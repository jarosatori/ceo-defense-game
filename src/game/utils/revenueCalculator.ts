import type { GameState, FocusActivity, WaveConfig } from "../types";
import {
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
  FOCUS_CONFIGS,
} from "../constants";

/**
 * Calculate revenue and profit earned after completing a wave.
 *
 * Revenue = baseRevenue x teamMultiplier x focusMultiplier x performanceMultiplier
 * Profit = revenue - monthly team costs
 */
export function calculateWaveFinancials(
  state: GameState,
  waveConfig: WaveConfig,
  focus: FocusActivity | null
): { revenueGain: number; profitGain: number; monthlyCosts: number } {
  const base = waveConfig.baseRevenue;

  // Team multiplier: 1.0 + sum of all team members' revenue boosts
  let teamBoost = 0;
  for (const member of state.team) {
    const config = ROLE_CONFIGS[member.role];
    const boost = config.revenueBoost;
    teamBoost +=
      member.level === "senior"
        ? boost * SENIOR_MULTIPLIER.revenueBoostFactor
        : boost;
  }
  const teamMultiplier = 1 + teamBoost;

  // Focus multiplier
  let focusMultiplier = 1;
  if (focus) {
    const focusConfig = FOCUS_CONFIGS.find((f) => f.id === focus);
    if (focusConfig) {
      focusMultiplier = focusConfig.revenueMultiplier;
    }
  }

  // Performance multiplier: how well you defended this wave
  // 100% caught = 1.0, 50% caught = 0.5, 0% caught = 0.2 (min floor)
  const totalProblems = state.problemsCaught + state.problemsMissed;
  const catchRate = totalProblems > 0 ? state.problemsCaught / totalProblems : 0.5;
  const performanceMultiplier = Math.max(0.2, catchRate);

  const revenueGain = Math.round(
    base * teamMultiplier * focusMultiplier * performanceMultiplier
  );

  // Monthly costs = sum of all team member monthlyCosts
  const monthlyCosts = state.team.reduce((sum, m) => {
    const cfg = ROLE_CONFIGS[m.role];
    return sum + cfg.monthlyCost;
  }, 0);

  const profitGain = revenueGain - monthlyCosts;

  return { revenueGain, profitGain, monthlyCosts };
}

/**
 * Legacy wrapper — returns just the revenue gain number.
 * Used where only revenue is needed.
 */
export function calculateWaveRevenue(
  state: GameState,
  waveConfig: WaveConfig,
  focus: FocusActivity | null
): number {
  return calculateWaveFinancials(state, waveConfig, focus).revenueGain;
}

/**
 * Get a human-readable revenue label (€15k -> "€15 000", €1.2M -> "€1,2M")
 */
export function formatRevenue(revenueK: number): string {
  if (revenueK >= 1000) {
    const millions = revenueK / 1000;
    return `€${millions.toFixed(millions >= 10 ? 0 : 1).replace(".", ",")}M`;
  }
  return `€${revenueK.toLocaleString("sk-SK")}k`;
}

/**
 * Format profit — same as revenue but can show negative in red-compatible format
 */
export function formatProfit(profitK: number): string {
  const prefix = profitK < 0 ? "-" : "+";
  const abs = Math.abs(profitK);
  if (abs >= 1000) {
    const millions = abs / 1000;
    return `${prefix}€${millions.toFixed(millions >= 10 ? 0 : 1).replace(".", ",")}M`;
  }
  return `${prefix}€${abs.toLocaleString("sk-SK")}k`;
}

/**
 * Get revenue milestone label for results
 */
export function getRevenueMilestone(revenueK: number): string {
  if (revenueK >= 3000) return "Exit ready";
  if (revenueK >= 1500) return "Milionár";
  if (revenueK >= 800) return "Na ceste k miliónu";
  if (revenueK >= 400) return "Stredná firma";
  if (revenueK >= 150) return "Rastúci biznis";
  if (revenueK >= 50) return "Malý podnikateľ";
  return "Živnostník";
}
