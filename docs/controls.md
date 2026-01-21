# Controls

This summarizes the current input schemes as implemented in `src/input.js` and the in-game HUD buttons.

## Keyboard

- Move: `Left/Right Arrow`
- Soft drop: `Down Arrow`
- Hard drop: `Up Arrow`
- Rotate CW: `X`
- Rotate CCW: `Z`
- Hold: `C`
- Flip: `Space` or `Shift`
- Pause: `P` or `Esc`

Menus:
- Navigate: `Arrow Keys`
- Confirm: `X` or `Enter`
- Back: `Z` or `Backspace`

## Gamepad

Movement:
- D-pad: move left/right, soft drop, hard drop

Actions:
- Rotate CW: `A` (South)
- Rotate CCW: `B` (East) or `X` (West) depending on layout
- Hold: the other face button (X or B)
- Flip: `Y/Triangle` and `RB`
- Pause: `Start`
- Back/Menu: `Back`

Notes:
- Change the rotate layout in **Options**: South/East (A/B), South/West (A/X),
  Sideways: South/East (A/B), or Sideways: South/West (A/X).
- Sideways layouts remap the D-pad and right stick for landscape handheld play.
- Sideways mapping also applies to menus.

Sideways mapping:
- D-pad up: move right
- D-pad down: move left
- D-pad left: hard drop
- D-pad right: soft drop (hold)
- Right stick mirrors the D-pad mapping (axis priority, vertical ties).

## Mouse

Mouse schemes are selectable in **Options**.

### Alternate (Wheel Rotate) — default
- Move: drag left/right
- Rotate CW/CCW: mouse wheel up/down
- Soft drop: right click (hold)
- Hard drop: double right click
- Hold: hold left + right buttons
- Flip: middle click

### Classic (Wheel Drop)
- Move: drag left/right
- Rotate CW: left click
- Rotate CCW: right click
- Soft drop: mouse wheel down (brief)
- Hard drop: mouse wheel up (debounced)
- Flip: middle click

## Touch

- Move: slide left/right (trackpad-style)
- Soft drop: swipe down (hold)
- Hard drop: swipe up
- Rotate CW: tap
- Rotate CCW: two-finger tap/gesture (short swipe)
- Flip: two-finger swipe down or tap the FLIP button
- Hold: long-press (about 0.4s) or tap the HOLD box
- Pause: PAUSE button

Notes:
- Touch buttons appear only during gameplay.
