import type {
  BusinessTypeConfig,
  Category,
  PriorityConfig,
  ProblemConfig,
  RoleConfig,
} from "./types";

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
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  accent: "#eab308",
} as const;

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

// ──────────────────────────────────────────────────────────
// BUSINESS TYPES — baseline ratios at start
// ──────────────────────────────────────────────────────────

export const BUSINESS_TYPE_CONFIGS: Record<"eshop" | "services", BusinessTypeConfig> = {
  eshop: {
    id: "eshop",
    label: "E-shop",
    description: "Predávaš produkty online. Nízka marža, vyššie marketing náklady. Výzva: zlepšiť maržu.",
    emoji: "🛒",
    startingRevenue: 3, // €3k/month
    startingGrossMargin: 0.45, // 45% — after COGS
    startingMarketingRatio: 0.25, // 25% of revenue on ads
    maxGrossMargin: 0.65,
    minMarketingRatio: 0.08,
    characterColor: "#3b82f6",
    characterLabel: "E-SHOP",
  },
  services: {
    id: "services",
    label: "Služby / Agentúra",
    description: "Predávaš expertízu alebo čas. Vysoká marža, ale kapacita limitovaná tímom.",
    emoji: "💼",
    startingRevenue: 4, // €4k/month
    startingGrossMargin: 0.7, // 70% — no inventory
    startingMarketingRatio: 0.1, // 10% — mostly referrals
    maxGrossMargin: 0.85,
    minMarketingRatio: 0.05,
    characterColor: "#22c55e",
    characterLabel: "AGENTÚRA",
  },
};

