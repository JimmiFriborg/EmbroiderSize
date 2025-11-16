@echo off
REM SimpleSkale 4.0 - Fix Tauri Native Binding Error
REM Version: 1.0.0
REM Last Updated: 2025-11-16
REM This script fixes the "Cannot find native binding" error

echo ========================================
echo SimpleSkale 4.0 - Fix Tauri Bindings
echo Version 1.0.0
echo ========================================
echo.
echo This will fix the error:
echo "Cannot find native binding"
echo "Cannot find module './cli.win32-x64-msvc.node'"
echo.
echo What this script does:
echo 1. Deletes package-lock.json
echo 2. Deletes node_modules folder
echo 3. Reinstalls npm dependencies
echo.
echo This will take 2-5 minutes...
echo.
echo Press any key to continue...
pause >nul

REM Navigate to the script directory
cd /d "%~dp0"

echo.
echo ========================================
echo Step 1: Cleaning up old files
echo ========================================
echo.

REM Delete package-lock.json
if exist package-lock.json (
    echo [1/2] Deleting package-lock.json...
    del /F /Q package-lock.json
    if exist package-lock.json (
        echo [X] Failed to delete package-lock.json
        pause
        exit /b 1
    ) else (
        echo [OK] package-lock.json deleted
    )
) else (
    echo [OK] package-lock.json not found (already deleted)
)

echo.

REM Delete node_modules folder
if exist node_modules (
    echo [2/2] Deleting node_modules folder...
    echo (This may take 30-60 seconds...)
    rmdir /S /Q node_modules
    if exist node_modules (
        echo [X] Failed to delete node_modules folder
        echo Try closing any programs that might be using files in node_modules
        pause
        exit /b 1
    ) else (
        echo [OK] node_modules folder deleted
    )
) else (
    echo [OK] node_modules not found (already deleted)
)

echo.
echo ========================================
echo Step 2: Reinstalling npm dependencies
echo ========================================
echo.
echo This will take 2-5 minutes...
echo Installing packages and Tauri native bindings...
echo.

REM Run npm install with force flag to ensure optional dependencies are installed
npm install --force

if %errorlevel% neq 0 (
    echo.
    echo [X] npm install failed
    echo.
    echo Please check:
    echo 1. Do you have an internet connection?
    echo 2. Is npm installed? (run: npm --version)
    echo 3. Are you in the correct directory?
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] npm dependencies installed successfully

echo.
echo ========================================
echo Step 3: Verifying Tauri bindings
echo ========================================
echo.

REM Check if the Tauri native binding exists
if exist "node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node" (
    echo [OK] Tauri native binding found!
    echo File: node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node
) else (
    if exist "node_modules\@tauri-apps\cli-win32-x64-msvc" (
        echo [OK] Tauri native binding package found!
        echo Package: @tauri-apps/cli-win32-x64-msvc
    ) else (
        echo [!] Warning: Tauri native binding not found
        echo This might still work, but if you get errors, try:
        echo 1. Update Node.js to v20.19.0 or higher
        echo 2. Run this script again
    )
)

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo What to do next:
echo 1. Double-click run.bat to start SimpleSkale
echo 2. If you still get errors, try:
echo    - Update Node.js to v20.19.0 or v22.12.0+
echo    - Run this script again
echo    - Check ERROR_FIXES.md for more solutions
echo.
echo Press any key to exit...
pause >nul
