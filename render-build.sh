#!/usr/bin/env bash
set -e

echo "=== Installing frontend ==="
cd frontend
npm install --include=dev
echo "vite: $(ls node_modules/vite 2>/dev/null && echo YES || echo NO)"
node node_modules/vite/bin/vite.js build
cd ..

echo "=== Installing admin ==="
cd admin
npm install --include=dev
node node_modules/vite/bin/vite.js build
cd ..

echo "=== Installing backend ==="
cd backend
npm install --include=dev
cd ..

echo "=== Done ==="
