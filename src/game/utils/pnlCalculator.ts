import type {
  BaselineRatios,
  GameState,
  MonthlyPnl,
  Priority,
  TeamMember,
  WaveConfig,
} from "../types";
import {
  BUSINESS_TYPE_CONFIGS,
  MILESTONES,
  PRIORITY_CONFIGS,
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
} from "../constants";

/**
 * Calculate monthly revenue (top line) given state, market demand, priority, and performance.
 *
 * Revenue = businessTypeBase × marketDemand × (1 + teamBoost) × revenueMultiplier × priorityBoost × performance
 */
export function calculateMonthlyRevenue(
  state: GameState,
  waveConfig: WaveConfig,
  priority: Priority | null,
): number {
  const businessCfg = BUSINESS_TYPE_CONFIGS[state.businessType];
  const base = businessCfg.startingRevenue;

  // Team revenue boost (sum of individual boosts, seniors 1.5×)
  let teamBoost = 0;
  for (const member of state.team) {
    const cfg = ROLE_CONFIGS[member.role];
    const boost =
      member.level === "senior"
        ? cfg.revenueBoost * SENIOR_MULTIPLIER.revenueBoostFactor
        : cfg.revenueBoost;
    teamBoost += boost;
  }

  // Apply team effectiveness multiplier (from baseline ratios)
  teamBoost *= state.baselineRatios.teamEffectiveness;

  // Priority this-month boost
  const priorityCfg = priority ? PRIORITY_CONFIGS.find((p) => p.id === priority) : null;
  const priorityBoost = priorityCfg?.revenueBoostThisMonth ?? 1;

  // Performance: how well the month was defended (catch rate)
  const totalProblems = state.problemsCaught + state.problemsMissed;
  const catchRate = totalProblems > 0 ? state.problemsCaught / totalProblems : 0.5;
  const performance = Math.max(0.3, catchRate);

  const revenue =
    base *
    waveConfig.marketDemand *
    (1 + teamBoost) *
    state.baselineRatios.revenueMultiplier *
    priorityBoost *
    performance;

  return Math.round(revenue * 100) / 100; // 2 decimal places in €k
}

/**
 * Calculate full monthly P&L.
 * Revenue → COGS → Gross Margin → Marketing → CP3 → Salaries → EBITDA
 */
export function calculateMonthlyPnl(
  state: GameState,
  waveConfig: WaveConfig,
  priority: Priority | null,
): MonthlyPnl {
  const revenue = calculateMonthlyRevenue(state, waveConfig, priority);
  const ratios = state.baselineRatios;

  // COGS = revenue × (1 - grossMargin)
  const cogs = revenue * (1 - ratios.grossMargin);
  const grossMargin = revenue - cogs;

  // Marketing cost = revenue × marketingRatio
  const marketingCost = revenue * ratios.marketingRatio;
  const cp3 = grossMargin - marketingCost;

  // Salaries = sum of all team monthly costs (seniors 1.5×)
  const salaries = state.team.reduce((sum, m) => {
    const cfg = ROLE_CONFIGS[m.role];
    const cost =
      m.level === "senior"
        ? cfg.monthlyCost * SENIOR_MULTIPLIER.monthlyCostFactor
        : cfg.monthlyCost;
    return sum + cost;
  }, 0);

  const ebitda = cp3 - salaries;

  const safeRatio = (n: number, d: number) => (d > 0 ? n / d : 0);

  return {
    month: state.wave,
    revenue: round2(revenue),
    cogs: round2(cogs),
    grossMargin: round2(grossMargin),
    marketingCost: round2(marketingCost),
    cp3: round2(cp3),
    salaries: round2(salaries),
    ebitda: round2(ebitda),
    grossMarginRatio: safeRatio(grossMargin, revenue),
    marketingRatio: safeRatio(marketingCost, revenue),
    cp3Ratio: safeRatio(cp3, revenue),
    ebitdaRatio: safeRatio(ebitda, revenue),
  };
}

/**
 * Simulate next month's P&L assuming a hypothetical team change (for hire card previews).
 */
export function simulatePnl(
  state: GameState,
  waveConfig: WaveConfig,
  priority: Priority | null,
  teamOverride: TeamMember[],
  ratiosOverride: BaselineRatios,
): MonthlyPnl {
  const simState: GameState = {
    ...state,
    team: teamOverride,
    baselineRatios: ratiosOverride,
  };
  return calculateMonthlyPnl(simState, waveConfig, priority);
}

/**
 * Update baseline ratios when a priority is chosen.
 * Applies permanent boosts (per priority config), clamped to business-type caps.
 */
