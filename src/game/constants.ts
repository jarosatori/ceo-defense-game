import type { Category, ProblemConfig, RoleConfig } from "./types";

export const COLORS = {
  background: 0x0a0a0a,
  ceo: 0xffffff,
  marketing: 0x3b82f6,
  finance: 0xef4444,
  operations: 0x22c55e,
  general: 0xeab308,
  uiText: 0xe5e5e5,
  damageStart: 0x22c55e,
  damageEnd: 0xef4444,
} as const;

export const CSS_COLORS = {
  background: "#0a0a0a",
  ceo: "#ffffff",
  marketing: "#3b82f6",
  finance: "#ef4444",
  operations: "#22c55e",
  general: "#eab308",
  uiText: "#e5e5e5",
} as const;

export const PROBLEM_CONFIGS: Record<Category, ProblemConfig> = {
  marketing: { category: "marketing", color: "#3b82f6", shape: "triangle" },
  finance: { category: "finance", color: "#ef4444", shape: "diamond" },
  operations: { category: "operations", color: "#22c55e", shape: "square" },
  general: { category: "general", color: "#eab308", shape: "circle" },
};

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  va: {
    role: "va",
    label: "Virtuálna asistentka",
    color: CSS_COLORS.general,
    catchCategories: ["marketing", "finance", "operations", "general"],
    catchSpeed: 1200,
    catchRadius: 60,
    cost: 50,
    upgradeCost: 75,
  },
  marketing: {
    role: "marketing",
    label: "Marketingák",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing"],
    catchSpeed: 600,
    catchRadius: 70,
    cost: 100,
    upgradeCost: 150,
  },
  finance: {
    role: "finance",
    label: "Finančník",
    color: CSS_COLORS.finance,
    catchCategories: ["finance"],
    catchSpeed: 600,
    catchRadius: 70,
    cost: 100,
    upgradeCost: 150,
  },
  operations: {
    role: "operations",
    label: "Operations Manager",
    color: CSS_COLORS.operations,
    catchCategories: ["operations"],
    catchSpeed: 600,
    catchRadius: 90,
    cost: 150,
    upgradeCost: 225,
  },
};

export const SENIOR_MULTIPLIER = {
  speedFactor: 0.7,
  radiusFactor: 1.3,
};

export const DAMAGE_PER_MISS = 4;
export const BUDGET_PER_CATCH = 3;
export const CEO_CATCH_RADIUS = 50;
export const CEO_CATCH_SPEED = 400;
export const PLANNING_DURATION = 15;
export const STARTING_BUDGET = 0;
