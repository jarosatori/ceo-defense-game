export type Category = "marketing" | "finance" | "operations" | "general";

export type Role = "va" | "sales" | "marketing" | "product" | "support" | "accountant" | "cfo" | "hr" | "operations" | "coo";

export type Level = "junior" | "senior";

export type Phase = "intro" | "action" | "planning" | "results" | "gameover";

export type CEOProfile =
  | "lone-wolf"
  | "micromanager"
  | "generalist-trap"
  | "delegator"
  | "strategist";

/** Activity the player chooses to focus on during planning */
export type FocusActivity = "product" | "sales" | "optimize" | "cashflow";

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
  /** Monthly salary cost (reduces profit each wave) */
  monthlyCost: number;
  /** Revenue multiplier this role contributes (per wave) */
  revenueBoost: number;
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
  /** Base revenue potential for this wave (€k) */
  baseRevenue: number;
}

export interface ProblemConfig {
  category: Category;
  color: string;
  shape: "triangle" | "diamond" | "square" | "circle";
}

export interface FocusConfig {
  id: FocusActivity;
  label: string;
  description: string;
  color: string;
  revenueMultiplier: number;
  /** Which category of problems this focus reduces */
  reduces: Category;
}

export interface GameState {
  wave: number;
  score: number;
  budget: number;
  damage: number;
  revenue: number;        // cumulative monthly revenue €k
  profit: number;         // cumulative EBITDA €k (revenue - costs)
  monthlyCosts: number;   // team salaries total per month
  team: TeamMember[];
  problemsCaught: number;
  problemsMissed: number;
  caughtByCategory: Record<Category, number>;
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  phase: Phase;
  focusHistory: FocusActivity[];
}

export interface GameResults {
  profile: CEOProfile;
  wavesCompleted: number;
  score: number;
  revenue: number;
  profit: number;
  team: TeamMember[];
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  totalCaught: number;
  totalMissed: number;
}
