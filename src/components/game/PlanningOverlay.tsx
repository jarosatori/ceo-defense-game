"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Category,
  GameState,
  Priority,
  Role,
  TeamMember,
} from "@/game/types";
import {
  BUSINESS_TYPE_CONFIGS,
  PLANNING_DURATION,
  PRIORITY_CONFIGS,
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
} from "@/game/constants";
import { WAVES } from "@/game/data/waves";
import {
  applyHireToBaseline,
  formatMoney,
  formatPercent,
  ratioHealth,
  simulatePnl,
} from "@/game/utils/pnlCalculator";

const ALL_ROLES: Role[] = [
  "va",
  "sales",
  "marketing",
  "product",
  "support",
  "accountant",
  "cfo",
  "hr",
  "operations",
  "coo",
];

const ROLE_SHORT: Record<Role, string> = {
  va: "VA",
  sales: "SAL",
  marketing: "MKT",
  product: "PRD",
  support: "SUP",
  accountant: "ACC",
  cfo: "CFO",
  hr: "HR",
  operations: "OPS",
  coo: "COO",
};

const CAT_COLORS: Record<Category, { color: string; tint: string; label: string }> = {
  marketing: { color: "#9F2D6D", tint: "rgba(159,45,109,0.14)", label: "Marketing" },
  finance: { color: "#E81A1E", tint: "rgba(232,26,30,0.14)", label: "Financie" },
  operations: { color: "#FF7404", tint: "rgba(255,116,4,0.14)", label: "Operácie" },
  general: { color: "#A69E92", tint: "rgba(166,158,146,0.18)", label: "Ostatné" },
};

function roleCategory(role: Role): Category {
  const cfg = ROLE_CONFIGS[role];
  // First matching catch category drives the visual color.
  return cfg.catchCategories[0] ?? "general";
}

function memberMonthly(member: TeamMember): number {
  const cfg = ROLE_CONFIGS[member.role];
  return member.level === "senior"
    ? cfg.monthlyCost * SENIOR_MULTIPLIER.monthlyCostFactor
    : cfg.monthlyCost;
}

interface PlanningOverlayProps {
  state: GameState;
  onHire: (role: Role) => void;
  onFire: (memberId: string) => void;
  onUpgrade: (memberId: string) => void;
  onSelectPriority: (priority: Priority) => void;
  onContinue: () => void;
}

