# Tetris Flip Android (Sideload) Requirements

Version: 0.1 (Draft)
Owner: Timetoady
Date: 2026-01-24

## 1) Goals
- Deliver an Android APK for sideload distribution only (no Play Store).
- Fully offline: bundle all assets and game code in the APK.
- Support two layout modes selected from Options (not switchable mid-game).
- Support portrait and landscape by user choice in Options.

## 2) Non-Goals
- No Play Store compliance or listing.
- No PWA/TWA or online hosting requirements.
- No runtime orientation switching during an active run.

## 3) Packaging Decision
- Use Capacitor (Android WebView wrapper) for build and packaging.
- Bundle the Vite build output inside the APK.
- Keep the app offline-only; no remote asset loading.

## 4) Modes and Orientation
### 4.1 Modes (Settings selection)
- Standard (Faithful) mode: current board dimensions and HUD layout.
- Handheld (Compact) mode: reduce vertical space to fit smaller devices.

### 4.2 Orientation (Settings selection)
- Portrait mode (phones, tall handhelds like MagicX Zero40).
- Landscape mode (gaming handhelds like AYN/Retroid/Trimui class).
- Orientation is locked after selection; changes apply on next new game.
- Mode and orientation are separate, independent Options settings.

## 5) Board Sizing (Initial Target)
- Compact mode targets a reduction of 6 total rows (current pass).
- Allocation for the first pass:
  - Neutral zone: -2 rows
  - Field A: -2 rows
  - Field B: -2 rows
- Re-evaluate after device playtests; more reduction may be needed.
- Standard mode retains current dimensions.
- Neutral zone size remains viable for spawn/flip behavior; validate with playtests.

## 6) UI/UX Layout Rules
- Compact mode removes all on-screen visual buttons (pause/flip/etc.).
- Compact mode keeps HUD elements but tightens spacing as needed.
- Standard mode keeps existing HUD and visual buttons.
- Touch input remains available in both modes.

## 7) Input & Controls
- Default input layout remains standard (not sideways handheld).
- Sideways handheld mapping remains available as a non-default option.
- Gamepad menu navigation stays as-is, but add a Back confirmation dialog on the title/splash screen.

## 8) Navigation & Exit
- Android Back button on title/splash opens a confirm-exit dialog.
- Confirm exit can be completed by:
  - Selecting Yes, or
  - Pressing Back again.

## 9) Settings & Persistence
- New Options items (independent):
  - Layout Mode: Standard / Handheld
  - Orientation: Portrait / Landscape
  - (Optional) Sideways Handheld Mapping: On / Off
- Settings persist across app restarts.
- Mode and orientation changes only apply to new games.

## 10) Capacitor Setup Plan
- Install Capacitor tooling:
  - `npm install -D @capacitor/cli`
  - `npm install @capacitor/core @capacitor/android`
- Initialize Capacitor (set `appId`, `appName`, and `webDir` = `dist`):
  - `npx cap init`
- Add Android platform:
  - `npx cap add android`
- Configure Android project:
  - Set `minSdkVersion` (API 24) and `targetSdkVersion` as desired.
  - Confirm `android` project uses bundled assets from `dist`.
- Build + sync workflow:
  - `npm run build`
  - `npx cap sync android`
### 10.1) CLI Template Extraction Workaround
- If `npx cap sync android` fails with `TypeError: Cannot read properties of undefined (reading 'extract')`,
  apply the patch-package fix for `@capacitor/cli` (see `patches/@capacitor+cli+8.0.1.patch`).
- This patches `dist/util/template.js` to use `tar.extract(...)` directly, compatible with tar v7.

### 10.2) Product Flavors (Current vs Android 10)
- Flavors are defined in `android/app/build.gradle`:
  - `current`: uses default min/target SDK from `android/variables.gradle`.
  - `android10`: `minSdkVersion 29`, `targetSdkVersion 29`, plus
    `applicationIdSuffix ".android10"` and `versionNameSuffix "-android10"` so it can be installed
    alongside the current build.
- Build variants:
  - `currentDebug`, `currentRelease`
  - `android10Debug`, `android10Release`
- Gradle builds (from `android/`):
  - `./gradlew assembleCurrentDebug`
  - `./gradlew assembleAndroid10Debug`
  - `./gradlew installAndroid10Debug` (installs the Android 10 lane)
- Capacitor run with a flavor:
  - `npx cap run android --flavor current`
  - `npx cap run android --flavor android10`
  - Live reload example: `npx cap run android --flavor current -l --host 192.168.68.100 --port 5173`
  - Use the IP only (no `http://`) in `--host` to avoid a double scheme.
  - After live reload, run `npx cap sync android` (no `-l`) before building/installing APKs,
    otherwise the app will keep the dev server URL.
- NPM shortcuts:
  - `npm run android:current:debug`
  - `npm run android:current:install`
  - `npm run android:android10:debug`
  - `npm run android:android10:install`
  - (shortcuts are fixed to Java target 17)
  - For Java 21, use the helper script or run Gradle directly with `-PTETRISFLIP_JAVA=21`
  - If PowerShell blocks `npm.ps1`, use `cmd /c npm run android:current:debug`
