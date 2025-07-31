#!/bin/bash

# TekMedika Firmware Updater Backend Build Script
# This script builds and prepares the backend for deployment

echo "================================"
echo "TekMedika Backend Build Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    exit 1
fi

echo "npm version:"
npm --version

echo ""
echo "Step 1: Cleaning previous builds..."
if [ -d "node_modules" ]; then
    echo "Removing existing node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "Removing package-lock.json..."
    rm package-lock.json
fi

echo ""
echo "Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Step 3: Running security audit..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    echo "WARNING: Security vulnerabilities found. Run 'npm audit fix' to attempt fixes."
fi

echo ""
echo "Step 4: Checking environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Copying .env.example to .env..."
        cp .env.example .env
        echo "WARNING: Please update .env file with your actual configuration"
    else
        echo "WARNING: No .env file found. Please create one with your configuration."
    fi
else
    echo ".env file exists."
fi

echo ""
echo "Step 5: Testing application startup..."
echo "Starting server in test mode..."
sleep 2
npm run test-start
if [ $? -ne 0 ]; then
    echo "ERROR: Application failed to start properly"
    exit 1
fi

echo ""
echo "Step 6: Creating build directory..."
mkdir -p build

echo ""
echo "Step 7: Copying production files..."
cp app.js build/
cp package.json build/
cp .env build/
cp -r views build/

echo ""
echo "================================"
echo "Build completed successfully!"
echo "================================"
echo ""
echo "Production files are in the 'build' directory"
echo "To start the production server:"
echo "  cd build"
echo "  npm install --production"
echo "  npm start"
echo ""
echo "To start development server:"
echo "  npm run dev"
echo ""
