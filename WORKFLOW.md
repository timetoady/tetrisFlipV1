# Tetris Flip Workflow

## Local Development

Install dependencies:

```bash
npm install
```

Run the Vite dev server (web build):

```bash
npm run dev
```

Run the Electron app in dev mode (Vite + Electron):

```bash
npm run electron:dev
```

## Build Outputs

Renderer-only build (for web/preview):

```bash
npm run build
npm run preview
```

Electron distributables (Windows):

```bash
npm run dist
```

Outputs land in `release/`.

## Linux AppImage (Docker)

Requires Docker Desktop running:

```bash
docker run --rm -v "C:\Users\adama\Documents\GitHub\tetrisFlipV1:/project" -w /project electronuserland/builder:latest /bin/bash -lc "npm ci && npm run build:renderer && npx electron-builder --linux"
```

The AppImage is produced in `release/`.

## Release Checklist

- Bump version if needed (`npm version X.Y.Z --no-git-tag-version`).
- Build Windows installer: `npm run dist`.
- Build Linux AppImage via Docker (command above).
- Upload `release/Tetris Flip Setup X.Y.Z.exe`, `release/Tetris Flip Setup X.Y.Z.exe.blockmap`, `release/latest.yml`, `release/latest-linux.yml`, and `release/Tetris Flip-X.Y.Z.AppImage` to the GitHub release.
- Update release notes with download links and screenshot if desired.
