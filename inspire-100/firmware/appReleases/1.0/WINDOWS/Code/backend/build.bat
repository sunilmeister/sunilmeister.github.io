@echo off
REM TekMedika Firmware Updater Backend Build Script
REM This script builds and prepares the backend for deployment

echo ================================
echo TekMedika Backend Build Script
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo npm version:
npm --version

echo.
echo Step 1: Cleaning previous builds...
if exist node_modules (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

echo.
echo Step 2: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Running security audit...
npm audit --audit-level moderate
if %errorlevel% neq 0 (
    echo WARNING: Security vulnerabilities found. Run 'npm audit fix' to attempt fixes.
)

echo.
echo Step 4: Checking environment configuration...
if not exist .env (
    if exist .env.example (
        echo Copying .env.example to .env...
        copy .env.example .env
        echo WARNING: Please update .env file with your actual configuration
    ) else (
        echo WARNING: No .env file found. Please create one with your configuration.
    )
) else (
    echo .env file exists.
)

echo.
echo Step 5: Testing application startup...
echo Starting server in test mode...
timeout /t 2 /nobreak >nul
npm run test-start
if %errorlevel% neq 0 (
    echo ERROR: Application failed to start properly
    pause
    exit /b 1
)

echo.
echo Step 6: Creating build directory...
if not exist build (
    mkdir build
)

echo.
echo Step 7: Copying production files...
xcopy /y app.js build\
xcopy /y package.json build\
xcopy /y .env build\
xcopy /s /y views build\views\

echo.
echo ================================
echo Build completed successfully!
echo ================================
echo.
echo Production files are in the 'build' directory
echo To start the production server:
echo   cd build
echo   npm install --production
echo   npm start
echo.
echo To start development server:
echo   npm run dev
echo.
pause
