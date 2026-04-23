import type {
  BaselineRatios,
  EventConsequences,
  GameEvent,
  GameState,
  MonthlyPnl,
  PolicyId,
  Priority,
  RunStoryEntry,
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
import { POLICY_BY_ID } from "../data/policies";

/**
 * Aggregate multiplicative revenue multiplier from all active policies.
 */
function policyRevenueMultiplier(activePolicies: PolicyId[]): number {
  let m = 1;
  for (const id of activePolicies) {
    const mod = POLICY_BY_ID[id]?.modifiers;
    if (mod?.revenueMultiplier !== undefined) m *= mod.revenueMultiplier;
  }
  return m;
}

/**
 * Additive gross margin boost applied at run-start (one-time, not each month).
 * Used in initializeRunPolicies.
 */
export function policyStartingMarginBoost(activePolicies: PolicyId[]): number {
  let b = 0;
  for (const id of activePolicies) {
    const mod = POLICY_BY_ID[id]?.modifiers;
    if (mod?.grossMarginBoost !== undefined) b += mod.grossMarginBoost;
  }
  return b;
}

/**
 * Conditional margin boost this month from product-market-focus policy.
 */
function policyConditionalMarginBoost(
  activePolicies: PolicyId[],
  team: TeamMember[],
): number {
  let b = 0;
  for (const id of activePolicies) {
    const cond = POLICY_BY_ID[id]?.modifiers.conditionalMarginBoost;
    if (!cond) continue;
    const matching = team.filter((m) => cond.ifRoles.includes(m.role)).length;
    if (matching >= cond.count) b += cond.boost;
  }
  return b;
}

/**
 * Calculate monthly revenue (top line).
 */
export function calculateMonthlyRevenue(
  state: GameState,
  waveConfig: WaveConfig,
  priority: Priority | null,
): number {
  const businessCfg = BUSINESS_TYPE_CONFIGS[state.businessType];
  const base = businessCfg.startingRevenue;

  let teamBoost = 0;
  for (const member of state.team) {
    const cfg = ROLE_CONFIGS[member.role];
    const boost =
      member.level === "senior"
        ? cfg.revenueBoost * SENIOR_MULTIPLIER.revenueBoostFactor
        : cfg.revenueBoost;
    teamBoost += boost;
  }
  teamBoost *= state.baselineRatios.teamEffectiveness;

  const priorityCfg = priority ? PRIORITY_CONFIGS.find((p) => p.id === priority) : null;
  const priorityBoost = priorityCfg?.revenueBoostThisMonth ?? 1;

  const totalProblems = state.problemsCaught + state.problemsMissed;
  const catchRate = totalProblems > 0 ? state.problemsCaught / totalProblems : 0.5;
  const performance = Math.max(0.3, catchRate);

  // V9 policy + event multipliers
  const policyMult = policyRevenueMultiplier(state.activePolicies);
  const eventMult = state.pendingWaveModifiers.revenueMultiplier ?? 1;

  const revenue =
    base *
    waveConfig.marketDemand *
    (1 + teamBoost) *
    state.baselineRatios.revenueMultiplier *
    priorityBoost *
    performance *
    policyMult *
    eventMult;

  return Math.round(revenue * 100) / 100;
}

/**
 * Calculate full monthly P&L.
 */
export function calculateMonthlyPnl(
  state: GameState,
  waveConfig: WaveConfig,
  priority: Priority | null,
): MonthlyPnl {
  const revenue = calculateMonthlyRevenue(state, waveConfig, priority);
  const ratios = state.baselineRatios;

  // Apply conditional margin boost + temporary margin penalty (event-driven)
  const condMargin = policyConditionalMarginBoost(state.activePolicies, state.team);
  const tempPenalty =
    (state.pendingWaveModifiers.marginPenaltyMonthsLeft ?? 0) > 0
      ? state.pendingWaveModifiers.marginPenalty ?? 0
      : 0;
  const effectiveMargin = Math.max(0, ratios.grossMargin + condMargin - tempPenalty);

  const cogs = revenue * (1 - effectiveMargin);
  const grossMargin = revenue - cogs;

  const marketingCost = revenue * ratios.marketingRatio;
  const cp3 = grossMargin - marketingCost;

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
 * Simulate next month's P&L for hire previews.
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
 * Apply priority permanent boosts to baseline ratios (legacy — still used if selectedPriority set).
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

  return {
    grossMargin: Math.min(
      bizCfg.maxGrossMargin,
      ratios.grossMargin + (b.grossMargin ?? 0),
    ),
    marketingRatio: Math.max(
      bizCfg.minMarketingRatio,
      ratios.marketingRatio + (b.marketingRatio ?? 0),
    ),
    revenueMultiplier: ratios.revenueMultiplier + (b.revenueMultiplier ?? 0),
    teamEffectiveness: ratios.teamEffectiveness + (b.teamEffectiveness ?? 0),
  };
}

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
// V9 POLICY & EVENT HELPERS
// ──────────────────────────────────────────────────────────

/**
 * Apply run-start effects from selected policies (one-time):
 * - grossMarginBoost → add pp to starting margin (capped).
 */
export function applyPoliciesAtRunStart(state: GameState): GameState {
  const bizCfg = BUSINESS_TYPE_CONFIGS[state.businessType];
  const marginBoost = policyStartingMarginBoost(state.activePolicies);
  return {
    ...state,
    baselineRatios: {
      ...state.baselineRatios,
      grossMargin: Math.min(
        bizCfg.maxGrossMargin,
        state.baselineRatios.grossMargin + marginBoost,
      ),
    },
  };
}

/**
 * Called each month-start. Applies recurring policy modifiers (energy, rep, marketing ratio).
 */
export function applyMonthlyPolicyTick(state: GameState): GameState {
  let energy = Math.min(10, state.energy + 3); // base +3/month
  let reputation = state.reputation;
  let marketingRatio = state.baselineRatios.marketingRatio;

  for (const id of state.activePolicies) {
    const mod = POLICY_BY_ID[id]?.modifiers;
    if (!mod) continue;
    if (mod.energyPerMonth) energy = Math.min(10, energy + mod.energyPerMonth);
    if (mod.reputationPerMonth) reputation += mod.reputationPerMonth;
    if (mod.marketingRatioDelta) marketingRatio += mod.marketingRatioDelta;
  }

  const bizCfg = BUSINESS_TYPE_CONFIGS[state.businessType];
  marketingRatio = Math.max(bizCfg.minMarketingRatio, marketingRatio);
  reputation = Math.max(0, Math.min(100, reputation));

  // decay temp margin penalty months-left
  const pwm = state.pendingWaveModifiers;
  const nextMonthsLeft =
    (pwm.marginPenaltyMonthsLeft ?? 0) > 0
      ? (pwm.marginPenaltyMonthsLeft ?? 0) - 1
      : 0;

  return {
    ...state,
    energy,
    reputation,
    baselineRatios: {
      ...state.baselineRatios,
      marketingRatio,
    },
    pendingWaveModifiers: {
      ...pwm,
      marginPenaltyMonthsLeft: nextMonthsLeft,
    },
  };
}

/**
 * Apply an event choice's consequences to game state.
 * Returns the new state and a narrative log entry.
 */
export function applyEventConsequences(
  state: GameState,
  event: GameEvent,
  consequences: EventConsequences,
): { state: GameState; story: RunStoryEntry } {
  let next: GameState = { ...state };
  const bizCfg = BUSINESS_TYPE_CONFIGS[state.businessType];

  // Cash audit boss: check consecutive loss months
  if (consequences.auditCheck) {
    if (state.consecutiveLossMonths >= 2) {
      // Mark as game over by setting profit deep negative
      next.profit = Math.min(next.profit, -1000);
    } else if (consequences.seedRoundReward) {
      next.cash += consequences.seedRoundReward;
      next.budget = next.cash;
    }
  }

  // Early exit
  if (consequences.earlyExit) {
    next.earlyExit = {
      month: state.wave,
      value: consequences.exitValue ?? 0,
    };
  }

  if (consequences.cashDelta) {
    next.cash += consequences.cashDelta;
    next.budget = next.cash;
  }
  if (consequences.reputationDelta) {
    next.reputation = Math.max(0, Math.min(100, next.reputation + consequences.reputationDelta));
  }
  if (consequences.energyDelta) {
    next.energy = Math.max(0, Math.min(10, next.energy + consequences.energyDelta));
  }
  if (consequences.grossMarginPermanent) {
    next.baselineRatios = {
      ...next.baselineRatios,
      grossMargin: Math.min(
        bizCfg.maxGrossMargin,
        next.baselineRatios.grossMargin + consequences.grossMarginPermanent,
      ),
    };
  }
  if (consequences.revenueMultiplierPermanent) {
    next.baselineRatios = {
      ...next.baselineRatios,
      revenueMultiplier: Math.max(
        0.1,
        next.baselineRatios.revenueMultiplier + consequences.revenueMultiplierPermanent,
      ),
    };
  }
  if (consequences.teamEffectivenessPermanent) {
    next.baselineRatios = {
      ...next.baselineRatios,
      teamEffectiveness: Math.max(
        0.1,
        next.baselineRatios.teamEffectiveness + consequences.teamEffectivenessPermanent,
      ),
    };
  }

  // Apply to next wave only
  next.pendingWaveModifiers = {
    ...next.pendingWaveModifiers,
    revenueMultiplier: consequences.waveRevenueMultiplier,
    problemDensity: consequences.waveProblemDensity,
    categorySkew: consequences.waveCategorySkew,
    marginPenalty:
      consequences.temporaryMarginPenalty ?? next.pendingWaveModifiers.marginPenalty,
    marginPenaltyMonthsLeft:
      consequences.temporaryMarginDuration ??
      next.pendingWaveModifiers.marginPenaltyMonthsLeft,
  };

  const story: RunStoryEntry = {
    month: state.wave,
    kind: event.isBoss ? "boss" : "event",
    text: event.isBoss
      ? consequences.narrativeTag
      : `${event.id}|${consequences.narrativeTag}`,
  };

  return { state: next, story };
}

/**
 * Apply event-based modifiers to a WaveConfig (problem density + category skew).
 * Used by ActionScene before starting the wave.
 */
export function applyEventToWave(
  wave: WaveConfig,
  state: GameState,
): WaveConfig {
  const pwm = state.pendingWaveModifiers;

  // Policy-based density multiplier
  let densityMult = 1;
  for (const id of state.activePolicies) {
    const d = POLICY_BY_ID[id]?.modifiers.problemDensityMultiplier;
    if (d !== undefined) densityMult *= d;
  }
  if (pwm.problemDensity) densityMult *= pwm.problemDensity;

  let distribution = { ...wave.distribution };
  if (pwm.categorySkew) {
    // Bump the skewed category by +0.3 and renormalize
    distribution = { ...distribution };
    distribution[pwm.categorySkew] = (distribution[pwm.categorySkew] ?? 0) + 0.3;
    const total =
      distribution.marketing + distribution.finance + distribution.operations + distribution.general;
    distribution.marketing /= total;
    distribution.finance /= total;
    distribution.operations /= total;
    distribution.general /= total;
  }

  return {
    ...wave,
    problemCount: Math.max(3, Math.round(wave.problemCount * densityMult)),
    distribution,
  };
}

/**
 * Consume pending wave modifiers that are one-shot (after a wave completes).
 */
export function consumePendingWaveModifiers(state: GameState): GameState {
  return {
    ...state,
    pendingWaveModifiers: {
      // Keep only the margin penalty duration (ticks down monthly)
      marginPenalty: state.pendingWaveModifiers.marginPenalty,
      marginPenaltyMonthsLeft: state.pendingWaveModifiers.marginPenaltyMonthsLeft,
    },
  };
}

/**
 * Apply monthly reputation penalty for missed problems (called after wave).
 * -1 rep per missed problem (capped).
 */
export function applyMonthEndReputation(state: GameState): GameState {
  const missed =
    state.missedByCategory.marketing +
    state.missedByCategory.finance +
    state.missedByCategory.operations +
    state.missedByCategory.general;
  const delta = -Math.min(15, missed); // cap -15/mo
  return {
    ...state,
    reputation: Math.max(0, Math.min(100, state.reputation + delta)),
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
  return `${sign}€${Math.round(abs * 1000)}`;
}

export function formatPercent(ratio: number, decimals: number = 0): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

export function ratioHealth(
  ratio: number,
  target: number,
  invertDirection: boolean = false,
): "good" | "warning" | "bad" {
  const good = invertDirection ? ratio <= target : ratio >= target;
  const warning = invertDirection
    ? ratio <= target * 1.3
    : ratio >= target * 0.7;

  if (good) return "good";
  if (warning) return "warning";
  return "bad";
}

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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
