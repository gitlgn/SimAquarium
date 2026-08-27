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

| Area            | State                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Boots & renders | ✅ zero console errors, canvas + UI render, game loop runs                                                                                 |
| Save / load     | ✅ `localStorage` (the old `chrome.storage` + sandbox-iframe bridge is gone)                                                               |
| Build           | ✅ `vite build` → static `dist/`, service worker + web manifest generated                                                                  |
| Tooling         | ✅ ESLint (flat config) + Prettier + EditorConfig                                                                                          |
| Code style      | 🟡 ES modules under `src/` (Phase 2b done); syntax still 2014-era (`var`, `==`) pending Phase 3 — see [MODERNIZATION.md](MODERNIZATION.md) |
| Mobile layout   | 🟡 fixed 457×300 "widget" now scales uniformly to the viewport (`public/stage.js`); a fluid/reflowing layout is Phase 4                    |

## Requirements

- **Node.js ≥ 20.19** (a `.nvmrc` pins 24). Check with `node --version`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
npm run format   # Prettier (modern sources only; legacy game code is left as-is for now)
```

## Editor

VS Code is the intended environment. On first open it will recommend the ESLint,
Prettier and EditorConfig extensions (`.vscode/extensions.json`); format-on-save
and lint-fix-on-save are pre-configured. `F5` launches Chrome against the dev
server.

## Project layout

```
index.html          app shell (merged from the old mainpage.html + sandbox.html)
src/                ES modules, bundled by Vite
  main.js           entry (<script type="module">) — bootstrap
  aquarium.js …     one module per game singleton
  species.js        fish species table + fish factory (was fish.js)
  constants.js      shared numeric constants
  storage.js loop.js util.js   small support modules
public/             served verbatim by Vite
  css/*.css         styles
  gfx/**            sprites, UI art, icons
  stage.js          scales the fixed 457×300 widget to the viewport
vite.config.js      Vite + vite-plugin-pwa
eslint.config.js    flat config: src/** (module) vs public/*.js (classic script) tiers
```

## Roadmap

See [MODERNIZATION.md](MODERNIZATION.md) for the staged plan (ES modules →
TypeScript-ready → responsive layout → Android via Trusted Web Activity).

## License

GPL-2.0-only. Original design and code © 2014 Satria Adhi
([xtrsyz.org](https://xtrsyz.org/)). All modernization changes are released under
the same license.
