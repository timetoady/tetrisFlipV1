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

Clean container build (recommended, avoids touching host node_modules):

```bash
docker run --rm -v "C:\Users\adama\Documents\GitHub\tetrisFlipV1:/project" -w /tmp/build electronuserland/builder:latest /bin/bash -lc "mkdir -p /tmp/build && cd /project && tar --exclude=node_modules --exclude=dist --exclude=release -cf - . | (cd /tmp/build && tar -xf -) && cd /tmp/build && npm ci && npm run build:renderer && npx electron-builder --linux && mkdir -p /project/release && cp -R /tmp/build/release/* /project/release/"
```

The AppImage is produced in `release/`.

## Release Checklist

- Bump version if needed (`npm version X.Y.Z --no-git-tag-version`).
- Build Windows installer: `npm run dist`.
- Build Linux AppImage via Docker (command above).
- Upload `release/Tetris Flip Setup X.Y.Z.exe`, `release/Tetris Flip Setup X.Y.Z.exe.blockmap`, `release/latest.yml`, `release/latest-linux.yml`, and `release/Tetris Flip-X.Y.Z.AppImage` to the GitHub release.
- Update release notes with download links and screenshot if desired.

## Full Release Process

1) Commit changes and bump version (package.json, package-lock.json, README.md).
2) Build Windows installer: `npm run dist` (creates `release/` artifacts).
3) Build Linux AppImage (Docker clean build recommended).
4) Web deploy:
   - Build web output: `npm run build` (or reuse the `dist/` from `npm run dist`).
   - Deploy to S3: `.\scripts\deploy-aws.ps1 -Bucket game.adamandreason.com -DistributionId YOUR_DIST_ID`
5) Upload release artifacts to GitHub release.

### CloudFront distribution ID (private)

Keep the distribution ID out of the repo by setting an environment variable:

```powershell
# One-time (current user)
[Environment]::SetEnvironmentVariable("CLOUDFRONT_DISTRIBUTION_ID", "YOUR_DIST_ID", "User")

# Current session only
$env:CLOUDFRONT_DISTRIBUTION_ID = "YOUR_DIST_ID"
```

Then `scripts/deploy-aws.ps1` will pick it up automatically.

## Release Script (Automated)

Use the release script to run builds + deploy with clear step failures:

```powershell
.\scripts\release.ps1 -Bucket game.adamandreason.com
```

Options:

- `-SkipWindowsBuild`
- `-SkipLinuxBuild`
- `-SkipWebDeploy`
- `-AllowDirty`