// ──────────────────────────────────────────────────────────
// ROLES — realistic salaries in €k/month
// Hiring fee (one-time) = monthly × 2, Upgrade = monthly × 3
// ──────────────────────────────────────────────────────────

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  va: {
    role: "va",
    label: "Virtuálna asistentka",
    description: "Emaily, admin, support. Pomalšia, ale lacná a flexibilná.",
    color: CSS_COLORS.general,
    catchCategories: ["marketing", "finance", "operations", "general"],
    catchSpeed: 900,
    catchRadius: 80,
    cost: 2, // €2k hiring
    upgradeCost: 3,
    monthlyCost: 1, // €1k/month
    revenueBoost: 0.02,
  },
  support: {
    role: "support",
    label: "Customer Support",
    description: "Rieši zákaznícke problémy, reklamácie. Znižuje churn.",
    color: CSS_COLORS.operations,
    catchCategories: ["general", "operations"],
    catchSpeed: 600,
    catchRadius: 90,
    cost: 3,
    upgradeCost: 4.5,
    monthlyCost: 1.5,
    revenueBoost: 0.03,
  },
  accountant: {
    role: "accountant",
    label: "Účtovník",
    description: "Faktúry, dane, cashflow. Základ finančnej disciplíny.",
    color: CSS_COLORS.finance,
    catchCategories: ["finance"],
    catchSpeed: 500,
    catchRadius: 100,
    cost: 4,
    upgradeCost: 6,
    monthlyCost: 2,
    revenueBoost: 0.04,
    ratioBoost: {
      grossMargin: 0.01, // +1pp margin (better cost tracking)
    },
  },
  sales: {
    role: "sales",
    label: "Obchodník",
    description: "Uzatvára dealy, prináša tržby. Priamy impact na obrat.",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing", "general"],
    catchSpeed: 550,
    catchRadius: 95,
    cost: 5,
    upgradeCost: 7.5,
    monthlyCost: 2.5,
    revenueBoost: 0.10,
  },
  hr: {
    role: "hr",
    label: "HR Generalista",
    description: "Nábor, onboarding, kultúra. Pomáha scalovať tím.",
    color: CSS_COLORS.general,
    catchCategories: ["general"],
    catchSpeed: 400,
    catchRadius: 100,
    cost: 5,
    upgradeCost: 7.5,
    monthlyCost: 2.5,
    revenueBoost: 0.04,
    ratioBoost: {
      teamEffectiveness: 0.1, // team works 10% better
    },
  },
  marketing: {
    role: "marketing",
    label: "Marketingový špecialista",
    description: "Buduje značku, prináša zákazníkov. Ťahúň obratu.",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing"],
    catchSpeed: 400,
    catchRadius: 110,
    cost: 6,
    upgradeCost: 9,
    monthlyCost: 3,
    revenueBoost: 0.15,
    ratioBoost: {
      marketingRatio: -0.02, // -2pp (brand building lowers CAC)
    },
  },
  operations: {
    role: "operations",
    label: "Operations Manager",
    description: "Procesy, logistika, kvalita. Škáluje kapacitu firmy.",
    color: CSS_COLORS.operations,
    catchCategories: ["operations"],
    catchSpeed: 400,
    catchRadius: 120,
    cost: 7,
    upgradeCost: 10.5,
    monthlyCost: 3.5,
    revenueBoost: 0.08,
    ratioBoost: {
      grossMargin: 0.02, // +2pp (efficient operations)
    },
  },
  product: {
    role: "product",
    label: "Produktový manažér",
    description: "Vylepšuje produkt, riadi roadmapu. Zvyšuje maržu.",
    color: CSS_COLORS.marketing,
    catchCategories: ["marketing", "operations"],
    catchSpeed: 500,
    catchRadius: 100,
    cost: 8,
    upgradeCost: 12,
    monthlyCost: 4,
    revenueBoost: 0.12,
    ratioBoost: {
      grossMargin: 0.03, // +3pp (better product = higher margin)
    },
  },
  cfo: {
    role: "cfo",
    label: "Finančný kontrolór",
    description: "Strategické financie — optimalizácia ziskovosti.",
    color: CSS_COLORS.finance,
    catchCategories: ["finance"],
    catchSpeed: 350,
    catchRadius: 120,
    cost: 10,
    upgradeCost: 15,
    monthlyCost: 5,
    revenueBoost: 0.08,
    ratioBoost: {
      grossMargin: 0.02,
      marketingRatio: -0.02,
    },
  },
  coo: {
    role: "coo",
    label: "COO (Pravá ruka)",
    description: "Pravá ruka CEO — prevádzka aj financie. Odbremení ťa.",
    color: CSS_COLORS.operations,
    catchCategories: ["operations", "finance"],
    catchSpeed: 450,
    catchRadius: 130,
    cost: 12,
    upgradeCost: 18,
    monthlyCost: 6,
    revenueBoost: 0.15,
    ratioBoost: {
      teamEffectiveness: 0.15,
      grossMargin: 0.02,
    },
  },
};

// ──────────────────────────────────────────────────────────
// PRIORITIES — 9 strategic focuses (MANDATORY each wave)
// Permanent boosts stack each time picked
// ──────────────────────────────────────────────────────────

