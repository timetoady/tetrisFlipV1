Here is the implementation-ready requirements document for **Redemption (Lives) Mode**.

---

# Tetris Flip: Redemption (Lives) Mode Requirements (v1.0)

## 1. Executive Summary

Redemption (Lives) Mode is a Marathon-style variant with limited lives. The player chooses 1-3 lives before starting. When the stack tops out, the player loses a life, the bottom 6 rows are removed, the remaining stack shifts down, and play continues until all lives are gone.

---

## 2. Goals

- Add a selectable Redemption (Lives) Mode with its own options screen.
- Let players choose 1, 2, or 3 lives before starting.
- On top-out, consume a life and clear the bottom 6 rows, shifting remaining blocks down.
- End the run when no lives remain.
- Keep Marathon scoring/leveling behavior otherwise unchanged.

---

## 3. Non-Goals

- New scoring formulas.
- New garbage mechanics or multiplayer rules.
- Separate board sizes or gravity directions.

---

## 4. Mode Setup and Menu Flow

### 4.1 Mode Selection

- Add a new mode tile labeled "Redemption" (or "Lives") on the mode screen.
- Selecting it opens a dedicated Redemption Options screen.

### 4.2 Redemption Options Screen

- Lives: 1-3.
- Starting Gravity: 0-35 (same as Marathon).
- Start and Back actions.
- Display top ten Redemption scores.

---

## 5. Gameplay Rules

- Uses Marathon scoring, leveling, and gravity progression.
- Top-out triggers a "life loss" instead of immediate game over, if lives remain.
- On life loss:
  - Decrement lives by 1.
  - Remove the bottom 6 rows from both fields (respecting owners).
  - Shift remaining blocks down by 6 rows.
  - Clear active piece, reset lock delay state, and spawn a fresh piece.
  - Resume play unless lives are now 0.
- If lives reach 0 after a top-out, end the run with Game Over.

---

## 6. Scoring and Records

- Use existing Marathon scoring rules.
- Store Redemption scores under: `tetrisflip:redemption:scores`.
- High score entry and top 10 list per mode.

---

## 7. UI and Feedback

- Add Redemption Options screen with lives + starting gravity and top ten list.
- Add a lives display in the HUD during gameplay.
- Optional: life loss callout/announcement when a life is consumed.

---

## 8. Implementation Notes

- Add a new mode id `redemption` alongside `marathon`, `chillax`, and `garbage`.
- Add `lives` state to the game loop and expose it in HUD rendering.
- Add a life-loss handler that performs the bottom-row clear and downward shift.
- Preserve the dual-field ownership model when shifting rows.
- Show lives as pixel heart icons in a single vertical column at the upper-right HUD.
- Life loss pauses the game and prompts the player to use a life or quit.
- On life loss, clear the active piece, play a heart-break sound, and animate the bottom
  six rows exploding and the stack shifting downward.

---

## 9. Acceptance Criteria

- Player can select Redemption Mode and choose 1-3 lives.
- Starting gravity behaves like Marathon.
- On top-out, a life is consumed and the bottom 6 rows are removed.
- Play continues until all lives are gone, then Game Over triggers.
- Redemption has its own top ten list.

---

## 10. Resolved Decisions

- Lives are shown as 1-3 pixel heart icons in a single vertical column at the upper-right HUD.
- Bottom-6-row removal happens only on the field that topped out.
- Level and score persist unchanged after life loss.
- Life loss pauses the game and prompts the player to use a life or quit.
- Active piece is cleared on life loss.
