@echo off
REM SimpleSkale 4.0 - Run Application (Self-Healing Edition)
REM Version: 2.0.1 (Fixed Silent Failures)
REM Last Updated: 2025-11-16
REM This starts the SimpleSkale development server with automatic error fixing

echo ========================================
echo SimpleSkale 4.0 - Starting Application
echo Version 2.0.1 (Self-Healing)
echo ========================================
echo.

REM Navigate to script directory
cd /d "%~dp0"

REM ========================================
REM Step 1: Check prerequisites
REM ========================================

echo [1/4] Checking prerequisites...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ========================================
    echo ERROR: Node.js is not installed!
    echo ========================================
    echo.
    echo Please run install.bat first to install all prerequisites.
    echo.
    echo Make sure to:
    echo 1. Right-click install.bat
    echo 2. Select "Run as Administrator"
    echo 3. Restart your computer after installation
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)
echo [OK] Node.js is installed
node --version

REM Check if Rust/Cargo is installed
where cargo >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Rust is not installed!
    echo ========================================
    echo.
    echo Please run install.bat first to install all prerequisites.
    echo.
    echo Make sure to:
    echo 1. Right-click install.bat
    echo 2. Select "Run as Administrator"
    echo 3. Restart your computer after installation
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)
echo [OK] Rust is installed
cargo --version
echo.

REM ========================================
REM Step 2: Check and fix npm packages
REM ========================================

echo [2/4] Checking npm packages...
echo.

REM Check if npm packages are installed
if not exist "node_modules\" (
    echo [!] node_modules not found, installing packages...
    echo This may take 2-5 minutes...
    echo.

    echo Cleaning npm cache...
    call npm cache clean --force
    if %errorLevel% neq 0 (
        echo [!] Warning: Cache clean had issues, continuing...
    )

    echo Installing base packages...
    call npm install --no-optional
    if %errorLevel% neq 0 (
        echo [!] Warning: Base install had issues
    )

    echo Installing optional dependencies...
    call npm install --force
    if %errorLevel% neq 0 (
        echo.
        echo ========================================
        echo ERROR: npm install failed
        echo ========================================
        echo.
        echo This could mean:
        echo 1. Network connection issues
        echo 2. Corrupted npm cache
        echo 3. Disk space issues
        echo.
        echo Try:
        echo 1. Check your internet connection
        echo 2. Run install.bat again
        echo 3. Restart your computer
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo.
) else (
    echo [OK] node_modules exists
)
echo.

REM ========================================
REM Step 3: Verify Tauri native bindings
REM ========================================

echo [3/4] Verifying Tauri native bindings...
echo.

set "BINDING_OK=0"

if exist "node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node" (
    echo [OK] Native bindings found!
    set "BINDING_OK=1"
) else (
    if exist "node_modules\@tauri-apps\cli-win32-x64-msvc" (
        echo [OK] Native bindings found!
        set "BINDING_OK=1"
    )
)

if "%BINDING_OK%"=="0" (
    echo [!] Native bindings are missing - fixing automatically...
    echo.
    echo This is a known npm bug - fixing it now...
    echo This will take 2-5 minutes...
    echo.

    REM Clean and reinstall to fix the binding issue
    echo Cleaning npm cache...
    call npm cache clean --force
    if %errorLevel% neq 0 (
        echo [!] Warning: Cache clean had issues
    )

    echo Removing old package files...
    if exist "package-lock.json" del /F /Q package-lock.json
    if exist "node_modules" (
        echo This will take 30-60 seconds...
        rmdir /S /Q node_modules
    )

    echo Reinstalling packages...
    echo.
    call npm install --no-optional
    call npm install --force

    if %errorLevel% neq 0 (
        echo.
        echo [!] Still having issues, trying alternative method...
        call npm install --legacy-peer-deps --force

        if %errorLevel% neq 0 (
            echo.
            echo ========================================
            echo ERROR: Could not fix native bindings
            echo ========================================
            echo.
            echo The automatic fix failed.
            echo.
            echo Try:
            echo 1. Update Node.js to v20.19.0+ or v22.12.0+
            echo    Download: https://nodejs.org/
            echo 2. Restart your computer
            echo 3. Run install.bat again
            echo 4. Then run this script again
            echo.
            echo For detailed help: TAURI_NATIVE_BINDING_GUIDE.md
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    )

    echo.
    echo [OK] Fix complete!
    echo.
)

REM ========================================
REM Step 4: Start SimpleSkale
REM ========================================

echo [4/4] Starting SimpleSkale...
echo.
echo First-time compilation will take 2-5 minutes.
echo Please be patient...
echo.
echo A window will open when ready!
echo.
echo ----------------------------------------
echo.

REM Create a temporary file to capture error output
set "TEMP_ERROR=%TEMP%\simpleskale_error.txt"

REM Run the Tauri dev server and capture errors
call npm run tauri dev 2>"%TEMP_ERROR%"

REM If the command fails, check if it's the native binding error
if %errorLevel% neq 0 (
    REM Check if it's the native binding error
    findstr /C:"Cannot find native binding" "%TEMP_ERROR%" >nul
    if %errorLevel% equ 0 (
        echo.
        echo ========================================
        echo Auto-Fixing Native Binding Error
        echo ========================================
        echo.
        echo Detected the native binding error - fixing automatically...
        echo This will take 2-5 minutes...
        echo.

        REM Apply the fix
        call npm cache clean --force
        if exist "package-lock.json" del /F /Q package-lock.json
        if exist "node_modules" (
            echo Removing node_modules...
            rmdir /S /Q node_modules
        )

        echo Reinstalling packages with fix...
        call npm install --no-optional
        call npm install --force

        if %errorLevel% neq 0 (
            call npm install --legacy-peer-deps --force
        )

        echo.
        echo [OK] Fix applied! Restarting SimpleSkale...
        echo.

        REM Try running again
        call npm run tauri dev

        if %errorLevel% neq 0 (
            echo.
            echo ========================================
            echo Still Having Issues
            echo ========================================
            echo.
            echo The automatic fix didn't resolve the issue.
            echo.
            echo This might help:
            echo 1. Update Node.js to v20.19.0 or v22.12.0+
            echo    Download: https://nodejs.org/
            echo 2. Restart your computer
            echo 3. Run this script again
            echo.
            echo For detailed help, see: TAURI_NATIVE_BINDING_GUIDE.md
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    ) else (
        REM Different error - show the error and suggest solutions
        echo.
        echo ========================================
        echo ERROR: Failed to start SimpleSkale
        echo ========================================
        echo.
        echo Error details:
        type "%TEMP_ERROR%"
        echo.
        echo ----------------------------------------
        echo.
        echo Common issues:
        echo 1. Did you run install.bat first?
        echo 2. Did you restart your computer after install.bat?
        echo 3. Is Visual Studio C++ Build Tools installed?
        echo.
        echo For solutions, check:
        echo - ERROR_FIXES.md (for common errors)
        echo - TAURI_NATIVE_BINDING_GUIDE.md (for binding errors)
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

REM Clean up temp file
if exist "%TEMP_ERROR%" del "%TEMP_ERROR%"

REM If we got here, SimpleSkale is running!
echo.
echo ========================================
echo SimpleSkale is now running!
echo ========================================
echo.
echo Keep this window open while using SimpleSkale.
echo Close the window or press Ctrl+C to stop.
echo.
