# Tetris Flip V1 TODO

## Phase 1: Engine

- [x] Vite project bootstrapped and running
- [x] Canvas setup and scaling
- [x] Static grid render
- [x] 7-bag piece generator
- [x] Basic gravity and lock
- [x] Basic collision (walls/floor)

## Phase 2: Inputs

- [x] Left/Right movement (DAS + ARR)
- [x] Soft drop (hold)
- [x] Hard drop (instant lock)
- [x] Basic rotation
- [x] SRS wall kicks

## Phase 3: Flip Mechanic

- [x] Field owner tagging for locked blocks
- [x] Flip toggle with active-owner swap
- [x] Collision ignores inactive field blocks
- [x] Ghosting / overlap handling

## Phase 4: Rules and UI

- [x] Line clears (active field only)
- [x] Scoring and leveling
- [x] Lock delay (500ms reset on grounded moves, max grounded time, limit 15)
- [x] Next queue + Hold
- [x] HUD (score/level/lines)
- [x] Pause

## Phase 5: Polish

- [x] Ghost piece
- [x] Spawn zone visualization (debug)
- [ ] Color-blind pattern overlays
- [x] Audio stubs

## Lose round condition
- [x] Add lose condition/lose screen

## UX Improvements

- [x] Ghost piece with stronger white outline (dark colors readability)

## Sound Effects

- [x] Line clear sound
- [x] Tetris sound (emphatic, celebration)
- [x] Level up sound (rising tone)
- [x] Grounding sound (soft thud)
- [x] Hard drop sound (thump)
- [x] Pause/unpause sound

## Clearing Animation

- [x] Line clear animation (pause during animation)
- [x] Tetris celebration (announcement + visual splash)
- [x] Blank out pieces on playing field during pause

## Menus

- [x] Start splash page (image provided by user)
- [x] Mode selection (Marathon only for now)
- [x] Marathon menu: pick starting gravity (1-19)
- [x] High score entry (top 10 list per mode)
