# Tetris Flip (v2.0.2)

Tetris Flip is a puzzle game that mixes classic Tetris with a dual-field flip mechanic. The playfield is split into top/bottom fields, and you can flip which field is active so pieces fall into the current bottom. Marathon and Chillax modes include scoring/levels, hold/next, HUD, game over handling, and a local top-10 leaderboard, while Garbage, Redemption, Co-op, and Sirtet expand the challenges.

## Modes

- Marathon: classic scoring with level progression and rising speed.
- Chillax: fixed speed (no level increase), relaxed practice runs.
- Garbage: timed clear challenge. Choose speed (0-35) and height (1-9), clear garbage on both fields, and finish fast. Leaderboards are tracked per speed/height by fastest time.
- Redemption: limited lives mode. If a piece cannot spawn, you can spend a life to clear the bottom rows and keep going; the run ends when lives are gone.
- Co-op Therapy: two players share the board; Player 1 plays downward, Player 2 plays upward with a per-piece placement timer and combined scoring. Flips are shared.
- Sirtet: reverse gravity mode. Pieces rise instead of fall; soft drop is Up and hard drop is Down.

## Requirements

- Node.js (LTS)
- npm

## Setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

Open the URL printed by Vite preview.

## Desktop App (Electron)

Install dependencies:

```bash
npm install
```

Run the desktop app in dev mode (Vite + Electron):

```bash
npm run electron:dev
```

Package the desktop app (builds the renderer first):

```bash
npm run dist
```

Artifacts are created in `release/` by electron-builder. Auto-updates are configured to use GitHub Releases.

On Windows, packaging requires Developer Mode (or running the terminal as Administrator) so the build tools can create symbolic links.

## Running the Release Zip

The release zip contains a static build and must be served by a local web server. Opening `index.html` directly will show a blank screen because browsers block module scripts and asset loading from `file://`.

From the unzipped folder, run one of these:

```bash
# Option A: Python (built-in)
python -m http.server 4173

# Option B: Node (if installed)
npx serve -l 4173
```

Then open `http://localhost:4173/`.

## Controls

Quick reference (Player 1):
- Move: Arrow Left/Right
- Soft drop: Arrow Down (Arrow Up in Sirtet)
- Hard drop: Arrow Up (Arrow Down in Sirtet)
- Rotate CW/CCW: X / Z
- Hold: C
- Flip: Space / Shift
- Pause: P / Esc

Keyboard (Player 2, Co-op):
- Move: A/D/W/S
- Rotate CCW/CW: J / K
- Hold: L
- Flip: Space (shared)

Gamepad:
- D-pad moves, Start pauses, Back returns.
- Rotate layout is configurable in Options (South/East, South/West, or Sideways variants).
- Sideways remaps D-pad + right stick: Up = Move Right, Down = Move Left,
  Left = Hard Drop, Right = Soft Drop.

Mouse:
- Choose a mouse scheme in Options (Alternate, Classic, Tetris.com).
- Dragging left/right moves the piece.

Touch:
- Slide to move, swipe down to soft drop, swipe up to hard drop.
- Tap to rotate CW, two-finger tap to rotate CCW.
- Two-finger swipe flips; long press holds.

Full breakdown: in-app Help (Options -> Help or app menu Help -> Manual), plus `docs/controls.md`.

## Bonus System

- Flip Pop: flip-jam line clears earn a score multiplier and callout.
- Flip Chain: clears after flips build a chain up to 4 for extra multiplier.
- Tetris Streak: consecutive tetrises grant escalating streak multipliers.
- Clearout: emptying the active field after a clear grants a bonus.
- High Wire: clears at dangerous stack height earn a multiplier.
- Momentum: clears (and a small hard-drop bonus) fill the meter; Burst at full meter grants a multiplier for a short window, followed by a brief recovery period with reduced gain.

## Notes

- Rendering uses a 2D canvas with a 10x40 logical grid.
- Inactive field blocks are drawn with reduced opacity (except in Co-op and Sirtet).
- Flipping late can cause a jam and immediate lock, with a visual/sound cue.

## Fan Tribute Disclaimer

Tetris is a trademark of The Tetris Company. This project is a fan tribute game
and is not affiliated with or endorsed by The Tetris Company.

## Docs

- Requirements: `docs/requirements-plan.md`
- Architecture: `docs/architecture.md`
- TODO: `docs/TODO.md`
- Workflow: `WORKFLOW.md`
