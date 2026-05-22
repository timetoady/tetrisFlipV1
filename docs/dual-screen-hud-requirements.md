# Dual-Screen HUD Requirements

Date: 2026-04-28
Target: AYN Thor-style Android secondary display

## Goal

Add Android dual-screen support for devices that expose a lower or secondary panel as a presentation display. The primary WebView remains the owner of gameplay, input, timing, collision, scoring, and the canonical renderer. The secondary display is read-only.

## Modes

Expose one Options setting: `Dual Screen` with `Info / Experimental Game / Off`.

- `Info`: show the proven secondary-display HUD with stronger visual styling, score emphasis, hold/next queue, and mode-specific stat groups.
- `Experimental Game`: show a display-only lower-field board viewer driven by serialized board snapshots from the primary game.
- `Off`: dismiss the presentation and stop sending secondary-display snapshots.

The default mode is `Info`. Legacy stored value `auto` should be treated as `Info`.

## Scope

- Support Android devices that expose the second panel through `DisplayManager.DISPLAY_CATEGORY_PRESENTATION`.
- Render a native Android `Presentation` on the secondary display.
- Stream lightweight snapshots from the Capacitor WebView to native code at most every 120ms.
- Preserve normal behavior on devices without a secondary display.
- Preserve desktop web/Electron behavior with no native plugin dependency.
- Keep the presentation non-focusable so it does not steal primary activity input.

## Info Mode Content

- App/title/status: menu, playing, or paused.
- Mode label.
- P1 score, level, lines.
- P1 hold and next queue.
- Co-op P2 score, level, lines when applicable.
- Garbage mode progress/time when applicable.
- Redemption lives when applicable.
- Run stats such as I drought and total pieces for relevant modes.
- Momentum stats where applicable.

## Game Mode Content

- Display-only lower half of the logical board, currently rows 20-39 of the 40-row board.
- Locked board cells plus active piece overlays from serialized primary-game state.
- Mode/status label and compact score/level/line footer.
- No secondary input handling.
- No duplicated gameplay logic.

## Non-Goals

- Do not move gameplay state ownership out of the primary WebView.
- Do not accept touch input from the secondary display.
- Do not change collision, scoring, timing, or primary input mappings.
- Do not rely on pure CSS spanning/cropping across physical screens; Thor-style devices expose a separate Android presentation display, not one shared DOM viewport.
- Do not prioritize Jetpack WindowManager or web viewport segment APIs until after Thor-style presentation behavior is stable.

## Native Behavior

- Register a local Capacitor plugin named `DualScreenHud`.
- Use `DisplayManager` to discover presentation displays.
- Show one `Presentation` on the preferred secondary display when mode is `Info` or `Game` and a display is available.
- Dismiss the presentation on pause, destroy, display removal, or when the option is set to `Off`.
- Render `Info` with a fixed native custom HUD view that fits one Thor screen without scrolling.
- Render `Experimental Game` with a native custom board view fed by primary WebView snapshots.
- Provide a native exit fallback that dismisses the presentation before finishing the Android task.

## Web Behavior

- Register the native plugin only on non-web Capacitor platforms.
- Persist the option in `localStorage["tetrisflip:android:dualScreenHud"]` as `info`, `game`, or `off`.
- Treat plugin failures as non-fatal and continue the primary game.
- Include `displayMode` on every secondary-display snapshot.
- Include serialized board state only while mode is `Game`.
- Include enough queue data for native monochrome hold/next rendering in `Info`.

## Acceptance Tests

- On a normal single-screen Android device, the app launches and plays normally with `Dual Screen: Info`.
- On AYN Thor, `Info` shows the native HUD on the secondary screen once a presentation display is available.
- Toggling to `Experimental Game` changes the secondary screen to the lower-board viewer without moving gameplay or controls.
- Toggling to `Off` dismisses the secondary presentation and stops snapshot pushes.
- Toggling back to `Info` restores the secondary HUD.
- Starting, pausing, resuming, and returning to menus update the secondary screen without disrupting the primary game.
- Pressing Android Back on the splash screen opens `EXIT TETRIS FLIP?`.
- Pressing `Yes` exits the app even when the secondary screen is active in either `Info` or `Experimental Game`.
- `vite build`, `assembleCurrentDebug`, and `assembleAndroid10Debug` pass.

## Future Expansion Candidates

- Add a secondary WebView/canvas renderer if the lower-board prototype needs closer visual parity with the primary renderer.
- Crop the primary renderer to the upper playfield in `Game` mode once the secondary lower-board viewer is validated.
- Add mode-specific secondary layouts for co-op, Garbage, Redemption, and Sirtet.
- Add a diagnostic badge showing display ID, resolution, and plugin active/inactive state.
- Investigate foldable spanning support separately using Jetpack WindowManager or web viewport segment APIs.
- Keep the current native lower-board path labeled experimental because it is still a separate renderer driven by throttled snapshots rather than the primary canvas cadence.
