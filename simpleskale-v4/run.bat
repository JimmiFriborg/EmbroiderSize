@echo off
REM SimpleSkale 4.0 - Run Application
REM Version: 1.1.0
REM Last Updated: 2025-11-16
REM This starts the SimpleSkale development server

echo ========================================
echo SimpleSkale 4.0 - Starting Application
echo Version 1.1.0
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please run install.bat first to install all prerequisites.
    echo.
    pause
    exit /b 1
)

REM Check if Rust/Cargo is installed
where cargo >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Rust is not installed!
    echo.
    echo Please run install.bat first to install all prerequisites.
    echo.
    pause
    exit /b 1
)

REM Check if npm packages are installed
if not exist "node_modules\" (
    echo Installing npm packages...
    call npm install
    echo.
)

echo Starting SimpleSkale 4.0...
echo.
echo First-time compilation will take 2-5 minutes.
echo Please be patient...
echo.
echo A window will open when ready!
echo.

REM Run the Tauri dev server
call npm run tauri dev

REM If the command fails
if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Failed to start SimpleSkale
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Did you run install.bat first?
    echo 2. Did you restart your computer after install.bat?
    echo 3. Check ERROR_FIXES.md for solutions
    echo.
    pause
    exit /b 1
)
