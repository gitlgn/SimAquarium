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

### ✅ 4a — touch / mobile hardening (done)

- `public/css/mobile.css`: safe-area padding on `#viewport`;
  `touch-action` / `-webkit-tap-highlight` / `user-select` on `#stage`;
  `touch-action: none` on the speed bar.
- `stage.js` measures `#viewport`'s content box (safe-area already removed),
  caps at 4× and re-fits on `visualViewport` resize.
- Speed bar is drag-to-set via pointer events (mouse / pen / touch).
- `cursor: hand` → `cursor: pointer` (12×); dead `-apple-dashboard-region`
  declarations removed (7×).

### 4b — fluid re-layout

The whole 2014 UI is `position: absolute` on a 457×300 raster, drawn by one
frame bitmap (`widgetFront.png`), scaled uniformly. Making it fluid means a
real grid/flex shell and converting each panel off its pixel coordinates.
Staged so every commit boots and is checkable on a real screen.

#### ✅ 4b-1 — responsive shell + fluid tank (done)

- New `public/css/shell.css`; `stage.css` + `stage.js` (the uniform-scale
  wrapper) removed. `#pageFront` is now a grid: tank region + toolbar strip —
  **stacked in portrait, side-by-side in landscape**.
- Tank `<canvas>` keeps its 360×240 buffer and fills `#panelBody` via
  `object-fit: contain` (`image-rendering: pixelated`). On a phone it goes from
  ~360-scaled to near-fullscreen.
- `#aquariumToolbar` is a flex strip (`toolbar.css` rewritten from absolute
  coords). Speed bar is now **width-independent**: `uio.speedBarSet()` maps the
  pointer's x-fraction to one of six speeds; the handle sits at `delay/5 * 100%`
  inside the bar. `main.ts` boots the fish loop through `setSmallInterval()` so
  the handle and loop agree from the start.
- View-switch buttons wrapped in `#viewSwitch` (flex row); the six `.view`
  panels wrapped in `#panelBody` (scrolls). `#pageMode` moved to the corner
  next to the widget buttons.
- Minimise (`#pageMode`) reworked: toggles `.mini` on `#stage` (CSS hides the
  strip + switcher) and forces the aquarium view → distraction-free tank.
- Shop/stats panel internals are **still on their 2014 CSS** at a fixed
  360×240 inside the scroll area — converted next.
- Verified (functional, at 1280×720 and 375×812): boots, canvas fully painted,
  no 4xx, no page overflow, view switch / Configuration / Add Money / mini /
  speed-drag all work. `npm run check` green.

#### ✅ 4b-2 — ≥44 px targets + CSS button chrome (done)

- Dropped the 3-state sprite frames (`buttonMedium/Big/Small.png`,
  `viewMode.png`) for CSS button chrome — rounded rect, border, `:active`
  inset, `:hover` tint. Icons are a centred `background-image` now (was
  `content: url()`), so size is clean: tools + view buttons **44×44**, the
  help/config/save + minimise buttons **34×34**.
- `uio.ts`: `changeView()` no longer pokes `style.backgroundPosition` — the
  `.active` class drives the look. `highlightViewButtonOn/Off` + their
  `mouseover`/`mouseout` bindings deleted (`:hover` is pure CSS). `.mini`
  swaps the minimise icon via CSS, not `style.content`.
