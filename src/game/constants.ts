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
    catchSpeed: 900,
    catchRadius: 90,
    cost: 50,
    upgradeCost: 70,
  },
  marketing: {
    role: "marketing",
    label: "Marketingák",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing"],
    catchSpeed: 450,
    catchRadius: 110,
    cost: 80,
    upgradeCost: 120,
  },
  finance: {
    role: "finance",
    label: "Finančník",
    color: CSS_COLORS.finance,
    catchCategories: ["finance"],
    catchSpeed: 450,
    catchRadius: 110,
    cost: 80,
    upgradeCost: 120,
  },
  operations: {
    role: "operations",
    label: "Operations Manager",
    color: CSS_COLORS.operations,
    catchCategories: ["operations"],
    catchSpeed: 450,
    catchRadius: 130,
    cost: 100,
    upgradeCost: 150,
  },
};

export const SENIOR_MULTIPLIER = {
  speedFactor: 0.65,
  radiusFactor: 1.4,
};

export const DAMAGE_PER_MISS = 6;
export const BUDGET_PER_CATCH = 5;
export const CEO_CATCH_RADIUS = 80;
export const CEO_CATCH_SPEED = 400;
export const PLANNING_DURATION = 12;
export const STARTING_BUDGET = 60;

// Team orbit config (much closer, more visible)
export const TEAM_ORBIT_RADIUS = 55;
export const TEAM_ORBIT_SPEED = 0.15;

// Combo system
export const COMBO_WINDOW_MS = 1500;
export const COMBO_BONUS_MULTIPLIER = 0.5; // +50% per combo tier
