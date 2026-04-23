export type Category = "marketing" | "finance" | "operations" | "general";

export type Role = "va" | "sales" | "marketing" | "product" | "support" | "accountant" | "cfo" | "hr" | "operations" | "coo";

export type Level = "junior" | "senior";

export type Phase = "intro" | "business-type" | "policy-select" | "event-decision" | "action" | "planning" | "results" | "gameover";

export type CEOProfile =
  | "lone-wolf"
  | "micromanager"
  | "generalist-trap"
  | "delegator"
  | "strategist";

/** Type of business the player runs — affects starting P&L ratios */
export type BusinessType = "eshop" | "services";

/** Strategic priority (legacy — V9 replaces with policies, kept for type compat) */
export type Priority =
  | "product"
  | "marketing"
  | "sales"
  | "processes"
  | "finance"
  | "team"
  | "unit-economics"
  | "retention"
  | "self-dev";

// ──────────────────────────────────────────────────────────
// V9 POLICIES — permanent run-wide modifiers picked at start
// ──────────────────────────────────────────────────────────

export type PolicyId =
  | "aggressive-growth"
  | "profit-focus"
  | "brand-first"
  | "ops-excellence"
  | "sustainable-pace"
  | "cash-preservation"
  | "product-market-focus"
  | "experiment"
  | "network-builder"
  | "scorched-earth"
  | "premium-positioning"
  | "slow-steady";

export interface PolicyModifiers {
  revenueMultiplier?: number;         // applied to monthly revenue
  problemDensityMultiplier?: number;  // applied to wave problemCount
  grossMarginBoost?: number;          // permanent pp added at run-start
  marketingRatioDelta?: number;       // pp added each month (negative = lowers CAC)
  hireCostMultiplier?: number;        // applied to hire cost
  opsRadiusBonus?: number;            // bonus to ops role catch radius (not implemented in MVP)
  energyPerMonth?: number;            // extra energy restored each month
  seniorsLocked?: boolean;            // block senior upgrades
  conditionalMarginBoost?: {
    ifRoles: Role[];
    count: number;
    boost: number;
  };
  bonusEventChance?: number;          // 0-1 chance of extra event
  investorEventMultiplier?: number;   // weight multiplier for investor/angel events
  reputationPerMonth?: number;        // ±rep each month
  revenuePerCatchMultiplier?: number; // revenue boost per catch (MVP: fold into revenue)
}

export interface PolicyConfig {
  id: PolicyId;
  label: string;
  description: string;
  icon: string;
  modifiers: PolicyModifiers;
}

// ──────────────────────────────────────────────────────────
// V9 EVENTS — narrative decisions between months
// ──────────────────────────────────────────────────────────

export interface EventTrigger {
  minMonth?: number;
  maxMonth?: number;
  minReputation?: number;
  maxReputation?: number;
  bossMonth?: number;
}

export interface EventConsequences {
  cashDelta?: number;                     // €k change
  reputationDelta?: number;               // -100..100
  energyDelta?: number;
  waveRevenueMultiplier?: number;         // applied to this month's revenue only
  waveCategorySkew?: Category;            // bias problem distribution this wave
  waveProblemDensity?: number;            // multiplier on problemCount
  grossMarginPermanent?: number;          // pp permanent
  revenueMultiplierPermanent?: number;    // applied to baselineRatios.revenueMultiplier
  teamEffectivenessPermanent?: number;    // applied to baselineRatios.teamEffectiveness
  temporaryMarginPenalty?: number;        // negative pp for N months
  temporaryMarginDuration?: number;
  narrativeTag: string;                   // the one-liner for run story
  seedRoundReward?: number;               // bonus cash if cash-audit survived
  auditCheck?: boolean;                   // special marker for boss cash audit
  earlyExit?: boolean;                    // end-run marker
  exitValue?: number;                     // €k
  vcCheck?: {
    marketingRatioBelow: number;
    reward: number;
    penaltyReputation: number;
  };
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  consequences: EventConsequences;
}

export interface GameEvent {
  id: string;
  isBoss?: boolean;
  headline: string;
  flavor: string;
  trigger: EventTrigger;
  choices: EventChoice[];
}

