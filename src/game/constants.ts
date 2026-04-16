import type { Category, FocusConfig, ProblemConfig, RoleConfig } from "./types";

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

// Category labels (used across UI)
export const CATEGORY_LABELS: Record<Category, string> = {
  marketing: "Produkt & Marketing",
  finance: "Financie",
  operations: "Operácie & Procesy",
  general: "Ostatné",
};

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
    description: "Rieši všetko po troche — emaily, admin, support. Pomalšia, ale flexibilná.",
    color: CSS_COLORS.general,
    catchCategories: ["marketing", "finance", "operations", "general"],
    catchSpeed: 900,
    catchRadius: 80,
    cost: 60,        // monthlyCost * 2
    upgradeCost: 90, // monthlyCost * 3
    monthlyCost: 30,
    revenueBoost: 0.02,
  },
  sales: {
    role: "sales",
    label: "Obchodník",
    description: "Uzatvára dealy, prináša tržby. Silný v marketingu aj general.",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing", "general"],
    catchSpeed: 550,
    catchRadius: 95,
    cost: 120,
    upgradeCost: 180,
    monthlyCost: 60,
    revenueBoost: 0.12,
  },
  marketing: {
    role: "marketing",
    label: "Marketingový špecialista",
    description: "Buduje značku, prináša zákazníkov. Ťahúň rastu obratu.",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing"],
    catchSpeed: 400,
    catchRadius: 110,
    cost: 140,
    upgradeCost: 210,
    monthlyCost: 70,
    revenueBoost: 0.18,
  },
  product: {
    role: "product",
    label: "Produktový manažér",
    description: "Vylepšuje produkt, riadi roadmapu. Chytá marketing aj operácie.",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing", "operations"],
    catchSpeed: 500,
    catchRadius: 100,
    cost: 180,
    upgradeCost: 270,
    monthlyCost: 90,
    revenueBoost: 0.15,
  },
  support: {
    role: "support",
    label: "Customer Support",
    description: "Rieši zákaznícke problémy a operatívu. Lacný a spoľahlivý.",
    color: CSS_COLORS.operations,
    catchCategories: ["general", "operations"],
    catchSpeed: 600,
    catchRadius: 90,
    cost: 80,
    upgradeCost: 120,
    monthlyCost: 40,
    revenueBoost: 0.04,
  },
  accountant: {
    role: "accountant",
    label: "Účtovník",
    description: "Kontroluje faktúry, dane, cashflow. Chráni tvoje peniaze.",
    color: CSS_COLORS.finance,
    catchCategories: ["finance"],
    catchSpeed: 500,
    catchRadius: 100,
    cost: 100,
    upgradeCost: 150,
    monthlyCost: 50,
    revenueBoost: 0.06,
  },
  cfo: {
    role: "cfo",
    label: "Finančný kontrolór",
    description: "Strategické financie — optimalizuje ziskovosť a investície.",
    color: CSS_COLORS.finance,
    catchCategories: ["finance"],
    catchSpeed: 350,
    catchRadius: 120,
    cost: 200,
    upgradeCost: 300,
    monthlyCost: 100,
    revenueBoost: 0.12,
  },
  hr: {
    role: "hr",
    label: "HR Generalista",
    description: "Nábor, onboarding, kultúra. Rieši ľudské problémy.",
    color: CSS_COLORS.general,
    catchCategories: ["general"],
    catchSpeed: 400,
    catchRadius: 100,
    cost: 120,
    upgradeCost: 180,
    monthlyCost: 60,
    revenueBoost: 0.05,
  },
  operations: {
    role: "operations",
    label: "Operations Manager",
    description: "Nastavuje procesy, rieši logistiku, zabezpečuje kvalitu.",
    color: CSS_COLORS.operations,
    catchCategories: ["operations"],
    catchSpeed: 400,
    catchRadius: 120,
    cost: 160,
    upgradeCost: 240,
    monthlyCost: 80,
    revenueBoost: 0.10,
  },
  coo: {
    role: "coo",
    label: "COO (Pravá ruka)",
    description: "Pravá ruka CEO — operácie aj financie, škáluje kapacitu.",
    color: CSS_COLORS.operations,
    catchCategories: ["operations", "finance"],
    catchSpeed: 450,
    catchRadius: 130,
    cost: 300,
    upgradeCost: 450,
    monthlyCost: 150,
    revenueBoost: 0.18,
  },
};

// Focus activities player can choose in planning phase
export const FOCUS_CONFIGS: FocusConfig[] = [
  {
    id: "product",
    label: "Vylepšiť produkt & marketing",
    description: "+30% obrat z marketingu, menej marketingových problémov",
    color: CSS_COLORS.marketing,
    revenueMultiplier: 1.3,
    reduces: "marketing",
  },
  {
    id: "sales",
    label: "Agresívny predaj",
    description: "+20% celkový obrat, ale viac operačných problémov",
    color: CSS_COLORS.general,
    revenueMultiplier: 1.2,
    reduces: "general",
  },
  {
    id: "optimize",
    label: "Optimalizovať procesy",
    description: "+15% efektivita, výrazne menej operačných problémov",
    color: CSS_COLORS.operations,
    revenueMultiplier: 1.15,
    reduces: "operations",
  },
  {
    id: "cashflow",
    label: "Stabilizovať financie",
    description: "+10% obrat, výrazne menej finančných problémov",
    color: CSS_COLORS.finance,
    revenueMultiplier: 1.1,
    reduces: "finance",
  },
];

export const SENIOR_MULTIPLIER = {
  speedFactor: 0.65,
  radiusFactor: 1.4,
  revenueBoostFactor: 1.5, // seniors contribute 50% more to revenue
};

export const DAMAGE_PER_MISS = 6;
export const BUDGET_PER_CATCH = 5;
export const CEO_CATCH_RADIUS = 80;
export const CEO_CATCH_SPEED = 400;
export const PLANNING_DURATION = 25; // more time for strategic decisions
export const STARTING_BUDGET = 80;
export const STARTING_REVENUE = 8; // €8k starting monthly revenue

// Team orbit config
export const TEAM_ORBIT_RADIUS = 55;
export const TEAM_ORBIT_SPEED = 0.15;

// Combo system
export const COMBO_WINDOW_MS = 1500;
export const COMBO_BONUS_MULTIPLIER = 0.5;

// Profit game-over threshold
export const PROFIT_GAMEOVER_THRESHOLD = -100; // €-100k = cash crunch
