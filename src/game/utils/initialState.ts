import type { BusinessType, GameState } from "../types";
import { BUSINESS_TYPE_CONFIGS, STARTING_BUDGET } from "../constants";

/**
 * Create a fresh GameState for a given business type.
 * Used by React overlay when the player picks E-shop / Agentúra.
 */
export function createInitialGameState(businessType: BusinessType): GameState {
  const cfg = BUSINESS_TYPE_CONFIGS[businessType];
  return {
    wave: 1,
    score: 0,
    budget: STARTING_BUDGET,
    cash: STARTING_BUDGET,
    energy: 10,
    reputation: 50,
    damage: 0,
    businessType,
    baselineRatios: {
      grossMargin: cfg.startingGrossMargin,
      marketingRatio: cfg.startingMarketingRatio,
      revenueMultiplier: 1,
      teamEffectiveness: 1,
    },
    revenue: 0,
    profit: 0,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    monthlyCosts: 0,
    pnlHistory: [],
    team: [],
    problemsCaught: 0,
    problemsMissed: 0,
    caughtByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
    missedByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
    manualClicks: 0,
    phase: "policy-select",
    priorityHistory: [],
    selectedPriority: null,
    activePolicies: [],
    runStory: [],
    pendingEvent: null,
    pendingWaveModifiers: {},
    consecutiveLossMonths: 0,
  };
}
