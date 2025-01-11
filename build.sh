#!/bin/bash

# Cleanup
sh cleanup.sh

# Check if node_modules exists to skip npm install
if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing dependencies..."
  npm install
else
  echo "node_modules already exists. Skipping npm install."
fi

# Build
npx tsc -p .

# Copy resources to dist folder
cp -r resources dist/
cp -r src/public dist/src/

# Install pm2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing pm2"
  npm install pm2 -g
else
  echo "pm2 is already installed. Skipping installation."
fi

# Start service
echo "Starting service"
pm2 stop all
pm2 delete all
pm2 start dist/src/app.js --name dispenser