- Regression fixes from 4b-1: the camera button lost its icon (rule dropped in
  the rewrite) — restored; the alert lamp + water gauge lost their bitmaps +
  sizes — restored (the water bar's px height is still game-driven).
- Help/config/save buttons moved into `#viewSwitch` (right-aligned group);
  minimise (`#pageMode`) stays a `#stage` child so `.mini` can't hide it.
  Landscape strip gets `padding-top` so the corner minimise button clears the
  money readout.
- Verified at 375×812, 768×1024 and 1024×680: no overflow/overlap, buttons
  ≥34 px, view switch / speed-drag / minimise / Configuration all work,
  canvas painted, no 4xx. `npm run check` + `vite build` green.

#### ✅ 4b-3 — fish / scenery / lighting panels reflow (done)

- `public/css/panels.css` (loaded last). The three single-grid shops (view1–3)
  go from a fixed 3-column absolute layout to `grid-template-columns:
  repeat(auto-fill, 110px)` — 2 columns on a phone, 6+ on a wide screen — with
  the panel scrolling. Tile internals (`.title/.image/.money/.button`) are
  **untouched**; only the tile's own `position: absolute` + per-`#id`
  `top/left` are neutralised (via `#viewN .fooSlot` selectors that out-specify
  the id rules).
- Show/hide moved off inline `style.display` to the **`hidden` attribute**
  (`uio.changeView`), with a `[hidden] { display: none !important }` reset — so
  the `display: grid` rules can actually apply. `hidden` added to `#view1`–`5`
  in the markup; the per-view `#viewN { display: none }` rules removed.
- `.tabBar` / `.headerInfo` back into normal flow.
- Accessories (view4) + Statistics (view5) stay pinned at 360×240 for now.
- Verified at 375×812 and 1024×680: shops reflow + scroll, tiles stay in
  bounds and clickable (buy/info/sell fire), tank + other views unaffected,
  no 4xx. `npm run check` + `vite build` green.

#### ✅ 4b-4 — accessories + statistics panels + the knob file (done)

- `uio.changeTab` off inline `style.display` → the `hidden` attribute, so
  `#tabFilterShop` / `#tabBackgroundShop` reflow as grids (filters on the
  110 px column, backgrounds on a 64 px column). `#tabStatistics` /
  `#tabFishList` markup lost their inline `display`; `statistics.ts`'s
  `refreshStatsPage` guard changed from `style.display === 'block'` to
  `!hidden` to match.
- `#tabStatistics` absolute-label soup → a plain stacked flow list.
  `#fishTableContainer` goes full-width (was 342 px) and grows with the
  panel's scroll instead of its own fixed 180 px box.
- **`public/css/theme.css`** — every layout number the shell uses is now a
  `:root` custom property (widths, gaps, button + tile sizes, colours). One
  place to tune. The layout switch point stays a literal `760px` in two
  `@media (min-width: …)` lines (shell.css + toolbar.css) since `@media`
  can't read a variable — the orientation query it replaced was fragile on
  wide phones.
- **`src/devpanel.ts`** — dev-only (`import.meta.env.DEV`, dynamically
  imported, absent from the production bundle). A `⚙ layout` panel bottom-left
  with a slider per numeric knob that writes it live onto `<html>`; "Copy CSS"
  emits the matching `:root { … }` block to paste into theme.css, "Reset"
  drops the overrides.
- Verified at 375×812 / 1024×680: all six views reflow + stay in bounds,
  tab switches (filters/backgrounds, fish-list/tank-info) work, buy / sell /
  info fire, stats populate, dev panel mounts + Copy/Reset work, canvas
  painted, no 4xx. `npm run check` + `vite build` green; devpanel confirmed
  tree-shaken from prod.

#### 4b-4 — statistics + fish-list panel

- `#tabStatistics` (absolute label soup) → a simple two-column definition list.
- `#fishTableContainer` rows already scroll; make them width-fluid.

#### ✅ 4b-5 — knob pass from real-device feedback (done)

Applied after eyeballing 4b-4 on Chrome/Brave/phone:

- **Full-bleed.** `--frame-gap`, `--strip-pad`, `--panel-pad` → `0`;
  `#stage` `max-width` cap removed (fills the window). `--app-max-width` /
  `--strip-width` knobs gone.
- **One button size.** `--btn-size-sm` / `--btn-icon-sm` removed — tools,
  view buttons, help/config/save and minimise are all `--btn-size` (44) with
  `--btn-icon` (44, edge-to-edge). One CSS rule.
- **Toolbar strip = minimum width.** Side-by-side layout strip is `width:
  auto` (shrink-wraps to the tools, ~125 px) instead of a fixed 180.
- **Speed bar is a real slider now.** `gameSpeedBar.png` / `gameSpeedHandle.png`
  dropped for a CSS track (rounded, a `--speed-fill` portion up to the current
  speed) + a round thumb whose travel is inset so it can't overflow the ends.
  Driven by `--speed-frac` (0–1), which `uio.setSmallInterval` sets on
  `#speedBar` — replaces the old `handle.style.left` write. Bar width = strip
  width.
- **Shop tiles resize with the window.** Grid columns went from a fixed
  `110px` to `minmax(var(--tile-min), 1fr)`; tiles stretch to fill the row,
  `aspect-ratio` keeps their proportions, the per-slot art scales with them.
- Phone tools grid is 4-per-row (was 2) so the strip isn't so tall.
- Dev tuner (`devpanel.ts`) trimmed to the 7 knobs that remain.
- Verified 375×812 / 1024×680: strip auto-widths, speed thumb stays in the
  track at 0 and max, tiles grow past 110 px keeping aspect, fish list + tabs
  + camera still work, no 4xx. `npm run check` + `vite build` green; devpanel
  still tree-shaken from prod.

#### 4b-6 — Configuration page (`#pageBack`)

The last 2014 island: still `position: absolute` on `widgetBack.png` at a
fixed 457×300. Turn it into a plain centred flex panel and drop the bitmap.

## Phase 5 — Android

Route: **Trusted Web Activity** — a thin native shell around the deployed PWA,
built with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) → AAB →
Play Store. No app code to maintain; web updates ship without a resubmit.
(Capacitor stays the fallback if a native API is ever needed — `/android` and
`/ios` are git-ignored for it.)

