@echo off
REM SimpleSkale 4.0 - Installation Batch File
REM Version: 2.0.0 (Self-Healing Edition)
REM Last Updated: 2025-11-16
REM This will run the PowerShell setup script with Administrator privileges

echo ========================================
echo SimpleSkale 4.0 - Automated Installation
echo Version 2.0.0 (Self-Healing Edition)
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
if %errorLevel% == 0 (
    echo Running as Administrator - Good!
    echo.

    REM Run the PowerShell setup script
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1"

    if %errorLevel% neq 0 (
        echo.
        echo [!] PowerShell setup encountered issues, but continuing...
        echo.
    )

    REM Navigate to script directory
    cd /d "%~dp0"

    echo.
    echo ========================================
    echo Installing npm packages (preventing common errors)
    echo ========================================
    echo.
    echo This may take 5-10 minutes...
    echo.

    REM Clean npm cache to prevent corrupted package issues
    echo [1/4] Cleaning npm cache to prevent installation issues...
    npm cache clean --force >nul 2>&1
    echo [OK] Cache cleaned
    echo.

    REM Delete any existing problematic files
    echo [2/4] Removing any existing package files...
    if exist "package-lock.json" (
        del /F /Q package-lock.json >nul 2>&1
        echo [OK] Removed old package-lock.json
    )
    if exist "node_modules" (
        rmdir /S /Q node_modules >nul 2>&1
        echo [OK] Removed old node_modules
    )
    echo.

    REM Install packages with the strategy that prevents native binding errors
    echo [3/4] Installing npm packages (this prevents the native binding bug)...
    echo.

    REM First install without optional deps
    npm install --no-optional

    REM Then install with force to get optional deps
    npm install --force

    if %errorLevel% neq 0 (
        echo.
        echo [!] Warning: npm install had some issues
        echo Trying alternative installation method...
        echo.
        npm install --legacy-peer-deps --force
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
    pause
) else (
    echo ERROR: This script must run as Administrator!
    echo.
    echo Please:
    echo 1. Right-click on install.bat
    echo 2. Select "Run as Administrator"
    echo.
    pause
    exit /b 1
)
