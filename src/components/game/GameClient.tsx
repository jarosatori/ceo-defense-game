"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  BusinessType,
  EventChoice,
  GameEvent,
  GameState,
  PolicyId,
  Priority,
  Role,
} from "@/game/types";
import { ROLE_CONFIGS, SENIOR_MULTIPLIER } from "@/game/constants";
import { POLICY_BY_ID } from "@/game/data/policies";
import {
  applyEventConsequences,
  applyHireToBaseline,
  applyMonthEndReputation,
  applyMonthlyPolicyTick,
  applyPoliciesAtRunStart,
  consumePendingWaveModifiers,
  getBusinessMilestone,
} from "@/game/utils/pnlCalculator";
import { createInitialGameState } from "@/game/utils/initialState";
import { pickEventForMonth } from "@/game/utils/eventSelector";
import { serializeRunStory } from "@/game/utils/runStoryGenerator";
import { calculateProfile } from "@/game/utils/profileCalculator";
import BusinessTypeOverlay from "./BusinessTypeOverlay";
import PlanningOverlay from "./PlanningOverlay";
import PolicySelectOverlay from "./PolicySelectOverlay";
import EventDecisionOverlay from "./EventDecisionOverlay";
import type { GameController } from "./GameCanvas";

const GameCanvas = dynamic(() => import("./GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-me-plum">
      <p className="text-me-cream">Načítavam hru…</p>
    </div>
  ),
});

type UIPhase =
  | "business-type"
  | "policy-select"
  | "event-decision"
  | "action"
  | "planning"
  | "results";

function effectiveHireCost(baseCost: number, policies: PolicyId[]): number {
  let mult = 1;
  for (const id of policies) {
    const m = POLICY_BY_ID[id]?.modifiers.hireCostMultiplier;
    if (m !== undefined) mult *= m;
  }
  return Math.round(baseCost * mult * 100) / 100;
}

function seniorsLocked(policies: PolicyId[]): boolean {
  for (const id of policies) {
    if (POLICY_BY_ID[id]?.modifiers.seniorsLocked) return true;
  }
  return false;
}

