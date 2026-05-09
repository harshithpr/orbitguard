#!/bin/zsh
set -e

cd "$(dirname "$0")"

echo "Publishing OrbitGuard to GitHub..."
echo "Repository: https://github.com/harshithpr/orbitguard"
echo

git remote remove origin >/dev/null 2>&1 || true
git remote add origin https://github.com/harshithpr/orbitguard.git
git branch -M main

echo "Pushing the local OrbitGuard code to GitHub."
echo "If GitHub asks for a username, use: harshithpr"
echo "If it asks for a password, use a GitHub Personal Access Token, not your normal GitHub password."
echo

git push -u origin main

echo
echo "Done. Open https://github.com/harshithpr/orbitguard to see the code."
read "?Press Return to close this window."
