import type { GameEvent } from "../types";

export const EVENTS: GameEvent[] = [
  {
    id: "competitor-launch",
    headline: "Konkurent spustil podobný produkt",
    flavor:
      "Väčší hráč kopíroval tvoj core produkt a spustil s 10x väčším marketing budgetom.",
    trigger: { minMonth: 3 },
    choices: [
      {
        id: "aggressive-ads",
        label: "Agresívna reklama",
        description: "-€10k cash, +30% obrat tento mesiac",
        consequences: {
          cashDelta: -10,
          waveRevenueMultiplier: 1.3,
          narrativeTag: "reagoval som agresívnou reklamou",
        },
      },
      {
        id: "product-innovation",
        label: "Produktová inovácia",
        description: "-€5k, +3pp marža permanent, ťažší mesiac",
        consequences: {
          cashDelta: -5,
          grossMarginPermanent: 0.03,
          waveCategorySkew: "marketing",
          narrativeTag: "zaodpovedal som produktovou inováciou",
        },
      },
      {
        id: "ignore",
        label: "Ignorovať",
        description: "-15 reputácia",
        consequences: {
          reputationDelta: -15,
          narrativeTag: "ignoroval som konkurenciu",
        },
      },
    ],
  },
  {
    id: "viral-tiktok",
    headline: "Virálny TikTok o tvojom produkte",
    flavor:
      "Niekto postol video s tvojím produktom a dostal 2M views. Dopyt exploduje.",
    trigger: { minMonth: 2 },
    choices: [
      {
        id: "scale-up",
        label: "Nahnať kapacitu",
        description: "+50% obrat, +60% operations problémy",
        consequences: {
          waveRevenueMultiplier: 1.5,
          waveCategorySkew: "operations",
          waveProblemDensity: 1.3,
          narrativeTag: "využil som virál a škáloval",
        },
      },
      {
        id: "stay-course",
        label: "Zostať pri pláne",
        description: "+20% obrat, +5 reputácia",
        consequences: {
          waveRevenueMultiplier: 1.2,
          reputationDelta: 5,
          narrativeTag: "zostal som pri pláne",
        },
      },
    ],
  },
  {
    id: "key-employee-quits",
    headline: "Kľúčový zamestnanec sa vyhráža odchodom",
    flavor:
      "Najschopnejší člen tímu dostal ponuku od konkurenta. Chce 50% zvýšenie platu.",
    trigger: { minMonth: 4 },
    choices: [
      {
        id: "raise",
        label: "Zvýšiť plat",
        description: "-€8k, +5 reputácia, team +10% permanent",
        consequences: {
          cashDelta: -8,
          reputationDelta: 5,
          teamEffectivenessPermanent: 0.1,
          narrativeTag: "zvýšil som kľúčovému človeku plat",
        },
      },
      {
        id: "let-go",
        label: "Nechať odísť",
        description: "-10 reputácia, team -15% permanent",
        consequences: {
          reputationDelta: -10,
          teamEffectivenessPermanent: -0.15,
          narrativeTag: "nechal som kľúčového človeka odísť",
        },
      },
      {
        id: "counter-with-equity",
        label: "Ponúknuť equity",
        description: "-€3k, -2% obrat permanent, team +15%",
        consequences: {
          cashDelta: -3,
          teamEffectivenessPermanent: 0.15,
          revenueMultiplierPermanent: -0.02,
          narrativeTag: "ponúkol som equity",
        },
      },
    ],
  },
  {
    id: "big-customer-churn",
    headline: "Stratil si najväčšieho zákazníka",
    flavor: "€20k contract je preč. Prešiel ku konkurencii.",
    trigger: { minMonth: 4, minReputation: 30 },
    choices: [
      {
        id: "win-back",
        label: "Získať ho späť",
        description: "-€5k, risk",
        consequences: {
          cashDelta: -5,
          narrativeTag: "pokúsil som sa získať strateného zákazníka",
        },
      },
      {
        id: "focus-retention",
        label: "Retencia ostatných",
        description: "+10 reputácia, -30% obrat tento mesiac",
        consequences: {
          reputationDelta: 10,
          waveRevenueMultiplier: 0.7,
          narrativeTag: "zameral som sa na retenciu",
        },
      },
    ],
  },
  {
    id: "supply-chain-delay",
    headline: "Supply chain delay",
    flavor: "Dodávateľ má 2 týždne meškanie. Operácie explodujú.",
    trigger: { minMonth: 3 },
    choices: [
      {
        id: "air-freight",
        label: "Letecká doprava",
        description: "-€7k cash, normálny mesiac",
        consequences: {
          cashDelta: -7,
          narrativeTag: "zaplatil som leteckú dopravu",
        },
      },
      {
        id: "delay-accept",
        label: "Akceptovať delay",
        description: "2x operations problémy tento mesiac",
        consequences: {
          waveCategorySkew: "operations",
          waveProblemDensity: 1.5,
          narrativeTag: "akceptoval som delay",
        },
      },
    ],
  },
  {
    id: "pr-disaster",
    headline: "PR katastrofa",
    flavor: "Negatívna recenzia s 500+ likes. Reputation hit!",
    trigger: { minMonth: 4, minReputation: 40 },
    choices: [
      {
        id: "respond-publicly",
        label: "Verejne zareagovať",
        description: "-1 energy, +5 reputácia",
        consequences: {
          energyDelta: -1,
          reputationDelta: 5,
          narrativeTag: "verejne som zareagoval",
        },
      },
      {
        id: "ignore-pr",
        label: "Ignorovať",
        description: "-10 reputácia",
        consequences: {
          reputationDelta: -10,
          narrativeTag: "ignoroval som PR katastrofu",
        },
      },
    ],
  },
  {
    id: "partnership-offer",
    headline: "Partnership ponuka",
    flavor: "Väčšia firma ponúka co-marketing partnership.",
    trigger: { minMonth: 5, minReputation: 50 },
    choices: [
      {
        id: "accept-partnership",
        label: "Prijať",
        description: "+€15k, +10 reputácia, -20% marže 2 mesiace",
        consequences: {
          cashDelta: 15,
          reputationDelta: 10,
          temporaryMarginPenalty: 0.2,
          temporaryMarginDuration: 2,
          narrativeTag: "uzavrel som partnership",
        },
      },
      {
        id: "decline-partnership",
        label: "Odmietnuť",
        description: "Žiadna zmena",
        consequences: { narrativeTag: "odmietol som partnership" },
      },
    ],
  },
  {
    id: "regulatory-change",
    headline: "Zmena regulácie",
    flavor: "Nové EU pravidlá ovplyvňujú tvoj produkt.",
    trigger: { minMonth: 5 },
    choices: [
      {
        id: "compliance-invest",
        label: "Investovať do compliance",
        description: "-€10k, +10 reputácia, +1pp marža permanent",
        consequences: {
          cashDelta: -10,
          reputationDelta: 10,
          grossMarginPermanent: 0.01,
          narrativeTag: "investoval som do compliance",
        },
      },
      {
        id: "workaround",
        label: "Obísť cez loophole",
        description: "-5 reputácia",
        consequences: {
          reputationDelta: -5,
          narrativeTag: "obišiel som regulácie",
        },
      },
    ],
  },
  {
    id: "angel-offer",
    headline: "Anjel investor ťa našiel",
    flavor: "Skúsený podnikateľ ponúka €30k za 5% equity.",
    trigger: { minMonth: 3, maxReputation: 60 },
    choices: [
      {
        id: "accept-angel",
        label: "Prijať €30k",
        description: "+€30k, -2% obrat permanent (dilution)",
        consequences: {
          cashDelta: 30,
          revenueMultiplierPermanent: -0.02,
          narrativeTag: "prijal som anjel investora",
        },
      },
      {
        id: "decline-angel",
        label: "Odmietnuť",
        description: "+5 reputácia (bootstrap street cred)",
        consequences: {
          reputationDelta: 5,
          narrativeTag: "odmietol som anjel investora",
        },
      },
    ],
  },
  {
    id: "growth-spurt",
    headline: "Neočakávaný growth spurt",
    flavor: "Word-of-mouth ťa posúva vyššie ako si čakal.",
    trigger: { minMonth: 2 },
    choices: [
      {
        id: "invest-growth",
        label: "Investovať do marketingu",
        description: "-€4k, +€25% obrat tento mesiac",
        consequences: {
          cashDelta: -4,
          waveRevenueMultiplier: 1.25,
          narrativeTag: "investoval som do momenta",
        },
      },
      {
        id: "bank-cash",
        label: "Odložiť cash",
        description: "+5 reputácia, normálny mesiac",
        consequences: {
          reputationDelta: 5,
          narrativeTag: "odložil som si cash",
        },
      },
    ],
  },
  // BOSS events
  {
    id: "boss-month-3-cash-audit",
    isBoss: true,
    trigger: { bossMonth: 3 },
    headline: "MESIAC 3: Cash Audit",
    flavor:
      "Tvoj účtovník hovorí: 'Ak si mal 2+ stratové mesiace za sebou, je to game over. Investor audituje.'",
    choices: [
      {
        id: "face-it",
        label: "Postaviť sa tomu",
        description:
          "Ak máš 2+ stratové mesiace v rade → game over. Inak +€20k Seed round.",
        consequences: {
          auditCheck: true,
          seedRoundReward: 20,
          narrativeTag: "Prežil som cash audit",
        },
      },
    ],
  },
  {
    id: "boss-month-6-market-shift",
    isBoss: true,
    trigger: { bossMonth: 6 },
    headline: "MESIAC 6: Market Shift",
    flavor: "Trh sa mení. Jedna kategória bude 2x kritickejšia.",
    choices: [
      {
        id: "prep-marketing",
        label: "Pripraviť marketing",
        description: "1.5x marketing problémy tento mesiac",
        consequences: {
          waveCategorySkew: "marketing",
          waveProblemDensity: 1.5,
          narrativeTag: "Market shift: marketing",
        },
      },
      {
        id: "prep-operations",
        label: "Pripraviť ops",
        description: "1.5x operations problémy tento mesiac",
        consequences: {
          waveCategorySkew: "operations",
          waveProblemDensity: 1.5,
          narrativeTag: "Market shift: operations",
        },
      },
      {
        id: "prep-finance",
        label: "Pripraviť finance",
        description: "1.5x finance problémy tento mesiac",
        consequences: {
          waveCategorySkew: "finance",
          waveProblemDensity: 1.5,
          narrativeTag: "Market shift: finance",
        },
      },
    ],
  },
  {
    id: "boss-month-9-acquisition",
    isBoss: true,
    trigger: { bossMonth: 9 },
    headline: "MESIAC 9: Acquisition Offer",
    flavor:
      "Big Corp ponúka €500k za celú firmu. Exit TERAZ? Alebo pokračuj do mesiaca 10 na väčší exit?",
    choices: [
      {
        id: "accept-acquisition",
        label: "Predať za €500k",
        description: "END GAME — Early Exit. Run končí.",
        consequences: {
          earlyExit: true,
          exitValue: 500,
          narrativeTag: "Predal som firmu za €500k (mesiac 9)",
        },
      },
      {
        id: "push-for-ipo",
        label: "Pokračovať",
        description: "Pokračuj do mesiaca 10 pre finálny exit",
        consequences: { narrativeTag: "Odmietol som €500k — idem na IPO" },
      },
    ],
  },
];

export const EVENTS_BY_ID: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
