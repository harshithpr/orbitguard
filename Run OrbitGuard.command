#!/bin/zsh
set -e

cd "$(dirname "$0")"

PORT="${PORT:-4173}"
URL="http://localhost:${PORT}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run OrbitGuard."
  echo "Install it from https://nodejs.org/en, then run this file again."
  read "?Press Return to close this window."
  exit 1
fi

if curl -fsS "${URL}/api/v1/health" >/dev/null 2>&1; then
  echo "OrbitGuard is already running at ${URL}"
  open "${URL}"
  read "?Press Return to close this window."
  exit 0
fi

echo "Starting OrbitGuard..."
echo "Website: ${URL}"
echo
open "${URL}" >/dev/null 2>&1 || true
node server.mjs