export default function PlanningOverlay({
  state,
  onHire,
  onFire,
  onUpgrade,
  onSelectPriority,
  onContinue,
}: PlanningOverlayProps) {
  const [countdown, setCountdown] = useState(PLANNING_DURATION);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // Auto-start only if priority is selected — otherwise keep waiting.
          if (state.selectedPriority !== null) {
            onContinue();
            return 0;
          }
          return 5;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.selectedPriority, onContinue]);

  const lastPnl = state.pnlHistory[state.pnlHistory.length - 1];
  const bizCfg = BUSINESS_TYPE_CONFIGS[state.businessType];

  // "Čo ťa zabilo" — percentage of misses per category (last wave)
  const missedPct = useMemo(() => {
    const total =
      state.missedByCategory.marketing +
      state.missedByCategory.finance +
      state.missedByCategory.operations +
      state.missedByCategory.general;
    const pct = (v: number) =>
      total > 0 ? Math.round((v / total) * 100) : 0;
    return {
      marketing: pct(state.missedByCategory.marketing),
      finance: pct(state.missedByCategory.finance),
      operations: pct(state.missedByCategory.operations),
      general: pct(state.missedByCategory.general),
    };
  }, [state.missedByCategory]);

  const priorityReady = state.selectedPriority !== null;

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-me-cream">
      <div className="mx-auto w-full max-w-[500px] px-5 py-7 sm:px-6 sm:py-9">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="me-eyebrow mb-2 text-me-magenta">
            Vlna {state.wave} · prežil si
          </div>
          <h1
            className="me-display text-me-ink"
            style={{ fontSize: 34, letterSpacing: "-0.02em" }}
          >
            Plánovacia fáza
          </h1>
        </div>

        {/* P&L summary card — plum */}
        <PnlSummary
          revenue={state.monthlyRevenue}
          profit={state.monthlyProfit}
          teamCount={state.team.length}
          monthlyCosts={state.monthlyCosts}
        />

        {/* Detailed P&L breakdown (last month) */}
        {lastPnl && (
          <div className="mt-4 rounded-2xl border border-me-mist bg-white p-5">
            <div className="me-label mb-3 text-me-stone">
              P&L minulý mesiac
            </div>
            <PnlLine label="Obrat" value={formatMoney(lastPnl.revenue)} />
            <PnlLine
              label="COGS"
              value={`-${formatMoney(lastPnl.cogs)}`}
              dim
            />
            <PnlLine
              label={`= Hrubá marža (${formatPercent(lastPnl.grossMarginRatio)})`}
              value={formatMoney(lastPnl.grossMargin)}
              color={healthColor(
                ratioHealth(
                  lastPnl.grossMarginRatio,
                  bizCfg.maxGrossMargin * 0.85,
                ),
              )}
              bold
            />
            <PnlLine
              label={`Marketing (${formatPercent(lastPnl.marketingRatio)})`}
              value={`-${formatMoney(lastPnl.marketingCost)}`}
              color={healthColor(
                ratioHealth(
                  lastPnl.marketingRatio,
                  Math.max(bizCfg.minMarketingRatio * 1.5, 0.12),
                  true,
                ),
              )}
            />
            <PnlLine
              label={`= CP3 (${formatPercent(lastPnl.cp3Ratio)})`}
              value={formatMoney(lastPnl.cp3)}
              color={healthColor(ratioHealth(lastPnl.cp3Ratio, 0.25))}
              bold
            />
            <PnlLine
              label="Mzdy"
              value={`-${formatMoney(lastPnl.salaries)}`}
              dim
            />
            <PnlLine
              label={`= EBITDA (${formatPercent(lastPnl.ebitdaRatio)})`}
              value={formatMoney(lastPnl.ebitda)}
              color={healthColor(ratioHealth(lastPnl.ebitdaRatio, 0.15))}
              bold
            />
            <div className="mt-3 flex items-baseline justify-between border-t border-me-mist pt-3">
              <span className="text-me-fg-dim" style={{ fontSize: 11 }}>
                Kumulatívny zisk
              </span>
              <span
                className="me-display"
                style={{
                  fontSize: 13,
                  color: state.profit >= 0 ? "#FF7404" : "#E81A1E",
                }}
              >
                {formatMoney(state.profit)}
              </span>
            </div>
          </div>
        )}

        {/* Budget + Countdown */}
        <div className="my-7 flex items-center justify-between px-1">
          <div>
            <div className="me-label text-me-stone">K dispozícii</div>
            <div
              className="me-display"
              style={{ fontSize: 28, color: "#FF7404" }}
            >
              {formatMoney(state.budget)}
            </div>
          </div>
          <div className="text-right">
            <div className="me-label text-me-stone">Auto-start</div>
            <div
              className="me-display"
              style={{ fontSize: 28, color: "#531E38" }}
            >
              {countdown}s
            </div>
          </div>
        </div>

        {/* Čo ťa zabilo */}
        <div className="me-eyebrow mb-2">Čo ťa zabilo</div>
        <div className="mb-7 rounded-2xl border border-me-mist bg-white px-5 py-1">
          <CategoryBar label="Marketing" pct={missedPct.marketing} cat="marketing" />
          <CategoryBar label="Financie" pct={missedPct.finance} cat="finance" />
          <CategoryBar label="Operácie" pct={missedPct.operations} cat="operations" />
          <CategoryBar label="Ostatné" pct={missedPct.general} cat="general" last />
        </div>

        {/* Čo budeš riešiť — priorities */}
        <div className="me-eyebrow mb-2">Čo budeš riešiť</div>
        <div className="mb-7 flex flex-col gap-2">
          {PRIORITY_CONFIGS.map((p) => (
            <PriorityOption
              key={p.id}
              id={p.id}
              label={p.label}
              description={p.description}
              tag={priorityTag(p.id)}
              categoryColor={p.color}
              selected={state.selectedPriority === p.id}
              onSelect={onSelectPriority}
            />
          ))}
        </div>

        {/* Najmi do tímu */}
        <div className="me-eyebrow mb-2">Najmi do tímu</div>
        <div className="mb-7 flex flex-col gap-2">
          {ALL_ROLES.map((role) => (
            <HireRow
              key={role}
              role={role}
              canAfford={state.budget >= ROLE_CONFIGS[role].cost}
              state={state}
              onHire={onHire}
            />
          ))}
        </div>

        {/* Tvoj tím */}
        {state.team.length > 0 && (
          <>
            <div className="me-eyebrow mb-2">Tvoj tím</div>
            <div className="mb-7 flex flex-col gap-2">
              {state.team.map((m) => (
                <TeamMemberRow
                  key={m.id}
                  member={m}
                  canUpgrade={
                    m.level === "junior" &&
                    state.budget >= ROLE_CONFIGS[m.role].upgradeCost
                  }
                  onFire={onFire}
                  onUpgrade={onUpgrade}
                />
              ))}
            </div>
          </>
        )}

        {/* Continue button */}
        <button
          type="button"
          disabled={!priorityReady}
          onClick={onContinue}
          className="me-btn me-btn--primary"
          style={{
            background: priorityReady ? "#FF7404" : "#D4D4D1",
            color: priorityReady ? "#EFEDEB" : "#7A736A",
          }}
        >
          {priorityReady ? "POKRAČOVAŤ →" : "VYBER PRIORITU"}
        </button>

        <div className="h-10" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function PnlSummary({
  revenue,
  profit,
  teamCount,
  monthlyCosts,
}: {
  revenue: number;
  profit: number;
  teamCount: number;
  monthlyCosts: number;
}) {
  const sign = profit >= 0 ? "+" : "-";
  const cells: Array<{ k: string; v: string; c: string }> = [
    { k: "Obrat", v: formatMoney(revenue), c: "#FF7404" },
    {
      k: "Zisk",
      v: `${sign}${formatMoney(Math.abs(profit))}`,
      c: profit >= 0 ? "#FF9DC8" : "#E81A1E",
    },
    { k: "Tím", v: String(teamCount), c: "#EFEDEB" },
    { k: "Náklady", v: formatMoney(monthlyCosts), c: "rgba(239,237,235,0.85)" },
  ];
  return (
    <div
      className="grid grid-cols-4 rounded-[18px] px-5 py-5 text-me-cream"
      style={{ background: "#531E38", gap: 2 }}
    >
      {cells.map((c, i) => (
        <div
          key={c.k}
          className="px-3 py-1"
          style={{
            borderRight:
              i < cells.length - 1
                ? "1px solid rgba(239,237,235,0.12)"
                : undefined,
          }}
        >
          <div
            className="me-display mb-1"
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            {c.k}
          </div>
          <div
            className="me-display"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: c.c,
              letterSpacing: "-0.02em",
            }}
          >
            {c.v}
          </div>
        </div>
      ))}
    </div>
  );
}

