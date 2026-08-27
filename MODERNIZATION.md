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

## ✅ Phase 2b — ES modules (done)

`public/js/**` (one shared global scope) → ES modules under `src/`, bundled by
Vite from a single `<script type="module" src="/src/main.js">`.

- One module per singleton: `aquarium`, `config`, `fishShop` (`fishshop.js`),
  `stats` (`statistics.js`), `uio`, `scenery`, `lighting`, `filtration` +
  `background`.
- New support modules: `constants.js` (all shared `SPEC_*`/`VIEW_*`/`BUY`… ),
  `species.js` (was `fish.js`: table + `fishConstructor` + `computeBreedingRate`/
  `computeFishNumComfort`), `util.js` (`dbg`, `openTab`), `storage.js`
  (localStorage), `loop.js` (the `smallInterval`/`bigInterval`/`chosenSpeed`
  state that several files reassigned — now a shared object).
- `storageAPI.js` + `sandbox.js` deleted; `js/main.js`'s DOMContentLoaded +1 s
  setTimeout hack collapsed into one `load` handler in `src/main.js`.
- `changeMoney` exposed as `aquarium.changeMoney`; bare `updateBuyButtons()`
  re-exported as a thin wrapper over `aquarium.updateBuyButtonsAlias()`.
- Implicit-global loop/scratch vars (`i`, `num`, `e`, `tmp`, `dirX`…) declared
  for module strict mode. **Semantics unchanged** — no `var`→`const`, no
  `==`→`===` yet (that's Phase 3), so the `src/**` ESLint tier keeps `no-var` /
  `eqeqeq` off for now and enforces `no-undef` / `no-implied-eval`.
- Dev-only: `src/main.js` puts the singletons on `window` under
  `import.meta.env.DEV` for DevTools poking (stripped from the prod bundle).
- Validated dev + `vite build`: boots clean, canvas renders, save/load
  round-trips, buy/sell/add-money work, 0 lint errors.

## Phase 3 — TypeScript-ready

- Syntax modernization first: `var`→`const`/`let`, `==`→`===`, then flip the
  `src/**` ESLint rules back on. Loop-ify the 64 hand-written `sellFish`
  listeners in `statistics.js`; turn the `fishSpecies` array-of-arrays into an
  array of objects.
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
