# Tetris Flip (v1.0.0)

Tetris Flip is a single-player, browser-based puzzle game that mixes classic Tetris with a dual-field flip mechanic. The playfield is split into top/bottom fields, and you can flip which field is active so pieces fall into the current bottom. Marathon and Chillax modes include scoring/levels, hold/next, HUD, game over handling, and a local top-10 leaderboard, while Garbage and Redemption add timed and lives-based challenges.

## Modes

- Marathon: classic scoring and level progression.
- Chillax: fixed speed (no level increase), relaxed play.
- Garbage: choose speed (0-35) and height (1-9), clear randomized garbage on both fields; the round ends when all garbage is gone. Leaderboards are tracked per speed/height and ranked by fastest clear time.
- Redemption: pick starting gravity and 1-3 lives; topping out costs a life, clears the bottom six rows of the active field, and play continues until you run out.

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

Artifacts are created in `dist/` by electron-builder. Auto-updates are configured to use GitHub Releases.

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

Quick reference:
- Move: Arrow Left/Right
- Soft drop: Arrow Down
- Hard drop: Arrow Up
- Rotate CW/CCW: X / Z
- Hold: C
- Flip: Space / Shift
- Pause: P / Esc

Full breakdown (keyboard, gamepad, mouse, touch): `docs/controls.md`

## Bonus System

- Flip Pop: flip-jam line clears earn a score multiplier and callout.
- Flip Chain: clears after flips build a chain up to 4 for extra multiplier.
- Tetris Streak: consecutive tetrises grant escalating streak multipliers.
- Clearout: emptying the active field after a clear grants a bonus.
- High Wire: clears at dangerous stack height earn a multiplier.
- Momentum: clears (and a small hard-drop bonus) fill the meter; Burst at full meter grants a multiplier for a short window, followed by a brief recovery period with reduced gain.

## Notes

- Rendering uses a 2D canvas with a 10x40 logical grid.
- Inactive field blocks are drawn with reduced opacity.
- Flipping late can cause a jam and immediate lock, with a visual/sound cue.

## Docs

- Requirements: `docs/requirements-plan.md`
- Architecture: `docs/architecture.md`
- TODO: `docs/TODO.md`
- Workflow: `WORKFLOW.md`
