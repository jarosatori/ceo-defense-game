import type { GameState, FocusActivity, WaveConfig } from "../types";
import {
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
  FOCUS_CONFIGS,
} from "../constants";

/**
 * Calculate revenue earned after completing a wave.
 *
 * Revenue = baseRevenue × teamMultiplier × focusMultiplier × performanceMultiplier
 *
 * - teamMultiplier: sum of role revenueBoost (seniors × 1.5)
 * - focusMultiplier: from chosen focus activity
 * - performanceMultiplier: based on % problems caught (missed problems = lost revenue)
 */
export function calculateWaveRevenue(
  state: GameState,
  waveConfig: WaveConfig,
  focus: FocusActivity | null
): number {
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

  const revenue = Math.round(
    base * teamMultiplier * focusMultiplier * performanceMultiplier
  );

  return revenue;
}

/**
 * Get a human-readable revenue label (€15k → "€15 000", €1.2M → "€1,2M")
 */
export function formatRevenue(revenueK: number): string {
  if (revenueK >= 1000) {
    const millions = revenueK / 1000;
    return `€${millions.toFixed(millions >= 10 ? 0 : 1).replace(".", ",")}M`;
  }
  return `€${revenueK.toLocaleString("sk-SK")}k`;
}

/**
 * Get revenue milestone label for results
 */
export function getRevenueMilestone(revenueK: number): string {
  if (revenueK >= 1000) return "Milionár! 🏆";
  if (revenueK >= 500) return "Na ceste k miliónu";
  if (revenueK >= 200) return "Rastúci biznis";
  if (revenueK >= 100) return "Stabilná firma";
  if (revenueK >= 50) return "Začínajúci podnikateľ";
  return "Živnostník";
}
