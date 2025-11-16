@echo off
REM SimpleSkale 4.0 - Installation Batch File
REM Version: 1.2.0
REM Last Updated: 2025-11-16
REM This will run the PowerShell setup script with Administrator privileges

echo ========================================
echo SimpleSkale 4.0 - Automated Installation
echo Version 1.2.0 (Fixed PowerShell Syntax)
echo ========================================
echo.
echo This will install all prerequisites:
echo - Rust
echo - Visual Studio Build Tools (6GB)
echo - Node.js
echo - WebView2
echo - npm packages
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

    echo.
    echo ========================================
    echo Installation Complete!
    echo ========================================
    echo.
    echo IMPORTANT: You MUST restart your computer now!
    echo.
    echo After restart:
    echo 1. Double-click run.bat to start SimpleSkale
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
