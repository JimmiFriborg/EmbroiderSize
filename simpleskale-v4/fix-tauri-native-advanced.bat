@echo off
REM SimpleSkale 4.0 - Advanced Tauri Native Binding Fix
REM Version: 2.0.0
REM Last Updated: 2025-11-16
REM This script uses multiple strategies to fix the native binding error

echo ========================================
echo SimpleSkale 4.0 - Advanced Fix Script
echo Version 2.0.0
echo ========================================
echo.
echo This advanced fix script will:
echo 1. Clean npm cache completely
echo 2. Remove package-lock.json and node_modules
echo 3. Try multiple installation strategies
echo 4. Explicitly install platform-specific packages
echo 5. Verify the installation
echo.
echo This will take 5-10 minutes...
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM Navigate to the script directory
cd /d "%~dp0"

echo.
echo ========================================
echo Step 1/6: Cleaning npm cache
echo ========================================
echo.
echo This removes any corrupted cached packages...
echo (This may take 1-2 minutes)
echo.

npm cache clean --force

if %errorlevel% neq 0 (
    echo [!] Warning: Cache clean had issues, continuing anyway...
) else (
    echo [OK] npm cache cleaned successfully
)

echo.
echo ========================================
echo Step 2/6: Verifying cache is empty
echo ========================================
echo.

npm cache verify

echo.
echo ========================================
echo Step 3/6: Removing old files
echo ========================================
echo.

REM Delete package-lock.json
if exist package-lock.json (
    echo [1/2] Deleting package-lock.json...
    del /F /Q package-lock.json
    if exist package-lock.json (
        echo [X] Failed to delete package-lock.json
        echo Try running as administrator
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
        echo Try closing all programs and running as administrator
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
echo Step 4/6: Installing dependencies (Strategy 1)
echo ========================================
echo.
echo Using: npm install --no-optional
echo This installs without optional deps first...
echo.

npm install --no-optional

if %errorlevel% neq 0 (
    echo [X] Strategy 1 failed, trying Strategy 2...
    echo.
    goto strategy2
)

echo [OK] Base packages installed
echo.

:strategy2
echo ========================================
echo Step 5/6: Installing optional dependencies (Strategy 2)
echo ========================================
echo.
echo Now installing optional dependencies separately...
echo This works around the npm bug.
echo.

REM Try to install optional dependencies explicitly
npm install --force

if %errorlevel% neq 0 (
    echo [!] Warning: Force install had issues, trying Strategy 3...
    echo.
    goto strategy3
)

echo [OK] Optional dependencies installed
echo.
goto verify

:strategy3
echo ========================================
echo Step 5/6 Alternative: Manual platform package install (Strategy 3)
echo ========================================
echo.
echo Explicitly installing Windows platform package...
echo.

REM Try to explicitly install the platform-specific package
npm install @tauri-apps/cli-win32-x64-msvc --force --no-save

if %errorlevel% neq 0 (
    echo [!] Warning: Platform package install failed
    echo This might still work if the binding was installed by previous steps
    echo.
)

:verify
echo.
echo ========================================
echo Step 6/6: Verifying installation
echo ========================================
echo.

REM Check Node.js version
echo Checking Node.js version...
node --version
echo.

REM Check npm version
echo Checking npm version...
npm --version
echo.

REM List installed Tauri packages
echo Checking installed Tauri packages...
npm list @tauri-apps/cli 2>nul
echo.

REM Check if the critical files exist
echo Verifying native bindings...
echo.

set "BINDING_FOUND=0"

REM Check for the .node file
if exist "node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node" (
    echo [OK] Native binding file found!
    echo     Location: node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node
    set "BINDING_FOUND=1"
) else (
    echo [!] Native binding file NOT found
    echo     Expected: node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node
)

echo.

REM Check for the platform package
if exist "node_modules\@tauri-apps\cli-win32-x64-msvc" (
    echo [OK] Platform package found!
    echo     Location: node_modules\@tauri-apps\cli-win32-x64-msvc
    set "BINDING_FOUND=1"
) else (
    echo [!] Platform package NOT found
    echo     Expected: node_modules\@tauri-apps\cli-win32-x64-msvc
)

echo.

REM Check if Tauri CLI itself exists
if exist "node_modules\@tauri-apps\cli\index.js" (
    echo [OK] Tauri CLI core files found
    echo     Location: node_modules\@tauri-apps\cli\
) else (
    echo [X] Tauri CLI core files NOT found!
    echo     This is a critical error.
)

echo.
echo ========================================
echo Installation Summary
echo ========================================
echo.

if "%BINDING_FOUND%"=="1" (
    echo [SUCCESS] Native bindings are installed!
    echo.
    echo You should now be able to run SimpleSkale.
    echo.
    echo Next steps:
    echo 1. Double-click run.bat to start SimpleSkale
    echo 2. Wait 2-5 minutes for first-time compilation
    echo 3. The app window will open when ready
    echo.
) else (
    echo [WARNING] Native bindings may not be properly installed
    echo.
    echo This could mean:
    echo 1. Your Node.js version is incompatible
    echo 2. Your Windows version doesn't support these bindings
    echo 3. There's a deeper npm configuration issue
    echo.
    echo Recommended actions:
    echo.
    echo A. Update Node.js:
    echo    - Download from: https://nodejs.org/
    echo    - Install version 20.19.0 or 22.12.0+
    echo    - Restart computer
    echo    - Run this script again
    echo.
    echo B. Check your system:
    echo    - Windows 10/11 64-bit required
    echo    - Must have x64 architecture (not ARM)
    echo.
    echo C. Try running anyway:
    echo    - Sometimes it works despite warnings
    echo    - Double-click run.bat to test
    echo.
)

echo ========================================
echo Script Complete
echo ========================================
echo.
echo Press any key to exit...
pause >nul
