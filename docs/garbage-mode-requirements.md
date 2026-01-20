Here is the implementation-ready requirements document for **Garbage Mode**.

---

# Tetris Flip: Garbage Mode Requirements (v1.0)

## 1. Executive Summary

Garbage Mode is a finite challenge where the player clears preset garbage stacks on both fields. The player chooses a fixed speed (0-35) and garbage height (1-9). The mode ends with a success message and final score once all garbage blocks are removed from both the bottom and top fields.

---

## 2. Goals

- Add a selectable Garbage Mode with its own options screen.
- Let players pick speed 0-35 and garbage height 1-9 before starting.
- Generate gray garbage blocks on both fields at the start of the round.
- End with a success message and score when all garbage is cleared.
- Track a separate top ten scoreboard for Garbage Mode.

---

## 3. Non-Goals

- Endless or Marathon-style progression.
- Multiplayer or garbage attack mechanics.
- New scoring formulas (reuse the current scoring system).
- Alternate gravity directions or field behaviors.

---

## 4. Mode Setup and Menu Flow

### 4.1 Mode Selection

- Add a new mode tile labeled "Garbage" on the mode screen.
- Selecting "Garbage" opens a dedicated Garbage Options screen.

### 4.2 Garbage Options Screen

- Speed: 0-35 (fixed for the round).
- Garbage Height: 1-9.
- Start and Back actions.
- Display top ten Garbage Mode scores.
- Defaults: Speed 0, Height 1.

### 4.3 Startup Behavior

- Set the starting level to the chosen speed.
- Freeze level progression for the round (speed stays fixed).
- Create garbage stacks before the first piece spawns.

---

## 5. Garbage Generation Rules

- Generate garbage for both owners: bottom field and top field.
- For each owner, fill `garbageHeight` rows starting from that owner's local bottom row.
- Each garbage row has 9 filled cells and 1 empty hole.
- Hole column is randomized per row and should not repeat in adjacent rows for the same owner.
- Garbage blocks use cell value `8` and render in gray.
- Garbage blocks are locked and belong to their respective owner.

---

## 6. Gameplay Rules

- Line clears function exactly like Marathon (active field only).
- Garbage blocks clear only when their owner field clears a line.
- Win condition: no garbage blocks remain in either field.
- Lose condition: existing top-out logic stays unchanged.
- On win, pause gameplay and show a success screen with the final score.

---

## 7. Scoring and Records

- Reuse existing scoring rules.
- Store Garbage Mode scores under a new key: `tetrisflip:garbage:scores`.
- Allow name entry for top ten placements.

---

## 8. UI and Feedback

- Add a Garbage Options screen with speed, height, and top ten list.
- Success screen includes a clear "Garbage Cleared" message and final score.
- Success screen is distinct from game over and uses mode-specific success images.

### 8.1 Success Image Tiering

- Use tiered images by speed and height rather than per-combination.
- Speed tiers: 0-5 (Slow), 6-15 (Steady), 16-25 (Fast), 26-35 (Blazing).
- Height tiers: 1-3 (Low), 4-6 (Mid), 7-9 (High).
- Total variants: 12 (4 speed tiers x 3 height tiers).
- Fallback: if a tier-specific image is missing, fall back to nearest speed tier, then nearest height tier, then default.

---

## 9. Implementation Notes

- Add a new mode id `garbage` alongside `marathon` and `chillax`.
- Add menu elements and selectors for Garbage Options.
- Add `garbageHeight` state alongside `startingGravity`.
- Extend score storage keys and scoreboard rendering to include Garbage Mode.
- Add a win check after line clears to detect remaining garbage blocks.

---

## 10. Acceptance Criteria

- Player can select Garbage Mode and set speed 0-35 and height 1-9.
- Both fields spawn with gray garbage rows at the chosen height.
- Clearing all garbage ends the round with a success message and score.
- Garbage Mode has its own top ten list.
- Standard lose condition still triggers on top-out.

---

## 11. Resolved Decisions

- Defaults: Speed 0, Height 1.
- Avoid repeating hole columns in adjacent rows.
- No remaining-garbage HUD indicator.
- Success screen is distinct from game over and uses tiered success images.