function PnlLine({
  label,
  value,
  color,
  bold,
  dim,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-[3px]">
      <span
        style={{
          fontSize: 12,
          color: dim ? "#A69E92" : "#6b635a",
          fontWeight: bold ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        className="me-display"
        style={{
          fontSize: bold ? 13 : 12,
          color: color ?? (dim ? "#A69E92" : "#1B1C1E"),
          fontWeight: bold ? 700 : 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CategoryBar({
  label,
  pct,
  cat,
  last,
}: {
  label: string;
  pct: number;
  cat: Category;
  last?: boolean;
}) {
  const { color } = CAT_COLORS[cat];
  return (
    <div
      className="grid items-center gap-3 py-2"
      style={{
        gridTemplateColumns: "110px 1fr 44px",
        borderBottom: last ? undefined : "1px solid rgba(212,212,209,0.6)",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ fontSize: 13, color: "#1B1C1E", fontWeight: 500 }}
      >
        <span
          className="inline-block rounded-sm"
          style={{
            width: 8,
            height: 8,
            background: color,
          }}
        />
        {label}
      </div>
      <div
        className="relative h-[6px] overflow-hidden rounded-full"
        style={{ background: "#F2EEEA" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div
        className="me-display text-right"
        style={{ fontSize: 13, color: "#1B1C1E" }}
      >
        {pct}%
      </div>
    </div>
  );
}

function PriorityOption({
  id,
  label,
  description,
  tag,
  categoryColor,
  selected,
  onSelect,
}: {
  id: Priority;
  label: string;
  description: string;
  tag: string;
  categoryColor: string;
  selected: boolean;
  onSelect: (p: Priority) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="relative grid w-full cursor-pointer items-center gap-4 overflow-hidden rounded-2xl p-4 pl-5 text-left transition-all duration-200"
      style={{
        gridTemplateColumns: "1fr auto",
        background: selected ? "#531E38" : "#ffffff",
        border: `1px solid ${selected ? "#531E38" : "#D4D4D1"}`,
        boxShadow: selected
          ? "0 10px 34px -14px rgba(83,30,56,0.55)"
          : undefined,
      }}
    >
      <div
        aria-hidden
        className="absolute bottom-0 left-0 top-0"
        style={{
          width: 4,
          background: selected ? "#FF7404" : categoryColor,
          opacity: selected ? 1 : 0.35,
          borderRadius: "16px 0 0 16px",
        }}
      />
      <div>
        <div
          className="flex items-center gap-2"
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: selected ? "#EFEDEB" : "#1B1C1E",
          }}
        >
          {label}
          <span
            className="me-display"
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 999,
              background: selected
                ? "rgba(255,116,4,0.18)"
                : `${categoryColor}20`,
              color: selected ? "#FF7404" : categoryColor,
            }}
          >
            {tag}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            marginTop: 3,
            lineHeight: 1.4,
            color: selected ? "rgba(239,237,235,0.72)" : "#6b635a",
          }}
        >
          {description}
        </div>
      </div>
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 24,
          height: 24,
          background: selected ? "#FF7404" : "#F6F3F0",
          border: `1.5px solid ${selected ? "#FF7404" : "#D4D4D1"}`,
        }}
      >
        {selected && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EFEDEB"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </div>
    </button>
  );
}

function priorityTag(id: Priority): string {
  // Short human-friendly signal, kept in sync with PRIORITY_CONFIGS boosts.
  switch (id) {
    case "product":
      return "+5% obrat";
    case "marketing":
      return "+8% obrat";
    case "sales":
      return "+25% obrat";
    case "processes":
      return "+3% efektivita";
    case "finance":
      return "+1pp marža";
    case "team":
      return "+5% tím";
    case "unit-economics":
      return "+1.5pp marža";
    case "retention":
      return "+8% obrat";
    case "self-dev":
      return "+2% obrat";
  }
}

function HireRow({
  role,
  canAfford,
  state,
  onHire,
}: {
  role: Role;
  canAfford: boolean;
  state: GameState;
  onHire: (role: Role) => void;
}) {
  const cfg = ROLE_CONFIGS[role];
  const cat = roleCategory(role);
  const { color } = CAT_COLORS[cat];

  const sim = useMemo(() => {
    const nextWave = WAVES[state.wave]; // wave is 1-indexed; next-wave is at index wave
    if (!nextWave) return null;
    const baseline = simulatePnl(
      state,
      nextWave,
      state.selectedPriority,
      state.team,
      state.baselineRatios,
    );
    const hypoTeam = [...state.team, { role, level: "junior" as const, id: "sim" }];
    const hypoRatios = applyHireToBaseline(
      state.baselineRatios,
      role,
      state.businessType,
    );
    const withHire = simulatePnl(
      state,
      nextWave,
      state.selectedPriority,
      hypoTeam,
      hypoRatios,
    );
    return {
      rev: withHire.revenue - baseline.revenue,
      profit: withHire.ebitda - baseline.ebitda,
    };
  }, [role, state]);

  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white py-3 pl-5 pr-4"
      style={{
        borderColor: "#D4D4D1",
        opacity: canAfford ? 1 : 0.55,
      }}
    >
      <div
        aria-hidden
        className="absolute bottom-0 left-0 top-0"
        style={{ width: 4, background: color }}
      />
      <RoleToken role={role} size={38} />
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#1B1C1E",
          }}
        >
          {cfg.label}
        </div>
        <div
          className="truncate"
          style={{ fontSize: 12, color: "#6b635a", marginTop: 2 }}
        >
          {cfg.description}
        </div>
        {sim && (
          <div
            style={{
              fontSize: 10,
              color: "#A69E92",
              marginTop: 4,
            }}
          >
            Δ obrat {signed(sim.rev)} · Δ zisk {signed(sim.profit)}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="me-display" style={{ fontSize: 15, color: "#1B1C1E" }}>
          {formatMoney(cfg.cost)}
        </div>
        <div
          style={{ fontSize: 10, color: "#A69E92", marginTop: 2 }}
        >
          +{formatMoney(cfg.monthlyCost)}/mes
        </div>
      </div>
      <button
        type="button"
        disabled={!canAfford}
        onClick={() => canAfford && onHire(role)}
        className="shrink-0 rounded-full px-4 py-2 transition-colors"
        style={{
          background: canAfford ? "#FF7404" : "#F2EEEA",
          color: canAfford ? "#EFEDEB" : "#A69E92",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.04em",
          cursor: canAfford ? "pointer" : "not-allowed",
        }}
      >
        {canAfford ? "Najať" : "—"}
      </button>
    </div>
  );
}

