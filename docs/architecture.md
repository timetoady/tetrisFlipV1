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
   - Apply horizontal movement if not colliding.
   - Apply rotation if not colliding (kicks later).
   - Apply gravity and lock delay (lock delay planned).
   - When locked, write blocks with the active owner.
   - Clear full lines that belong entirely to the active owner.
3. Render phase
   - Clear canvas.
   - Draw inactive field with low opacity.
   - Draw active field with full opacity.
   - Draw active piece and ghost piece (ghost planned).
   - Draw HUD (planned).

## Flip Rules

- Flip does not change piece coordinates or grid contents.
- Collision checks only consider blocks owned by the active (bottom) field.
- Inactive field blocks are drawn with reduced opacity to allow planning.
