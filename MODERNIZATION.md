# Modernization plan

Staged so the game stays runnable and testable after every step.

## ✅ Phase 1 — runnable again (done)

- Removed the dead Chrome-App platform (`chrome.app.runtime` background page,
  sandboxed iframe, `chrome.storage`) and the incomplete `opera/` tree.
- Single static entry (`index.html` + `public/`), served/built by Vite 8.
- `storageAPI` now uses `localStorage` directly (it already had that fallback).
- Removed `chrome/event/` — 60 unused promo photos referenced by no code.

## ✅ Phase 2a — tooling & safe fixes (done)

- ESLint 10 flat config (`eslint.config.js`) + Prettier + EditorConfig.
  Baseline: **0 errors, ~650 warnings** in `public/js/**` — that warning count is
  the modernization backlog; drive it down, don't add to it.
- `vite-plugin-pwa`: web manifest + service worker, generated PWA icons
  (`public/gfx/pwa-*.png`, upscaled from the 128px original — **replace with real
  artwork**).
- Replaced all 10 `setInterval("code string", …)` / `setTimeout("code string", …)`
  with function references (implied-eval; also blocks a strict CSP later).
- Fixed the no-op `dbg()` (was a bare `console.error` reference).
- Widget buttons (`buttonWidget0`, `buttonWidget2`, Copyrights) no longer
  `postMessage` to a parent frame that no longer exists — they call `openTab()` /
  `config.saveGame()` directly.

## ▶ Phase 2b — ES modules (next)

Convert `public/js/**` from one shared global scope to ES modules under `src/`.

- One singleton per file (`aquarium`, `config`, `fishShop`, `stats`, `uio`,
  `scenery`, `lighting`, `filtration`, `background`) → `export`.
- Shared constants (`SPEC_*`, `VIEW_*`, `DIRECTION_*`, `RARITY_*`, `BUY`/`SELL`,
  `fishSpecies`, …) → a `constants.js` / `species.js` module.
- Free functions (`eventsCreate`, `updateBuyButtons`, `computeBreedingRate`,
  `computeFishNumComfort`, `openTab`, `dbg`) → explicit imports.
- Single `src/main.js` entry, loaded as `<script type="module">`; delete
  `sandbox.js` and the `DOMContentLoaded`/`load` double-bootstrap in `js/main.js`.
- Fix the implicit-global loop vars (`i`, `num`, `e`) flagged by `no-undef`.
- Move `src/**` onto the strict ESLint tier; format with Prettier.
- Re-validate: boot with no console errors, canvas renders, save/load round-trips,
  buy/sell/breed still work.

## Phase 3 — TypeScript-ready

- `jsconfig.json` + `checkJS`, JSDoc types on the public API of each module.
- Convert file-by-file to `.ts` once types are stable.
- Add a test runner (Vitest) around the economy/breeding logic first — it's the
  most rule-heavy and least DOM-coupled part.

## Phase 4 — responsive / mobile layout

- The UI is a fixed ~457×300 px "desktop widget". Make the tank and views scale
  to viewport; touch targets ≥ 44 px; respect safe-area insets.
- Pointer events instead of mouse-only handlers.

## Phase 5 — Android

Two options, decide when Phase 4 lands:

1. **Trusted Web Activity** (recommended if no native APIs are needed): wrap the
   deployed PWA with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
   → AAB → Play Store. Needs a hosted HTTPS origin, a Play Console developer
   account (one-time US$25), and Digital Asset Links.
2. **Capacitor**: if native plugins become necessary. Needs Android Studio + JDK;
   `/android` is already git-ignored for this.
