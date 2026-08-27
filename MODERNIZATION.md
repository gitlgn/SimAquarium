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

## ✅ Phase 3b — data + class shape (done)

- **3b-1** `fishSpecies` array-of-arrays → array of objects
  (`{ name, price, sizeX, … }`); `SPEC_*` (and the "not used" `SPEC_RARITY` +
  `RARITY_*`) removed from `constants.js`. Table regenerated + verified
  byte-for-byte by script; 30 index accesses across four files rewritten to
  `.field`. Column-1 rarity was `RARITY_POPULAR` for all 29 and read by
  nothing — not carried over.
- **3b-2** the nine `*Constructor` functions → ES `class` with `#private`
  fields/methods: `Lighting`, `Filtration`, `BackgroundWall`, `Scenery`,
  `Config`, `FishShop`, `Stats`, `Uio`, `Aquarium`, and `fishConstructor` →
  `class Fish` (21 `#fields`, a `get #spec()` accessor). `aquarium.changeMoney`
  is now a real public method; `#updateBuyButtons` / `#render*` are private.
  Done in two commits (everything, then `aquarium.js` alone), each re-validated.
- **3b-3** `events.js` ~900 lines of copy-pasted `addEventListener` → ~95 lines
  of loops over the button families + an `on(id, type, fn)` helper.
- Bundle 49.5 → ~49.4 kB. Every step validated in dev and a clean production
  preview by exercising the game through its API and by clicking every button
  family via dispatched `MouseEvent`s.

## ✅ Phase 3c — type-checked + tested (done)

- **3c-1** `jsconfig.json` with `checkJs`. Pragmatic level for now:
  `strict` / `strictNullChecks` **off** so the DOM-heavy 2014 code doesn't
  need a null-safety pass first; `noImplicitThis` + `noFallthroughCasesInSwitch`
  on. `@typedef Species`; `fishSpecies: Species[]`, `Aquarium.#fish: Fish[]`,
  the 2d contexts typed. The 40 findings fixed behaviour-preservingly —
  `parseInt(<number>)` → `Math.trunc`, `el.innerHTML = <number>` → `String(…)`,
  `canvas.setAttribute('width', 360)` → `.width = 360`, typed
  `HTMLInputElement` / `HTMLCanvasElement` casts. `npm run typecheck`.
- **3c-2** Vitest (jsdom) + 15 specs — fishSpecies data integrity and the
  economy invariants (overdraw guard, add/remove bookkeeping, per-species
  counts, `Fish` serialize round-trip, condition clamping). `npm test`;
  `npm run check` = typecheck + lint + test.
- Import-order fix: `aquarium.updateComfortAquarium()` no longer runs at
  module-eval (it hit `fishSpecies`'s TDZ through the `species ↔ aquarium`
  cycle when `species.js` was imported first) — it seeds from `main.js` boot().

## ✅ Phase 3d — TypeScript (done)

- **3d-1** `src/dom.ts`: `$(id)` (throws on a missing id) + `ctx2d(canvas)`.
  ~130 `document.getElementById(…)` → `$(…)`. `storage.getItem` returns
  `string` (`''` for missing — callers already treat missing == empty);
  `loop.small/big` typed `number` (0 = no timer). `tsconfig` → `strict: true`
  (0 errors).
- **3d-2** `src/*.js` + `test/*.js` → `.ts`, `jsconfig.json` → `tsconfig.json`.
  JSDoc `@type` casts → native TS (`#fish: Fish[]`, `expr as HTMLInputElement`,
  …). Import specifiers keep `.js` (bundler resolution maps to `.ts`).
  `noImplicitAny` stays **off**: the scenery/light/filter/shop rows are `T[]`
  indexed by column constants and tuple-typing them isn't worth it yet.
- **ESLint gap:** `typescript-eslint` doesn't support the TS 7 compiler API
  yet ([typescript-eslint#10940]). `src/**` / `test/**` are covered by
  `tsc --strict` + Prettier for now; ESLint lints `*.config.js` +
  `public/*.js` only. Re-add `typescript-eslint` when TS 7 is supported, and
  turn `noImplicitAny` on with tuple types for the shop rows.
- Bundle 49.4 → 46.8 kB. `npm run check` = typecheck + lint + test.

[typescript-eslint#10940]: https://github.com/typescript-eslint/typescript-eslint/issues/10940

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