export function applyPriorityToBaseline(
  ratios: BaselineRatios,
  priority: Priority,
  businessType: keyof typeof BUSINESS_TYPE_CONFIGS,
): BaselineRatios {
  const cfg = PRIORITY_CONFIGS.find((p) => p.id === priority);
  if (!cfg) return ratios;

  const bizCfg = BUSINESS_TYPE_CONFIGS[businessType];
  const b = cfg.permanentBoosts;

  const newGrossMargin = Math.min(
    bizCfg.maxGrossMargin,
    ratios.grossMargin + (b.grossMargin ?? 0),
  );
  const newMarketingRatio = Math.max(
    bizCfg.minMarketingRatio,
    ratios.marketingRatio + (b.marketingRatio ?? 0), // negative value here improves
  );
  const newRevenueMultiplier = ratios.revenueMultiplier + (b.revenueMultiplier ?? 0);
  const newTeamEffectiveness = ratios.teamEffectiveness + (b.teamEffectiveness ?? 0);

  return {
    grossMargin: newGrossMargin,
    marketingRatio: newMarketingRatio,
    revenueMultiplier: newRevenueMultiplier,
    teamEffectiveness: newTeamEffectiveness,
  };
}

/**
 * Apply one-time ratio boosts when a role is hired.
 */
export function applyHireToBaseline(
  ratios: BaselineRatios,
  role: TeamMember["role"],
  businessType: keyof typeof BUSINESS_TYPE_CONFIGS,
): BaselineRatios {
  const cfg = ROLE_CONFIGS[role];
  if (!cfg.ratioBoost) return ratios;

  const bizCfg = BUSINESS_TYPE_CONFIGS[businessType];
  const b = cfg.ratioBoost;

  return {
    grossMargin: Math.min(
      bizCfg.maxGrossMargin,
      ratios.grossMargin + (b.grossMargin ?? 0),
    ),
    marketingRatio: Math.max(
      bizCfg.minMarketingRatio,
      ratios.marketingRatio + (b.marketingRatio ?? 0),
    ),
    revenueMultiplier: ratios.revenueMultiplier,
    teamEffectiveness: ratios.teamEffectiveness + (b.teamEffectiveness ?? 0),
  };
}

// ──────────────────────────────────────────────────────────
// FORMATTERS
// ──────────────────────────────────────────────────────────

export function formatMoney(amountK: number): string {
  const abs = Math.abs(amountK);
  const sign = amountK < 0 ? "-" : "";
  if (abs >= 1000) {
    const m = abs / 1000;
    return `${sign}€${m.toFixed(m >= 10 ? 0 : 1).replace(".", ",")}M`;
  }
  if (abs >= 1) {
    return `${sign}€${abs.toFixed(abs >= 10 ? 0 : 1).replace(".", ",")}k`;
  }
  // Sub-€1k shown in hundreds
  return `${sign}€${Math.round(abs * 1000)}`;
}

export function formatPercent(ratio: number, decimals: number = 0): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/**
 * Compare a ratio to a target — return health status.
 * Used for visual indicators (✓ ⚠️ ❌) in the UI.
 */
export function ratioHealth(
  ratio: number,
  target: number,
  invertDirection: boolean = false,
): "good" | "warning" | "bad" {
  // Default: higher is better. If invertDirection, lower is better.
  const good = invertDirection ? ratio <= target : ratio >= target;
  const warning = invertDirection
    ? ratio <= target * 1.3
    : ratio >= target * 0.7;

  if (good) return "good";
  if (warning) return "warning";
  return "bad";
}

// ──────────────────────────────────────────────────────────
// MILESTONES & RESULT CATEGORIZATION
// ──────────────────────────────────────────────────────────

export function getBusinessMilestone(
  cumulativeRevenue: number,
  ebitdaRatio: number,
): string {
  if (cumulativeRevenue >= MILESTONES.EXIT_READY_REVENUE && ebitdaRatio >= 0.2) {
    return "Exit ready";
  }
  if (cumulativeRevenue >= MILESTONES.MILIONAR_REVENUE && ebitdaRatio >= 0.15) {
    return "Milionár";
  }
  if (
    cumulativeRevenue >= MILESTONES.PROFITABLE_REVENUE &&
    ebitdaRatio >= 0.1
  ) {
    return "Profitabilná firma";
  }
  if (cumulativeRevenue >= MILESTONES.GROWING_REVENUE) {
    if (ebitdaRatio < 0) return "Rastúca ale stratová";
    return "Rastúca firma";
  }
  if (ebitdaRatio < 0) return "Stratová firma";
  return "Živnostník";
}

// ──────────────────────────────────────────────────────────
// Private helpers
// ──────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
