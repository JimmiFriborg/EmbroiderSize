@echo off
REM SimpleSkale 4.0 - Installation Batch File
REM Version: 2.0.1 (Fixed Silent Failures)
REM Last Updated: 2025-11-16
REM This will run the PowerShell setup script with Administrator privileges

echo ========================================
echo SimpleSkale 4.0 - Automated Installation
echo Version 2.0.1 (Fixed Silent Failures)
echo ========================================
echo.
echo This will install all prerequisites:
echo - Rust
echo - Visual Studio Build Tools (6GB)
echo - Node.js
echo - WebView2
echo - npm packages (with automatic error prevention)
echo.
echo Installation time: 20-40 minutes
echo.
echo Press any key to start installation...
pause >nul

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Not Running as Administrator!
    echo ========================================
    echo.
    echo This script MUST run as Administrator!
    echo.
    echo Please:
    echo 1. Right-click on install.bat
    echo 2. Select "Run as Administrator"
    echo 3. Click "Yes" when prompted
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Running as Administrator - Good!
echo.

REM Navigate to script directory
cd /d "%~dp0"

REM Run the PowerShell setup script
echo Running PowerShell setup to install prerequisites...
echo This will install: Rust, Node.js, Visual Studio Build Tools, WebView2
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1"

if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo WARNING: PowerShell setup had issues
    echo ========================================
    echo.
    echo The setup script encountered problems.
    echo This might mean some prerequisites failed to install.
    echo.
    echo Continuing anyway to attempt npm package installation...
    echo.
    pause
)

echo.
echo ========================================
echo Installing npm packages (preventing common errors)
echo ========================================
echo.

REM Check if Node.js/npm is available
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: npm is not available!
    echo ========================================
    echo.
    echo npm (Node.js) doesn't seem to be installed or accessible.
    echo.
    echo This usually means:
    echo 1. The PowerShell setup script failed to install Node.js
    echo 2. You haven't restarted after a previous installation attempt
    echo 3. Node.js is installed but not in PATH
    echo.
    echo What to do:
    echo 1. Close this window
    echo 2. Restart your computer
    echo 3. Try running install.bat again
    echo.
    echo If that doesn't work:
    echo 1. Manually install Node.js from https://nodejs.org/
    echo 2. Restart your computer
    echo 3. Run install.bat again
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [OK] npm is available
echo.
echo This may take 5-10 minutes...
echo.

REM Clean npm cache to prevent corrupted package issues
echo [1/4] Cleaning npm cache to prevent installation issues...
npm cache clean --force
if %errorLevel% neq 0 (
    echo [!] Warning: Cache clean had issues
    echo Continuing anyway...
) else (
    echo [OK] Cache cleaned
)
echo.

REM Delete any existing problematic files
echo [2/4] Removing any existing package files...
if exist "package-lock.json" (
    del /F /Q package-lock.json
    if %errorLevel% neq 0 (
        echo [!] Warning: Could not delete package-lock.json
    ) else (
        echo [OK] Removed old package-lock.json
    )
)
if exist "node_modules" (
    echo Removing node_modules folder (this may take 30-60 seconds)...
    rmdir /S /Q node_modules
    if %errorLevel% neq 0 (
        echo [!] Warning: Could not fully delete node_modules
    ) else (
        echo [OK] Removed old node_modules
    )
)
echo.

REM Install packages with the strategy that prevents native binding errors
echo [3/4] Installing npm packages (this prevents the native binding bug)...
echo.
echo Step 1: Installing base packages...
npm install --no-optional

if %errorLevel% neq 0 (
    echo.
    echo [!] Warning: Base package installation had issues
    echo Continuing to step 2 anyway...
    echo.
)

echo.
echo Step 2: Installing optional dependencies (including Tauri)...
npm install --force

if %errorLevel% neq 0 (
    echo.
    echo [!] Warning: npm install had some issues
    echo Trying alternative installation method...
    echo.
    npm install --legacy-peer-deps --force

    if %errorLevel% neq 0 (
        echo.
        echo ========================================
        echo ERROR: npm install failed completely
        echo ========================================
        echo.
        echo This could mean:
        echo 1. Network connection issues
        echo 2. npm registry is down
        echo 3. Disk space issues
        echo 4. Permission problems
        echo.
        echo Try:
        echo 1. Check your internet connection
        echo 2. Restart your computer
        echo 3. Run install.bat again
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)
echo.

REM Verify Tauri bindings are installed
echo [4/4] Verifying Tauri native bindings...
if exist "node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node" (
    echo [OK] Tauri native bindings installed successfully!
) else (
    if exist "node_modules\@tauri-apps\cli-win32-x64-msvc" (
        echo [OK] Tauri native bindings installed successfully!
    ) else (
        echo [!] Warning: Native bindings may not be installed
        echo Don't worry - run.bat will fix this automatically if needed
    )
)
echo.

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo IMPORTANT: You MUST restart your computer now!
echo.
echo After restart:
echo 1. Double-click run.bat to start SimpleSkale
echo 2. run.bat will automatically fix any issues
echo.
echo Press any key to exit...
pause >nul
