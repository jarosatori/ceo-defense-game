# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CEO Defense** — a hybrid tower defense browser game serving as a lead magnet for Miliónová Evolúcia. The player is a solo CEO overwhelmed by waves of business problems. They must hire team members with the right skills to survive. The game never tells the player what to do — they learn by experiencing consequences. Minimalist flat geometric visual style on dark background.

## Design Spec

Full spec: `docs/superpowers/specs/2026-04-14-ceo-defense-design.md`

## Key Design Decisions

- **Hybrid tower defense:** Arcade action phases + 15s strategic planning breaks between waves
- **5 waves with weighted problem distribution** — not random. Each wave emphasizes a different problem category (marketing → finance → operations) mirroring real business growth barriers
- **4 hire-able roles:** VA (generalist, slow), Marketingák (blue), Finančník (red), Operations Manager (green). No tooltips — player infers from gameplay
- **Implicit teaching:** Post-wave bar chart shows "what killed you" by color. No recommendations. Player must figure out who to hire.
- **CEO Profile scoring:** Lone Wolf / Micromanager / Generalist Trap / Delegátor / Stratég — based on hiring decisions and manual click ratio
- **Email gate before game** (MailerLite), post-game data enrichment with profile + score
- **Share card** via Vercel OG for LinkedIn + IG Stories

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Game engine:** Phaser.js 3 (HTML5 Canvas)
- **Styling:** Tailwind CSS (non-game UI only)
- **Deployment:** Vercel
- **Email:** MailerLite API
- **Share cards:** Vercel OG Image Generation

## Routes

```
/            → Landing page + email gate
/game        → Phaser game canvas
/results     → Results + share card + CTA
/api/lead    → POST: MailerLite integration
/api/og      → GET: dynamic OG image
```

## Color System

- Background: `#0a0a0a` | CEO: `#ffffff`
- Marketing: `#3b82f6` (blue, triangle)
- Financie: `#ef4444` (red, diamond)
- Operácie: `#22c55e` (green, square)
- General: `#eab308` (yellow, circle)

## Commands

_To be filled once the project is bootstrapped._

## Architecture

_To be filled once the project structure is established._
