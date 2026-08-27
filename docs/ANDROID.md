# Packaging SimAquarium for Android

The game is a PWA. The recommended route to the Play Store is a **Trusted Web
Activity (TWA)** — a thin native shell that opens the deployed PWA full-screen,
with no browser UI. No app code to maintain; every web update ships instantly.

Use **Capacitor** instead only if you later need a native API the web platform
doesn't expose (see the end of this doc).

---

## Prerequisites (one-time, on your machine)

| Need | How |
| --- | --- |
| **A public HTTPS origin** serving `dist/` | Any static host — GitHub Pages, Netlify, Cloudflare Pages, Vercel. Must serve `/.well-known/assetlinks.json` (already in `public/`) and `/manifest.webmanifest`. |
| **JDK 17** | `winget install EclipseAdoptium.Temurin.17.JDK` (or let Bubblewrap download its own JDK on first run). |
| **Android SDK / command-line tools** | Bubblewrap downloads these on first run if you don't have Android Studio. |
| **Bubblewrap CLI** | `npm i -g @bubblewrap/cli` |
| **Google Play Console account** | One-time US$25, at <https://play.google.com/console>. Your action — required to publish. |

---

## Steps

### 1. Deploy the PWA

```bash
npm run build
# upload dist/ to your static host
```

Confirm in a browser:

- `https://YOUR_HOST/manifest.webmanifest` loads
- `https://YOUR_HOST/.well-known/assetlinks.json` loads (still with the
  placeholder fingerprint for now)
- the site is installable (Chrome DevTools → Application → Manifest, no errors)

### 2. Fill in the config

Edit **`twa-manifest.json`** (repo root):

- `host`, `webManifestUrl`, `iconUrl`, `maskableIconUrl`, `fullScopeUrl` →
  your real host
- `packageId` → reverse-DNS you control, e.g. `com.yourdomain.simaquarium`
  (this is permanent once published)

### 3. Generate the project + signing key

```bash
bubblewrap init --manifest https://YOUR_HOST/manifest.webmanifest
# it reads twa-manifest.json for the rest; it creates android.keystore
```

`bubblewrap` will prompt for a keystore password — **save it in your password
manager**. Losing the keystore means you can never update the app again.

### 4. Wire up Digital Asset Links

Get the signing key's SHA-256 fingerprint:

```bash
keytool -list -v -keystore android.keystore -alias android
# copy the "SHA256:" line, strip the colons? NO — keep them, uppercase hex
```

Put that value into **`public/.well-known/assetlinks.json`** (replace
`REPLACE_WITH_SHA256_FINGERPRINT...`), rebuild, and redeploy so the live file
has the real fingerprint. The TWA will not verify (browser address bar stays
visible) until this matches.

> When you enrol in **Play App Signing** (recommended), Play re-signs the app
> with its own key. Add **that** fingerprint too — Play Console →
> your app → Setup → App integrity shows it. `assetlinks.json` can hold
> several fingerprints.

### 5. Build the release bundle

```bash
bubblewrap build
# -> app-release-bundle.aab  (upload this to Play)
# -> app-release-signed.apk  (for side-loading / local testing)
```

Side-load to test:

```bash
adb install app-release-signed.apk
```

### 6. Publish

Play Console → create app → upload the `.aab` → fill store listing → submit.
First review typically 1–7 days.

---

## Updating

- **Web content**: just redeploy `dist/`. Installed apps pick it up.
- **Shell** (icon, name, target SDK, Bubblewrap version): bump
  `appVersionCode` + `appVersionName` in `twa-manifest.json`, `bubblewrap
  update`, `bubblewrap build`, upload the new `.aab`.

---

## Faster path without a local toolchain: PWABuilder

<https://www.pwabuilder.com> → enter your deployed URL → "Package for Stores"
→ Android → it generates the same TWA `.aab` + an `assetlinks.json` snippet in
the cloud. Good for a first build; `twa-manifest.json` here still documents the
intended settings.

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
trade-off. Only worth it for real native needs (e.g. Play Games Services,
platform notifications, file pickers beyond the web APIs).
