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

## ✅ Phase 3a — syntax modernization (done)

- Every `var` in `src/**` → `const`/`let`; every loose `==`/`!=` → `===`/`!==`
  (all 37 sites reviewed individually — each was number↔number, string↔string or
  otherwise semantics-preserving). `src/**` ESLint tier now enforces `no-var`,
  `prefer-const`, `eqeqeq`, `no-redeclare`.
- The `*Constructor` IIFEs became plain `function` declarations; helper methods
  that don't touch `this` are arrows, singleton self-calls go through the export
  name (`uio.setSmallInterval(…)`), so no `var self = this`.
- `statistics.js`: the 64 hand-written `fishTableSellFish{N}` listeners → one
  `for` loop wiring `() => aquarium.sellFish(i)` on each row as it is built;
  row construction factored through a `makeDiv(class, id)` helper. −540 lines.
- `species.js`: `fishSpecies` restored to a compact `// prettier-ignore` table
  (values verified byte-for-byte against the pre-refactor data with a diff
  script). Dead `breedChance` / `setBreedChance` removed.
- `aquarium.js`: the implicit-global scratch block is gone — `i`, `x`, `y`,
  `*Melt`, `swimVar`, `dirX/dirY`, `tempCtx`, `tempFishNum` are now properly
  block- or method-scoped; dead `canvasTankGameCtx` (`getContext('opera-2dgame')`)
  removed. Bundle 57.8 → 49.5 kB.
- `parseInt(localStorage value)` calls got an explicit `, 10` radix. `parseInt`
  applied to a _number_ for display truncation was left as-is (changing it to
  `Math.trunc` would be a behaviour tweak, not this pass).
- Validated dev + prod build via scripted API calls and real DOM clicks: boot,
  render, save/load round-trip, buy/sell, tools, scare/attract, `update()` tick,
  view switching, New Game — all clean. 0 lint errors.

## Phase 3b — data + class shape (next)

- `fishSpecies` array-of-arrays → array of objects (`{ name, price, … }`);
  delete the `SPEC_*` index constants. Coordinated change across `species.js`,
  `aquarium.js`, `fishshop.js`, `statistics.js` — do value-by-value.
- Convert the nine `*Constructor` functions to ES `class` (private `#fields`
  for the closure state), one file per commit, each re-validated.
- Arrow the remaining `function () {}` event callbacks in `events.js`.

## Phase 3c — TypeScript-ready

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
