# Gameplay Rewards and Progression Requirements

## Context (current code)
The core game loop lives in `src/systems/gameloop.js`. Line clear scoring is handled in `lockPiece()` with a base table `[0, 100, 300, 500, 800]` multiplied by `level`. Tetris (4 lines) plays a dedicated sound and triggers the "TETRIS!" flash and text overlay. Flip is triggered by `Space` or `Shift` and can cause a flip-jam lock via `handleFlipJam()`, which shoves the piece upward and immediately locks it. Gravity speed is derived from `getDropInterval(level)` using a linear slope and milestone reductions.

## Goals
Reward skilled play with points and clear visual and audio feedback rather than only making the game harder. Encourage flipping back and forth between fields. Increase gravity progression speed relative to the current curve.

## Non-goals
Do not tie gravity to performance for now. Do not add new game modes or UI redesigns. Do not replace the existing Tetris callout style, only extend it.

## Reward features to add

### 1) Tetris streak bonus
Definition: A tetris is a 4-line clear. A streak is consecutive tetris clears with no intervening non-tetris clear and no piece lock without a clear. Streak tiers are 2, 3, and 4 tetrises in a row. Apply a bonus when the streak tier is reached and show a callout.

### 2) Clearout bonus
Definition: After a line clear resolves, the active owner field has zero locked blocks. Award a flat or level-scaled bonus, with a "CLEAROUT" callout and a short success sound.

### 3) Flip-jump bonus
Definition: A line clear caused by a flip-jam lock from `handleFlipJam()`. Apply a multiplier to line-clear points and show a distinct "FLIP POP" or "FLIP JUMP" callout plus a short sound.

### 4) Risk bonus
Definition: A line clear that occurs while the active owner stack height is at or above a danger threshold in the active field. The height check should use the pre-clear state. Apply a multiplier and a "HIGH WIRE" callout.

### 5) Momentum meter
Definition: A meter that fills on each line clear, with higher fills for 2, 3, or 4-line clears. When the meter reaches full, trigger a timed "Burst" state that provides a score multiplier and a visual glow. The meter should decay slowly when no clears occur.

### 6) Flip chain (flip -> clear -> flip -> clear)
Definition: Track flips between clears. If a line clear occurs after at least one flip since the previous clear, increment a flip chain counter. The chain max is 4. If a line clear occurs without a flip since the prior clear, reset the chain. Each qualifying clear applies a multiplier and shows a "FLIP CHAIN xN" callout. This is intended to reward alternating flips and clears.

### 7) Faster gravity progression
Definition: Update `getDropInterval(level)` to reduce frame intervals faster than the current curve. Keep the same update flow in `lockPiece()` for level changes. The new curve does not depend on player performance.

## Scoring model
Base line clear points remain `lineScores[cleared] * level`. Apply multipliers for flip-jump, flip chain, tetris streak, risk, and momentum in a consistent order. Clearout is an additional bonus applied after multipliers. All new values are tunables and should be declared as constants near the existing scoring table.

## Visual and audio requirements
Use the existing Tetris callout style as reference. Each new reward feature should have a short, readable callout and a distinct, brief sound. Add one new callout timer per feature or reuse a generic announcement system if it is simpler.

## New state tracking (GameLoop)
Add state to track tetris streak count, flip chain count, whether a flip happened since the last clear, whether the last lock was a flip-jam, momentum meter value and burst timer, and the risk height threshold.

## Acceptance checklist
Streak bonuses trigger only on consecutive tetrises. Clearout triggers only when the active field is empty after clearing. Flip-jump bonus triggers only on jam-induced clears. Risk bonus triggers only when height threshold is met. Flip chain increments only with flips between clears and caps at four. Momentum burst activates only on full meter and applies its multiplier for the defined duration. Gravity is noticeably faster at mid and high levels.
