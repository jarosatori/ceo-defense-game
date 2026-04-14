---
title: CEO Defense — Game Lead Magnet Design Spec
date: 2026-04-14
status: approved
type: design-spec
project: game-lead-magnet
---

# CEO Defense — Game Lead Magnet

## Purpose

Interactive browser-based tower defense game serving as a lead magnet for Miliónová Evolúcia. Teaches delegation through gameplay — the player starts as a solo CEO, gets overwhelmed, and must hire the right team members to survive. The game never tells the player what to do; they learn by experiencing consequences of their decisions.

## Target Audience

**Segment C: "Preťažený operátor"** — founders/CEOs with €250k–€3M revenue who are the bottleneck of their own company. They struggle with delegation, missing processes, no reporting, and time management. Age 25–50, SK/CZ market.

## User Flow

```
Landing page → Email gate (MailerLite) → Short intro animation (10s) → Wave 1 → Planning phase (15s) → Wave 2 → ... → Wave 5 → Results screen → Share card + CTA to Miliónová Evolúcia
```

## Game Design

### Genre

Hybrid tower defense — arcade action phases with strategic planning breaks between waves. Minimalist flat geometric visual style.

### Core Loop

1. **Action phase (wave):** Problems fly in from all sides. CEO and team auto-catch problems in their radius. Player taps/clicks uncaught problems (CEO manually firefighting). Missed problems fill damage bar.
2. **Planning phase (15s between waves):** Player spends earned budget to hire team members or upgrade existing ones. No guidance on who to hire — player must read the pattern from what killed them.

### 5 Waves = 5 Phases of Miliónová Evolúcia

| Wave | Name | Duration | Problem Distribution | Core Lesson |
|------|------|----------|---------------------|-------------|
| 1 | Všetko sám | 30s | 70% marketing/predaj, 10% financie, 20% operácie | False sense of control — "I can handle this" |
| 2 | Prvý nápor | 40s | 50% marketing/predaj, 15% financie, 35% operácie | You need your first hire. But who? |
| 3 | Peniaze horia | 45s | 25% marketing/predaj, 50% financie, 25% operácie | Cash kills quietly — you need financial visibility |
| 4 | Chaos | 50s | 15% marketing/predaj, 20% financie, 65% operácie | Processes matter. Delegate responsibility, not tasks |
| 5 | Škáluj alebo zomri | 60s | 25% each category | Either your team works as a system, or everything collapses |

### Problem Types (Visual Encoding)

Each problem is a geometric shape + color representing its category:

| Category | Color | Shape | Examples |
|----------|-------|-------|----------|
| Marketing/Predaj | Blue | Triangle | Objednávky, reklamy, social media, nový zákazník |
| Financie | Red | Diamond | Faktúry, cashflow, dane, nezaplatené pohľadávky |
| Operácie/Procesy | Green | Square | Reklamácie, logistika, "čo mám robiť?", procesný fail |
| General/Mix | Yellow | Circle | Emaily, mítingy, admin, nečakané krízy |

Problems spawn from edges of the screen, moving toward the center (CEO position). Speed and density increase with each wave.

### Hiring System

Available roles in planning phase (no tooltips explaining when to use them):

| Role | Color Match | Catch Speed | Catch Radius | Cost | What It Catches |
|------|------------|-------------|-------------|------|-----------------|
| Virtuálna asistentka | Yellow (mix) | Slow | Medium | Low (€) | Catches all types, but slowly |
| Marketingák | Blue | Fast | Medium | Medium (€€) | Marketing/Predaj problems |
| Finančník | Red | Fast | Medium | Medium (€€) | Financie problems |
| Operations Manager | Green | Fast | Large | High (€€€) | Operácie/Procesy problems |

**Upgrades:** Each role can be upgraded once (junior → senior). Senior catches faster and has larger radius. Cost: 1.5x original hire price.

**Budget:** Earned by catching problems (each caught problem = €). Missed problems = no money + damage. This creates a natural economy — if you're losing, you have less money to fix it (just like real business).

