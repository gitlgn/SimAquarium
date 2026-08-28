# SimAquarium

An aquarium simulation game — buy and sell fish, sceneries (plants, rocks, …),
lighting and filters for your tank. Play with the fish, feed them, breed and sell
them to earn money. 28 species with different characteristics; the priciest animal
isn't a fish at all — it's a dolphin.

This is a modernization fork of [xtrsyz/simaquarium](https://github.com/xtrsyz/simaquarium)
by Satria Adhi (2014). The goal: get the game running again on today's web
platform, then keep building on it — long term toward an installable mobile
(Android) app.

## Status

The upstream shipped only as a **legacy Chrome App** (removed from Chrome years
ago) plus an incomplete Opera extension, so it no longer ran anywhere. This fork
now runs as a plain static web app built with [Vite](https://vite.dev/), and is
set up as an installable **PWA**.

| Area            | State                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boots & renders | ✅ zero console errors, canvas + UI render, game loop runs                                                                                                                                                           |
| Save / load     | ✅ `localStorage` (the old `chrome.storage` + sandbox-iframe bridge is gone)                                                                                                                                         |
| Build           | ✅ `vite build` → static `dist/`, service worker + web manifest generated                                                                                                                                            |
| Tooling         | ✅ ESLint (flat config) + Prettier + EditorConfig                                                                                                                                                                    |
| Code style      | 🟢 **TypeScript** (`strict`), classes with `#private`, data objects; 15 Vitest specs. `npm run check` = tsc + eslint + test. (ESLint only covers `*.config.js` / `public/` until `typescript-eslint` supports TS 7.) |
| Mobile layout   | 🟢 responsive shell: CSS grid; desktop = tank + right rail, phone portrait = burger drawer, phone landscape = tank between two button rails; every panel reflows, safe-area aware; layout knobs in `public/css/theme.css`   |
| Android         | 🟡 TWA packaging groundwork in place (`twa-manifest.json`, Digital Asset Links, [docs/ANDROID.md](docs/ANDROID.md)); building the `.aab` needs a deployed HTTPS origin + a Play Console account                        |

## Requirements

- **Node.js ≥ 20.19** (a `.nvmrc` pins 24). Check with `node --version`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm run typecheck  # tsc --strict (no emit)
npm run test       # Vitest
npm run check      # typecheck + lint + test
npm run format     # Prettier
```

## Editor

VS Code is the intended environment. On first open it will recommend the ESLint,
Prettier and EditorConfig extensions (`.vscode/extensions.json`); format-on-save
and lint-fix-on-save are pre-configured. `F5` launches Chrome against the dev
server.

## Project layout

```
index.html          app shell (merged from the old mainpage.html + sandbox.html)
src/                TypeScript modules (classes), bundled by Vite
  main.ts           entry (<script type="module">) — bootstrap
  aquarium.ts …     one class per game object (Aquarium, Config, Uio, …),
                    exported as a singleton instance
  species.ts        fishSpecies data + `class Fish`
  dom.ts            `$(id)` / `ctx2d()` helpers
  events.ts         wires the DOM controls to the game objects
  constants.ts      shared numeric constants
  storage.ts loop.ts util.ts   small support modules
test/               Vitest specs (jsdom)
public/             served verbatim by Vite
  css/*.css         styles
  gfx/**            sprites, UI art, icons
  stage.js          scales the widget to the viewport; mobile.css touch-hardens it
  .well-known/assetlinks.json   Digital Asset Links for the Android TWA
docs/ANDROID.md     Play-Store packaging playbook (Bubblewrap / PWABuilder)
twa-manifest.json   Bubblewrap config (fill placeholders after deploy)
vite.config.js      Vite + vite-plugin-pwa
vitest.config.js    test runner (jsdom, test/setup.js)
tsconfig.json       tsc --strict settings
eslint.config.js    lints *.config.js + public/*.js (src/ & test/ are tsc-checked)
```

## Roadmap

See [MODERNIZATION.md](MODERNIZATION.md) for the staged plan (ES modules →
TypeScript-ready → responsive layout → Android via Trusted Web Activity).

## License

GPL-2.0-only. Original design and code © 2014 Satria Adhi
([xtrsyz.org](https://xtrsyz.org/)). All modernization changes are released under
the same license.
