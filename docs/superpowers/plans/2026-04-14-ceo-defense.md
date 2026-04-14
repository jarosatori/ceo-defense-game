---
title: CEO Defense Implementation Plan
date: 2026-04-14
spec: ../specs/2026-04-14-ceo-defense-design.md
status: active
---

# CEO Defense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hybrid tower defense browser game where a solo CEO must hire team members to survive waves of business problems, serving as a lead magnet for Miliónová Evolúcia.

**Architecture:** Next.js App Router serves three pages (landing, game, results) with Phaser.js embedded as a client component for the game canvas. Game state is fully client-side, passed to results via URL search params. MailerLite API handles lead capture, Vercel OG handles share card generation.

**Tech Stack:** Next.js 15, TypeScript, Phaser.js 3, Tailwind CSS v4, Vercel, MailerLite API, Vercel OG

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Landing page + email gate form
│   ├── game/
│   │   └── page.tsx            # Game page wrapper (client boundary)
│   ├── results/
│   │   └── page.tsx            # Results screen + share + CTA
│   ├── api/
│   │   ├── lead/
│   │   │   └── route.ts        # POST: MailerLite email capture
│   │   └── og/
│   │       └── route.tsx       # GET: dynamic OG share card image
│   └── globals.css             # Tailwind base + game fonts
├── components/
│   ├── EmailGateForm.tsx       # Email capture form component
│   ├── ResultsCard.tsx         # Results display component
│   ├── ShareButtons.tsx        # LinkedIn, IG, copy link, download
│   └── PhaserGame.tsx          # Phaser canvas wrapper (client component)
├── game/
│   ├── config.ts               # Phaser game config + constants
│   ├── constants.ts            # Colors, speeds, distributions, costs
│   ├── types.ts                # All game TypeScript interfaces
│   ├── scenes/
│   │   ├── IntroScene.ts       # 10s intro animation
│   │   ├── ActionScene.ts      # Main wave gameplay
│   │   ├── PlanningScene.ts    # Between-wave hiring UI
│   │   └── GameOverScene.ts    # Game over / completion trigger
│   ├── entities/
│   │   ├── CEO.ts              # CEO circle entity + manual click handler
│   │   ├── TeamMember.ts       # Orbiting team member with auto-catch
│   │   └── Problem.ts          # Flying problem entity (shape + color + category)
│   ├── systems/
│   │   ├── WaveSpawner.ts      # Spawns problems per wave config
│   │   ├── CatchSystem.ts      # Detects catches (team auto + CEO manual)
│   │   ├── DamageSystem.ts     # Tracks missed problems, damage bar
│   │   └── BudgetSystem.ts     # Earn/spend budget economy
│   ├── data/
│   │   └── waves.ts            # Wave definitions (count, speed, distribution)
│   └── utils/
│       └── profileCalculator.ts # Determines CEO profile from game stats
├── lib/
│   └── mailerlite.ts           # MailerLite API client
└── public/
    └── fonts/                  # IBM Plex Mono / Inter if needed
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the full Next.js scaffolding.

- [ ] **Step 2: Install game dependencies**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm install phaser
```

- [ ] **Step 3: Verify dev server starts**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm run dev
```

Expected: Server starts on localhost:3000, default Next.js page renders.

- [ ] **Step 4: Clean up default page**

Replace `src/app/page.tsx` with minimal content:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <h1 className="text-white text-4xl font-bold">CEO Defense</h1>
    </main>
  );
}
```

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "CEO Defense — Dokážeš vybudovať firmu?",
  description:
    "Interaktívna hra pre podnikateľov. Prežiješ 5 vĺn biznis problémov?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 5: Verify clean page renders**

Run: `npm run dev` (if not already running)

Open http://localhost:3000 — should show "CEO Defense" white text on black background.

- [ ] **Step 6: Initialize git and commit**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
git init
echo "node_modules/\n.next/\n.env.local" > .gitignore
git add -A
git commit -m "feat: bootstrap Next.js project with Phaser dependency"
```

---

## Task 2: Game Types and Constants

**Files:**
- Create: `src/game/types.ts`, `src/game/constants.ts`, `src/game/data/waves.ts`

- [ ] **Step 1: Create game type definitions**

Create `src/game/types.ts`:

```typescript
export type Category = "marketing" | "finance" | "operations" | "general";

export type Role = "va" | "marketing" | "finance" | "operations";

export type Level = "junior" | "senior";

export type Phase = "intro" | "action" | "planning" | "results" | "gameover";

export type CEOProfile =
  | "lone-wolf"
  | "micromanager"
  | "generalist-trap"
  | "delegator"
  | "strategist";

export interface TeamMember {
  role: Role;
  level: Level;
  id: string;
}

export interface RoleConfig {
  role: Role;
  label: string;
  color: string;
  catchCategories: Category[];
  catchSpeed: number; // ms per catch
  catchRadius: number; // pixels
  cost: number;
  upgradeCost: number;
}

export interface WaveConfig {
  wave: number;
  name: string;
  duration: number; // seconds
  problemCount: number;
  problemSpeed: number; // seconds to cross screen
  distribution: Record<Category, number>; // percentages, sum to 1
  burstEnabled: boolean;
  burstSize: number;
}

export interface ProblemConfig {
  category: Category;
  color: string;
  shape: "triangle" | "diamond" | "square" | "circle";
}

export interface GameState {
  wave: number;
  score: number;
  budget: number;
  damage: number;
  team: TeamMember[];
  problemsCaught: number;
  problemsMissed: number;
  caughtByCategory: Record<Category, number>;
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  phase: Phase;
}

export interface GameResults {
  profile: CEOProfile;
  wavesCompleted: number;
  score: number;
  team: TeamMember[];
  missedByCategory: Record<Category, number>;
  manualClicks: number;
  totalCaught: number;
  totalMissed: number;
}
```

- [ ] **Step 2: Create constants**

Create `src/game/constants.ts`:

```typescript
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
  speedFactor: 0.7, // 30% faster
  radiusFactor: 1.3, // 30% larger
};

export const DAMAGE_PER_MISS = 4; // ~25 misses = game over
export const BUDGET_PER_CATCH = 3;
export const CEO_CATCH_RADIUS = 50;
export const CEO_CATCH_SPEED = 400;
export const PLANNING_DURATION = 15; // seconds
export const STARTING_BUDGET = 0;
```

- [ ] **Step 3: Create wave definitions**

Create `src/game/data/waves.ts`:

```typescript
import type { WaveConfig } from "../types";

export const WAVES: WaveConfig[] = [
  {
    wave: 1,
    name: "Všetko sám",
    duration: 30,
    problemCount: 15,
    problemSpeed: 2.0,
    distribution: { marketing: 0.7, finance: 0.1, operations: 0.2, general: 0 },
    burstEnabled: false,
    burstSize: 0,
  },
  {
    wave: 2,
    name: "Prvý nápor",
    duration: 40,
    problemCount: 25,
    problemSpeed: 1.5,
    distribution: { marketing: 0.5, finance: 0.15, operations: 0.35, general: 0 },
    burstEnabled: false,
    burstSize: 0,
  },
  {
    wave: 3,
    name: "Peniaze horia",
    duration: 45,
    problemCount: 35,
    problemSpeed: 1.3,
    distribution: { marketing: 0.25, finance: 0.5, operations: 0.25, general: 0 },
    burstEnabled: true,
    burstSize: 5,
  },
  {
    wave: 4,
    name: "Chaos",
    duration: 50,
    problemCount: 50,
    problemSpeed: 1.0,
    distribution: { marketing: 0.15, finance: 0.2, operations: 0.65, general: 0 },
    burstEnabled: true,
    burstSize: 5,
  },
  {
    wave: 5,
    name: "Škáluj alebo zomri",
    duration: 60,
    problemCount: 70,
    problemSpeed: 0.8,
    distribution: { marketing: 0.25, finance: 0.25, operations: 0.25, general: 0.25 },
    burstEnabled: true,
    burstSize: 8,
  },
];
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/types.ts src/game/constants.ts src/game/data/waves.ts
git commit -m "feat: add game types, constants, and wave definitions"
```

---

## Task 3: CEO Profile Calculator

**Files:**
- Create: `src/game/utils/profileCalculator.ts`, `src/game/__tests__/profileCalculator.test.ts`