### Implicit Teaching Mechanics

1. **Problem distribution shifts per wave** — player sees which color is killing them, must infer what to hire.
2. **Post-wave mini bar chart (3s)** — shows "what killed you" by color. No text recommendation. Just data.
3. **Flash on miss** — when a problem passes defense, its color flashes large on screen. Subconscious pattern recognition.
4. **Bad hire = felt consequence** — hiring a finančník when marketing is killing you means he sits there catching nothing while blue triangles fly past. The player feels the wasted money.
5. **VA trap** — the cheapest hire (VA) catches everything slowly. Beginners will hire multiple VAs. Advanced players hire specialists. This mirrors real business: generalists don't scale.

### Difficulty Scaling

- **Wave 1:** 15 problems, slow speed (2s cross time)
- **Wave 2:** 25 problems, medium speed (1.5s)
- **Wave 3:** 35 problems, medium speed (1.3s), first "burst" events (5 problems at once)
- **Wave 4:** 50 problems, fast (1s), frequent bursts
- **Wave 5:** 70 problems, fast (0.8s), continuous pressure from all sides

### Damage & Game Over

- Damage bar starts at 0%, fills with each missed problem
- Each missed problem adds ~3-5% damage (scaled by wave)
- At 100% → game over screen with "Tvoja firma sa zrútila vo vlne X"
- Game over still shows results + share card + CTA (not a dead end)

## Visual Design

### Style

Minimalist flat geometric. Dark background, bright accent colors. Professional, not playful — this targets entrepreneurs, not casual gamers.

### Layout

```
┌─────────────────────────────────┐
│  Wave 3/5    Score: 847    €€€  │  ← Top bar: wave, score, budget
│  ████████░░░░░░░░ Damage: 42%   │  ← Damage bar
│                                 │
│         ▲                       │
│      ▲     ◆                    │
│    ◆    (CEO)   ■              │  ← Game field: problems fly toward center
│         (M)(F)                  │  ← Team members orbit CEO
│      ■        ▲                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Planning Phase Layout

```
┌─────────────────────────────────┐
│  PLÁNOVACIA FÁZA    Budget: €€€ │
│  Ďalšia vlna za: 12s            │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌───┐ │
│  │ VA  │ │ MKT │ │ FIN │ │OPS│ │  ← Hire cards
│  │  €  │ │ €€  │ │ €€  │ │€€€│ │
│  └─────┘ └─────┘ └─────┘ └───┘ │
│                                 │
│  Tvoj tím: (CEO) (M-jr)        │  ← Current team
│                                 │
│  Čo ťa zabilo:                  │
│  ████████ MKT  42%              │  ← Mini bar chart (no recommendation)
│  ███ FIN  15%                   │
│  █████ OPS  28%                 │
│  ██ MIX  15%                    │
└─────────────────────────────────┘
```

### Color Palette

- Background: `#0a0a0a` (near black)
- CEO: `#ffffff` (white)
- Marketing/Predaj: `#3b82f6` (blue)
- Financie: `#ef4444` (red)
- Operácie: `#22c55e` (green)
- General/Mix: `#eab308` (yellow)
- UI text: `#e5e5e5` (light gray)
- Damage bar: gradient from `#22c55e` to `#ef4444`

## Results Screen

### CEO Profile Types

Based on player decisions throughout the game:

| Profile | Condition | Description |
|---------|-----------|-------------|
| **Lone Wolf** | Hired 0-1 people | "Všetko si riešil sám. Tvoja firma stojí a padá s tebou." |
| **Micromanager** | Hired team but mostly clicked manually | "Máš tím, ale stále hasíš požiare sám. Nedôveruješ im." |
| **Generalist Trap** | Hired mostly VAs | "Máš ľudí, ale žiadnych špecialistov. Všetci robia všetko, nikto nič poriadne." |
| **Delegátor** | Hired specialists matching wave patterns | "Rozpoznal si, čo ťa brzdí, a najal si správnych ľudí. Tvoja firma rastie." |
| **Stratég** | Survived wave 5 with upgraded specialists | "Postavil si systém, ktorý funguje bez teba. Toto je škálovateľný biznis." |