// ──────────────────────────────────────────────────────────
// RUN STORY — records narrative beats for share card
// ──────────────────────────────────────────────────────────

export type RunStoryKind =
  | "policy-picked"
  | "event"
  | "hire"
  | "boss"
  | "milestone"
  | "outcome";

export interface RunStoryEntry {
  month: number;
  kind: RunStoryKind;
  text: string;
}

// ──────────────────────────────────────────────────────────

export interface TeamMember {
  role: Role;
  level: Level;
  id: string;
}

export interface RoleConfig {
  role: Role;
  label: string;
  description: string;
  color: string;
  catchCategories: Category[];
  catchSpeed: number;
  catchRadius: number;
  cost: number;
  upgradeCost: number;
  monthlyCost: number;
  revenueBoost: number;
  ratioBoost?: {
    grossMargin?: number;
    marketingRatio?: number;
    teamEffectiveness?: number;
  };
}

export interface WaveConfig {
  wave: number;
  name: string;
  duration: number;
  problemCount: number;
  problemSpeed: number;
  distribution: Record<Category, number>;
  burstEnabled: boolean;
  burstSize: number;
  marketDemand: number;
}

export interface ProblemConfig {
  category: Category;
  color: string;
  shape: "triangle" | "diamond" | "square" | "circle";
}

export interface PriorityConfig {
  id: Priority;
  label: string;
  description: string;
  color: string;
  revenueBoostThisMonth: number;
  permanentBoosts: {
    grossMargin?: number;
    marketingRatio?: number;
    revenueMultiplier?: number;
    teamEffectiveness?: number;
  };
  reducesCategory?: Category;
  reductionPercent?: number;
}

export interface BusinessTypeConfig {
  id: BusinessType;
  label: string;
  description: string;
  emoji: string;
  startingRevenue: number;
  startingGrossMargin: number;
  startingMarketingRatio: number;
  maxGrossMargin: number;
  minMarketingRatio: number;
  characterColor: string;
  characterLabel: string;
}

export interface MonthlyPnl {
  month: number;
  revenue: number;
  cogs: number;
  grossMargin: number;
  marketingCost: number;
  cp3: number;
  salaries: number;
  ebitda: number;
  grossMarginRatio: number;
  marketingRatio: number;
  cp3Ratio: number;
  ebitdaRatio: number;
}

export interface BaselineRatios {
  grossMargin: number;
  marketingRatio: number;
  revenueMultiplier: number;
  teamEffectiveness: number;
}

/** Active event modifiers applied to the NEXT wave/PnL only. */
export interface PendingWaveModifiers {
  revenueMultiplier?: number;
  problemDensity?: number;
  categorySkew?: Category;
  marginPenalty?: number;   // temp margin reduction active
  marginPenaltyMonthsLeft?: number;
}

export interface GameState {
  wave: number;
  score: number;
  /** Alias of `cash`. Kept for Phaser scene compat. */
  budget: number;
  /** €k cash — preferred field going forward. */
  cash: number;
  /** 0-10 CEO mental capacity. */
  energy: number;
  /** 0-100 brand trust. */
  reputation: number;
  damage: number;
  businessType: BusinessType;
  baselineRatios: BaselineRatios;
  revenue: number;
  profit: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  monthlyCosts: number;
  pnlHistory: MonthlyPnl[];
  team: TeamMember[];
  problemsCaught: number;
  problemsMissed: number;
  caughtByCategory: Record<Category, number>;
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  phase: Phase;
  priorityHistory: Priority[];
  selectedPriority: Priority | null;

  // V9 additions
  activePolicies: PolicyId[];
  runStory: RunStoryEntry[];
  pendingEvent: GameEvent | null;
  pendingWaveModifiers: PendingWaveModifiers;
  consecutiveLossMonths: number;
  earlyExit?: { month: number; value: number };
}

export interface GameResults {
  profile: CEOProfile;
  wavesCompleted: number;
  score: number;
  revenue: number;
  profit: number;
  businessType: BusinessType;
  finalGrossMargin: number;
  finalEbitdaRatio: number;
  team: TeamMember[];
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  totalCaught: number;
  totalMissed: number;
}