export const PRIORITY_CONFIGS: PriorityConfig[] = [
  {
    id: "product",
    label: "Produktový vývoj",
    description: "Vylepšuješ produkt — zvyšuješ maržu aj dopyt.",
    color: CSS_COLORS.marketing,
    revenueBoostThisMonth: 1.05,
    permanentBoosts: {
      grossMargin: 0.005, // +0.5pp
    },
    reducesCategory: "marketing",
    reductionPercent: 0.15,
  },
  {
    id: "marketing",
    label: "Marketing & brand building",
    description: "Buduješ značku — obrat rastie, CAC klesá.",
    color: CSS_COLORS.marketing,
    revenueBoostThisMonth: 1.08,
    permanentBoosts: {
      marketingRatio: -0.005, // -0.5pp (brand = lower CAC)
      revenueMultiplier: 0.02, // permanent +2%
    },
    reducesCategory: "marketing",
    reductionPercent: 0.2,
  },
  {
    id: "sales",
    label: "Agresívny predaj",
    description: "Krátkodobý boost obratu tento mesiac.",
    color: CSS_COLORS.general,
    revenueBoostThisMonth: 1.25, // big boost THIS MONTH
    permanentBoosts: {}, // no lasting improvement
    reducesCategory: "general",
    reductionPercent: 0.3,
  },
  {
    id: "processes",
    label: "Procesy & systémy",
    description: "Systematizuješ prevádzku. Menej chaosu.",
    color: CSS_COLORS.operations,
    revenueBoostThisMonth: 1.03,
    permanentBoosts: {
      grossMargin: 0.003,
      teamEffectiveness: 0.03,
    },
    reducesCategory: "operations",
    reductionPercent: 0.35,
  },
  {
    id: "finance",
    label: "Finančné riadenie",
    description: "Kontroluješ čísla — lepšie marže a cashflow.",
    color: CSS_COLORS.finance,
    revenueBoostThisMonth: 1.02,
    permanentBoosts: {
      grossMargin: 0.01, // +1pp permanent
    },
    reducesCategory: "finance",
    reductionPercent: 0.25,
  },
  {
    id: "team",
    label: "Budovanie tímu",
    description: "Investuješ do ľudí — tím pracuje efektívnejšie.",
    color: CSS_COLORS.general,
    revenueBoostThisMonth: 1.03,
    permanentBoosts: {
      teamEffectiveness: 0.05, // +5% team output
    },
    reducesCategory: "general",
    reductionPercent: 0.2,
  },
  {
    id: "unit-economics",
    label: "Unit economics",
    description: "Optimalizuješ jednotkovú ekonomiku — margin rastie.",
    color: CSS_COLORS.finance,
    revenueBoostThisMonth: 1.02,
    permanentBoosts: {
      grossMargin: 0.015, // +1.5pp — strongest margin boost
    },
    reducesCategory: "finance",
    reductionPercent: 0.15,
  },
  {
    id: "retention",
    label: "Retencia & LTV",
    description: "Staráš sa o existujúcich zákazníkov. Obrat rastie.",
    color: CSS_COLORS.operations,
    revenueBoostThisMonth: 1.08,
    permanentBoosts: {
      revenueMultiplier: 0.03, // +3% permanent
      marketingRatio: -0.008, // -0.8pp (retained customers = cheaper)
    },
    reducesCategory: "general",
    reductionPercent: 0.1,
  },
  {
    id: "self-dev",
    label: "Self-development CEO",
    description: "Rozvíjaš seba — lepšie rozhodnutia, viac kapacity.",
    color: CSS_COLORS.accent,
    revenueBoostThisMonth: 1.02,
    permanentBoosts: {
      revenueMultiplier: 0.015,
      teamEffectiveness: 0.02,
    },
  },
];

export const SENIOR_MULTIPLIER = {
  speedFactor: 0.65,
  radiusFactor: 1.4,
  revenueBoostFactor: 1.5,
  monthlyCostFactor: 1.5, // seniors cost 50% more
};

// ──────────────────────────────────────────────────────────
// GAME BALANCE
// ──────────────────────────────────────────────────────────

export const DAMAGE_PER_MISS = 6;
export const BUDGET_PER_CATCH = 0.15; // €k per catch → builds up hiring budget
export const CEO_CATCH_RADIUS = 80;
export const CEO_CATCH_SPEED = 400;
export const PLANNING_DURATION = 30; // 30s for strategic decisions
export const STARTING_BUDGET = 5; // €5k starting cash

// Team orbit
export const TEAM_ORBIT_RADIUS = 55;
export const TEAM_ORBIT_SPEED = 0.15;

// Combo
export const COMBO_WINDOW_MS = 1500;
export const COMBO_BONUS_MULTIPLIER = 0.5;

// Profit game-over: if cumulative EBITDA drops below this, game over
export const PROFIT_GAMEOVER_THRESHOLD = -30; // €-30k cumulative = cash crunch

// Win milestone targets
export const MILESTONES = {
  EXIT_READY_REVENUE: 3000, // €3M cumulative
  MILIONAR_REVENUE: 1000,    // €1M cumulative
  PROFITABLE_REVENUE: 500,   // €500k cumulative
  GROWING_REVENUE: 200,
  HEALTHY_EBITDA_RATIO: 0.15, // 15% EBITDA margin = healthy
};
