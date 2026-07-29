#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e
echo "Starting RIU frontend..."

if ! node -e "require('@rollup/rollup-linux-x64-gnu')" >/dev/null 2>&1; then
  echo "Installing Linux dependencies..."
  npm ci
fi

exec npm start
