#!/usr/bin/env bash
#
# autosync.sh — automatically commit and push changes to GitHub.
#
# Every INTERVAL seconds it checks for changes; if any exist it stages them,
# makes a timestamped commit, and pushes to the current branch's remote.
#
# Usage:
#   npm run autosync            # checks every 15s (default)
#   npm run autosync -- 30      # checks every 30s
#   bash scripts/autosync.sh 10 # checks every 10s
#
# Requirements:
#   - A git remote named 'origin' must be configured.
#   - You must have pushed successfully at least once so your credentials are
#     cached (macOS Keychain). Otherwise the push will fail silently.
#
# Stop it any time with Ctrl+C.

set -uo pipefail

# Move to the repo root (this script lives in <repo>/scripts).
cd "$(dirname "$0")/.."

INTERVAL="${1:-15}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository." >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "Auto-sync started on branch '${BRANCH}'."
echo "Checking for changes every ${INTERVAL}s. Press Ctrl+C to stop."

while true; do
  if [[ -n "$(git status --porcelain)" ]]; then
    git add -A
    if git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1; then
      if git push >/dev/null 2>&1; then
        echo "[$(date '+%H:%M:%S')] Committed and pushed changes."
      else
        echo "[$(date '+%H:%M:%S')] Committed locally, but push failed (check auth/network)."
      fi
    fi
  fi
  sleep "${INTERVAL}"
done
