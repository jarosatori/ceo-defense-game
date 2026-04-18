"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  BusinessType,
  GameState,
  Priority,
  Role,
} from "@/game/types";
import { ROLE_CONFIGS, SENIOR_MULTIPLIER } from "@/game/constants";
import { applyHireToBaseline } from "@/game/utils/pnlCalculator";
import { createInitialGameState } from "@/game/utils/initialState";
import { calculateProfile } from "@/game/utils/profileCalculator";
import { getBusinessMilestone } from "@/game/utils/pnlCalculator";
import BusinessTypeOverlay from "./BusinessTypeOverlay";
import PlanningOverlay from "./PlanningOverlay";
import type { GameController } from "./GameCanvas";

const GameCanvas = dynamic(() => import("./GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-me-plum">
      <p className="text-me-cream">Načítavam hru…</p>
    </div>
  ),
});

type Phase = "intro" | "business-type" | "action" | "planning" | "results";

export default function GameClient() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const controllerRef = useRef<GameController | null>(null);

  const handleReady = useCallback((controller: GameController) => {
    controllerRef.current = controller;
  }, []);

  const handleIntroComplete = useCallback(() => {
    setPhase("business-type");
  }, []);

  const handleWaveComplete = useCallback((updated: GameState) => {
    setGameState({ ...updated });
    setPhase("planning");
  }, []);

  const handleGameOver = useCallback(
    (data: { gameState: GameState; cashCrunch: boolean; survived: boolean }) => {
      const { gameState: finalState, cashCrunch, survived } = data;

      const profile = calculateProfile(finalState);
      const ebitdaRatio =
        finalState.revenue > 0 ? finalState.profit / finalState.revenue : 0;
      const milestone = getBusinessMilestone(finalState.revenue, ebitdaRatio);
      const teamString = finalState.team
        .map((m) => `${m.role}:${m.level}`)
        .join(",");

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
      });

      // MailerLite enrichment (fire-and-forget)
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
            }),
          }).catch(() => {});
        }
      } catch {
        // sessionStorage unavailable (SSR / privacy mode) — swallow
      }

      setPhase("results");

      // Give the browser a beat to paint before navigating away.
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = `/results?${params.toString()}`;
        }
      }, 250);
    },
    [],
  );

  // ──────────────────────────────────────────────────────
  // BusinessType → start first ActionScene
  // ──────────────────────────────────────────────────────
  const handleSelectBusinessType = useCallback((type: BusinessType) => {
    const initial = createInitialGameState(type);
    setGameState(initial);
    setPhase("action");
    // Defer to next tick so GameCanvas visibility toggle is applied before Phaser boots the scene.
    queueMicrotask(() => {
      controllerRef.current?.startAction(initial);
    });
  }, []);

  // ──────────────────────────────────────────────────────
  // Planning-phase state mutations
  // ──────────────────────────────────────────────────────
  const handleHire = useCallback((role: Role) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const cfg = ROLE_CONFIGS[role];
      if (prev.budget < cfg.cost) return prev;
      const next: GameState = {
        ...prev,
        budget: prev.budget - cfg.cost,
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

  const handleUpgrade = useCallback((memberId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const member = prev.team.find((m) => m.id === memberId);
      if (!member || member.level === "senior") return prev;
      const cfg = ROLE_CONFIGS[member.role];
      if (prev.budget < cfg.upgradeCost) return prev;
      const next: GameState = {
        ...prev,
        budget: prev.budget - cfg.upgradeCost,
        team: prev.team.map((m) =>
          m.id === memberId ? { ...m, level: "senior" as const } : m,
        ),
      };
      next.monthlyCosts = recalcSalaries(next);
      return next;
    });
  }, []);

  const handleSelectPriority = useCallback((priority: Priority) => {
    setGameState((prev) =>
      prev ? { ...prev, selectedPriority: priority } : prev,
    );
  }, []);

  const handleContinuePlanning = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      if (prev.selectedPriority === null) return prev;
      // Advance wave: ActionScene's init does its own reset + will read selectedPriority
      // when the wave completes.
      const advanced: GameState = { ...prev, wave: prev.wave + 1 };
      setPhase("action");
      queueMicrotask(() => {
        controllerRef.current?.startAction(advanced);
      });
      return advanced;
    });
  }, []);

  const phaserVisible = phase === "intro" || phase === "action";

  const overlay = useMemo(() => {
    if (phase === "business-type") {
      return <BusinessTypeOverlay onSelect={handleSelectBusinessType} />;
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
