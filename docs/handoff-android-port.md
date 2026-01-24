# Handoff — Tetris Flip Android Port (Sideload)

Date: 2026-01-24  
Owner: Timetoady  
Branch: `android-port` (pushed to origin)

---

## 1) What was decided

- Distribution: **sideload only**, no Play Store.
- Assets: **fully offline**, bundled in APK. No PWA/TWA.
- Two **independent** Options settings:
  - Layout Mode: **Standard / Handheld (Compact)**
  - Orientation: **Portrait / Landscape**
- Mode/orientation changes apply **on next new game**, not mid-run.
- Compact sizing initial pass (total -4 rows):
  - **Neutral zone -2**
  - **Field A -1**
  - **Field B -1**
- Compact mode removes **on-screen buttons** (pause/flip/etc.); standard keeps them.
- Sideways handheld input **optional**, **not default**.
- Android Back button on title/splash should open **confirm-exit** dialog (Back again or Yes confirms).

---

## 2) Source of truth

Requirements document:  
`docs/android-sideload-requirements.md`

This doc includes:
- Packaging plan (Capacitor)
- Keystore/signing checklist
- Example Gradle signing config
- Progress checklist (to be updated as work continues)

---

## 3) Repo state on `android-port`

Committed changes include:
- `docs/android-sideload-requirements.md`
- Capacitor bootstrap:
  - `capacitor.config.json`
  - `android/` native project (Capacitor template)
- `.gitignore` updates to keep local Android files out of git:
  - `android/.gradle/`, `android/.idea/`, `android/build/`, `android/app/build/`, `android/local.properties`
  - keystore files `*.jks`, `*.keystore`

Commits on branch:
1) `Add Android sideload requirements`
2) `Bootstrap Capacitor Android project`

---

## 4) Capacitor setup status

Installed packages:
- `@capacitor/cli`
- `@capacitor/core`
- `@capacitor/android`

Capacitor config:
- appName: **Tetris Flip**
- appId: **com.timetoady.tetrisflip**
- webDir: **dist**

Commands already run:
- `npx cap init "Tetris Flip" "com.timetoady.tetrisflip" --web-dir=dist`
- `npx cap add android`
- `npm run build`
- `npx cap sync android`

---

## 5) Important workaround

`npx cap add android` initially failed due to a **tar ESM default export** issue in `@capacitor/cli`.

Workaround applied:
- Added npm override to force CLI’s `tar` dependency to `6.2.0` in `package.json`.

This fixes the CLI extraction error on this machine.  
You can keep it for now, or remove later if the issue does not reproduce.

---

## 6) Build on the Android SDK machine

From repo root:

```bash
git fetch
git checkout android-port

npm install
npm run build
npx cap sync android
```

Open in Android Studio:

```bash
npx cap open android
```

Optional debug APK:

```bash
cd android
./gradlew assembleDebug
```

---

## 7) Next implementation tasks

- Implement Options settings:
  - Layout Mode (Standard / Handheld)
  - Orientation (Portrait / Landscape)
- Apply compact row reductions:
  - neutral zone -2, each field -1
- Remove on-screen buttons for compact mode
- Add Back confirmation dialog on title/splash
- Device testing on phones + handhelds

---

## 8) Notes / References

Capacitor docs:
- https://capacitorjs.com/docs/android
- https://capacitorjs.com/docs/getting-started/environment-setup

---

## 9) Quick status checklist

- [x] Requirements doc added
- [x] Capacitor Android project created
- [x] Build + sync done once locally
- [ ] Android build tested on SDK machine
- [ ] Options settings implemented
- [ ] Compact mode sizing applied
- [ ] Back confirmation dialog
- [ ] Device tests (phone + handheld)
