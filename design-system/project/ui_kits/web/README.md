# CEO Defense — Web UI Kit

React/JSX recreation of the three non-game Next.js pages: **Landing** (email gate), **Planning** (post-wave strategic phase), **Results** (profile + share + CTA).

> The action phase is rendered in a Phaser canvas (`/game`) and not part of this web UI kit — it's canvas, not DOM. See `../../README.md` for the Phaser constants that drive the game look.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry. Click-through from landing → planning → results. |
| `App.jsx` | Screen state machine + fake game state. |
| `LandingScreen.jsx` | `/` — hero + email gate form. |
| `PlanningScreen.jsx` | `/planning` (rendered in Phaser — recreated in DOM here). P&L summary, "čo ťa zabilo" chart, focus radio, hire rows, team list. |
| `ResultsScreen.jsx` | `/results` — results card, share buttons, Miliónová Evolúcia CTA. |
| `Primitives.jsx` | Shared building blocks: `WaveTracker`, `ShapeGlyph`, `RoleToken`, `CeoDisc`, `PrimaryButton`, `GhostButton`, `CategoryBar`, `Eyebrow`. |

## Source mapping

| This kit | Original file |
|---|---|
| `LandingScreen` | `src/app/page.tsx` + `src/components/EmailGateForm.tsx` |
| `PlanningScreen` | `src/game/scenes/PlanningScene.ts` (Phaser → DOM recreation) |
| `ResultsScreen` | `src/app/results/page.tsx` + `src/components/ResultsCard.tsx` + `src/components/ShareButtons.tsx` |
| `RoleToken` | `ROLE_CONFIGS` from `src/game/constants.ts` |

## Fidelity notes

- Copy is pulled verbatim from the repo (Slovak, with diacritics).
- Colors are the six tokens in `CSS_COLORS` — no new colors introduced.
- Phaser planning scene uses canvas with Inter @ 11/13/14/22/26 px and custom drawing — we mirror those exact sizes in DOM so numbers don't drift.
- The radio-selection focus panel and the drag-scroll mechanics are the distinctive planning-phase shapes; we kept the radio but not the drag-scroll (DOM scrolls natively).
