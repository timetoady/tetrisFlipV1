# Dual-Screen Stability & Interface Refinements Requirements

This document outlines the final remaining requirements to make the dual-screen mode, native Android HUD, and related layouts completely stable, clean, and polished on landscape/handheld screens (including wide aspect ratio devices like the AYN Thor).

---

## 1. Options Menu Centering & Width Refinement
- **Visual Defect**: On wide screens (landscape), the options panel `.menu-panel.options-panel` aligns to the left edge of the viewport, leaving the right side black and looking squished.
- **Requirements**:
  - Center the options panel horizontally and vertically on all screens.
  - Set the active `.menu-screen` to a flex layout with alignment centered.
  - Increase the landscape options panel `max-width` to `680px` (matching the width of the Mode Select screen) to use the wide screen space.

---

## 2. Options Grid Layout & D-pad Navigation
- **Grid Layout**:
  - Remove the `max-height: 520px` restriction in media queries so the 2-column grid layout of options is enabled on all landscape aspect ratios.
  - Organize options into a 6x2 grid (6 rows, 2 columns):
    - **Column 1**: Layout Mode, Orientation, Rotate Layout, Mouse Controls, Music, Music Volume.
    - **Column 2**: SFX Volume, Show FPS, Flip P2 HUD, Dual Screen HUD, Help, Back.
- **Navigation Controls**:
  - Enable D-pad **Left / Right** buttons to move the selected item highlight horizontally between the two columns.
  - Enable D-pad **Up / Down** buttons to move the highlight vertically within the current column.
  - When an option is highlighted, pressing the **Confirm (A/X)** button will cycle or toggle its value (e.g., toggling Show FPS, cycling through Volume levels or music tracks, etc.).

---

## 3. Co-op Mode Playfield Alignment & Spacing
- **Playfield Alignment**:
  - Define `getGridLeft()` on the `Gameloop` class in `src/systems/gameloop.js` to return `this.getGridOffsetX()`. This ensures that the left offset (which accounts for `HUD_WIDTH` in Co-op mode) is accurately sent to the native bridge.
  - Ensure the Java `GameBoardView` uses this updated offset to center and align the bottom screen's playfield exactly under the top screen's playfield.
- **Pause Menu Spacing**:
  - Shrink the excessive spacing around the native pause menu container on the lower screen.
  - Style the native pause buttons and confirm overlays to fit cleanly within the scaled playfield boundaries without clipping or overflow.

---

## 4. Mode Selection Hover Descriptions
- **Hover Description HUD**:
  - Add a dynamic text description box at the bottom of the Mode Select screen.
  - As the user moves the highlight between different game modes (Marathon, Burst, Vanilla, Garbage, Chillax, Redemption, Co-op, Sirtet, Options), update the description to explain what that mode is about:
    - **Marathon**: "Standard endless play. Gravity increases as you clear lines."
    - **Burst**: "Use I-Boosts to clear lines quickly under a time limit."
    - **Vanilla**: "Retro single-field mode with classic piece scaling."
    - **Garbage**: "Clear rising rows of garbage blocks as fast as possible."
    - **Chillax**: "Relaxed endless mode with slower, constant gravity."
    - **Redemption**: "Play with multiple lives. Restores board on top-out."
    - **Co-op**: "Team up with Player 2. Both play on the same split board."
    - **Sirtet**: "Upside-down challenge where pieces fall upward."
    - **Options**: "Configure game settings, controls, and audio."
  - Synchronize these description strings with the native secondary screen via the HUD menu state updates so they display on the bottom screen during mode selection.

---

## 5. Screen Orientation Locking in Dual Screen Mode
- **Orientation Lock**:
  - In `DualScreenHudPlugin.java`, call `getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE)` when dual-screen mode is enabled.
  - Restore sensor/user-based rotation (`ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED`) when dual-screen mode is disabled, allowing rotation again for normal portrait use.