function TeamMemberRow({
  member,
  canUpgrade,
  onFire,
  onUpgrade,
}: {
  member: TeamMember;
  canUpgrade: boolean;
  onFire: (id: string) => void;
  onUpgrade: (id: string) => void;
}) {
  const cfg = ROLE_CONFIGS[member.role];
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border bg-white p-3 pl-4"
      style={{ borderColor: "#D4D4D1" }}
    >
      <RoleToken role={member.role} size={36} />
      <div className="flex-1">
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#1B1C1E",
          }}
        >
          {cfg.label}{" "}
          <span
            style={{
              color: "#A69E92",
              fontWeight: 400,
              fontSize: 12,
            }}
          >
            · {member.level === "senior" ? "Senior" : "Junior"}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#6b635a", marginTop: 2 }}>
          {formatMoney(memberMonthly(member))}/mes
        </div>
      </div>
      {member.level === "junior" && (
        <button
          type="button"
          disabled={!canUpgrade}
          onClick={() => canUpgrade && onUpgrade(member.id)}
          className="rounded-full px-3 py-2"
          style={{
            background: canUpgrade ? "rgba(255,116,4,0.12)" : "#F6F3F0",
            color: canUpgrade ? "#FF7404" : "#A69E92",
            fontSize: 11,
            fontWeight: 700,
            cursor: canUpgrade ? "pointer" : "not-allowed",
          }}
        >
          Upgrade {formatMoney(cfg.upgradeCost)}
        </button>
      )}
      <button
        type="button"
        onClick={() => onFire(member.id)}
        className="rounded-full px-3 py-2"
        style={{
          background: "rgba(232,26,30,0.1)",
          color: "#E81A1E",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        Prepustiť
      </button>
    </div>
  );
}

function RoleToken({ role, size = 38 }: { role: Role; size?: number }) {
  const cat = roleCategory(role);
  const { color } = CAT_COLORS[cat];
  return (
    <div
      className="me-display flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        color: "#EFEDEB",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}
    >
      {ROLE_SHORT[role]}
    </div>
  );
}

function signed(n: number): string {
  const prefix = n >= 0 ? "+" : "";
  return prefix + formatMoney(n);
}

function healthColor(h: "good" | "warning" | "bad"): string {
  switch (h) {
    case "good":
      return "#2E7D32";
    case "warning":
      return "#FF7404";
    case "bad":
      return "#E81A1E";
  }
}