### ✅ 5a — packaging groundwork (done)

- `vite.config.js` manifest completed for store submission: `id`, `dir`,
  `categories`, explicit icon `purpose`, `lang`, `description`.
- `public/.well-known/assetlinks.json` — Digital Asset Links file (placeholder
  fingerprint). Verified it is copied into `dist/` and served as
  `application/json`.
- `twa-manifest.json` (repo root) — Bubblewrap config, all host/URL values as
  `PLACEHOLDER_*` to fill in after deploy. `packageId: org.gitlgn.simaquarium`.
- `pwa-maskable-512.png` regenerated with the icon at 60 % (was 80 %) so nothing
  is clipped by a circular mask — safe-ring now 0 % content.
- `.gitignore`: keystores (`*.keystore` / `*.jks` / `android.keystore`), bundles
  (`*.aab` / `*.apk`), `.bubblewrap/`, `/android/`, `/ios/`.
- `docs/ANDROID.md` — full playbook (Bubblewrap steps, Digital Asset Links,
  Play submission) plus the PWABuilder cloud path and the Capacitor alternative.

Build stays green: `npm run check` + `vite build` (207 precache entries).

### 5b — publish (needs owner action, cannot be automated here)

1. Deploy `dist/` to a public HTTPS origin (GitHub Pages / Netlify / Cloudflare
   Pages / Vercel). Confirm `/manifest.webmanifest` and
   `/.well-known/assetlinks.json` load.
2. Fill the `PLACEHOLDER_*` values in `twa-manifest.json`.
3. `npm i -g @bubblewrap/cli`; `bubblewrap init --manifest https://HOST/manifest.webmanifest`
   (creates `android.keystore` — **back up the keystore + password**).
4. `keytool -list -v -keystore android.keystore -alias android` → put the SHA-256
   into `assetlinks.json`, rebuild, redeploy.
5. `bubblewrap build` → upload the `.aab` to Play Console (developer account:
   one-time US$25).

JDK 17 + Android SDK are needed locally for step 3–5, or use
<https://www.pwabuilder.com> to generate the same `.aab` in the cloud.
