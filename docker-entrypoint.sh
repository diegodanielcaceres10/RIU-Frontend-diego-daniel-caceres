#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e
echo "Starting RIU frontend..."

if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing dependencies..."
  npm ci
elif ! node -e "require('@rollup/rollup-linux-x64-gnu')" >/dev/null 2>&1; then
  echo "node_modules is incomplete or incompatible. Reinstalling dependencies..."
  npm ci
fi

exec npm start
