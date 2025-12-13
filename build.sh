#!/bin/bash

# Install backend dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build backend
npm run build

# Install frontend dependencies and build
cd frontend
npm install
npm run build

# Move frontend build to backend dist folder
cd ..
mkdir -p dist/frontend
cp -r frontend/dist/* dist/frontend/

echo "Build completed successfully!"