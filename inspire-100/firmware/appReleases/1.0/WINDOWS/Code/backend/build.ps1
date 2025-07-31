# TekMedika Firmware Updater Backend Build Script (PowerShell)
# This script builds and prepares the backend for deployment

Write-Host "================================" -ForegroundColor Green
Write-Host "TekMedika Backend Build Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing existing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json"
}

if (Test-Path "build") {
    Write-Host "Removing existing build directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "build"
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 3: Running security audit..." -ForegroundColor Yellow
try {
    npm audit --audit-level moderate
}
catch {
    Write-Host "WARNING: Security vulnerabilities found. Run 'npm audit fix' to attempt fixes." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Copying .env.example to .env..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "WARNING: Please update .env file with your actual configuration" -ForegroundColor Yellow
    }
    else {
        Write-Host "WARNING: No .env file found. Please create one with your configuration." -ForegroundColor Yellow
    }
}
else {
    Write-Host ".env file exists." -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 5: Running build script..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Build script completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Build script failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Production files are in the 'build' directory" -ForegroundColor Cyan
Write-Host "To start the production server:" -ForegroundColor Cyan
Write-Host "  cd build" -ForegroundColor White
Write-Host "  npm install --production" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "To start development server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