- [ ] **Step 1: Install test runner**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Write failing tests for profile calculator**

Create `src/game/__tests__/profileCalculator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculateProfile } from "../utils/profileCalculator";
import type { GameState, TeamMember } from "../types";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    wave: 5,
    score: 1000,
    budget: 0,
    damage: 50,
    team: [],
    problemsCaught: 100,
    problemsMissed: 20,
    caughtByCategory: { marketing: 30, finance: 30, operations: 30, general: 10 },
    missedByCategory: { marketing: 5, finance: 5, operations: 5, general: 5 },
    manualClicks: 50,
    phase: "results",
    ...overrides,
  };
}

function makeMember(role: TeamMember["role"], level: TeamMember["level"] = "junior"): TeamMember {
  return { role, level, id: `${role}-${level}` };
}

describe("calculateProfile", () => {
  it("returns lone-wolf when 0-1 people hired", () => {
    const state = makeState({ team: [] });
    expect(calculateProfile(state)).toBe("lone-wolf");

    const state1 = makeState({ team: [makeMember("va")] });
    expect(calculateProfile(state1)).toBe("lone-wolf");
  });

  it("returns micromanager when team exists but manual clicks are high", () => {
    const state = makeState({
      team: [makeMember("marketing"), makeMember("finance")],
      manualClicks: 80,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("micromanager");
  });

  it("returns generalist-trap when mostly VAs hired", () => {
    const state = makeState({
      team: [makeMember("va"), makeMember("va"), makeMember("va")],
      manualClicks: 20,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("generalist-trap");
  });

  it("returns delegator when specialists match wave patterns", () => {
    const state = makeState({
      team: [makeMember("marketing"), makeMember("finance"), makeMember("operations")],
      manualClicks: 20,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("delegator");
  });

  it("returns strategist when survived wave 5 with upgraded specialists", () => {
    const state = makeState({
      wave: 5,
      damage: 40,
      team: [
        makeMember("marketing", "senior"),
        makeMember("finance", "senior"),
        makeMember("operations"),
      ],
      manualClicks: 15,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("strategist");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement profile calculator**

Create `src/game/utils/profileCalculator.ts`:

```typescript
import type { CEOProfile, GameState } from "../types";

export function calculateProfile(state: GameState): CEOProfile {
  const { team, manualClicks, problemsCaught, wave, damage } = state;

  // Lone Wolf: 0-1 hires
  if (team.length <= 1) {
    return "lone-wolf";
  }

  const vaCount = team.filter((m) => m.role === "va").length;
  const specialistCount = team.length - vaCount;
  const seniorCount = team.filter((m) => m.level === "senior").length;
  const manualRatio = problemsCaught > 0 ? manualClicks / problemsCaught : 1;

  // Strategist: survived wave 5, has upgraded specialists, low manual ratio
  if (wave >= 5 && damage < 100 && seniorCount >= 2 && manualRatio < 0.25) {
    return "strategist";
  }

  // Micromanager: has team but still does most work manually (>50% manual)
  if (manualRatio > 0.5) {
    return "micromanager";
  }

  // Generalist Trap: majority of team are VAs
  if (vaCount > specialistCount) {
    return "generalist-trap";
  }

  // Delegator: has specialists, reasonable manual ratio
  return "delegator";
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm test
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/utils/profileCalculator.ts src/game/__tests__/profileCalculator.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add CEO profile calculator with tests"
```

---

## Task 4: Phaser Game Setup + Intro Scene

**Files:**
- Create: `src/game/config.ts`, `src/game/scenes/IntroScene.ts`, `src/components/PhaserGame.tsx`, `src/app/game/page.tsx`

- [ ] **Step 1: Create Phaser game config**

Create `src/game/config.ts`:

```typescript
import Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene";
import { ActionScene } from "./scenes/ActionScene";
import { PlanningScene } from "./scenes/PlanningScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { COLORS } from "./constants";

export function createGameConfig(
  parent: string,
  width: number,
  height: number
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: COLORS.background,
    scene: [IntroScene, ActionScene, PlanningScene, GameOverScene],
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
```

- [ ] **Step 2: Create IntroScene**

Create `src/game/scenes/IntroScene.ts`:

```typescript
import Phaser from "phaser";
import { COLORS } from "../constants";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Title
    const title = this.add
      .text(centerX, centerY - 60, "CEO DEFENSE", {
        fontSize: "36px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Subtitle
    const subtitle = this.add
      .text(centerX, centerY, "Dokážeš vybudovať firmu,\nktorá funguje bez teba?", {
        fontSize: "18px",
        fontFamily: "Inter, sans-serif",
        color: "#e5e5e5",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // CEO circle preview
    const ceoCircle = this.add
      .circle(centerX, centerY + 80, 20, COLORS.ceo)
      .setAlpha(0);

    const startHint = this.add
      .text(centerX, centerY + 130, "Ty si CEO. Všetko ide cez teba.", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animate in sequence
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: centerY - 80,
      duration: 800,
      ease: "Power2",
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 800,
      delay: 600,
      ease: "Power2",
    });

    this.tweens.add({
      targets: ceoCircle,
      alpha: 1,
      duration: 600,
      delay: 1200,
      ease: "Power2",
    });

    this.tweens.add({
      targets: startHint,
      alpha: 1,
      duration: 600,
      delay: 1600,
      ease: "Power2",
    });

    // Transition to ActionScene after intro
    this.time.delayedCall(4000, () => {
      this.scene.start("ActionScene");
    });
  }
}
```

- [ ] **Step 3: Create stub scenes for ActionScene, PlanningScene, GameOverScene**

Create `src/game/scenes/ActionScene.ts`:

```typescript
import Phaser from "phaser";

export class ActionScene extends Phaser.Scene {
  constructor() {
    super({ key: "ActionScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "Action Scene — Wave 1", {
        fontSize: "24px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
```

Create `src/game/scenes/PlanningScene.ts`:

```typescript
import Phaser from "phaser";

export class PlanningScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanningScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "Planning Scene", {
        fontSize: "24px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
```

Create `src/game/scenes/GameOverScene.ts`:

```typescript
import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "Game Over", {
        fontSize: "24px",
        fontFamily: "Inter, sans-serif",
        color: "#ef4444",
      })
      .setOrigin(0.5);
  }
}
```

- [ ] **Step 4: Create PhaserGame client component**

Create `src/components/PhaserGame.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function PhaserGame() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current || !gameContainerRef.current) return;

    const initPhaser = async () => {
      const Phaser = (await import("phaser")).default;
      const { createGameConfig } = await import("@/game/config");

      const container = gameContainerRef.current!;
      const width = Math.min(container.clientWidth, 800);
      const height = Math.min(container.clientHeight, 600);

      const config = createGameConfig("phaser-game", width, height);
      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center"
    >
      <div id="phaser-game" />
    </div>
  );
}
```

- [ ] **Step 5: Create game page**

Create `src/app/game/page.tsx`:

```tsx
import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-white text-lg">Načítavam hru...</p>
    </div>
  ),
});

export default function GamePage() {
  return <PhaserGame />;
}
```

- [ ] **Step 6: Verify game page renders with intro animation**

Open http://localhost:3000/game — should show dark background, then animated "CEO DEFENSE" title, subtitle, white CEO circle, and hint text fading in over ~4 seconds. Then transitions to "Action Scene — Wave 1" stub.

- [ ] **Step 7: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/config.ts src/game/scenes/ src/components/PhaserGame.tsx src/app/game/page.tsx
git commit -m "feat: add Phaser setup, intro scene, and game page"
```

---

## Task 5: Problem Entity

**Files:**
- Create: `src/game/entities/Problem.ts`

- [ ] **Step 1: Create Problem entity**

Create `src/game/entities/Problem.ts`:

```typescript
import Phaser from "phaser";
import type { Category } from "../types";
import { PROBLEM_CONFIGS } from "../constants";

export class Problem extends Phaser.GameObjects.Graphics {
  category: Category;
  speed: number;
  targetX: number;
  targetY: number;
  caught: boolean = false;
  private size: number = 12;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    category: Category,
    speed: number,
    targetX: number,
    targetY: number
  ) {
    super(scene, { x, y });
    this.category = category;
    this.speed = speed;
    this.targetX = targetX;
    this.targetY = targetY;

    this.drawShape();
    scene.add.existing(this);
  }

  private drawShape(): void {
    const config = PROBLEM_CONFIGS[this.category];
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.fillStyle(color, 1);

    const s = this.size;
    switch (config.shape) {
      case "triangle":
        this.fillTriangle(0, -s, -s, s, s, s);
        break;
      case "diamond":
        this.fillPoints(
          [
            new Phaser.Geom.Point(0, -s),
            new Phaser.Geom.Point(s, 0),
            new Phaser.Geom.Point(0, s),
            new Phaser.Geom.Point(-s, 0),
          ],
          true
        );
        break;
      case "square":
        this.fillRect(-s, -s, s * 2, s * 2);
        break;
      case "circle":
        this.fillCircle(0, 0, s);
        break;
    }
  }

  update(delta: number): void {
    if (this.caught) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      // Reached center — this is a miss
      this.emit("missed", this);
      this.destroy();
      return;
    }

    // Move toward target at constant speed
    const pixelsPerMs = (this.scene.scale.width / this.speed) / 1000;
    const moveDistance = pixelsPerMs * delta;
    const ratio = moveDistance / dist;

    this.x += dx * ratio;
    this.y += dy * ratio;
  }

  catch(): void {
    this.caught = true;
    // Quick fade-out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 150,
      onComplete: () => this.destroy(),
    });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/entities/Problem.ts
git commit -m "feat: add Problem entity with shape rendering and movement"
```

---

## Task 6: CEO Entity

**Files:**
- Create: `src/game/entities/CEO.ts`

- [ ] **Step 1: Create CEO entity**

Create `src/game/entities/CEO.ts`:

```typescript
import Phaser from "phaser";
import { COLORS, CEO_CATCH_RADIUS } from "../constants";

export class CEO extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Catch radius indicator (subtle ring)
    this.radiusIndicator = scene.add
      .circle(0, 0, CEO_CATCH_RADIUS, 0xffffff, 0.05)
      .setStrokeStyle(1, 0xffffff, 0.15);

    // CEO circle
    this.circle = scene.add.circle(0, 0, 18, COLORS.ceo);

    // Label
    this.label = scene.add
      .text(0, 0, "CEO", {
        fontSize: "10px",
        fontFamily: "Inter, sans-serif",
        color: "#0a0a0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([this.radiusIndicator, this.circle, this.label]);
    scene.add.existing(this);
  }

  flashDamage(): void {
    this.scene.tweens.add({
      targets: this.circle,
      fillColor: { from: COLORS.finance, to: COLORS.ceo },
      duration: 300,
    });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/entities/CEO.ts
git commit -m "feat: add CEO entity with radius indicator"
```

---

## Task 7: TeamMember Entity

**Files:**
- Create: `src/game/entities/TeamMember.ts`

- [ ] **Step 1: Create TeamMember entity**

Create `src/game/entities/TeamMember.ts`:

```typescript
import Phaser from "phaser";
import type { Role, Level, Category } from "../types";
import { ROLE_CONFIGS, SENIOR_MULTIPLIER } from "../constants";

export class TeamMemberEntity extends Phaser.GameObjects.Container {
  role: Role;
  level: Level;
  memberId: string;
  catchCategories: Category[];
  catchSpeed: number;
  catchRadius: number;
  private catchCooldown: number = 0;
  private circle: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private orbitAngle: number;
  private orbitRadius: number;
  private orbitSpeed: number = 0.3; // radians per second

  constructor(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number,
    role: Role,
    level: Level,
    memberId: string,
    orbitIndex: number
  ) {
    super(scene, centerX, centerY);
    this.role = role;
    this.level = level;
    this.memberId = memberId;

    const config = ROLE_CONFIGS[role];
    this.catchCategories = config.catchCategories;
    this.catchSpeed = level === "senior"
      ? config.catchSpeed * SENIOR_MULTIPLIER.speedFactor
      : config.catchSpeed;
    this.catchRadius = level === "senior"
      ? config.catchRadius * SENIOR_MULTIPLIER.radiusFactor
      : config.catchRadius;

    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.orbitAngle = (Math.PI * 2 * orbitIndex) / 6; // max 6 team members spread evenly
    this.orbitRadius = 70;

    // Radius indicator
    this.radiusIndicator = scene.add
      .circle(0, 0, this.catchRadius, color, 0.05)
      .setStrokeStyle(1, color, 0.15);

    // Member circle
    const circleSize = level === "senior" ? 14 : 11;
    this.circle = scene.add.circle(0, 0, circleSize, color);

    // Role label
    const labelText = role === "va" ? "VA" : role.substring(0, 3).toUpperCase();
    const label = scene.add
      .text(0, 0, labelText, {
        fontSize: "8px",
        fontFamily: "Inter, sans-serif",
        color: "#0a0a0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([this.radiusIndicator, this.circle, label]);
    scene.add.existing(this);

    // Set initial orbit position
    this.updateOrbitPosition(0);
  }

  updateOrbitPosition(delta: number): void {
    this.orbitAngle += this.orbitSpeed * (delta / 1000);
    const parentX = (this.parentContainer?.x ?? this.x);
    const parentY = (this.parentContainer?.y ?? this.y);
    this.x = parentX + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.y = parentY + Math.sin(this.orbitAngle) * this.orbitRadius;
  }

  canCatch(category: Category): boolean {
    if (this.catchCooldown > 0) return false;
    return this.catchCategories.includes(category);
  }

  performCatch(): void {
    this.catchCooldown = this.catchSpeed;
    // Flash effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
    });
  }

  updateCooldown(delta: number): void {
    if (this.catchCooldown > 0) {
      this.catchCooldown = Math.max(0, this.catchCooldown - delta);
    }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/entities/TeamMember.ts
git commit -m "feat: add TeamMember entity with orbit, catch mechanics, and upgrades"
```

---

## Task 8: Wave Spawner System

**Files:**
- Create: `src/game/systems/WaveSpawner.ts`

- [ ] **Step 1: Create WaveSpawner**

Create `src/game/systems/WaveSpawner.ts`:

```typescript
import Phaser from "phaser";
import type { Category, WaveConfig } from "../types";
import { Problem } from "../entities/Problem";

export class WaveSpawner {
  private scene: Phaser.Scene;
  private waveConfig: WaveConfig;
  private centerX: number;
  private centerY: number;
  private spawnedCount: number = 0;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private problems: Problem[] = [];
  private burstTimer: Phaser.Time.TimerEvent | null = null;

  onProblemMissed?: (problem: Problem) => void;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number) {
    this.scene = scene;
    this.centerX = centerX;
    this.centerY = centerY;
    this.waveConfig = {} as WaveConfig; // set via startWave
  }

  startWave(config: WaveConfig): void {
    this.waveConfig = config;
    this.spawnedCount = 0;
    this.problems = [];

    const intervalMs = (config.duration / config.problemCount) * 1000;

    this.spawnTimer = this.scene.time.addEvent({
      delay: intervalMs,
      callback: () => this.spawnProblem(),
      loop: true,
    });

    // Burst events — random timing during wave
    if (config.burstEnabled && config.burstSize > 0) {
      const burstDelay = (config.duration * 1000) / 3; // burst at 1/3 and 2/3 of wave
      this.burstTimer = this.scene.time.addEvent({
        delay: burstDelay,
        callback: () => this.spawnBurst(),
        repeat: 1,
      });
    }
  }

  private spawnProblem(): void {
    if (this.spawnedCount >= this.waveConfig.problemCount) {
      this.spawnTimer?.destroy();
      return;
    }

    const category = this.pickCategory();
    const { x, y } = this.randomEdgePosition();
    const problem = new Problem(
      this.scene,
      x,
      y,
      category,
      this.waveConfig.problemSpeed,
      this.centerX,
      this.centerY
    );

    problem.on("missed", (p: Problem) => {
      this.removeProblem(p);
      this.onProblemMissed?.(p);
    });

    this.problems.push(problem);
    this.spawnedCount++;
  }

  private spawnBurst(): void {
    for (let i = 0; i < this.waveConfig.burstSize; i++) {
      this.spawnProblem();
    }
  }

  private pickCategory(): Category {
    const rand = Math.random();
    const dist = this.waveConfig.distribution;
    let cumulative = 0;

    for (const [cat, weight] of Object.entries(dist)) {
      cumulative += weight;
      if (rand <= cumulative) {
        return cat as Category;
      }
    }
    return "general";
  }

  private randomEdgePosition(): { x: number; y: number } {
    const { width, height } = this.scene.scale;
    const margin = 20;
    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: // top
        return { x: Phaser.Math.Between(margin, width - margin), y: -margin };
      case 1: // right
        return { x: width + margin, y: Phaser.Math.Between(margin, height - margin) };
      case 2: // bottom
        return { x: Phaser.Math.Between(margin, width - margin), y: height + margin };
      case 3: // left
        return { x: -margin, y: Phaser.Math.Between(margin, height - margin) };
      default:
        return { x: -margin, y: height / 2 };
    }
  }

  getActiveProblems(): Problem[] {
    return this.problems.filter((p) => !p.caught && p.active);
  }

  removeProblem(problem: Problem): void {
    this.problems = this.problems.filter((p) => p !== problem);
  }

  isWaveComplete(): boolean {
    return (
      this.spawnedCount >= this.waveConfig.problemCount &&
      this.getActiveProblems().length === 0
    );
  }

  destroy(): void {
    this.spawnTimer?.destroy();
    this.burstTimer?.destroy();
    this.problems.forEach((p) => p.destroy());
    this.problems = [];
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/systems/WaveSpawner.ts
git commit -m "feat: add WaveSpawner with distribution-weighted spawning and bursts"
```

