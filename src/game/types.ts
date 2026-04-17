export type Category = "marketing" | "finance" | "operations" | "general";

export type Role = "va" | "sales" | "marketing" | "product" | "support" | "accountant" | "cfo" | "hr" | "operations" | "coo";

export type Level = "junior" | "senior";

export type Phase = "intro" | "business-type" | "action" | "planning" | "results" | "gameover";

export type CEOProfile =
  | "lone-wolf"
  | "micromanager"
  | "generalist-trap"
  | "delegator"
  | "strategist";

/** Type of business the player runs — affects starting P&L ratios */
export type BusinessType = "eshop" | "services";

/** Strategic priority for each month (wave). MANDATORY — player must pick one. */
export type Priority =
  | "product"           // Product development
  | "marketing"         // Marketing & brand
  | "sales"             // Aggressive sales push
  | "processes"         // Systems & processes
  | "finance"           // Financial discipline
  | "team"              // Team development
  | "unit-economics"    // Margin optimization
  | "retention"         // Customer retention & LTV
  | "self-dev";         // CEO self-development

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
  /** One-time hiring fee €k (recruitment, onboarding) */
  cost: number;
  /** One-time upgrade to senior fee €k */
  upgradeCost: number;
  /** Monthly salary cost €k (reduces profit every month) */
  monthlyCost: number;
  /** Revenue boost ratio (+X% on monthly revenue) */
  revenueBoost: number;
  /** One-time permanent ratio improvements when hired */
  ratioBoost?: {
    grossMargin?: number;      // +X percentage points
    marketingRatio?: number;   // -X percentage points (lowers marketing cost)
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
  /** Market potential revenue multiplier this month (how much the market can give you) */
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
  /** Short-term revenue multiplier (only this month) */
  revenueBoostThisMonth: number;
  /** Permanent improvements applied each time priority is chosen */
  permanentBoosts: {
    grossMargin?: number;       // +X percentage points
    marketingRatio?: number;    // -X percentage points
    revenueMultiplier?: number; // +X permanent multiplier
    teamEffectiveness?: number; // +X permanent
  };
  /** Reduces problems of this category */
  reducesCategory?: Category;
  /** Percentage reduction of that category's problems */
  reductionPercent?: number;
}

/** Business type config — starting baseline ratios */
export interface BusinessTypeConfig {
  id: BusinessType;
  label: string;
  description: string;
  emoji: string;
  startingRevenue: number;      // €k/month
  startingGrossMargin: number;  // % (e.g., 0.45 = 45%)
  startingMarketingRatio: number; // % of revenue (e.g., 0.25 = 25%)
  maxGrossMargin: number;       // cap on margin improvement
  minMarketingRatio: number;    // floor on marketing cost
  characterColor: string;
  characterLabel: string;       // displayed in-game
}

/** Snapshot of one month's P&L */
export interface MonthlyPnl {
  month: number;
  revenue: number;
  cogs: number;
  grossMargin: number;
  marketingCost: number;
  cp3: number;
  salaries: number;
  ebitda: number;
  // Ratios at end of month
  grossMarginRatio: number;
  marketingRatio: number;
  cp3Ratio: number;
  ebitdaRatio: number;
}

/** Baseline ratios that improve over time with decisions */
export interface BaselineRatios {
  grossMargin: number;       // 0-1
  marketingRatio: number;    // 0-1 (as % of revenue)
  revenueMultiplier: number; // 1.0 = baseline, grows with retention/brand
  teamEffectiveness: number; // 1.0 = baseline, grows with team-dev priority
}

export interface GameState {
  wave: number;
  score: number;
  budget: number;
  damage: number;
  businessType: BusinessType;
  baselineRatios: BaselineRatios;
  revenue: number;             // cumulative revenue €k
  profit: number;              // cumulative EBITDA €k
  monthlyRevenue: number;      // last month's revenue
  monthlyProfit: number;       // last month's profit
  monthlyCosts: number;        // current team salaries total
  pnlHistory: MonthlyPnl[];    // all months so far
  team: TeamMember[];
  problemsCaught: number;
  problemsMissed: number;
  caughtByCategory: Record<Category, number>;
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  phase: Phase;
  priorityHistory: Priority[]; // one priority per completed wave
  selectedPriority: Priority | null; // selected for current planning phase
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