export default function GameClient() {
  const [phase, setPhase] = useState<UIPhase>("business-type");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const controllerRef = useRef<GameController | null>(null);

  const handleReady = useCallback((controller: GameController) => {
    controllerRef.current = controller;
  }, []);

  const handleIntroComplete = useCallback(() => {
    // No-op.
  }, []);

  // ──────────────────────────────────────────────────────
  // End-of-run handler (from Phaser game-over OR early exit)
  // ──────────────────────────────────────────────────────
  const finishRun = useCallback(
    (finalState: GameState, cashCrunch: boolean, survived: boolean) => {
      const profile = calculateProfile(finalState);
      const ebitdaRatio =
        finalState.revenue > 0 ? finalState.profit / finalState.revenue : 0;
      const milestone = finalState.earlyExit
        ? `Early Exit · ${finalState.earlyExit.value}k`
        : getBusinessMilestone(finalState.revenue, ebitdaRatio);
      const teamString = finalState.team
        .map((m) => `${m.role}:${m.level}`)
        .join(",");
      const policyString = finalState.activePolicies.join(",");
      const storyString = serializeRunStory(finalState.runStory);

      const params = new URLSearchParams({
        profile,
        waves: String(survived ? 10 : finalState.wave),
        score: String(finalState.score),
        revenue: String(Math.round(finalState.revenue * 100) / 100),
        profit: String(Math.round(finalState.profit * 100) / 100),
        grossMargin: String(finalState.baselineRatios.grossMargin),
        marketingRatio: String(finalState.baselineRatios.marketingRatio),
        ebitdaRatio: String(Math.round(ebitdaRatio * 1000) / 1000),
        businessType: finalState.businessType,
        milestone,
        team: teamString,
        caught: String(finalState.problemsCaught),
        missed: String(finalState.problemsMissed),
        clicks: String(finalState.manualClicks),
        cashCrunch: cashCrunch ? "1" : "0",
        policies: policyString,
        story: storyString,
        earlyExit: finalState.earlyExit ? "1" : "0",
      });

      try {
        const email =
          typeof window !== "undefined"
            ? window.sessionStorage.getItem("ceo-defense-email")
            : null;
        if (email) {
          fetch("/api/lead/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              profile,
              waves: survived ? 10 : finalState.wave,
              score: finalState.score,
              revenue: finalState.revenue,
              profit: finalState.profit,
              businessType: finalState.businessType,
              milestone,
              policies: finalState.activePolicies,
            }),
          }).catch(() => {});
        }
      } catch {
        // SSR / privacy — swallow
      }

      setPhase("results");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = `/results?${params.toString()}`;
        }
      }, 250);
    },
    [],
  );

  // ──────────────────────────────────────────────────────
  // Phaser wave-complete → advance to planning with month-end processing
  // ──────────────────────────────────────────────────────
  const handleWaveComplete = useCallback((updated: GameState) => {
    // 1) Apply month-end effects
    let next = applyMonthEndReputation(updated);

    // 2) Track consecutive loss months (for cash audit boss)
    if (next.monthlyProfit < 0) {
      next = { ...next, consecutiveLossMonths: next.consecutiveLossMonths + 1 };
    } else {
      next = { ...next, consecutiveLossMonths: 0 };
    }

    // 3) Consume per-wave modifiers (but keep multi-month margin penalty)
    next = consumePendingWaveModifiers(next);

    // 4) Sync cash ↔ budget
    next = { ...next, cash: next.budget };

    setGameState({ ...next });
    setPhase("planning");
  }, []);

  // ──────────────────────────────────────────────────────
  // Phaser game-over
  // ──────────────────────────────────────────────────────
  const handleGameOver = useCallback(
    (data: { gameState: GameState; cashCrunch: boolean; survived: boolean }) => {
      const { gameState: finalState, cashCrunch, survived } = data;
      // sync cash
      const synced = { ...finalState, cash: finalState.budget };
      finishRun(synced, cashCrunch, survived);
    },
    [finishRun],
  );

  // ──────────────────────────────────────────────────────
  // BusinessType → PolicySelect
  // ──────────────────────────────────────────────────────
  const handleSelectBusinessType = useCallback((type: BusinessType) => {
    const initial = createInitialGameState(type);
    setGameState(initial);
    setPhase("policy-select");
  }, []);

  // ──────────────────────────────────────────────────────
  // PolicySelect → first EventDecision or Action (month 1 skips event)
  // ──────────────────────────────────────────────────────
  const handleConfirmPolicies = useCallback((picks: PolicyId[]) => {
    setGameState((prev) => {
      if (!prev) return prev;
      let next: GameState = { ...prev, activePolicies: picks };

      // Record policy picks in runStory
      const policyEntries = picks.map((id) => {
        const label = POLICY_BY_ID[id]?.label ?? id;
        return {
          month: 0,
          kind: "policy-picked" as const,
          text: label,
        };
      });
      next = { ...next, runStory: [...next.runStory, ...policyEntries] };

      // Apply one-time policy effects (margin boost)
      next = applyPoliciesAtRunStart(next);

      // Month 1: no event — go straight into action
      setPhase("action");
      queueMicrotask(() => {
        controllerRef.current?.startAction(next);
      });
      return next;
    });
  }, []);

  // ──────────────────────────────────────────────────────
  // Planning "Pokračovať" → next event (or straight action if no event)
  // ──────────────────────────────────────────────────────
  const handleContinuePlanning = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      // Advance wave → month N+1
      let advanced: GameState = { ...prev, wave: prev.wave + 1 };

      // Apply monthly policy tick (energy, rep, marketing ratio)
      advanced = applyMonthlyPolicyTick(advanced);

      // Pick event
      const event = pickEventForMonth(advanced);
      if (event) {
        advanced = { ...advanced, pendingEvent: event };
        setPhase("event-decision");
        return advanced;
      } else {
        setPhase("action");
        queueMicrotask(() => {
          controllerRef.current?.startAction(advanced);
        });
        return advanced;
      }
    });
  }, []);

  // ──────────────────────────────────────────────────────
  // Event choice → apply consequences → action
  // ──────────────────────────────────────────────────────
  const handleEventChoice = useCallback(
    (choice: EventChoice) => {
      setGameState((prev) => {
        if (!prev || !prev.pendingEvent) return prev;
        const ev: GameEvent = prev.pendingEvent;
        const { state: next, story } = applyEventConsequences(
          prev,
          ev,
          choice.consequences,
        );
        let updated: GameState = {
          ...next,
          pendingEvent: null,
          runStory: [...next.runStory, story],
        };
        // Keep budget ↔ cash in sync
        updated = { ...updated, budget: updated.cash };

        // Early exit? End run now.
        if (updated.earlyExit) {
          const payload: GameState = {
            ...updated,
            revenue: updated.revenue + updated.earlyExit.value,
          };
          setTimeout(() => finishRun(payload, false, false), 0);
          return payload;
        }

        // Cash audit game-over marker
        if (updated.profit <= -999) {
          setTimeout(() => finishRun(updated, true, false), 0);
          return updated;
        }

        setPhase("action");
        queueMicrotask(() => {
          controllerRef.current?.startAction(updated);
        });
        return updated;
      });
    },
    [finishRun],
  );

  // ──────────────────────────────────────────────────────
  // Hire / Fire / Upgrade (policy-adjusted costs)
  // ──────────────────────────────────────────────────────
  const handleHire = useCallback((role: Role) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const cfg = ROLE_CONFIGS[role];
      const cost = effectiveHireCost(cfg.cost, prev.activePolicies);
      if (prev.cash < cost) return prev;
      const newCash = prev.cash - cost;
      const next: GameState = {
        ...prev,
        cash: newCash,
        budget: newCash,
        team: [
          ...prev.team,
          {
            role,
            level: "junior",
            id: `${role}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          },
        ],
        baselineRatios: applyHireToBaseline(
          prev.baselineRatios,
          role,
          prev.businessType,
        ),
        runStory: [
          ...prev.runStory,
          {
            month: prev.wave,
            kind: "hire",
            text: `Najal som ${cfg.label}`,
          },
        ],
      };
      next.monthlyCosts = recalcSalaries(next);
      return next;
    });
  }, []);

  const handleFire = useCallback((memberId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const next: GameState = {
        ...prev,
        team: prev.team.filter((m) => m.id !== memberId),
      };
      next.monthlyCosts = recalcSalaries(next);
      return next;
    });
  }, []);

  const handleSelectPriority = useCallback((priority: Priority) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, selectedPriority: priority };
    });
  }, []);

  const handleUpgrade = useCallback((memberId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      if (seniorsLocked(prev.activePolicies)) return prev;
      const member = prev.team.find((m) => m.id === memberId);
      if (!member || member.level === "senior") return prev;
      const cfg = ROLE_CONFIGS[member.role];
      if (prev.cash < cfg.upgradeCost) return prev;
      const newCash = prev.cash - cfg.upgradeCost;
      const next: GameState = {
        ...prev,
        cash: newCash,
        budget: newCash,
        team: prev.team.map((m) =>
          m.id === memberId ? { ...m, level: "senior" as const } : m,
        ),
      };
      next.monthlyCosts = recalcSalaries(next);
      return next;
    });
  }, []);

  const phaserVisible = phase === "action";

  const overlay = useMemo(() => {
    if (phase === "business-type") {
      return <BusinessTypeOverlay onSelect={handleSelectBusinessType} />;
    }
    if (phase === "policy-select") {
      return <PolicySelectOverlay onConfirm={handleConfirmPolicies} />;
    }
    if (phase === "event-decision" && gameState?.pendingEvent) {
      return (
        <EventDecisionOverlay
          event={gameState.pendingEvent}
          month={gameState.wave}
          onChoose={handleEventChoice}
        />
      );
    }
    if (phase === "planning" && gameState) {
      return (
        <PlanningOverlay
          state={gameState}
          onHire={handleHire}
          onFire={handleFire}
          onUpgrade={handleUpgrade}
          onSelectPriority={handleSelectPriority}
          onContinue={handleContinuePlanning}
        />
      );
    }
    if (phase === "results") {
      return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-me-cream">
          <p className="me-display text-me-plum" style={{ fontSize: 22 }}>
            Načítavam výsledky…
          </p>
        </div>
      );
    }
    return null;
  }, [
    phase,
    gameState,
    handleSelectBusinessType,
    handleConfirmPolicies,
    handleEventChoice,
    handleHire,
    handleFire,
    handleUpgrade,
    handleSelectPriority,
    handleContinuePlanning,
  ]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-me-plum">
      <GameCanvas
        visible={phaserVisible}
        onIntroComplete={handleIntroComplete}
        onWaveComplete={handleWaveComplete}
        onGameOver={handleGameOver}
        onReady={handleReady}
      />
      {overlay}
    </div>
  );
}

function recalcSalaries(state: GameState): number {
  return state.team.reduce((sum, m) => {
    const cfg = ROLE_CONFIGS[m.role];
    const cost =
      m.level === "senior"
        ? cfg.monthlyCost * SENIOR_MULTIPLIER.monthlyCostFactor
        : cfg.monthlyCost;
    return sum + cost;
  }, 0);
}
