# Tetris Flip V1 Architecture

## Goals

- Separate game logic from rendering.
- Keep a single logical 10x40 grid with per-cell field ownership.
- Treat flip as a rendering and collision rule change, not a data mutation.

## Core Modules

- `src/main.js` Bootstraps canvas, creates the game, starts the loop.
- `src/constants.js` Global constants and configuration.
- `src/input.js` Keyboard state and edge-triggered actions.
- `src/systems/gameloop.js` Update/draw coordinator.
- `src/entities/board.js` Grid data, collision checks, line clears, flip state.
- `src/entities/piece.js` Piece shapes, rotations, movement helpers.
- `src/utils/randomizer.js` 7-bag generator.
- `src/utils/srs.js` Rotation kick data (stubbed for v1).
- `src/utils/drawing.js` Canvas helpers.
- `src/systems/gameloop.js` also tracks next queue + hold state.

## Data Model Summary

- `Cell`: `{ value, owner, locked }`
- `owner`: `FIELD_A` or `FIELD_B`
- `Board.isFlipped`: when true, `FIELD_B` is the active (bottom) field

## Order of Operations

1. Input phase
   - Read edge-triggered actions (move, rotate, flip, hard drop).
   - Read held actions (soft drop).
2. Update phase
   - Apply flip toggle (swap active owner).
   - If flip causes overlap, shove the piece up and lock immediately.
   - Apply horizontal movement if not colliding.
   - Apply rotation if not colliding (kicks applied).
   - Apply gravity and lock delay (grounded timer, reset cap, cooldown).
   - When locked, write blocks with the active owner.
   - If the active field blocks the spawn zone, trigger game over.
   - Clear full lines that belong entirely to the active owner.
   - Update score, lines, and level based on clears and drops.
3. Render phase
   - Clear canvas.
   - Draw field tints (top/bottom) and spawn zone gap.
   - Draw inactive field with low opacity.
   - Draw active field with full opacity.
   - Animate line clears (vertical flip).
   - Draw active piece and ghost piece.
   - Draw Tetris celebration overlay (flash + text).
   - Draw flip jam flash/outline animation (if triggered).
   - Draw HUD (score/level/lines).
   - Draw hold and next queue panels.

## Flip Rules

- Flip does not change piece coordinates or grid contents.
- Collision checks only consider blocks owned by the active (bottom) field.
- Inactive field blocks are drawn with reduced opacity to allow planning.
- Grid background parallax offsets briefly on flip to indicate state change.
