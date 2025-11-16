@echo off
REM SimpleSkale 4.0 - Diagnostic Tool
REM Version: 1.0.0
REM Last Updated: 2025-11-16
REM This script diagnoses Tauri installation issues

echo ========================================
echo SimpleSkale 4.0 - Diagnostic Tool
echo Version 1.0.0
echo ========================================
echo.
echo This script will check your system configuration
echo and help identify why Tauri isn't working.
echo.
echo Press any key to start diagnosis...
pause >nul

REM Navigate to the script directory
cd /d "%~dp0"

echo.
echo ========================================
echo System Information
echo ========================================
echo.

echo Operating System:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
echo.

echo System Architecture:
wmic os get osarchitecture
echo.

echo ========================================
echo Node.js and npm Versions
echo ========================================
echo.

echo Node.js version:
node --version 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js is NOT installed!
    echo     Download from: https://nodejs.org/
) else (
    echo [OK] Node.js is installed
)
echo.

echo npm version:
npm --version 2>nul
if %errorlevel% neq 0 (
    echo [X] npm is NOT installed!
) else (
    echo [OK] npm is installed
)
echo.

echo ========================================
echo Rust and Cargo Versions
echo ========================================
echo.

echo Rust version:
rustc --version 2>nul
if %errorlevel% neq 0 (
    echo [X] Rust is NOT installed!
    echo     Download from: https://rustup.rs/
) else (
    echo [OK] Rust is installed
)
echo.

echo Cargo version:
cargo --version 2>nul
if %errorlevel% neq 0 (
    echo [X] Cargo is NOT installed!
    echo     Install Rust from: https://rustup.rs/
) else (
    echo [OK] Cargo is installed
)
echo.

echo ========================================
echo Visual Studio C++ Build Tools
echo ========================================
echo.

echo Checking for Visual Studio installations...
where cl.exe >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Visual Studio C++ compiler (cl.exe) NOT found in PATH
    echo     This might cause "linker 'link.exe' not found" errors
    echo.
    echo     Install from:
    echo     https://visualstudio.microsoft.com/downloads/
    echo     Select "Desktop development with C++"
) else (
    echo [OK] Visual Studio C++ compiler found in PATH
)
echo.

echo ========================================
echo Current Directory Check
echo ========================================
echo.

echo Current directory:
cd
echo.

echo Checking for package.json...
if exist "package.json" (
    echo [OK] package.json found
    type package.json
) else (
    echo [X] package.json NOT found!
    echo     You might be in the wrong directory.
    echo     Expected: EmbroiderSize\simpleskale-v4
)
echo.

echo ========================================
echo node_modules Status
echo ========================================
echo.

if exist "node_modules\" (
    echo [OK] node_modules folder exists
    echo.
    echo Checking for @tauri-apps packages...

    if exist "node_modules\@tauri-apps\" (
        echo [OK] @tauri-apps folder exists
        echo.
        echo Contents:
        dir /B "node_modules\@tauri-apps\"
        echo.

        echo Checking for Tauri CLI...
        if exist "node_modules\@tauri-apps\cli\" (
            echo [OK] @tauri-apps/cli folder exists
            echo.

            echo Checking for native bindings...
            echo.

            REM Check for all possible binding files
            if exist "node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node" (
                echo [OK] cli.win32-x64-msvc.node FOUND
            ) else (
                echo [X] cli.win32-x64-msvc.node NOT FOUND
            )

            if exist "node_modules\@tauri-apps\cli-win32-x64-msvc\" (
                echo [OK] cli-win32-x64-msvc package FOUND
                dir /B "node_modules\@tauri-apps\cli-win32-x64-msvc\"
            ) else (
                echo [X] cli-win32-x64-msvc package NOT FOUND
            )

            echo.
            echo All files in @tauri-apps/cli:
            dir /B "node_modules\@tauri-apps\cli\"

        ) else (
            echo [X] @tauri-apps/cli folder NOT found
        )
    ) else (
        echo [X] @tauri-apps folder NOT found
    )
) else (
    echo [X] node_modules folder does NOT exist!
    echo     Run: npm install
)

echo.
echo ========================================
echo npm Configuration
echo ========================================
echo.

echo npm config (relevant settings):
echo.
echo Registry:
npm config get registry
echo.

echo Cache location:
npm config get cache
echo.

echo Node architecture:
node -p "process.arch"
echo.

echo Node platform:
node -p "process.platform"
echo.

echo ========================================
echo Package-lock.json Status
echo ========================================
echo.

if exist "package-lock.json" (
    echo [OK] package-lock.json exists
    echo.
    echo Checking for @tauri-apps/cli in lock file...
    findstr /C:"@tauri-apps/cli" package-lock.json >nul
    if %errorlevel% equ 0 (
        echo [OK] @tauri-apps/cli found in lock file
    ) else (
        echo [!] @tauri-apps/cli NOT found in lock file
    )
) else (
    echo [!] package-lock.json does NOT exist
    echo     This is normal if you just deleted it
)

echo.
echo ========================================
echo Recommended Actions
echo ========================================
echo.

echo Based on this diagnosis:
echo.

REM Check critical requirements
set "ISSUES=0"

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] CRITICAL: Install Node.js from https://nodejs.org/
    set "ISSUES=1"
)

cargo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] CRITICAL: Install Rust from https://rustup.rs/
    set "ISSUES=1"
)

if not exist "node_modules\" (
    echo [!] CRITICAL: Run 'npm install' to install dependencies
    set "ISSUES=1"
)

if not exist "node_modules\@tauri-apps\cli\cli.win32-x64-msvc.node" (
    if not exist "node_modules\@tauri-apps\cli-win32-x64-msvc\" (
        echo [!] CRITICAL: Tauri native bindings missing
        echo     Run: fix-tauri-native-advanced.bat
        set "ISSUES=1"
    )
)

if "%ISSUES%"=="0" (
    echo [OK] No critical issues found!
    echo     Your installation looks good.
    echo     If you're still having problems, it might be a runtime issue.
)

echo.
echo ========================================
echo Diagnosis Complete
echo ========================================
echo.
echo This information has been displayed above.
echo Please review it or share it with support if needed.
echo.
echo Press any key to exit...
pause >nul
