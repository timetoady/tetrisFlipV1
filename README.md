# Tetris Flip (v1)

Tetris Flip is a single-player, browser-based puzzle game that mixes classic Tetris with a dual-field flip mechanic. The playfield is split into two fields (Top/Bottom). You can flip which field is active so pieces fall into the current bottom field.

Status: core loop, flip mechanic, inputs, scoring/leveling, and HUD are in place. Hold/next, lock delay, and additional polish are next.

## Requirements

- Node.js (LTS)
- npm

## Setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Controls (current + planned)

- Left/Right: Arrow Left/Right
- Soft Drop: Arrow Down
- Hard Drop: Arrow Up
- Rotate CW: X
- Rotate CCW: Z
- Flip: Space / Shift
- Pause: P / Esc

## Notes

- Rendering uses a 2D canvas with a 10x40 logical grid.
- Inactive field blocks are drawn with reduced opacity.
- Flipping late can cause a jam and immediate lock, with a visual/sound cue.

## Docs

- Requirements: `docs/requirements-plan.md`
- Architecture: `docs/architecture.md`
- TODO: `docs/TODO.md`