---

## Task 9: Catch, Damage, and Budget Systems

**Files:**
- Create: `src/game/systems/CatchSystem.ts`, `src/game/systems/DamageSystem.ts`, `src/game/systems/BudgetSystem.ts`

- [ ] **Step 1: Create CatchSystem**

Create `src/game/systems/CatchSystem.ts`:

```typescript
import type { Problem } from "../entities/Problem";
import type { TeamMemberEntity } from "../entities/TeamMember";
import { CEO_CATCH_RADIUS } from "../constants";

export class CatchSystem {
  checkTeamCatches(
    teamMembers: TeamMemberEntity[],
    problems: Problem[]
  ): Problem[] {
    const caught: Problem[] = [];

    for (const member of teamMembers) {
      for (const problem of problems) {
        if (problem.caught) continue;
        if (!member.canCatch(problem.category)) continue;

        const dx = member.x - problem.x;
        const dy = member.y - problem.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= member.catchRadius) {
          problem.catch();
          member.performCatch();
          caught.push(problem);
          break; // one catch per member per frame
        }
      }
    }

    return caught;
  }

  checkCEOClick(
    ceoX: number,
    ceoY: number,
    clickX: number,
    clickY: number,
    problems: Problem[]
  ): Problem | null {
    // Find the closest problem to the click within CEO radius
    let closest: Problem | null = null;
    let closestDist = Infinity;

    for (const problem of problems) {
      if (problem.caught) continue;

      const dx = clickX - problem.x;
      const dy = clickY - problem.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= CEO_CATCH_RADIUS && dist < closestDist) {
        closest = problem;
        closestDist = dist;
      }
    }

    if (closest) {
      closest.catch();
    }

    return closest;
  }
}
```

- [ ] **Step 2: Create DamageSystem**

Create `src/game/systems/DamageSystem.ts`:

```typescript
import Phaser from "phaser";
import { DAMAGE_PER_MISS, COLORS } from "../constants";

export class DamageSystem {
  damage: number = 0;
  private bar: Phaser.GameObjects.Graphics;
  private barWidth: number;
  private barHeight: number = 8;
  private barX: number;
  private barY: number;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { width } = scene.scale;
    this.barWidth = width - 40;
    this.barX = 20;
    this.barY = 36;

    this.bar = scene.add.graphics();
    this.label = scene.add
      .text(width - 20, this.barY + this.barHeight / 2, "0%", {
        fontSize: "10px",
        fontFamily: "Inter, sans-serif",
        color: "#e5e5e5",
      })
      .setOrigin(1, 0.5);

    this.draw();
  }

  addDamage(amount: number = DAMAGE_PER_MISS): void {
    this.damage = Math.min(100, this.damage + amount);
    this.draw();
  }

  isGameOver(): boolean {
    return this.damage >= 100;
  }

  private draw(): void {
    this.bar.clear();

    // Background
    this.bar.fillStyle(0x333333, 1);
    this.bar.fillRoundedRect(this.barX, this.barY, this.barWidth, this.barHeight, 4);

    // Fill
    const fillWidth = (this.damage / 100) * this.barWidth;
    if (fillWidth > 0) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(COLORS.damageStart),
        Phaser.Display.Color.IntegerToColor(COLORS.damageEnd),
        100,
        this.damage
      );
      const fillColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      this.bar.fillStyle(fillColor, 1);
      this.bar.fillRoundedRect(this.barX, this.barY, fillWidth, this.barHeight, 4);
    }

    this.label.setText(`${Math.round(this.damage)}%`);
  }

  destroy(): void {
    this.bar.destroy();
    this.label.destroy();
  }
}
```

- [ ] **Step 3: Create BudgetSystem**

Create `src/game/systems/BudgetSystem.ts`:

```typescript
import Phaser from "phaser";
import { BUDGET_PER_CATCH, CSS_COLORS } from "../constants";

export class BudgetSystem {
  budget: number;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, initialBudget: number) {
    this.budget = initialBudget;
    const { width } = scene.scale;

    this.label = scene.add
      .text(width - 20, 12, `€${this.budget}`, {
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

    this.updateLabel();
  }

  earn(amount: number = BUDGET_PER_CATCH): void {
    this.budget += amount;
    this.updateLabel();
  }

  canAfford(cost: number): boolean {
    return this.budget >= cost;
  }

  spend(cost: number): boolean {
    if (!this.canAfford(cost)) return false;
    this.budget -= cost;
    this.updateLabel();
    return true;
  }

  private updateLabel(): void {
    this.label.setText(`€${this.budget}`);
  }

  destroy(): void {
    this.label.destroy();
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/systems/CatchSystem.ts src/game/systems/DamageSystem.ts src/game/systems/BudgetSystem.ts
git commit -m "feat: add catch, damage, and budget systems"
```

---

## Task 10: ActionScene — Full Wave Gameplay

**Files:**
- Modify: `src/game/scenes/ActionScene.ts`

- [ ] **Step 1: Implement full ActionScene**

Replace `src/game/scenes/ActionScene.ts` with:

