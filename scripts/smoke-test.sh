#!/usr/bin/env bash
# Smoke test: build the app, serve the production bundle, and check it responds
# with the app shell and the built JS. Usage: ./scripts/smoke-test.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build >/dev/null
PORT="${PORT:-4173}"
(npm run preview -- --port "$PORT" --strictPort >/tmp/docnest-smoke.log 2>&1 &)
trap 'fuser -k "$PORT/tcp" 2>/dev/null || true' EXIT
sleep 4

HTML="$(curl -fsS "http://localhost:$PORT/")"
echo "$HTML" | grep -q 'id="root"' || { echo "FAIL: no #root in index.html"; exit 1; }
echo "$HTML" | grep -q 'assets/index-.*\.js' || { echo "FAIL: no JS bundle referenced"; exit 1; }
BUNDLE="$(echo "$HTML" | grep -o 'assets/index-[^"]*\.js' | head -1)"
curl -fsS "http://localhost:$PORT/$BUNDLE" | grep -q 'DocNest' || { echo "FAIL: bundle does not contain the app"; exit 1; }
echo "SMOKE OK: preview serves the app shell and bundle on :$PORT"
