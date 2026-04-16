import type { WaveConfig } from "../types";

// problemSpeed = SECONDS for problem to cross screen (higher = slower = easier)
// baseRevenue = potential revenue growth this wave (€k) — modified by team + focus
export const WAVES: WaveConfig[] = [
  {
    wave: 1,
    name: "Všetko sám",
    duration: 22,
    problemCount: 9,
    problemSpeed: 3.8,
    distribution: { marketing: 0.7, finance: 0.1, operations: 0.2, general: 0 },
    burstEnabled: false,
    burstSize: 0,
    baseRevenue: 20, // €20k potential growth
  },
  {
    wave: 2,
    name: "Prvý nápor",
    duration: 28,
    problemCount: 15,
    problemSpeed: 3.3,
    distribution: { marketing: 0.5, finance: 0.15, operations: 0.35, general: 0 },
    burstEnabled: false,
    burstSize: 0,
    baseRevenue: 40,
  },
  {
    wave: 3,
    name: "Peniaze horia",
    duration: 34,
    problemCount: 22,
    problemSpeed: 2.9,
    distribution: { marketing: 0.25, finance: 0.5, operations: 0.25, general: 0 },
    burstEnabled: true,
    burstSize: 3,
    baseRevenue: 80,
  },
  {
    wave: 4,
    name: "Chaos",
    duration: 40,
    problemCount: 30,
    problemSpeed: 2.5,
    distribution: { marketing: 0.15, finance: 0.2, operations: 0.65, general: 0 },
    burstEnabled: true,
    burstSize: 4,
    baseRevenue: 150,
  },
  {
    wave: 5,
    name: "Škáluj alebo zomri",
    duration: 48,
    problemCount: 42,
    problemSpeed: 2.2,
    distribution: { marketing: 0.25, finance: 0.25, operations: 0.25, general: 0.25 },
    burstEnabled: true,
    burstSize: 5,
    baseRevenue: 300,
  },
];
