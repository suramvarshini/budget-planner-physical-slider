#!/usr/bin/env bash
# Render Build Script
# Installs dependencies for both backend and frontend, then builds the frontend.

set -e

echo "=== Installing backend dependencies ==="
cd backend
npm ci --omit=dev
cd ..

echo "=== Installing frontend dependencies ==="
cd frontend
npm ci
echo "=== Building frontend ==="
npm run build
cd ..

echo "=== Seeding database ==="
cd backend
node src/db/seed.js
cd ..

echo "=== Build complete ==="
