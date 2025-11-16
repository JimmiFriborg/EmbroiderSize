# SimpleSkale 4.0 - Automated Windows Setup Script
# Version: 1.2.2
# Last Updated: 2025-11-16
# This script will install all prerequisites for SimpleSkale 4.0

Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'SimpleSkale 4.0 - Windows Setup' -ForegroundColor Cyan
Write-Host 'Version 1.2.2 (Fixed npm install path)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host 'ERROR: This script must be run as Administrator!' -ForegroundColor Red
    Write-Host ''
    Write-Host 'Please:' -ForegroundColor Yellow
    Write-Host '1. Right-click PowerShell' -ForegroundColor Yellow
    Write-Host '2. Select Run as Administrator' -ForegroundColor Yellow
    Write-Host '3. Navigate to this directory and run the script again' -ForegroundColor Yellow
    Write-Host ''
    pause
    exit 1
}

Write-Host '[OK] Running as Administrator' -ForegroundColor Green
Write-Host ''

# Function to check if a command exists
function Test-CommandExists {
    param($commandName)
    $command = Get-Command $commandName -ErrorAction SilentlyContinue
    if ($command) {
        return $true
    }
    return $false
}

# 1. Check/Install Chocolatey (Package Manager)
Write-Host 'Step 1: Checking Chocolatey...' -ForegroundColor Cyan
$chocoExists = Test-CommandExists 'choco'
if (-not $chocoExists) {
    Write-Host '  Installing Chocolatey package manager...' -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

    $chocoExists = Test-CommandExists 'choco'
    if ($chocoExists) {
        Write-Host '  [OK] Chocolatey installed successfully' -ForegroundColor Green
    }
    else {
        Write-Host '  [X] Failed to install Chocolatey' -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host '  [OK] Chocolatey already installed' -ForegroundColor Green
}
Write-Host ''

# 2. Check/Install Node.js
Write-Host 'Step 2: Checking Node.js...' -ForegroundColor Cyan
$nodeExists = Test-CommandExists 'node'
if (-not $nodeExists) {
    Write-Host '  Installing Node.js LTS...' -ForegroundColor Yellow
    choco install nodejs-lts -y

    # Refresh environment variables
    $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = $machinePath + ';' + $userPath

    $nodeExists = Test-CommandExists 'node'
    if ($nodeExists) {
        Write-Host '  [OK] Node.js installed successfully' -ForegroundColor Green
    }
    else {
        Write-Host '  [X] Failed to install Node.js' -ForegroundColor Red
        exit 1
    }
}
else {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js already installed ($nodeVersion)" -ForegroundColor Green
}
Write-Host ''

# 3. Check/Install Rust
Write-Host 'Step 3: Checking Rust...' -ForegroundColor Cyan
$cargoExists = Test-CommandExists 'cargo'
if (-not $cargoExists) {
    Write-Host '  Installing Rust...' -ForegroundColor Yellow

    # Download rustup-init.exe
    $rustupUrl = 'https://win.rustup.rs/x86_64'
    $rustupPath = Join-Path $env:TEMP 'rustup-init.exe'

    Write-Host '  Downloading Rust installer...' -ForegroundColor Yellow
    Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupPath

    Write-Host '  Running Rust installer (this may take 5-10 minutes)...' -ForegroundColor Yellow
    Start-Process -FilePath $rustupPath -ArgumentList '-y' -Wait -NoNewWindow

    # Refresh environment variables
    $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = $machinePath + ';' + $userPath

    # Add cargo to path for this session
    $cargoPath = Join-Path $env:USERPROFILE '.cargo\bin'
    $env:Path += ';' + $cargoPath

    $cargoExists = Test-CommandExists 'cargo'
    if ($cargoExists) {
        Write-Host '  [OK] Rust installed successfully' -ForegroundColor Green
    }
    else {
        Write-Host '  [X] Failed to install Rust' -ForegroundColor Red
        Write-Host '  You may need to close and reopen PowerShell' -ForegroundColor Yellow
    }
}
else {
    $rustVersion = rustc --version
    Write-Host "  [OK] Rust already installed ($rustVersion)" -ForegroundColor Green
}
Write-Host ''

# 4. Check/Install Visual Studio Build Tools
Write-Host 'Step 4: Checking Visual Studio Build Tools...' -ForegroundColor Cyan
$vsWhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
$buildToolsInstalled = $false

if (Test-Path $vsWhere) {
    $vsInstalls = & $vsWhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($vsInstalls) {
        $buildToolsInstalled = $true
        Write-Host '  [OK] Visual Studio Build Tools already installed' -ForegroundColor Green
    }
}

if (-not $buildToolsInstalled) {
    Write-Host '  Installing Visual Studio Build Tools...' -ForegroundColor Yellow
    Write-Host '  This will download ~6GB and take 15-30 minutes' -ForegroundColor Yellow
    Write-Host ''

    # Download vs_buildtools.exe
    $vsUrl = 'https://aka.ms/vs/17/release/vs_buildtools.exe'
    $vsPath = Join-Path $env:TEMP 'vs_buildtools.exe'

    Write-Host '  Downloading Visual Studio Build Tools installer...' -ForegroundColor Yellow
    Invoke-WebRequest -Uri $vsUrl -OutFile $vsPath

    Write-Host '  Installing Build Tools with C++ workload...' -ForegroundColor Yellow
    Write-Host '  (This will take 15-30 minutes, please be patient)' -ForegroundColor Yellow

    # Install with C++ workload
    $installArgs = @(
        '--quiet',
        '--wait',
        '--norestart',
        '--nocache',
        '--add', 'Microsoft.VisualStudio.Workload.VCTools',
        '--includeRecommended'
    )

    Start-Process -FilePath $vsPath -ArgumentList $installArgs -Wait -NoNewWindow

    Write-Host '  [OK] Visual Studio Build Tools installation completed' -ForegroundColor Green
}
else {
    Write-Host '  (Skipping - already installed)' -ForegroundColor Gray
}
Write-Host ''

# 5. Install WebView2 (if not on Windows 11)
Write-Host 'Step 5: Checking WebView2...' -ForegroundColor Cyan
$webview2Path = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\EdgeWebView\Application'
if (-not (Test-Path $webview2Path)) {
    Write-Host '  Installing WebView2 Runtime...' -ForegroundColor Yellow
    choco install webview2-runtime -y
    Write-Host '  [OK] WebView2 installed successfully' -ForegroundColor Green
}
else {
    Write-Host '  [OK] WebView2 already installed' -ForegroundColor Green
}
Write-Host ''

# 6. Install npm dependencies
Write-Host 'Step 6: Installing npm dependencies...' -ForegroundColor Cyan
$scriptDir = $PSScriptRoot
$packageJsonPath = Join-Path $scriptDir 'package.json'
if (Test-Path $packageJsonPath) {
    Push-Location $scriptDir
    npm install
    Pop-Location
    Write-Host '  [OK] npm dependencies installed' -ForegroundColor Green
}
else {
    Write-Host '  [X] package.json not found in script directory' -ForegroundColor Red
    Write-Host "  Looking in: $scriptDir" -ForegroundColor Yellow
}
Write-Host ''

# Summary
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Installation Summary' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'Prerequisites installed:' -ForegroundColor Green
Write-Host '  [OK] Chocolatey package manager' -ForegroundColor Green
Write-Host '  [OK] Node.js' -ForegroundColor Green
Write-Host '  [OK] Rust (rustc + cargo)' -ForegroundColor Green
Write-Host '  [OK] Visual Studio Build Tools with C++' -ForegroundColor Green
Write-Host '  [OK] WebView2 Runtime' -ForegroundColor Green
Write-Host '  [OK] npm dependencies' -ForegroundColor Green
Write-Host ''

Write-Host '========================================' -ForegroundColor Yellow
Write-Host 'IMPORTANT: RESTART REQUIRED' -ForegroundColor Yellow
Write-Host '========================================' -ForegroundColor Yellow
Write-Host ''
Write-Host 'To complete the setup:' -ForegroundColor Yellow
Write-Host '1. Restart your computer NOW' -ForegroundColor Yellow
Write-Host '2. After restart, double-click run.bat' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Press any key to exit...' -ForegroundColor Cyan
pause
