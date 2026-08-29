# Running / packaging SimAquarium on Android

The game is a PWA deployed to **GitHub Pages** at

> <https://gitlgn.github.io/SimAquarium/>

by `.github/workflows/deploy.yml` on every push to `modernization`.

There are two ways onto an Android device. Pick by need:

| Route | Fullscreen? | Store? | Effort |
| --- | --- | --- | --- |
| **§0 Install from Chrome** (PWA) | yes | no | seconds, on the phone |
| **§1+ TWA `.aab` / `.apk`** (Bubblewrap) | only if asset links verify — see the caveat | optional | local Android toolchain |

---

## 0. Install the PWA from Chrome (recommended for the S25)

On the phone:

1. Open <https://gitlgn.github.io/SimAquarium/> in **Chrome**.
2. ⋮ menu → **Add to Home screen** → **Install**.
3. Launch it from the home screen — it runs in its own window, **no URL bar**,
   works offline (service worker caches the ~2 MB of sprites on first run).

Updates ship automatically: the next launch after a deploy picks up the new
service worker (`registerType: 'autoUpdate'`).

This needs nothing from the sections below — no APK, no keystore, no Play
Console. It covers "run the game directly on the S25".

---

## Caveat for the TWA route: Digital Asset Links

A TWA only goes fullscreen (no Chrome URL bar) when Android can verify a
**Digital Asset Links** file at the **origin root**:

> `https://gitlgn.github.io/.well-known/assetlinks.json`

Our site is a GitHub Pages **project** site, so the file we ship lands at
`https://gitlgn.github.io/SimAquarium/.well-known/assetlinks.json` — the wrong
place. This repo cannot write to `gitlgn.github.io/.well-known/`; that path
belongs to a repo literally named `gitlgn.github.io`.

So a TWA built now still works but opens in a **Custom Tab with the URL bar
visible** (`"fallbackType": "customtabs"`). To get a verified, barless TWA,
move the site to an origin root first — either:

- a **`gitlgn.github.io`** user-pages repo serving the game at `/`, or
- a **custom domain** on this project site (root becomes ours).

Then set `base` back to `/` in `vite.config.js`, drop `/SimAquarium` from the
manifest and `twa-manifest.json`, and the steps below verify cleanly.

If you only want the game on your own phone, **§0 already does that** — the TWA
route is for a shareable/installable artifact or a future Play listing.

---

## Prerequisites for the TWA route (one-time, on your machine)

| Need | How |
| --- | --- |
| **JDK 17** | `winget install EclipseAdoptium.Temurin.17.JDK` (or let Bubblewrap fetch its own on first run). |
| **Android SDK / cmdline-tools** | Bubblewrap downloads these on first run if you don't have Android Studio. |
| **Bubblewrap CLI** | `npm i -g @bubblewrap/cli` |
| **Google Play Console account** (only to publish) | one-time US$25, <https://play.google.com/console>. |

---

## 1. Confirm the deploy

After the Pages workflow has run once, check in a browser:

- <https://gitlgn.github.io/SimAquarium/> loads and is installable
  (DevTools → Application → Manifest: no errors, `scope` = `/SimAquarium/`)
- <https://gitlgn.github.io/SimAquarium/manifest.webmanifest> loads
- <https://gitlgn.github.io/SimAquarium/.well-known/assetlinks.json> loads
  (placeholder fingerprint — and at the subpath; see the caveat above)

## 2. Config

`twa-manifest.json` (repo root) is already filled in for
`https://gitlgn.github.io/SimAquarium/`. The only value that is permanent once
published is `packageId` (`org.gitlgn.simaquarium`) — change it now if you want
a different reverse-DNS.

## 3. Generate the project + signing key

```bash
bubblewrap init --manifest https://gitlgn.github.io/SimAquarium/manifest.webmanifest
# reads twa-manifest.json for the rest; creates android.keystore
```

Bubblewrap prompts for a keystore password — **save it in your password
manager**. Losing the keystore means you can never update the app again.

## 4. Wire up Digital Asset Links

Get the signing key's SHA-256 fingerprint:

```bash
keytool -list -v -keystore android.keystore -alias android
# copy the "SHA256:" hex — keep the colons, uppercase
```

Put it into `public/.well-known/assetlinks.json` (replace
`REPLACE_WITH_SHA256_FINGERPRINT...`), then get that file served at the origin
root (per the caveat — user-pages repo or custom domain). Until the file Android
fetches contains this fingerprint, the app shows the URL bar.

> With **Play App Signing**, Play re-signs with its own key — add that
> fingerprint too (Play Console → app → Setup → App integrity).
> `assetlinks.json` can hold several.

## 5. Build

```bash
bubblewrap build
# -> app-release-bundle.aab   (upload to Play)
# -> app-release-signed.apk   (side-load / local testing)

adb install app-release-signed.apk
```

## 6. Publish (optional)

Play Console → create app → upload the `.aab` → store listing → submit.
First review is typically 1–7 days.

---

## Updating

- **Web content**: merge to `modernization`; the workflow redeploys and
  installed apps pick it up on next launch.
- **Shell** (icon, name, target SDK): bump `appVersionCode` + `appVersionName`
  in `twa-manifest.json`, `bubblewrap update`, `bubblewrap build`, upload the
  new `.aab`.

---

## No local toolchain: PWABuilder

<https://www.pwabuilder.com> → enter `https://gitlgn.github.io/SimAquarium/` →
**Package for Stores** → Android → it produces the same TWA `.aab` plus an
`assetlinks.json` snippet in the cloud. Same asset-links caveat applies.

---

## Alternative: Capacitor (only if you need native APIs)

```bash
npm i -D @capacitor/core @capacitor/cli @capacitor/android
npx cap init SimAquarium org.gitlgn.simaquarium --web-dir dist
npm run build && npx cap add android && npx cap sync
npx cap open android      # needs Android Studio
```

`/android` is git-ignored. This bundles the web build **inside** the APK, so
every content change needs a rebuild + resubmit — the opposite of the TWA
trade-off. Only worth it for real native needs (Play Games Services, platform
notifications, file pickers beyond the web APIs).
