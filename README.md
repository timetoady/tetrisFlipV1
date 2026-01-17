# Tetris Flip (v1.0.0)

Tetris Flip is a single-player, browser-based puzzle game that mixes classic Tetris with a dual-field flip mechanic. The playfield is split into top/bottom fields, and you can flip which field is active so pieces fall into the current bottom. Marathon mode includes scoring/levels, hold/next, HUD, game over handling, and a local top-10 leaderboard.

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

## Controls (current + planned)

- Left/Right: Arrow Left/Right
- Soft Drop: Arrow Down
- Hard Drop: Arrow Up
- Rotate CW: X
- Rotate CCW: Z
- Flip: Space / Shift
- Pause: P / Esc
- Hold: C

## Notes

- Rendering uses a 2D canvas with a 10x40 logical grid.
- Inactive field blocks are drawn with reduced opacity.
- Flipping late can cause a jam and immediate lock, with a visual/sound cue.

## Docs

- Requirements: `docs/requirements-plan.md`
- Architecture: `docs/architecture.md`
- TODO: `docs/TODO.md`
