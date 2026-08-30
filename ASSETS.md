# Assets

Third-party art / audio bundled in this repo, with source and licence.
Everything here must stay redistributable — the game is GPL-2.0-only and is
served publicly from GitHub Pages, so every file is downloadable.

## Kenney Fish Pack 2.0

- **Files:** `public/gfx/kenney/**` (a curated subset — fish, seaweed, rocks,
  terrain tiles, bubbles; the vector `.svg` versions)
- **Source:** <https://kenney.nl/assets/fish-pack>
- **Author:** Kenney (<https://www.kenney.nl>)
- **Licence:** **CC0 1.0** (public domain) — `public/gfx/kenney/LICENSE.txt`.
  No attribution required; credited here and in the Config panel as a courtesy.
- The full pack is downloaded to `kenney_fish-pack_2/` locally (git-ignored);
  only the files actually used are committed.

## Original SimAquarium art (2014)

- **Files:** `public/gfx/**` except `public/gfx/kenney/**` and
  `public/gfx/icon.svg` / `public/gfx/pwa-*.png` / `public/gfx/favicon.png`
- **Author:** Satria Adhi — <https://xtrsyz.org/>
- **Licence:** GPL-2.0-only (same as the project; this is a modernisation fork).

## App icon

- **Files:** `public/gfx/icon.svg`, `public/gfx/pwa-192.png`,
  `public/gfx/pwa-512.png`, `public/gfx/favicon.png`
- **Author:** this project (drawn in `public/gfx/icon.svg`, rasterised by
  `scripts/generate-icons.mjs`).
- **Licence:** GPL-2.0-only.

## In-code vector fish

- **Files:** `src/fishArt.ts` (no asset files — SVG built in code)
- **Author:** this project, approximating the 2014 sprites.
- **Licence:** GPL-2.0-only.

---

### Adding an asset

1. Prefer **CC0**, then CC-BY (attribution only), then MIT/BSD. Avoid NC,
   "no redistribution", and CC-BY-SA (not GPL-2.0 compatible).
2. Commit only what the game uses; keep raw packs out of the repo
   (`.gitignore`).
3. Copy the pack's licence file next to the assets.
4. Add a row here: files, source, author, licence, required credit text.