```typescript
import Phaser from "phaser";
import type { GameState, Category, TeamMember } from "../types";
import { WAVES } from "../data/waves";
import { STARTING_BUDGET, BUDGET_PER_CATCH, COLORS, CSS_COLORS } from "../constants";
import { CEO } from "../entities/CEO";
import { TeamMemberEntity } from "../entities/TeamMember";
import { WaveSpawner } from "../systems/WaveSpawner";
import { CatchSystem } from "../systems/CatchSystem";
import { DamageSystem } from "../systems/DamageSystem";
import { BudgetSystem } from "../systems/BudgetSystem";

export class ActionScene extends Phaser.Scene {
  private ceo!: CEO;
  private teamEntities: TeamMemberEntity[] = [];
  private spawner!: WaveSpawner;
  private catchSystem!: CatchSystem;
  private damageSystem!: DamageSystem;
  private budgetSystem!: BudgetSystem;
  private waveLabel!: Phaser.GameObjects.Text;
  private waveNameLabel!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private gameState!: GameState;
  private centerX!: number;
  private centerY!: number;

  constructor() {
    super({ key: "ActionScene" });
  }

  init(data?: { gameState?: GameState }): void {
    const { width, height } = this.scale;
    this.centerX = width / 2;
    this.centerY = height / 2;

    if (data?.gameState) {
      this.gameState = { ...data.gameState, phase: "action" };
    } else {
      this.gameState = {
        wave: 1,
        score: 0,
        budget: STARTING_BUDGET,
        damage: 0,
        team: [],
        problemsCaught: 0,
        problemsMissed: 0,
        caughtByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
        missedByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
        manualClicks: 0,
        phase: "action",
      };
    }
  }

  create(): void {
    // UI — top bar
    this.waveLabel = this.add
      .text(20, 12, "", {
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      });

    this.waveNameLabel = this.add
      .text(20, 32, "", {
        fontSize: "11px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      });

    this.scoreLabel = this.add
      .text(this.scale.width / 2, 12, "", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#e5e5e5",
      })
      .setOrigin(0.5, 0);

    // Systems
    this.damageSystem = new DamageSystem(this);
    this.damageSystem.damage = this.gameState.damage;
    this.budgetSystem = new BudgetSystem(this, this.gameState.budget);
    this.catchSystem = new CatchSystem();

    // CEO
    this.ceo = new CEO(this, this.centerX, this.centerY);

    // Recreate team entities from state
    this.teamEntities = [];
    this.gameState.team.forEach((member, index) => {
      const entity = new TeamMemberEntity(
        this,
        this.centerX,
        this.centerY,
        member.role,
        member.level,
        member.id,
        index
      );
      this.teamEntities.push(entity);
    });

    // Spawner
    this.spawner = new WaveSpawner(this, this.centerX, this.centerY);
    this.spawner.onProblemMissed = (problem) => {
      this.gameState.problemsMissed++;
      this.gameState.missedByCategory[problem.category]++;
      this.damageSystem.addDamage();
      this.ceo.flashDamage();
      this.flashMissColor(problem.category);
    };

    // Input — CEO manual catch
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const caught = this.catchSystem.checkCEOClick(
        this.centerX,
        this.centerY,
        pointer.x,
        pointer.y,
        this.spawner.getActiveProblems()
      );
      if (caught) {
        this.gameState.manualClicks++;
        this.gameState.problemsCaught++;
        this.gameState.caughtByCategory[caught.category]++;
        this.gameState.score += 10;
        this.budgetSystem.earn(BUDGET_PER_CATCH);
        this.spawner.removeProblem(caught);
      }
    });

    // Start current wave
    this.startWave();
  }

  private startWave(): void {
    const waveConfig = WAVES[this.gameState.wave - 1];
    this.waveLabel.setText(`Vlna ${this.gameState.wave}/5`);
    this.waveNameLabel.setText(waveConfig.name);
    this.spawner.startWave(waveConfig);

    // Wave name splash
    const splash = this.add
      .text(this.centerX, this.centerY - 140, waveConfig.name, {
        fontSize: "28px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: splash,
      alpha: 1,
      duration: 400,
      yoyo: true,
      hold: 1000,
      onComplete: () => splash.destroy(),
    });
  }

  update(_time: number, delta: number): void {
    // Update score label
    this.scoreLabel.setText(`Score: ${this.gameState.score}`);

    // Update team orbit positions and cooldowns
    this.teamEntities.forEach((member) => {
      member.updateOrbitPosition(delta);
      member.updateCooldown(delta);
    });

    // Update active problems
    this.spawner.getActiveProblems().forEach((problem) => {
      problem.update(delta);
    });

    // Team auto-catch
    const autoCaught = this.catchSystem.checkTeamCatches(
      this.teamEntities,
      this.spawner.getActiveProblems()
    );
    for (const problem of autoCaught) {
      this.gameState.problemsCaught++;
      this.gameState.caughtByCategory[problem.category]++;
      this.gameState.score += 10;
      this.budgetSystem.earn(BUDGET_PER_CATCH);
      this.spawner.removeProblem(problem);
    }

    // Check game over
    if (this.damageSystem.isGameOver()) {
      this.endGame(false);
      return;
    }

    // Check wave complete
    if (this.spawner.isWaveComplete()) {
      if (this.gameState.wave >= 5) {
        this.endGame(true);
      } else {
        this.goToPlanning();
      }
    }
  }

  private flashMissColor(category: Category): void {
    const colorMap: Record<Category, string> = {
      marketing: CSS_COLORS.marketing,
      finance: CSS_COLORS.finance,
      operations: CSS_COLORS.operations,
      general: CSS_COLORS.general,
    };
    const flash = this.add
      .rectangle(this.centerX, this.centerY, this.scale.width, this.scale.height,
        Phaser.Display.Color.HexStringToColor(colorMap[category]).color, 0.15)
      .setDepth(-1);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  private goToPlanning(): void {
    this.gameState.budget = this.budgetSystem.budget;
    this.gameState.damage = this.damageSystem.damage;
    this.cleanup();
    this.scene.start("PlanningScene", { gameState: this.gameState });
  }

  private endGame(survived: boolean): void {
    this.gameState.budget = this.budgetSystem.budget;
    this.gameState.damage = this.damageSystem.damage;
    this.gameState.phase = survived ? "results" : "gameover";
    this.cleanup();
    this.scene.start("GameOverScene", { gameState: this.gameState });
  }

  private cleanup(): void {
    this.spawner.destroy();
    this.damageSystem.destroy();
    this.budgetSystem.destroy();
  }
}
```

- [ ] **Step 2: Verify the game runs with wave 1 gameplay**

Open http://localhost:3000/game — after intro, should see CEO in center, problems spawning from edges (mostly blue triangles), damage bar filling when problems reach center, click to manually catch.

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/scenes/ActionScene.ts
git commit -m "feat: implement full ActionScene with wave gameplay, catch, damage, budget"
```

---

## Task 11: PlanningScene — Hiring UI

**Files:**
- Modify: `src/game/scenes/PlanningScene.ts`

- [ ] **Step 1: Implement full PlanningScene**

Replace `src/game/scenes/PlanningScene.ts` with:

```typescript
import Phaser from "phaser";
import type { GameState, Role, Category } from "../types";
import { ROLE_CONFIGS, CSS_COLORS, PLANNING_DURATION } from "../constants";

