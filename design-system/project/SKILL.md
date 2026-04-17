# SKILL — Designing for CEO Defense

When designing a new screen, feature, or marketing surface for **CEO Defense**, start here.

## 1. Always start from tokens
- Import `colors_and_type.css`. Never hardcode a hex value or a px size — use `var(--…)`.
- If a value you need doesn't exist, propose a new token rather than inlining.

## 2. Respect the brand DNA
- **Editorial + arcade.** Serif for display, sans for body, mono for numerics / wave counters / P&L figures.
- **Shape language.** The 4 role categories map 1:1 to 4 shapes:
  - Ops → Triangle (blue)
  - Sales → Diamond (red)
  - People → Square (green)
  - Finance → Circle (yellow)
  Never use these shapes for anything else. Never re-map the colors.
- **The CEO disc** is reserved for the player (the user). It is never used for NPCs, employees, or generic UI.

## 3. Layout rules
- Game surfaces (planning, wave, results) are **dark** (`--ink-900` background, `--paper` text).
- Marketing / landing is also dark by default but can flip to `--paper` background for long-form storytelling.
- Keep the grid centered, max-width ~960px for reading, ~1280px for the planning dashboard.
- No decorative gradients. No drop shadows on text. Elevation is a single flat shadow (`--shadow-2`).

## 4. Copy tone
- Direct, punchy, in Slovak (primary) / English (secondary). Short sentences.
- Numbers matter — surface them in mono, with thousands separators.
- Avoid gamified fluff ("Epic win!"). Say "Survived wave 7" instead.

## 5. Components before screens
- Always check `preview/comp-*.html` for an existing component before designing a new one.
- Extend via variants (new `data-variant` or new size) rather than forking.

## 6. Checklist before shipping a design
- [ ] All colors from `--` tokens?
- [ ] All type sizes from `--fs-*`?
- [ ] Role colors + shapes paired correctly?
- [ ] Dark background + `--paper` ink as default?
- [ ] Numbers in mono?
- [ ] Registered as a preview card in `preview/` + asset manifest?
