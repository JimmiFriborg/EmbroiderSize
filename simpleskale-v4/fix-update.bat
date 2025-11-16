@echo off
REM Fix Update Script - Downloads latest setup-windows.ps1 from GitHub
REM Version: 1.0.0

echo ========================================
echo SimpleSkale 4.0 - Fix Update Script
echo ========================================
echo.
echo This will download the latest setup-windows.ps1 file
echo directly from GitHub to fix PowerShell syntax errors.
echo.
pause

echo.
echo Backing up old setup-windows.ps1...
if exist "setup-windows.ps1" (
    copy /Y "setup-windows.ps1" "setup-windows.ps1.backup" >nul
    echo Backup created: setup-windows.ps1.backup
)

echo.
echo Downloading latest setup-windows.ps1 from GitHub...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/JimmiFriborg/EmbroiderSize/claude/analyze-simpleskale-readiness-01GGpEjSUiKJ5HTZWRMzwfjM/simpleskale-v4/setup-windows.ps1' -OutFile 'setup-windows.ps1'"

if %errorLevel% == 0 (
    echo.
    echo ========================================
    echo SUCCESS! File updated successfully!
    echo ========================================
    echo.
    echo You can now run install.bat again.
    echo The PowerShell syntax errors should be fixed.
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Download failed!
    echo ========================================
    echo.
    echo Restoring backup...
    if exist "setup-windows.ps1.backup" (
        copy /Y "setup-windows.ps1.backup" "setup-windows.ps1" >nul
        echo Backup restored.
    )
    echo.
    echo Please check your internet connection and try again.
    echo.
)

pause
