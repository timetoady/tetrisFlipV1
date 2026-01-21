# Tetris Flip: Sideways Handheld Control Style Requirements

## 1. Summary

Add new "Sideways" variants under the existing rotate layout setting so the game is comfortable on wide Android handhelds in landscape orientation.

## 2. Goals

- Provide a sideways-friendly D-pad mapping for Player 1.
- Enable right analog stick input by default for the sideways option.
- Keep existing face-button rotate layout options (A/B or A/X).
- Avoid accidental double-inputs when both D-pad and right stick are active.
- Apply sideways mapping consistently in gameplay and menus.

## 3. Non-Goals

- No left stick mapping for sideways mode.
- No changes to Player 2 gamepad mapping for co-op.
- No changes to keyboard or touch mappings.

## 4. Settings and UI

- Location: Add the new option(s) inside the existing "Rotate Layout" setting in Options.
- Labels: Extend the rotate layout list to include both sideways variants.
- Storage: Persist in the same rotate layout storage key (`tetrisflip:input:rotateLayout`), using new layout ids.

## 5. Sideways Mapping (Player 1)

### 5.1 D-pad (digital)

| Input | Action | Key Code |
| --- | --- | --- |
| D-pad Up | Move Right | ArrowRight |
| D-pad Down | Move Left | ArrowLeft |
| D-pad Left | Hard Drop | ArrowUp |
| D-pad Right | Soft Drop (hold) | ArrowDown |

### 5.2 Right stick (analog)

- Uses the same mapping as the D-pad.
- Enabled by default for sideways mode only.
- Left stick has no effect in sideways mode.

## 6. Stick Behavior Details

- Deadzone: ignore stick input below a fixed threshold (ex: 0.4).
- Axis priority: use the axis with the larger absolute value.
- Diagonal tie-breaker: if axes are equal, prefer the vertical axis (maps to left/right movement) to avoid accidental drops.
- D-pad precedence: if D-pad and right stick are both active in the same frame, D-pad wins.

## 7. Co-op Scope

- Apply sideways mapping only to Player 1 inputs.
- Player 2 mapping remains unchanged, regardless of the sideways setting.

## 8. Implementation Notes

- `src/input.js`: add sideways-aware gamepad mapping for P1 D-pad and right stick.
- `src/main.js`: extend rotate layout options and persist the new layout ids.
- `docs/controls.md`: document the sideways mapping in the Gamepad section.
- `assets/`: optional controller image update if needed for clarity.

## 9. Acceptance Criteria

- The Options menu shows sideways variants in the rotate layout selector.
- In sideways mode, D-pad up/down move left/right; left hard drops; right soft drops.
- Right stick mirrors D-pad behavior and is on by default.
- Left stick has no effect in sideways mode.
- Diagonal stick input resolves by axis priority with a movement-friendly tie-breaker.
- Player 2 controls are unaffected by sideways mode.
- Sideways mapping applies to menus as well as gameplay.

## 10. Rotate Layout List

- South / East (A/B)
- South / West (A/X)
- Sideways: South / East (A/B)
- Sideways: South / West (A/X)
