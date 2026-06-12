#!/usr/bin/env bash
set -e

echo "=== Installing frontend dependencies ==="
cd frontend
npm install --legacy-peer-deps
echo "vite exists: $(ls node_modules/vite/bin/vite.js 2>/dev/null && echo YES || echo NO)"
node node_modules/vite/bin/vite.js build
cd ..

echo "=== Installing admin dependencies ==="
cd admin
npm install --legacy-peer-deps
node node_modules/vite/bin/vite.js build
cd ..

echo "=== Installing backend dependencies ==="
cd backend
npm install
cd ..

echo "=== Build complete ==="
