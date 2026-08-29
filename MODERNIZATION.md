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
- **ESLint gap (closed — see 3e):** for a while `typescript-eslint` couldn't
  parse the native TS 7.0 compiler API, so `src/**` / `test/**` were on
  `tsc --strict` + Prettier only.
- Bundle 49.4 → 46.8 kB. `npm run check` = typecheck + lint + test.

## ✅ Phase 3e — typescript-eslint restored (done)

TypeScript 7.0 (native Go compiler) ships without a stable programmatic API —
that lands in 7.1 — so `typescript-eslint@8` still peers `typescript <6.1`
([typescript-eslint#10940]). The 7.0 line is a *port*, feature-identical to the
classic `6.0.x` line, so:

- `typescript` pinned back to `~6.0.3` (classic line, same language features,
  same `tsconfig`). `typescript-eslint@8.68` added.
- `eslint.config.js`: `src/**` + `test/**` now linted with
  `tseslint.configs.recommendedTypeChecked` (type-aware, `projectService`).
- Findings: 3 `no-unnecessary-type-assertion` errors auto-fixed (redundant
  `as HTMLElement` / `as HTMLCanvasElement` — `$()` already returns
  `HTMLElement`). 11 `no-explicit-any` **warnings** remain on the shop
  row-tables (`any[][]` indexed by column constants) — the `noImplicitAny`
  tuple-typing job, still deferred.
- Revert path when 7.1 lands: bump `typescript` to `7.x` and `typescript-eslint`
  to the release that supports it; nothing else changes.

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

#### ✅ 4b-6 — Configuration overlay + kill the last bitmaps (done)

- `#pageBack` was shown by *hiding* `#pageFront`, which also hid the only
  button that flipped back. Now it's a **backdrop + centred CSS card**
  (`config.css`, contents wrapped in `#confPanel`) layered over the
  still-rendered `#pageFront`, with its own **Close** button (`#confClose` →
  `uio.flipWidget`). `flipWidget` is just `back.hidden = !back.hidden` now;
  the `#page` field + `PAGE_FRONT/PAGE_BACK` are gone.
- **Background shop had no visible effect** — the 2014 code showed the wall
  colour as a CSS background on `#view0` behind a transparent canvas, but the
  responsive tank canvas is opaque. Fixed: `aquarium` loads the wall into
  `#wallImage` and tiles it on-canvas in `#renderBackground()` (as
  `exportPhoto` always did); `buyBackground` / `loadAquarium` / `newGame` set
  it via `#setWall()`, and the image's `load` repaints. Verified white → red →
  blue all change the tank and survive save/load.
- Removed the now-unused bitmaps: `widgetFront.png`, `widgetBack.png`,
  `viewBackground.png`, `gameSpeedBar.png`, `gameSpeedHandle.png`,
  `buttonBig/Medium/Small.png`, `viewMode.png`. Precache 208 → 199 entries.
- Verified at 375×812 / 1100×720: config overlay opens over the game, Close +
  toggle both work, Add Money / New Game / Relax reachable, all six views in
  bounds, no 4xx, no requests for the deleted files. `npm run check` +
  `vite build` green.

#### ✅ 4b-7 — scale the tile + list contents (done)

Second knob round — "make the shop tile *and its buttons/text* bigger, and the
fish-list text":

- Shop tiles are kept at their native design size and `zoom`ed as one unit
  (`--tile-zoom`, derived from `--tile-min`), so the art, labels **and the
  buy/sell buttons** scale together and stay clickable (`zoom` scales the hit
  area, unlike `transform`). Grid columns are `calc(110px * var(--tile-zoom))`.
- Fish list: `#tabFishList` is `zoom`ed by `--fishlist-zoom`; the row and the
  `#fishTableIcons` header share **one fixed-column grid** so the stat icons
  line up with the health/hunger/sick/size bars. `#fishTableIcons` gained four
  `<span>` slices of `icons.png`, one per stat column.
- `statistics.ts` show/hide moved off inline `style.display` (`.hidden` for
  the header/info, `''` for shown rows) so the grid CSS applies;
  `overflow` → `overflowY` so narrow screens scroll rows sideways.
- Dev tuner: knobs support non-px units now; added `--tile-min` (unitless) +
  `--fishlist-zoom`.
- Values from device testing baked into `theme.css`: btn 66 / icon 56, tile
  260, all gaps + padding 0.

#### ✅ 4b-8 — device-feedback fixes (done)

- **Phones downscale.** `@media (max-width: 600px)` drops `--btn-size` to 44,
  `--tile-min` to 150, `--fishlist-zoom` to 1.15 — the button row is 2 deep
  instead of 3, and a 9-slot shop fits without scrolling.
- **Save & Exit button removed.** It called `window.close()` (a no-op in a
  normal tab). The game already saves on every buy/sell/tool; added a flush on
  `visibilitychange` (hidden) + `pagehide`. `uio.closeWidget` deleted.
- Toolbar strip: **two tool columns** side-by-side (was one) — half the height,
  no scroll, uses the space beside the tank.
- Fish-list **Sell no longer shrinks on press** (the 2014 `:active` rule);
  stat icons nudged onto their bars (±3 px now).
- `--btn-icon` follows `--btn-size` (`calc(size - 10px)`) so one knob scales
  the button and its glyph together.

Known, deferred to a UI rethink: the alert lamp (`alertLight.png`) only ever
shows its dim off-state — the 2014 event-notification is a 2-frame sprite
that's easy to miss; wants a real toast/log. Shops still scroll one row on a
very short viewport (height-aware tile sizing needs JS).

**Phase 4b complete.** The 2014 fixed-widget UI is gone: one responsive shell,
CSS chrome throughout, every panel reflows and scales, tuning knobs in
`theme.css` (+ the dev slider panel).

## Phase 6 — view / state split (proposed)

Phases 4a–4b retrofitted a responsive layer over DOM that the game logic still
drives imperatively: **~114 `$('id').style.x = …` / `.innerHTML` /
`setAttribute('class', …)` calls** across `aquarium` (52), `statistics` (21),
`uio` (15), `fishshop` (14), `filtration` (7). Every layout change fights those
inline writes (the `hidden`-vs-`style.display`, two-grids-must-align, and
`refreshStatsPage` guard fixes were all this leaking through).

The canvas game-sim is already clean (a real render loop). The proposal is to
give the **chrome** the same treatment, panel by panel:

- each game object exposes plain state; a thin per-panel `render(state)` owns
  its DOM subtree and rebuilds it from data (the shop tables are already
  data-driven in `species.ts` / `filtration.ts` — they're just not *rendered*
  from it, they're hand-placed in `index.html` and mutated in place)
- one `renderStatus(state)` for money / water / alert (+ a real notification
  surface, replacing the lamp)
- delete the scattered `$('id').style.*` writes → layout becomes pure CSS

Start with the fish list (worst offender), then status bar, then the shops.
Incremental, each panel shippable on its own.

### ✅ 6a — fish list + Tank Info from state (done, PR #9)

`statistics.ts`: 21 imperative writes + 64 pre-built hidden rows → two
`render(state)` functions building the markup from the `aquarium` accessors,
one delegated Sell listener. `#tabStatistics` label-soup deleted. Header + rows
share one `--fishrow-cols` grid so the stat icons line up exactly.

### ✅ 6b — status + fish meters: bitmaps → generated bars (done)

- Water-condition gauge (`#statusWater`) is a CSS bar; `updatePollutionBar()`
  sets its fill `height%` + hue (green → red) from the pollution value.
  `waterCondition.png` / `waterConditionBar.png` gone.
- Fish list: health / hunger / **size** are three CSS bars now
  (`<i style="width;--v">`, `--v` drives the colour — health green→red, hunger
  amber→red, size neutral), sick is a red **dot**. No `%` text, no
  `bar1.png` / `bar2.png`. Bar columns are a fixed width so the header icons
  and the bars stay aligned (delta 0).
- Precache 199 → 195.

### ✅ 6c — notification surface: alert lamp → toasts (done)

- `src/toast.ts` + `public/css/toast.css`: transient messages slide in over the
  top of the tank, hold 4 s, fade (fallback timeout in case `animationend`
  doesn't fire); at most 3 stack.
- `uio`: `blikStatusWidgetIcon` / `hideStatusWidgetIcon` / `getAlertNum` /
  `#hideStatusTimer` gone. `flushAlert()` (called once per `update()` tick)
  turns a pending `#alertNumber` (0-4) into `toast.event(n)`.
- `config` relax mode: toast on toggle + a persistent `#relaxBadge` shown via
  `#stage.relax` (was the `alertLightIcon5` lamp state).
- `#statusEvent` / `#statusEventIcon` removed from the markup; `alertLight.png`
  + `alertLightIcon0-5.png` deleted. Precache 195 → 189.

### ✅ 6d — background wall — verified

The 4b-6 on-canvas wall render is on this branch and works (white → red → blue
change the tank and persist). The "background gone" report was the wall simply
not being visible while a shop / stats panel covers the tank — expected.

### ✅ 6e — the control chrome: one strip, three responsive faces (done)

Iterated from device (S25) testing over several passes.

- **Structure.** `#viewSwitch` (6 view buttons + camera + help + config +
  minimise) and `#toolbarTools` (8 tools + prices + speed) live in one
  `#aquariumToolbar`, plus `#toolbarStatus` (water gauge + money). Tabs are
  gone everywhere (`.tabBar`/`.tab`/`uio.changeTab` deleted) — panels use
  plain `<h2 class="panelHead">` headings; Accessories shows Filters +
  Backgrounds on one page; Statistics shows the Fish List, and the water gauge
  toggles Tank Info (`#view5.show-tankinfo`).
- **≥ 760 px wide** — a vertical rail right of the tank. `--strip-width` =
  `calc(--btn-size * 2 + 24px)`; `--btn-size` is `clamp(38px, 7vh, 64px)` so
  the 2-column button grids fit any height with no scrollbar.
- **Portrait phone** — tank on top, `#aquariumToolbar` a static bar below it:
  status row, then `#viewSwitch` / `#toolbarTools` as `auto-fill` grids
  (~7 columns on a 380px phone → 2 rows each), then speed. Capped at 52 vh.
- **Landscape phone** (`max-height: 560px`) — `#aquariumToolbar` is
  `display: contents`; `#viewSwitch` becomes a rail on the **left**,
  `#toolbarTools` a rail on the **right**, tank fills the middle at full
  height. `#toolbarStatus` is its own grid cell above the left rail, so it
  can't overlap the buttons however short the viewport gets.
- No burger. Prices are corner badges on the tool buttons. Frame gap 0
  (tank flush to the edges; region borders are the bezel). Icon fills the
  button (`--btn-icon` = `--btn-size`).
- `.mini` (`#pageMode`) collapses the strip to just the restore button in
  every layout.
- Dev layout-tuner (`src/devpanel.ts`) removed.
- Verified full functional sweep at 1280×800, 380×820, 800×360: every view /
  shop buy / tool / speed drag / config / relax / mini / fish-list sell /
  water→Tank-Info / camera export works; no overflow, no 4xx.

### 6f — shops + `aquarium` from state

Converting the imperative shop DOM writes to per-panel `render(state)`,
panel by panel.

**Done:**

- **`fishshop.ts`** — `#view1` is emptied in `index.html` and rebuilt by
  `#render()` from `#slots` on every change (deliver / buy / load). One
  delegated Buy/Info listener via `data-act` / `data-slot`. Only the
  "new fish in" counter stays a per-tick value binding.
- **`filtration.ts`** — `createBackgroundSlots()` → `renderBackgrounds(money,
  used)`: `$('tabBackgroundShop').innerHTML` from the `#background` table,
  `id="backgroundSlot${i}"` kept for the CSS swatch art, `data-bg` /
  `data-act` for the delegated buy listener on `#tabBackgroundShop`. The four
  `$('buttonBackgroundBuy…').setAttribute('class', …)` sites in `aquarium.ts`
  (`resetAquarium`, `loadAquarium`, `buyBackground`, `#updateBuyButtons`) now
  call `background.renderBackgrounds(…)`.
- **`aquarium.ts` money readout** — `#renderMoney()`; every mutation
  (`resetMoney` / `changeMoney` / `loadAquarium`) routes through it, no more
  `$('statusMoney').innerHTML = …`.
- **`aquarium.ts` scenery / lighting / filter shops** — the ~35 scattered
  `choose` / `buy` / `sell` `setAttribute` toggles across `resetAquarium` /
  `loadAquarium` / `buy*` / `choose*` / `sell*` / `#updateBuyButtons` collapse
  into one `#renderShopButtons(prefix, count, owned, used, priceOf)` helper
  (called for all three via `#renderAccessoryShops()`). Every slot's class is
  now derived from `#sceneries` / `#lights` / `#filters` + `#usedX` + `#money`;
  the `buy*` / `sell*` / `choose*` methods only mutate state. The slot markup
  stays hand-placed in `index.html` (per-slot art is CSS keyed on the id) and
  the static `button…Buy/Sell` listeners in `events.ts` are unchanged.

`aquarium.ts` no longer writes shop DOM outside the render helpers — what's
left there is value bindings (money / water gauge) and the canvas. Small
imperative pockets remain in `uio.ts` (speed slider, widget flip) and
`statistics.ts` (`.hidden` toggles) — low-value, left as-is for now.

### Backlog

- **`noImplicitAny`** on, with tuple/union-array types for the scenery /
  lighting / filter / shop row-tables (currently 11 `no-explicit-any`
  warnings). typescript-eslint itself is back — see Phase 3e.
- Bump `typescript` `~6.0.3` → `7.x` once `typescript-eslint` supports the
  TS 7.1 compiler API.
- Real PWA icons (`public/gfx/pwa-*.png` are upscaled from the 128 px original).

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

### ✅ 5b — deploy to GitHub Pages (done)

Hosting decided: a GitHub Pages **project** site,
`https://gitlgn.github.io/SimAquarium/` (subpath).

- `vite.config.js` — `base: '/SimAquarium/'`; manifest `id` / `start_url` /
  `scope` follow it. All emitted asset URLs, the `registerSW` target and the
  SW `scope` are now `/SimAquarium/…`; `dist/.well-known/assetlinks.json`
  still ships (at the subpath).
- `.github/workflows/deploy.yml` — on push to `modernization` (and manual
  dispatch): `npm ci` → `npm run check` → `vite build` →
  `configure-pages@v5` (`enablement: true`, creates the site on first run) →
  `upload-pages-artifact` → `deploy-pages`.
- `twa-manifest.json` — filled in for `gitlgn.github.io` /
  `/SimAquarium/`; carries a `_WARNING_ASSET_LINKS` note.
- `docs/ANDROID.md` — rewritten: §0 "Install from Chrome" is the primary way
  onto the S25; the TWA sections carry the asset-links caveat.

Verified locally (`vite preview` at `/SimAquarium/`): base rewriting, manifest
scope, `registerSW.js` target, `assetlinks.json` reachable, game boots. SW
registration itself only testable on the live HTTPS origin.

**One manual step:** after the first workflow run, GitHub → repo **Settings →
Pages** should already show "GitHub Actions" as the source (auto-enabled). If
not, set it there once.

### 5c — TWA `.aab` / `.apk` (owner action, optional)

Only needed for a shareable install artifact or a Play listing — Chrome's
"Install app" (`docs/ANDROID.md` §0) already puts the game fullscreen on the
S25.

Blocker for a *verified* (barless) TWA: Digital Asset Links must sit at the
origin root `gitlgn.github.io/.well-known/assetlinks.json`, which a project
site can't provide. Fix by moving to an origin root first — a
`gitlgn.github.io` user-pages repo or a custom domain — then `base` goes back
to `/`. Steps in `docs/ANDROID.md` §1–6. JDK 17 + Android SDK (or PWABuilder
in the cloud); Play Console is one-time US$25.
