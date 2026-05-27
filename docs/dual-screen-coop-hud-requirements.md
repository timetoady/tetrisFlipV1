# Dual-Screen Co-op HUD Requirements (v1.0)

## 1. Executive Summary

This document specifies the requirements for the **Dual-Screen Co-op HUD** layout. The design is optimized for dual-screen clamshell devices (such as the AYN Thor). When playing in **Co-op Mode** with **Dual Screen (Game)** enabled:
- **Player 1's HUD** (Score, Level, Lines, Hold, Next, and Momentum) is moved to the bottom screen (native Presentation).
- **Player 1's HUD** is hidden on the top screen (WebView), leaving only **Player 2's HUD** on the top screen.
- **Perfect Gameboard Alignment** is maintained across the screen hinge/fold.

These changes MUST be tightly scoped to affect **only** dual-screen game mode, and **only** during Co-op mode, preserving standard single-screen modes, other dual-screen modes (Info), and desktop/Electron versions without regressions.

---

## 2. Scope

- **Platform**: Android (Capacitor) with dual-screen presentation support.
- **Mode Scoping**: Active ONLY when `data-dual-screen-mode="game"` is active AND the gameplay mode is `coop`.
- **Target Devices**: AYN Thor and similar clamshell devices.

---

## 3. UI/UX Requirements

### 3.1 Top Screen (WebView)
- **Grid Rendering**: Displays the inactive field (upper half of the 40-row board, rows 0-19 when normal; rows 20-39 when flipped).
- **Player 2 HUD**: Remains visible on the right side of the screen. Supports 180-degree rotation (Flip P2 HUD Option) for face-to-face play.
- **Player 1 HUD**: Hided completely to avoid redundancy and declutter the screen.

### 3.2 Bottom Screen (Native Presentation)
- **Grid Rendering**: Displays the active field (lower half of the 40-row board, rows 20-39 when normal; rows 0-19 when flipped).
- **Grid Alignment**: Aligns horizontally and vertically with the WebView's grid, ensuring cells match pixel-for-pixel and meet cleanly at the hinge.
- **Player 1 HUD**: Drawn natively on the left margin. It must include:
  - **Score**: "SCORE" label and 6-digit score value.
  - **Stats**: "LEVEL" and "LINES" values side-by-side.
  - **Hold**: "HOLD" box enclosing P1's current hold piece (rendered as a monochrome block).
  - **Next**: "NEXT" list displaying P1's next 3 upcoming pieces.
- **Controls/Margins**: Native touch buttons (Pause/Flip) and vertical Momentum bar remain on the right margin.

---

## 4. Technical Specifications

### 4.1 Grid Scaling and Positioning
- To ensure perfect alignment, the native grid cell size (`cellSize`) must match the WebView's physical cell size (`customCellSize * density`).
- The grid top offset `boardTop` is set to `0` (or computed dynamically) to ensure the grid starts directly at the screen edge (hinge).

### 4.2 Data Bridge (JS to Java)
- The `pushFrame` interface method is extended to pass P1's current hold piece type (int) and next queue (comma-separated string).
- The plugin parses and caches these values on every frame to render them in `GameBoardView`.

### 4.3 Flipped Screen Offset
- When the game state is flipped (`isFlipped = true`), the WebView (top screen) canvas translates by `-displayCanvasHeight` to render rows 20-39.
- The Presentation (bottom screen) renders rows 0-19.

---

## 5. Non-Goals

- Do not alter or add any P2 controls on the bottom screen.
- Do not affect standard Marathon or other single-screen modes.
- Do not display P1 HUD natively on the bottom screen for single-screen web/desktop players.
