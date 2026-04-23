import type { PolicyConfig } from "../types";

export const POLICY_CONFIGS: PolicyConfig[] = [
  {
    id: "aggressive-growth",
    label: "Agresívny rast",
    description: "+25% obrat, +40% hustota problémov",
    icon: "🚀",
    modifiers: { revenueMultiplier: 1.25, problemDensityMultiplier: 1.4 },
  },
  {
    id: "profit-focus",
    label: "Zisk prvá priorita",
    description: "+5pp marža, -20% revenue potential",
    icon: "🛡",
    modifiers: { grossMarginBoost: 0.05, revenueMultiplier: 0.8 },
  },
  {
    id: "brand-first",
    label: "Brand-first",
    description: "-1pp CAC každý mesiac, -10% obrat prvé mesiace",
    icon: "📢",
    modifiers: { marketingRatioDelta: -0.01, revenueMultiplier: 0.9 },
  },
  {
    id: "ops-excellence",
    label: "Operational Excellence",
    description: "Ops hires -20% cost, ops catch radius +40%",
    icon: "⚙️",
    modifiers: { hireCostMultiplier: 0.8, opsRadiusBonus: 0.4 },
  },
  {
    id: "sustainable-pace",
    label: "Udržateľné tempo",
    description: "+1 energy každý mesiac, -15% max obrat",
    icon: "🧘",
    modifiers: { energyPerMonth: 1, revenueMultiplier: 0.85 },
  },
  {
    id: "cash-preservation",
    label: "Šetriť cash",
    description: "Hire costs -30%, ale seniori zablokovaní",
    icon: "💸",
    modifiers: { hireCostMultiplier: 0.7, seniorsLocked: true },
  },
  {
    id: "product-market-focus",
    label: "Produkt-Market fokus",
    description: "+15% marža ak máš 2+ marketing/product hires",
    icon: "🎯",
    modifiers: {
      conditionalMarginBoost: {
        ifRoles: ["marketing", "product"],
        count: 2,
        boost: 0.15,
      },
    },
  },
  {
    id: "experiment",
    label: "Experimentovanie",
    description: "10% šanca na bonus event každý mesiac",
    icon: "🧪",
    modifiers: { bonusEventChance: 0.1 },
  },
  {
    id: "network-builder",
    label: "Network Builder",
    description: "Investor events sa zobrazujú 2x častejšie",
    icon: "🤝",
    modifiers: { investorEventMultiplier: 2 },
  },
  {
    id: "scorched-earth",
    label: "Scorched Earth",
    description: "+50% obrat, -5 reputácia každý mesiac",
    icon: "🔥",
    modifiers: { revenueMultiplier: 1.5, reputationPerMonth: -5 },
  },
  {
    id: "premium-positioning",
    label: "Premium positioning",
    description: "Menej ale väčšie problémy (2x revenue per catch)",
    icon: "💎",
    modifiers: {
      problemDensityMultiplier: 0.5,
      revenuePerCatchMultiplier: 2,
    },
  },
  {
    id: "slow-steady",
    label: "Pomaly a isto",
    description: "+10 reputácia každý mesiac, -10% obrat",
    icon: "🌱",
    modifiers: { reputationPerMonth: 10, revenueMultiplier: 0.9 },
  },
];

export const POLICY_BY_ID: Record<string, PolicyConfig> = Object.fromEntries(
  POLICY_CONFIGS.map((p) => [p.id, p]),
);