### Results Card Content

```
┌─────────────────────────────────┐
│                                 │
│  CEO DEFENSE                    │
│                                 │
│  Prežil som  ████ 4/5 vĺn      │
│                                 │
│  Som: MICROMANAGER              │
│  Score: 1,247                   │
│                                 │
│  Tím: (CEO)(MKT)(FIN)          │
│                                 │
│  A ty? → ceodefense.sk          │
│                                 │
└─────────────────────────────────┘
```

### CTA Section

Below the share card:
- Headline: "Chceš reálne vybudovať firmu, ktorá funguje bez teba?"
- Subheadline: "Miliónová Evolúcia — 5-fázový systém pre podnikateľov s obratom €100k–€1M+"
- Button: "Zisti viac" → link to ME landing page

## Technical Architecture

### Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Game engine:** Phaser.js 3 (HTML5 Canvas, mobile-optimized)
- **Styling:** Tailwind CSS (for non-game UI: landing, email gate, results)
- **Deployment:** Vercel
- **Email capture:** MailerLite API integration
- **Share cards:** Vercel OG Image Generation (dynamic)
- **Analytics:** Vercel Analytics + custom game events

### Pages / Routes

```
/                → Landing page + email gate form
/game            → Game screen (Phaser canvas)
/results         → Results screen + share card + CTA
/api/lead        → POST: save email to MailerLite
/api/og          → GET: generate dynamic share card image
```

### Game State

All game state lives client-side (no backend needed during gameplay):

```typescript
interface GameState {
  wave: number;              // 1-5
  score: number;
  budget: number;
  damage: number;            // 0-100
  team: TeamMember[];
  problemsCaught: number;
  problemsMissed: number;
  missedByCategory: Record<Category, number>;
  manualClicks: number;      // for CEO profile calculation
  phase: 'intro' | 'action' | 'planning' | 'results' | 'gameover';
}

type Category = 'marketing' | 'finance' | 'operations' | 'general';

interface TeamMember {
  role: 'va' | 'marketing' | 'finance' | 'operations';
  level: 'junior' | 'senior';
  position: { x: number; y: number };
}
```

### Responsive Design

- **Desktop:** Full game field, mouse click to catch problems
- **Mobile:** Same layout scaled down, tap to catch. Planning phase uses bottom sheet cards.
- **Minimum viewport:** 360px width (iPhone SE)

## Lead Capture Integration

### Email Gate (before game)

Simple form on landing page:
- Field: email (required)
- Field: meno (optional)
- Submit → POST `/api/lead` → MailerLite API → redirect to `/game`
- MailerLite group: "CEO Defense Lead Magnet"
- Tags: `lead-magnet`, `ceo-defense`, `segment-c`

### Post-Game Data Enrichment

After game completion, update the MailerLite subscriber with:
- `ceo_profile`: the profile type (lone-wolf, micromanager, etc.)
- `waves_survived`: 1-5
- `score`: final score

This enables personalized follow-up email sequences based on how they played.

## Share / Viral Mechanics

### Share Card

- Generated dynamically via Vercel OG (`/api/og?profile=micromanager&waves=4&score=1247`)
- Dimensions: 1200x630 (LinkedIn/Facebook) + 1080x1920 variant (IG Stories)
- Contains: profile type, waves survived, score, team visualization, URL

### Share Buttons

- LinkedIn (primary — target audience lives there)
- Instagram Stories
- Copy link
- Download image

## Success Metrics

- **Conversion:** email submissions / landing page visits
- **Completion rate:** % of players who reach wave 5 (or game over)
- **Share rate:** % of completers who click share
- **CTA click rate:** % of completers who click through to ME

## Out of Scope (v1)

- Leaderboard / multiplayer
- Sound effects / music
- Multiple game modes
- Backend-stored game state
- A/B testing of wave distributions
- Localization beyond SK
