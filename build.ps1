# Install backend dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build backend
npm run build

# Install frontend dependencies and build
Set-Location frontend
npm install
npm run build

# Move frontend build to backend dist folder
Set-Location ..
New-Item -ItemType Directory -Force -Path "dist/frontend"
Copy-Item -Path "frontend/dist/*" -Destination "dist/frontend/" -Recurse -Force

Write-Host "Build completed successfully!" -ForegroundColor Green