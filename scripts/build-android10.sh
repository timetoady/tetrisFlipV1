#!/bin/bash

# Build, sync, and optionally deploy Android 10 build
# Usage: ./scripts/build-android10.sh [--no-install]
#   --no-install, -n : Skip the install step

INSTALL=true

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-install|-n)
      INSTALL=false
      shift
      ;;
    -h|--help)
      echo "Usage: ./scripts/build-android10.sh [--no-install]"
      echo ""
      echo "Runs: npm run build → npx cap sync android → npm run android:android10:debug → [npm run android:android10:install]"
      echo ""
      echo "Options:"
      echo "  --no-install, -n   Skip the install step"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Error: Unknown option '$1'"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Exit on first error
set -e

echo "=== Step 1: Building Vite project ==="
npm run build || { echo "✗ Build failed"; exit 1; }
echo "✓ Build complete"
echo ""

echo "=== Step 2: Syncing to Android ==="
npx cap sync android || { echo "✗ Sync failed"; exit 1; }
echo "✓ Sync complete"
echo ""

echo "=== Step 3: Building Android 10 APK ==="
npm run android:android10:debug || { echo "✗ APK build failed"; exit 1; }
echo "✓ APK build complete"
echo ""

if [ "$INSTALL" = true ]; then
  echo "=== Step 4: Installing APK ==="
  npm run android:android10:install || { echo "✗ Installation failed"; exit 1; }
  echo "✓ Installation complete"
  echo ""
else
  echo "ℹ Skipping install step (--no-install flag set)"
  echo ""
fi

echo "✓ All steps completed successfully!"
