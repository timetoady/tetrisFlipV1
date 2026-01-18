Here is the implementation-ready requirements document for **Tetris Flip v2**.

---

# Tetris Flip: Technical Requirements Document (v2.0)

## 1. Executive Summary

This v2 scope focuses on input expansion: **gamepad/controller support** and **mouse/touch compatibility** for the existing single-player Marathon experience. Garbage and 2-player modes are explicitly out of scope for this document.

---

## 2. Goals

- Add controller support with remappable bindings.
- Add mouse/touch controls that feel natural on desktop and mobile.
- Preserve current keyboard controls and gameplay timing.
- Avoid input latency and accidental double-inputs across devices.

---

## 3. Non-Goals (Later)

- Garbage clearing mode.
- 2 player mode.
- Network play.

---

## 4. Controller Support

### 4.1 Devices

- Support standard gamepads via the **Gamepad API**.
- Target Xbox/PlayStation-style mappings.

### 4.2 Default Mapping

| Action | Gamepad Control |
| --- | --- |
| Move Left/Right | D-Pad Left/Right |
| Soft Drop | D-Pad Down |
| Hard Drop | D-Pad Up |
| Rotate CW | South (A/Cross) |
| Rotate CCW | East (B/Circle) |
| Flip | R1 / RB |
| Hold | X / Square |
| Pause | Start |
| Back | Select / Back |

Notes:
- D-Pad takes precedence over analog sticks by default.
- Optional: allow left stick to move (config toggle).
- Alternate rotate layout: South + West (A/X) with Hold moving to East (B).

### 4.3 Behavior

- Apply DAS/ARR rules identical to keyboard.
- Edge-triggered actions for rotate/flip/hold/pause.
- Held actions for movement and soft drop.
- Show controller connection state in UI (non-blocking).

---

## 5. Mouse + Touch Support

### 5.1 General Rules

- Touch should never require multi-touch to play.
- Tap gestures must be distinct from directional swipes.
- Mouse should be optional and unobtrusive.

### 5.2 Touch Mapping (Default)

| Gesture | Action |
| --- | --- |
| Swipe Left/Right | Move Left/Right |
| Swipe Down | Soft Drop |
| Swipe Up | Hard Drop |
| Tap | Rotate CW |
| Two-Finger Tap | Rotate CCW |
| Long Press | Hold |
| Two-Finger Swipe Up/Down | Flip |
| Tap Pause Button | Pause |

Notes:
- Provide on-screen buttons for Pause + Flip on mobile.
- Respect OS-level back gesture; do not hijack.

### 5.3 Mouse Mapping (Default)

| Input | Action |
| --- | --- |
| Left Click | Rotate CW |
| Right Click | Rotate CCW |
| Mouse Wheel Down | Soft Drop |
| Mouse Wheel Up | Hard Drop |
| Click UI Flip Button | Flip |
| Click UI Hold Button | Hold |

---

## 6. UI Additions

- Input settings panel:
  - Toggle gamepad analog stick support.
  - Choose rotate layout (South+East or South+West).
  - Enable/disable touch controls.
- Mobile HUD:
  - Minimal buttons: Pause, Flip, Hold.
  - Optional overlay tutorial (first launch).

---

## 7. Input System Changes

- Introduce an **Input Manager** that merges keyboard, gamepad, and touch.
- Single source of truth for:
  - `isHeld(Action)`
  - `wasPressed(Action)`
  - `wasReleased(Action)`
- Debounce touch and gamepad inputs to avoid duplicates.

---

## 8. Performance and Responsiveness

- Poll Gamepad API at frame rate; cache state per frame.
- Avoid allocations inside the game loop (reuse arrays/objects).
- Ensure touch handlers are passive where appropriate.

---

## 9. Acceptance Criteria

- Controller-only play is viable from splash screen to game over.
- Touch-only play is viable on mobile-size screens.
- Keyboard controls unchanged and still responsive.
- No input double-firing when multiple devices are connected.
