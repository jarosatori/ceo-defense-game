# CEO Defense — Design System

A design system for **CEO Defense**, a browser-based management game where the player takes the role of a CEO defending their company across 10 waves of business problems by hiring the right people and assigning them to the right functions.

The tone is **editorial + arcade**: serious typography (display serif + precise sans) paired with a reduced, almost Bauhaus-like shape language (triangle / diamond / square / circle) used as role glyphs.

## Files

```
colors_and_type.css        Single source of truth — CSS variables for color, type, spacing, radii, shadow
assets/                    Logo mark, wordmark, shape glyphs (SVG)
preview/                   20 preview cards (Brand, Colors, Type, Spacing, Components)
ui_kits/web/               React UI kit — landing, planning and results screens
```

## Tokens (see `colors_and_type.css`)

**Color** — 4 role categories (Ops / Sales / People / Finance), 4 semantic (damage / recovery / warning / success), a 9-step neutral ramp (`--ink-0` → `--ink-900`).

**Type** — Display serif for titles, a neutral sans for body, a monospace for numerics / wave labels. All sizes exposed as `--fs-*` and line-heights as `--lh-*`.

**Spacing** — 4px base scale from `--sp-1` (4px) to `--sp-10` (80px).

**Radii & shadow** — `--r-sm/md/lg/full`, `--shadow-1/2/3`.

## Usage

Import tokens and mount React:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

See `ui_kits/web/index.html` for the working React integration. Components are split across `Primitives.jsx`, `LandingScreen.jsx`, `PlanningScreen.jsx`, `ResultsScreen.jsx`, and composed in `App.jsx`.

## Review

Open the Design System tab — each preview card is registered as a reviewable asset grouped by Brand / Colors / Type / Spacing / Components.