export class PlanningScene extends Phaser.Scene {
  private gameState!: GameState;
  private countdown!: number;
  private countdownLabel!: Phaser.GameObjects.Text;
  private budgetLabel!: Phaser.GameObjects.Text;
  private teamContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "PlanningScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = { ...data.gameState, phase: "planning" };
    this.countdown = PLANNING_DURATION;
  }

  create(): void {
    const { width, height } = this.scale;

    // Header
    this.add
      .text(20, 16, "PLÁNOVACIA FÁZA", {
        fontSize: "18px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      });

    this.budgetLabel = this.add
      .text(width - 20, 16, `€${this.gameState.budget}`, {
        fontSize: "18px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

    this.countdownLabel = this.add
      .text(width / 2, 16, `Ďalšia vlna za: ${this.countdown}s`, {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      })
      .setOrigin(0.5, 0);

    // "What killed you" bar chart
    this.drawMissChart(width, 50);

    // Hire cards
    this.drawHireCards(width, height);

    // Current team display
    this.drawTeam(width, height);

    // Countdown timer
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.countdown--;
        this.countdownLabel.setText(`Ďalšia vlna za: ${this.countdown}s`);
        if (this.countdown <= 0) {
          this.startNextWave();
        }
      },
      loop: true,
    });
  }

  private drawMissChart(width: number, yStart: number): void {
    const totalMissed = Object.values(this.gameState.missedByCategory).reduce(
      (a, b) => a + b,
      0
    );
    if (totalMissed === 0) return;

    this.add
      .text(20, yStart, "Čo ťa zabilo:", {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      });

    const categories: { key: Category; label: string; color: string }[] = [
      { key: "marketing", label: "MKT", color: CSS_COLORS.marketing },
      { key: "finance", label: "FIN", color: CSS_COLORS.finance },
      { key: "operations", label: "OPS", color: CSS_COLORS.operations },
      { key: "general", label: "MIX", color: CSS_COLORS.general },
    ];

    const maxBarWidth = width - 120;

    categories.forEach((cat, i) => {
      const y = yStart + 20 + i * 22;
      const missed = this.gameState.missedByCategory[cat.key];
      const pct = totalMissed > 0 ? missed / totalMissed : 0;
      const barWidth = pct * maxBarWidth;

      this.add
        .text(20, y, cat.label, {
          fontSize: "11px",
          fontFamily: "Inter, sans-serif",
          color: cat.color,
          fontStyle: "bold",
        });

      if (barWidth > 0) {
        const color = Phaser.Display.Color.HexStringToColor(cat.color).color;
        this.add.rectangle(60 + barWidth / 2, y + 6, barWidth, 12, color, 0.7);
      }

      this.add
        .text(width - 20, y, `${Math.round(pct * 100)}%`, {
          fontSize: "11px",
          fontFamily: "Inter, sans-serif",
          color: "#a3a3a3",
        })
        .setOrigin(1, 0);
    });
  }

  private drawHireCards(width: number, height: number): void {
    const roles: Role[] = ["va", "marketing", "finance", "operations"];
    const cardWidth = (width - 60) / 4;
    const cardY = height * 0.45;

    this.add
      .text(20, cardY - 30, "Najmi do tímu:", {
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      });

    roles.forEach((role, i) => {
      const config = ROLE_CONFIGS[role];
      const cardX = 20 + i * (cardWidth + 8);
      const color = Phaser.Display.Color.HexStringToColor(config.color).color;
      const canAfford = this.gameState.budget >= config.cost;

      // Card background
      const card = this.add
        .rectangle(
          cardX + cardWidth / 2,
          cardY + 40,
          cardWidth,
          80,
          canAfford ? 0x1a1a1a : 0x111111,
          1
        )
        .setStrokeStyle(2, canAfford ? color : 0x333333, canAfford ? 0.8 : 0.3)
        .setInteractive({ useHandCursor: canAfford });

      // Role label
      this.add
        .text(cardX + cardWidth / 2, cardY + 20, config.label, {
          fontSize: "10px",
          fontFamily: "Inter, sans-serif",
          color: canAfford ? "#e5e5e5" : "#555555",
          align: "center",
          wordWrap: { width: cardWidth - 8 },
        })
        .setOrigin(0.5);

      // Color dot
      this.add.circle(cardX + cardWidth / 2, cardY + 45, 8, canAfford ? color : 0x333333);

      // Cost
      this.add
        .text(cardX + cardWidth / 2, cardY + 65, `€${config.cost}`, {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          color: canAfford ? CSS_COLORS.general : "#555555",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      if (canAfford) {
        card.on("pointerdown", () => this.hire(role));
      }
    });

    // Upgrade section (if team exists)
    if (this.gameState.team.length > 0) {
      this.drawUpgradeCards(width, height);
    }
  }

  private drawUpgradeCards(width: number, height: number): void {
    const upgradeable = this.gameState.team.filter((m) => m.level === "junior");
    if (upgradeable.length === 0) return;

    const startY = height * 0.7;
    this.add
      .text(20, startY - 20, "Upgradni (junior → senior):", {
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      });

    upgradeable.forEach((member, i) => {
      const config = ROLE_CONFIGS[member.role];
      const canAfford = this.gameState.budget >= config.upgradeCost;
      const color = Phaser.Display.Color.HexStringToColor(config.color).color;
      const btnX = 20 + i * 120;

      const btn = this.add
        .rectangle(btnX + 50, startY + 15, 100, 30, canAfford ? 0x1a1a1a : 0x111111)
        .setStrokeStyle(1, canAfford ? color : 0x333333)
        .setInteractive({ useHandCursor: canAfford });

      this.add
        .text(btnX + 50, startY + 15, `${config.label} €${config.upgradeCost}`, {
          fontSize: "10px",
          fontFamily: "Inter, sans-serif",
          color: canAfford ? "#e5e5e5" : "#555555",
        })
        .setOrigin(0.5);

      if (canAfford) {
        btn.on("pointerdown", () => this.upgrade(member.id));
      }
    });
  }

  private drawTeam(width: number, height: number): void {
    const teamY = height - 60;

    this.add
      .text(20, teamY - 20, "Tvoj tím:", {
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      });

    // CEO
    this.add.circle(30, teamY + 10, 10, 0xffffff);
    this.add
      .text(30, teamY + 10, "CEO", {
        fontSize: "7px",
        fontFamily: "Inter, sans-serif",
        color: "#0a0a0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Team members
    this.gameState.team.forEach((member, i) => {
      const config = ROLE_CONFIGS[member.role];
      const color = Phaser.Display.Color.HexStringToColor(config.color).color;
      const x = 60 + i * 35;
      const size = member.level === "senior" ? 12 : 9;

      this.add.circle(x, teamY + 10, size, color);
      const labelText = member.role === "va" ? "VA" : member.role.substring(0, 3).toUpperCase();
      this.add
        .text(x, teamY + 10, labelText, {
          fontSize: "6px",
          fontFamily: "Inter, sans-serif",
          color: "#0a0a0a",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    });
  }

  private hire(role: Role): void {
    const config = ROLE_CONFIGS[role];
    if (this.gameState.budget < config.cost) return;

    this.gameState.budget -= config.cost;
    const id = `${role}-${Date.now()}`;
    this.gameState.team.push({ role, level: "junior", id });

    // Redraw scene
    this.scene.restart({ gameState: this.gameState });
  }

  private upgrade(memberId: string): void {
    const member = this.gameState.team.find((m) => m.id === memberId);
    if (!member || member.level === "senior") return;

    const config = ROLE_CONFIGS[member.role];
    if (this.gameState.budget < config.upgradeCost) return;

    this.gameState.budget -= config.upgradeCost;
    member.level = "senior";

    this.scene.restart({ gameState: this.gameState });
  }

  private startNextWave(): void {
    this.gameState.wave++;
    this.scene.start("ActionScene", { gameState: this.gameState });
  }
}
```

- [ ] **Step 2: Verify planning phase works**

Play through wave 1 at http://localhost:3000/game — after wave 1 ends, should transition to planning scene showing:
- "Čo ťa zabilo" bar chart
- 4 hire cards (VA, MKT, FIN, OPS) with costs
- Budget display
- Countdown timer
- Clicking a hire card adds to team and refreshes

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/scenes/PlanningScene.ts
git commit -m "feat: implement PlanningScene with hiring, upgrades, and miss chart"
```

---

## Task 12: GameOverScene + Results Redirect

**Files:**
- Modify: `src/game/scenes/GameOverScene.ts`

- [ ] **Step 1: Implement GameOverScene**

Replace `src/game/scenes/GameOverScene.ts` with:

```typescript
import Phaser from "phaser";
import type { GameState } from "../types";
import { calculateProfile } from "../utils/profileCalculator";

export class GameOverScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
  }

  create(): void {
    const { width, height } = this.scale;
    const survived = this.gameState.phase === "results";
    const profile = calculateProfile(this.gameState);

    // Build results URL params
    const params = new URLSearchParams({
      profile,
      waves: String(survived ? 5 : this.gameState.wave),
      score: String(this.gameState.score),
      team: this.gameState.team.map((m) => `${m.role}:${m.level}`).join(","),
      caught: String(this.gameState.problemsCaught),
      missed: String(this.gameState.problemsMissed),
      clicks: String(this.gameState.manualClicks),
    });

    // Brief pause then redirect to results page
    const title = survived ? "PREŽIL SI!" : "TVOJA FIRMA SA ZRÚTILA";
    const titleColor = survived ? "#22c55e" : "#ef4444";
    const subtitle = survived
      ? `Vlna 5/5 — ${profile.toUpperCase()}`
      : `Vlna ${this.gameState.wave}/5`;

    this.add
      .text(width / 2, height / 2 - 40, title, {
        fontSize: "32px",
        fontFamily: "Inter, sans-serif",
        color: titleColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, subtitle, {
        fontSize: "18px",
        fontFamily: "Inter, sans-serif",
        color: "#e5e5e5",
      })
      .setOrigin(0.5);

    // Redirect after 2.5s
    this.time.delayedCall(2500, () => {
      window.location.href = `/results?${params.toString()}`;
    });
  }
}
```

- [ ] **Step 2: Verify game over / completion triggers redirect**

Play the game — when damage reaches 100% or wave 5 ends, should show brief splash then redirect to `/results?profile=...&waves=...`.

- [ ] **Step 3: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/game/scenes/GameOverScene.ts
git commit -m "feat: implement GameOverScene with profile calculation and redirect"
```

---

## Task 13: Landing Page + Email Gate

**Files:**
- Create: `src/components/EmailGateForm.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/api/lead/route.ts`, `src/lib/mailerlite.ts`

- [ ] **Step 1: Create MailerLite client**

Create `src/lib/mailerlite.ts`:

```typescript
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY!;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID!;

interface SubscriberData {
  email: string;
  name?: string;
  fields?: Record<string, string>;
}

export async function addSubscriber(data: SubscriberData): Promise<boolean> {
  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify({
      email: data.email,
      fields: {
        name: data.name || "",
        ...data.fields,
      },
      groups: [MAILERLITE_GROUP_ID],
    }),
  });

  return response.ok;
}

export async function updateSubscriber(
  email: string,
  fields: Record<string, string>
): Promise<boolean> {
  const response = await fetch(
    `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({ fields }),
    }
  );

  return response.ok;
}
```

- [ ] **Step 2: Create API route**

Create `src/app/api/lead/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const success = await addSubscriber({ email, name });

  if (!success) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create EmailGateForm component**

Create `src/components/EmailGateForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmailGateForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!res.ok) {
        setError("Niečo sa pokazilo. Skús to znova.");
        return;
      }

      // Store email in sessionStorage for post-game enrichment
      sessionStorage.setItem("ceo-defense-email", email);
      router.push("/game");
    } catch {
      setError("Niečo sa pokazilo. Skús to znova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <input
          type="text"
          placeholder="Meno (nepovinné)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#eab308] transition-colors"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Tvoj email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#eab308] transition-colors"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#eab308] hover:bg-[#ca9a06] text-[#0a0a0a] font-bold rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Načítavam..." : "HRAŤ →"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Implement landing page**

Replace `src/app/page.tsx` with:

```tsx
import EmailGateForm from "@/components/EmailGateForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            CEO DEFENSE
          </h1>
          <p className="text-lg text-[#a3a3a3]">
            Dokážeš vybudovať firmu, ktorá funguje bez teba?
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2 text-[#e5e5e5] text-sm leading-relaxed">
          <p>
            5 vĺn biznis problémov. Ty si CEO.
            <br />
            Najmi správnych ľudí — alebo ťa to prevalcuje.
          </p>
          <p className="text-[#666]">Hra trvá 5-7 minút.</p>
        </div>

        {/* Visual hint — shapes preview */}
        <div className="flex justify-center gap-4 py-4">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-[#3b82f6]" />
          <div className="w-5 h-5 bg-[#ef4444] rotate-45" />
          <div className="w-5 h-5 bg-[#22c55e]" />
          <div className="w-5 h-5 bg-[#eab308] rounded-full" />
        </div>

        {/* Email gate */}
        <EmailGateForm />

        {/* Footer */}
        <p className="text-xs text-[#444]">
          Miliónová Evolúcia — mentoring pre podnikateľov
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify landing page renders and form works**

Open http://localhost:3000 — should show landing page with title, description, shape previews, email form. Submit with any email (MailerLite will fail without env vars but form should redirect to /game).

- [ ] **Step 6: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/lib/mailerlite.ts src/app/api/lead/route.ts src/components/EmailGateForm.tsx src/app/page.tsx
git commit -m "feat: add landing page with email gate and MailerLite integration"
```

---

## Task 14: Results Page

**Files:**
- Create: `src/app/results/page.tsx`, `src/components/ResultsCard.tsx`, `src/components/ShareButtons.tsx`

- [ ] **Step 1: Create ResultsCard component**

Create `src/components/ResultsCard.tsx`:

```tsx
import type { CEOProfile } from "@/game/types";
import { CSS_COLORS } from "@/game/constants";

const PROFILE_DATA: Record<
  CEOProfile,
  { label: string; description: string; emoji: string }
> = {
  "lone-wolf": {
    label: "LONE WOLF",
    description: "Všetko si riešil sám. Tvoja firma stojí a padá s tebou.",
    emoji: "🐺",
  },
  micromanager: {
    label: "MICROMANAGER",
    description: "Máš tím, ale stále hasíš požiare sám. Nedôveruješ im.",
    emoji: "🔥",
  },
  "generalist-trap": {
    label: "GENERALIST TRAP",
    description:
      "Máš ľudí, ale žiadnych špecialistov. Všetci robia všetko, nikto nič poriadne.",
    emoji: "🔄",
  },
  delegator: {
    label: "DELEGÁTOR",
    description:
      "Rozpoznal si, čo ťa brzdí, a najal si správnych ľudí. Tvoja firma rastie.",
    emoji: "📈",
  },
  strategist: {
    label: "STRATÉG",
    description:
      "Postavil si systém, ktorý funguje bez teba. Toto je škálovateľný biznis.",
    emoji: "🏆",
  },
};

interface ResultsCardProps {
  profile: CEOProfile;
  waves: number;
  score: number;
  team: string;
}

export default function ResultsCard({
  profile,
  waves,
  score,
  team,
}: ResultsCardProps) {
  const data = PROFILE_DATA[profile] || PROFILE_DATA["lone-wolf"];
  const teamMembers = team ? team.split(",") : [];

  const roleColorMap: Record<string, string> = {
    va: CSS_COLORS.general,
    marketing: CSS_COLORS.marketing,
    finance: CSS_COLORS.finance,
    operations: CSS_COLORS.operations,
  };

  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full space-y-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">
        CEO DEFENSE
      </h2>

      {/* Waves survived */}
      <div className="space-y-1">
        <p className="text-sm text-[#a3a3a3]">Prežil som</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((w) => (
            <div
              key={w}
              className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                w <= waves
                  ? "bg-[#22c55e] text-[#0a0a0a]"
                  : "bg-[#1a1a1a] text-[#444]"
              }`}
            >
              {w}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#666]">{waves}/5 vĺn</p>
      </div>

      {/* Profile */}
      <div className="space-y-2">
        <p className="text-3xl font-bold text-white">{data.label}</p>
        <p className="text-sm text-[#a3a3a3] leading-relaxed">
          {data.description}
        </p>
      </div>

      {/* Score */}
      <p className="text-lg text-[#e5e5e5]">
        Score: <span className="font-bold text-white">{score.toLocaleString()}</span>
      </p>

      {/* Team */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#a3a3a3]">Tvoj tím:</p>
          <div className="flex gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-[8px] font-bold text-[#0a0a0a]">CEO</span>
            </div>
            {teamMembers.map((m, i) => {
              const [role, level] = m.split(":");
              const color = roleColorMap[role] || CSS_COLORS.general;
              const label =
                role === "va" ? "VA" : role.substring(0, 3).toUpperCase();
              return (
                <div
                  key={i}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: color,
                    width: level === "senior" ? 36 : 28,
                    height: level === "senior" ? 36 : 28,
                  }}
                >
                  <span className="text-[7px] font-bold text-[#0a0a0a]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ShareButtons component**

Create `src/components/ShareButtons.tsx`:

```tsx
"use client";

interface ShareButtonsProps {
  profile: string;
  waves: number;
  score: number;
}

export default function ShareButtons({
  profile,
  waves,
  score,
}: ShareButtonsProps) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text = `Prežil som ${waves}/5 vĺn v CEO Defense. Som ${profile.toUpperCase()}. Score: ${score}. A ty?`;
  const shareUrl = `${url}?ref=share`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    alert("Odkaz skopírovaný!");
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank");
  };

  const handleDownloadImage = () => {
    const ogUrl = `${url}/api/og?profile=${profile}&waves=${waves}&score=${score}`;
    window.open(ogUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <button
        onClick={handleLinkedIn}
        className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded-lg transition-colors"
      >
        Zdieľať na LinkedIn
      </button>
      <button
        onClick={handleCopyLink}
        className="w-full py-3 bg-[#1a1a1a] hover:bg-[#222] text-[#e5e5e5] font-bold rounded-lg border border-[#333] transition-colors"
      >
        Kopírovať odkaz
      </button>
      <button
        onClick={handleDownloadImage}
        className="w-full py-3 bg-[#1a1a1a] hover:bg-[#222] text-[#e5e5e5] font-bold rounded-lg border border-[#333] transition-colors"
      >
        Stiahnuť kartičku
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create results page**

Create `src/app/results/page.tsx`:

```tsx
import type { CEOProfile } from "@/game/types";
import ResultsCard from "@/components/ResultsCard";
import ShareButtons from "@/components/ShareButtons";

interface ResultsPageProps {
  searchParams: Promise<{
    profile?: string;
    waves?: string;
    score?: string;
    team?: string;
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const profile = (params.profile || "lone-wolf") as CEOProfile;
  const waves = parseInt(params.waves || "1", 10);
  const score = parseInt(params.score || "0", 10);
  const team = params.team || "";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-12 gap-8">
      <ResultsCard profile={profile} waves={waves} score={score} team={team} />

      <ShareButtons profile={profile} waves={waves} score={score} />

      {/* CTA */}
      <div className="max-w-md w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          Chceš reálne vybudovať firmu, ktorá funguje bez teba?
        </h3>
        <p className="text-sm text-[#a3a3a3] leading-relaxed">
          Miliónová Evolúcia — 5-fázový systém pre podnikateľov s obratom
          €100k–€1M+
        </p>
        <a
          href="https://milionovaevolucia.sk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full py-3 bg-[#eab308] hover:bg-[#ca9a06] text-[#0a0a0a] font-bold rounded-lg transition-colors"
        >
          Zisti viac
        </a>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify results page renders**

Open http://localhost:3000/results?profile=micromanager&waves=3&score=847&team=marketing:junior,finance:senior — should show results card with profile, wave indicators, score, team visualization, share buttons, and CTA.

- [ ] **Step 5: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/components/ResultsCard.tsx src/components/ShareButtons.tsx src/app/results/page.tsx
git commit -m "feat: add results page with profile card, share buttons, and CTA"
```

---

## Task 15: OG Image Generator for Share Cards

**Files:**
- Create: `src/app/api/og/route.tsx`

- [ ] **Step 1: Install OG image dependency**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm install @vercel/og
```

- [ ] **Step 2: Create OG image route**

Create `src/app/api/og/route.tsx`:

```tsx
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const PROFILE_LABELS: Record<string, string> = {
  "lone-wolf": "LONE WOLF",
  micromanager: "MICROMANAGER",
  "generalist-trap": "GENERALIST TRAP",
  delegator: "DELEGÁTOR",
  strategist: "STRATÉG",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const profile = searchParams.get("profile") || "lone-wolf";
  const waves = searchParams.get("waves") || "1";
  const score = searchParams.get("score") || "0";

  const profileLabel = PROFILE_LABELS[profile] || "LONE WOLF";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            color: "#a3a3a3",
            letterSpacing: "4px",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          CEO DEFENSE
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          {[1, 2, 3, 4, 5].map((w) => (
            <div
              key={w}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "8px",
                backgroundColor: w <= parseInt(waves) ? "#22c55e" : "#1a1a1a",
                color: w <= parseInt(waves) ? "#0a0a0a" : "#444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "10px",
            display: "flex",
          }}
        >
          {profileLabel}
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "#e5e5e5",
            marginBottom: "40px",
            display: "flex",
          }}
        >
          Score: {parseInt(score).toLocaleString()}
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "#eab308",
            fontWeight: "bold",
            display: "flex",
          }}
        >
          A ty? Dokážeš to lepšie?
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

- [ ] **Step 3: Verify OG image generates**

Open http://localhost:3000/api/og?profile=micromanager&waves=3&score=847 — should render a dark image with "CEO DEFENSE", wave indicators, "MICROMANAGER", score, and CTA text.

- [ ] **Step 4: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/app/api/og/route.tsx package.json package-lock.json
git commit -m "feat: add OG image generator for share cards"
```

---

## Task 16: Post-Game MailerLite Enrichment

**Files:**
- Create: `src/app/api/lead/enrich/route.ts`
- Modify: `src/game/scenes/GameOverScene.ts`

- [ ] **Step 1: Create enrichment API route**

Create `src/app/api/lead/enrich/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { updateSubscriber } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, profile, waves, score } = body;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const success = await updateSubscriber(email, {
    ceo_profile: profile || "",
    waves_survived: String(waves || 0),
    ceo_defense_score: String(score || 0),
  });

  if (!success) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Add enrichment call to GameOverScene**

In `src/game/scenes/GameOverScene.ts`, add the enrichment call before redirect. Add after the `const params` line:

```typescript
    // Enrich MailerLite subscriber with game data
    const email =
      typeof window !== "undefined"
        ? sessionStorage.getItem("ceo-defense-email")
        : null;

    if (email) {
      fetch("/api/lead/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profile,
          waves: survived ? 5 : this.gameState.wave,
          score: this.gameState.score,
        }),
      }).catch(() => {}); // fire and forget
    }
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add src/app/api/lead/enrich/route.ts src/game/scenes/GameOverScene.ts
git commit -m "feat: add post-game MailerLite enrichment with profile and score"
```

---

## Task 17: Environment Variables + Vercel Deploy Setup

**Files:**
- Create: `.env.local.example`

- [ ] **Step 1: Create env example file**

Create `.env.local.example`:

```
MAILERLITE_API_KEY=your_api_key_here
MAILERLITE_GROUP_ID=your_group_id_here
```

- [ ] **Step 2: Add OG metadata to results page**

In `src/app/results/page.tsx`, add dynamic metadata. Add before the default export:

```tsx
import type { Metadata } from "next";

interface ResultsPageProps {
  searchParams: Promise<{
    profile?: string;
    waves?: string;
    score?: string;
    team?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const profile = params.profile || "lone-wolf";
  const waves = params.waves || "1";
  const score = params.score || "0";

  const ogUrl = `/api/og?profile=${profile}&waves=${waves}&score=${score}`;

  return {
    title: `CEO Defense — ${profile.toUpperCase()}`,
    description: `Prežil som ${waves}/5 vĺn. Score: ${score}. A ty?`,
    openGraph: {
      title: `CEO Defense — ${profile.toUpperCase()}`,
      description: `Prežil som ${waves}/5 vĺn. Score: ${score}. A ty?`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `CEO Defense — ${profile.toUpperCase()}`,
      description: `Prežil som ${waves}/5 vĺn. Score: ${score}. A ty?`,
      images: [ogUrl],
    },
  };
}
```

Remove the duplicate `ResultsPageProps` interface that was defined earlier in the file — keep only this one.

- [ ] **Step 3: Verify build succeeds**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm run build
```

Expected: Build succeeds (MailerLite calls will fail without env vars but the build should complete).

- [ ] **Step 4: Commit**

```bash
cd /Users/jarosatori/game-lead-magnet
git add .env.local.example src/app/results/page.tsx
git commit -m "feat: add env setup, OG metadata for results page"
```

---

## Task 18: End-to-End Playtest + Polish

**Files:**
- Various small fixes across all files

- [ ] **Step 1: Start dev server and play full game**

Run: `npm run dev`

Play the full flow:
1. Landing page → enter email → submit
2. Intro animation → Wave 1 starts
3. Try to catch problems by clicking
4. Wave 1 ends → Planning phase
5. Hire a team member → Wave 2 starts
6. Continue through waves or until game over
7. Results screen shows profile, score, team
8. Share buttons work, CTA links work

- [ ] **Step 2: Test mobile viewport**

Open Chrome DevTools → toggle device toolbar → iPhone 14 viewport. Play through the full game. Verify:
- All elements fit on screen
- Touch/tap works for catching problems
- Planning phase hire cards are tappable
- Results page is readable

- [ ] **Step 3: Fix any issues found during playtesting**

Address any visual, gameplay, or navigation issues discovered.

- [ ] **Step 4: Run final build check**

Run:
```bash
cd /Users/jarosatori/game-lead-magnet
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 5: Commit final polish**

```bash
cd /Users/jarosatori/game-lead-magnet
git add -A
git commit -m "polish: playtest fixes and mobile optimization"
```

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | Project bootstrap | Next.js + Phaser setup |
| 2 | Game data layer | types, constants, waves |
| 3 | Profile calculator + tests | profileCalculator.ts |
| 4 | Phaser setup + intro | config, IntroScene, PhaserGame |
| 5 | Problem entity | Problem.ts |
| 6 | CEO entity | CEO.ts |
| 7 | TeamMember entity | TeamMember.ts |
| 8 | Wave spawner | WaveSpawner.ts |
| 9 | Game systems | Catch, Damage, Budget |
| 10 | Action scene (gameplay) | ActionScene.ts |
| 11 | Planning scene (hiring) | PlanningScene.ts |
| 12 | Game over + redirect | GameOverScene.ts |
| 13 | Landing page + email gate | page.tsx, EmailGateForm, MailerLite |
| 14 | Results page | ResultsCard, ShareButtons |
| 15 | OG share card image | /api/og |
| 16 | Post-game enrichment | /api/lead/enrich |
| 17 | Deploy setup + metadata | env, OG meta |
| 18 | End-to-end playtest | Polish + fixes |
