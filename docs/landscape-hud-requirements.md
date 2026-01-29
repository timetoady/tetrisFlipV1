# Landscape Centering + Side HUD Requirements (Android/Handheld)

## Goals
- In landscape/wide view, gameplay is visually centered (no left-anchored canvas).
- Replace the large empty side areas with:
  - a subtle, low-opacity logo watermark background, and
  - informative side panels that improve readability and UX on handhelds/tablets.
- Do not destabilize gameplay (avoid risky refactors to `GameLoop` logic).

## Non-Goals (v1)
- Rebuilding the core renderer to move HUD out of the canvas.
- Adding interactive UI elements in the side panels (informational only).
- Re-skinning the entire UI theme.

## Phase 0: Acceptance Criteria (Must-Haves)
- Canvas/game area is centered in landscape and stays centered when scaling changes.
- Overlays remain centered and usable (pause/game-over/name entry/exit confirm).
- No regressions:
  - splash/menu navigation works
  - exit dialog works (Back on splash -> exit confirm)
  - compact mode still applies; touch buttons remain hidden in compact
  - no new crashes; project builds and Android lanes assemble
- Side HUD (Phase 3+) only renders during gameplay (not menus) and does not block input.

## Phase 1: Centering Fix (Computed X Offset + Safe Scaling)

Status: DONE (2026-01-28)

### Requirement
- Replace any hard-coded translate offsets with computed centering offsets.
- Keep overlays centered (avoid transforming a container that also contains `position: fixed` overlays).

### Implementation Notes
- During touch scaling (coarse pointer), apply `transform` to the *canvas* only.
- `offsetX = max(0, (wrapRect.width - canvas.width * viewportScale) / 2)`
- `offsetY` is a small fixed padding (currently 2px) for top spacing.
- Touch scale is computed from the `.wrap` container height to avoid Android WebView viewport inconsistencies.

### Checklist
- [x] Remove hard-coded `offsetX` and compute from available width
- [x] Confirm centered on wide devices (tablet/handheld landscape)
- [x] Confirm no impact on touch button positioning

## Phase 2: Landscape Background Fill (Logo Watermark)

Status: DONE (2026-01-28)

### Requirement
- In landscape gameplay only, show a low-opacity watermark behind/around the gameplay area.
- Use an existing title logo image initially (reuse current splash/logo asset).

### Implementation Notes
- Watermark is implemented as `body::before` with `position: fixed` so it stays centered to the viewport.
- Watermark visibility is gated by `body[data-gameplay="true"]` (set from `src/main.js`).
- Name entry overlay uses a lighter backdrop during gameplay so the watermark remains visible.

### Visual Rules
- Low opacity (tunable)
- Subtle; must not reduce gameplay readability
- Prefer CSS-only (performance-friendly on Android 10)

### Checklist
- [x] Add a landscape-only background layer (CSS)
- [x] Reuse existing logo image asset (configurable later)
- [x] Confirm performance OK (no jank)

## Phase 3: "Useful UI" Side Panels (HTML Overlay, Low Risk)

Status: IN PROGRESS (3A baseline implemented; 3B marathon/chillax stats implemented)

### Implementation Principle
- Add DOM-based HUD panels (left/right) outside the canvas.
- Update values each frame by reading:
  - `game.getScoreState()`
  - Implemented: `getQueueState()` + `getMomentumState()`
- Avoid mutating gameplay state; avoid reworking rendering.

### General Requirements
- Panels visible only in landscape + gameplay (not menus).
- Panels scale with device size; readable on handhelds.
- Co-op uses symmetric panels for P1/P2.

### 3A: Universal (All Modes)
#### Display
- Score, Level, Lines
- Hold + Next preview (bigger than portrait HUD)
- Momentum meter (bigger + labeled)

#### Checklist
- [x] Add left/right HUD containers in `index.html`
- [x] Style with CSS (landscape-only)
- [x] Wire per-frame updates in `src/main.js`

### 3B: Marathon + Chillax (NES-style stats)
#### Display
- Piece counts: I/J/L/O/S/T/Z spawned
- "I drought": number of pieces since last I piece

#### Data Requirements
- Reliable spawn detection.
- Prefer: track stats inside `GameLoop` when pieces spawn.

#### Checklist
- [x] Add piece stats tracking (counts + drought) safely
- [x] Expose via `game.getPieceStats()` (or extend `getScoreState()` carefully)
- [x] Render in side panel for Marathon/Chillax only

### 3C: Garbage Mode
#### Display
- Garbage speed + height for the active run
- Remaining garbage progress indicator

#### Data Requirements
- Active run settings from `main.js` (already tracked)
- Remaining garbage metric (requires read-only accessor)

#### Checklist
- [ ] Add remaining garbage metric accessor
- [ ] Render speed/height + progress bar/text

### 3D: Redemption Mode
#### Display
- Lives prominently (big, readable)

#### Data Requirements
- Lives/max lives (likely via accessor)

#### Checklist
- [ ] Add `getLivesState()` accessor
- [ ] Render big lives readout

### 3E: Co-op Mode
#### Display
- Symmetric sidebars:
  - Left = P1, Right = P2
  - Each shows Score/Level/Lines + momentum

#### Data Requirements
- `getScoreState()` already includes P2 and combined score.

#### Checklist
- [ ] Implement co-op layout rules
- [ ] Confirm no overlap with pause overlay

## Phase 4: Styling/UX Polish
- [ ] Ensure panels don't cause layout shifts or scrolling
- [ ] Ensure watermark removes "grey bar" feel without visual clutter
- [ ] Confirm readability on:
  - tall handheld landscape
  - 16:9 handheld landscape
  - tablet landscape

## Test Checklist (Per Iteration)
- [ ] `npm.cmd run build`
- [ ] `npm.cmd run android:android10:debug`
- [ ] On device: verify centering + no input regressions
- [ ] Verify pause menu still usable (no overlay collisions)
- [ ] Verify compact mode still works
