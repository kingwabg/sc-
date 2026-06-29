#!/bin/sh
# Setup git hooks for this project.
# Run once after cloning: `sh scripts/setup-hooks.sh`

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.githooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "[setup-hooks] .githooks folder not found"
  exit 1
fi

# Ensure all hook files are executable
chmod +x "$HOOKS_DIR"/* 2>/dev/null || true

# Point git to our hooks folder
git config core.hooksPath "$HOOKS_DIR"
echo "[setup-hooks] core.hooksPath → $HOOKS_DIR"

# Show what hooks are active
echo "[setup-hooks] active hooks:"
for h in "$HOOKS_DIR"/*; do
  if [ -f "$h" ] && [ -x "$h" ]; then
    echo "  ✓ $(basename "$h")"
  fi
done