- PowerShell helper script (prefers Android Studio JBR by default):
  - Build current: `./scripts/android-lane.ps1 -Lane current -Action build -JavaTarget 17`
  - Install Android 10: `./scripts/android-lane.ps1 -Lane android10 -Action install -JavaTarget 17`
  - (optional) Java 21 target: add `-JavaTarget 21`
  - Live reload: `./scripts/android-lane.ps1 -Lane current -Action livereload -Host 192.168.68.100 -Port 5173`
  - Override JDK path: add `-JavaHome "C:\\Path\\To\\JDK"`

### 10.3) Java Version Selection (JDK 17 vs 21)
- Capacitor generates `android/app/capacitor.build.gradle` with Java 21 compile options.
- We enforce the Java target across all Android modules in `android/build.gradle` to avoid mismatched targets
  (e.g., capacitor-android defaulting to 21).
- We override the Java target via a Gradle property in `android/app/build.gradle`:
  - `TETRISFLIP_JAVA` (defaults to `17`).
- Choose the runtime JDK (JAVA_HOME) and compile target per build:
  - Current lane: default Java target is 17; use 21 when required by toolchain or live reload setup.
  - Android 10 lane: default Java target is 17; set 21 only if needed.
- Examples:
  - JDK 21 + Java 21 target (current lane, opt-in):
    - PowerShell: `$env:JAVA_HOME = "C:\\Program Files\\Android\\Android Studio\\jbr"; $env:Path = "$env:JAVA_HOME\\bin;$env:Path"`
    - Build: `./gradlew assembleCurrentDebug -PTETRISFLIP_JAVA=21`
  - JDK 21 + Java 17 target (default lane target):
    - Build: `./gradlew assembleAndroid10Debug -PTETRISFLIP_JAVA=17`
  - JDK 17 + Java 17 target (optional):
    - Point `JAVA_HOME` to a JDK 17 install
    - Build: `./gradlew assembleAndroid10Debug -PTETRISFLIP_JAVA=17`

### 10.4) WebView Compatibility (Android 10)
- Vite build target is set to `es2017` in `vite.config.js` to avoid modern syntax errors on older WebView builds.
- If Android 10 devices freeze on splash, rebuild with this target and re-sync assets.
- If you raise the target, re-test Android 10 devices.
## 11) Build & Release
- Target output: signed APK for sideloading.
- Build commands:
  - Debug APK: `cd android && ./gradlew assembleDebug`
  - Release APK: `cd android && ./gradlew assembleRelease`
- Signing checklist:
  - Generate a release keystore (once):
    - `keytool -genkeypair -v -keystore tetrisflip-release.jks -alias tetrisflip -keyalg RSA -keysize 2048 -validity 10000`
  - Store the keystore outside the repo (or in a secure, ignored location).
  - Add keystore paths and passwords to `~/.gradle/gradle.properties` or environment variables.
  - Configure `android/app/build.gradle` signingConfigs.release to read those values.
  - Keep the keystore and passwords out of version control.
  - Verify the release APK is signed:
    - `apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk`
- Example signing config (Gradle properties):
  - `~/.gradle/gradle.properties`:
    ```properties
    TETRISFLIP_KEYSTORE_PATH=/path/to/tetrisflip-release.jks
    TETRISFLIP_KEYSTORE_PASSWORD=your_keystore_password
    TETRISFLIP_KEY_ALIAS=tetrisflip
    TETRISFLIP_KEY_PASSWORD=your_key_password
    ```
  - `android/app/build.gradle` snippet:
    ```groovy
    signingConfigs {
      release {
        storeFile file(TETRISFLIP_KEYSTORE_PATH)
        storePassword TETRISFLIP_KEYSTORE_PASSWORD
        keyAlias TETRISFLIP_KEY_ALIAS
        keyPassword TETRISFLIP_KEY_PASSWORD
      }
    }
    buildTypes {
      release {
        signingConfig signingConfigs.release
      }
    }
    ```
- Versioning follows current app version scheme.
- Provide a short release checklist (build, sign, smoke test).

## 12) Testing Matrix (Minimum)
- Devices:
  - Phone (portrait) with touch only
  - Phone (landscape) with Bluetooth controller
  - Android handheld (landscape) with physical controls
- Scenarios:
  - Standard mode end-to-end run
  - Compact mode end-to-end run
  - Orientation switching in Settings (applies on next game)
  - Back confirmation dialog on title/splash

## 13) Open Questions
- Final compact board height (start with -6 rows total, adjust after playtests).
- Minimum neutral zone size for spawn/flip safety.
- Whether compact mode should reduce HUD elements further on very small screens.

## 14) Progress Checklist
- [ ] Capacitor initialized and Android platform added.
- [ ] Vite build output confirmed in `dist/` and loading in Android WebView.
- [x] Options: Layout Mode + Orientation implemented (independent settings).
- [x] Compact mode row reductions applied (-2 neutral, -2 per field).
- [x] Compact mode HUD updated (no on-screen buttons).
- [x] Back confirmation dialog on title/splash.
- [ ] Touch + gamepad input sanity tested on device.
- [ ] Release signing configured and verified.
- [ ] Sideload APK built and smoke tested on target devices.

















