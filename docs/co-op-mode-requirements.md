Here is the implementation-ready requirements document for **Co-op Relationship Therapy Mode**.

---

# Tetris Flip: Co-op Relationship Therapy Mode Requirements (v1.0)

## 1. Executive Summary

Co-op Relationship Therapy is a two-player Marathon variant where both players control simultaneous active pieces on the same dual-field board. Player 1 plays with standard downward gravity on the bottom field. Player 2 plays with upward gravity on the top field, and can clear lines in their field just like Player 1. The Flip mechanic remains shared, letting both players swap fields when helpful.

---

## 2. Goals

- Add a Co-op mode with two simultaneous active pieces.
- Keep Player 1 controls as-is; add keyboard/gamepad controls for Player 2.
- Make the top field interactive for Player 2 (line clears, scoring, collisions).
- Mirror Player 2 HUD on the left side with their own stats, hold, and momentum.
- Preserve Flip to swap fields for both players at once.

---

## 3. Non-Goals

- Touch/mouse co-op controls.
- Online multiplayer or networking.
- Separate playfields or split screens.

---

## 4. Controls

### 4.1 Keyboard (default)

- Player 1: same as current (Arrows, Z/X rotate, C hold, Space/Shift flip).
- Player 2:
  - Move: W/A/S/D
  - Rotate: J / K
  - Hold: L
  - Flip: shared on Space (no dedicated P2 flip key)

### 4.2 Gamepad

- Support two gamepads, one per player.
- Player 1 uses existing mapping.
- Player 2 mapping TBD (mirrors Player 1 mapping on second gamepad).

---

## 5. Gameplay Rules

- Both players have active pieces at the same time.
- Player 1 gravity is downward; Player 2 gravity is upward.
- Each player collides only with blocks in their current active field.
- Line clears happen independently per player/field.
- Flip swaps field positions for both players and changes which field is active for each.
- Player 2 receives a gameplay advantage to compensate for upward play (TBD).
  - Player 2 has no automatic upward gravity; pieces float until placed.
  - Add a per-piece placement timer (default 5 seconds) to force action.

---

## 6. Scoring and Records

- Separate scores, levels, lines for each player.
- Co-op leaderboard rules TBD (combined score or best-of).
  - Combined score, single name entry for the pair.

---

## 7. UI and Feedback

- Player 1 HUD remains on the right (current layout).
- Player 2 HUD mirrors on the left: score/level/lines, hold, next, momentum.
- Disable touch buttons in Co-op mode.

---

## 8. Implementation Notes

- Game loop must support two active pieces and two input streams.
- Board and line-clear logic should allow both owners to clear lines.
- Flip affects both active owners at once.
- Add a new mode id `coop` (final name TBD).
- Add a new menu option and Co-op mode screen (if settings are needed).
 - Player 2 uses a separate 7-bag randomizer.
 - Auto-assign gamepads in connection order for Player 1/2.

---

## 9. Follow-up Mode: Sirtet (Upside Down)

- Single-player mode using the upward gravity rules from Player 2.
- Uses Flip and dual-field logic but with inverted gravity for the active piece.
- Marathon-style scoring/levels.

---

## 10. Open Questions

- What gameplay advantage should Player 2 receive (mechanic, not just points)?
- How are collisions handled if both active pieces would occupy the same cell?
- Should this be an immediate block (thud) with no overlap, or an alternate resolution?
- Do both players see ghost pieces, and should Player 2’s ghost project upward?
- Sirtet mode: any unique constraints beyond upward gravity?
- What should the placement timer be (default 5 seconds ok)?

## 11. Resolved Decisions

- Placement timer: 5 seconds.
- Collision between active pieces: block with a thud, no overlap.
- Sirtet mode: no additional constraints beyond upward gravity.
