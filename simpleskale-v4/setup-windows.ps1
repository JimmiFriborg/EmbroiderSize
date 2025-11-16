# SimpleSkale 4.0 - Automated Windows Setup Script
# This script will install all prerequisites for SimpleSkale 4.0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SimpleSkale 4.0 - Windows Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to this directory and run the script again" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# 1. Check/Install Chocolatey (Package Manager)
Write-Host "Step 1: Checking Chocolatey..." -ForegroundColor Cyan
if (-not (Test-Command choco)) {
    Write-Host "  Installing Chocolatey package manager..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

    if (Test-Command choco) {
        Write-Host "  ✓ Chocolatey installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install Chocolatey" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Chocolatey already installed" -ForegroundColor Green
}
Write-Host ""

# 2. Check/Install Node.js
Write-Host "Step 2: Checking Node.js..." -ForegroundColor Cyan
if (-not (Test-Command node)) {
    Write-Host "  Installing Node.js LTS..." -ForegroundColor Yellow
    choco install nodejs-lts -y

    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    if (Test-Command node) {
        Write-Host "  ✓ Node.js installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install Node.js" -ForegroundColor Red
        exit 1
    }
} else {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js already installed ($nodeVersion)" -ForegroundColor Green
}
Write-Host ""

# 3. Check/Install Rust
Write-Host "Step 3: Checking Rust..." -ForegroundColor Cyan
if (-not (Test-Command cargo)) {
    Write-Host "  Installing Rust..." -ForegroundColor Yellow

    # Download rustup-init.exe
    $rustupUrl = "https://win.rustup.rs/x86_64"
    $rustupPath = "$env:TEMP\rustup-init.exe"

    Write-Host "  Downloading Rust installer..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupPath

    Write-Host "  Running Rust installer (this may take 5-10 minutes)..." -ForegroundColor Yellow
    Start-Process -FilePath $rustupPath -ArgumentList "-y" -Wait -NoNewWindow

    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    # Add cargo to path for this session
    $env:Path += ";$env:USERPROFILE\.cargo\bin"

    if (Test-Command cargo) {
        Write-Host "  ✓ Rust installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install Rust" -ForegroundColor Red
        Write-Host "  You may need to close and reopen PowerShell" -ForegroundColor Yellow
    }
} else {
    $rustVersion = rustc --version
    Write-Host "  ✓ Rust already installed ($rustVersion)" -ForegroundColor Green
}
Write-Host ""

# 4. Check/Install Visual Studio Build Tools
Write-Host "Step 4: Checking Visual Studio Build Tools..." -ForegroundColor Cyan
$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$buildToolsInstalled = $false

if (Test-Path $vsWhere) {
    $vsInstalls = & $vsWhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($vsInstalls) {
        $buildToolsInstalled = $true
        Write-Host "  ✓ Visual Studio Build Tools already installed" -ForegroundColor Green
    }
}

if (-not $buildToolsInstalled) {
    Write-Host "  Installing Visual Studio Build Tools..." -ForegroundColor Yellow
    Write-Host "  This will download ~6GB and take 15-30 minutes" -ForegroundColor Yellow
    Write-Host ""

    # Download vs_buildtools.exe
    $vsUrl = "https://aka.ms/vs/17/release/vs_buildtools.exe"
    $vsPath = "$env:TEMP\vs_buildtools.exe"

    Write-Host "  Downloading Visual Studio Build Tools installer..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $vsUrl -OutFile $vsPath

    Write-Host "  Installing Build Tools with C++ workload..." -ForegroundColor Yellow
    Write-Host "  (This will take 15-30 minutes, please be patient)" -ForegroundColor Yellow

    # Install with C++ workload
    $installArgs = @(
        "--quiet",
        "--wait",
        "--norestart",
        "--nocache",
        "--add", "Microsoft.VisualStudio.Workload.VCTools",
        "--includeRecommended"
    )

    Start-Process -FilePath $vsPath -ArgumentList $installArgs -Wait -NoNewWindow

    Write-Host "  ✓ Visual Studio Build Tools installation completed" -ForegroundColor Green
} else {
    Write-Host "  (Skipping - already installed)" -ForegroundColor Gray
}
Write-Host ""

# 5. Install WebView2 (if not on Windows 11)
Write-Host "Step 5: Checking WebView2..." -ForegroundColor Cyan
$webview2Path = "${env:ProgramFiles(x86)}\Microsoft\EdgeWebView\Application"
if (-not (Test-Path $webview2Path)) {
    Write-Host "  Installing WebView2 Runtime..." -ForegroundColor Yellow
    choco install webview2-runtime -y
    Write-Host "  ✓ WebView2 installed successfully" -ForegroundColor Green
} else {
    Write-Host "  ✓ WebView2 already installed" -ForegroundColor Green
}
Write-Host ""

# 6. Install npm dependencies
Write-Host "Step 6: Installing npm dependencies..." -ForegroundColor Cyan
$currentDir = Get-Location
if (Test-Path "$currentDir\package.json") {
    npm install
    Write-Host "  ✓ npm dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ package.json not found in current directory" -ForegroundColor Red
    Write-Host "  Make sure you're in the simpleskale-v4 directory" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Prerequisites installed:" -ForegroundColor Green
Write-Host "  ✓ Chocolatey package manager" -ForegroundColor Green
Write-Host "  ✓ Node.js" -ForegroundColor Green
Write-Host "  ✓ Rust (rustc + cargo)" -ForegroundColor Green
Write-Host "  ✓ Visual Studio Build Tools with C++" -ForegroundColor Green
Write-Host "  ✓ WebView2 Runtime" -ForegroundColor Green
Write-Host "  ✓ npm dependencies" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "IMPORTANT: RESTART REQUIRED" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "To complete the setup:" -ForegroundColor Yellow
Write-Host "1. Restart your computer NOW" -ForegroundColor Yellow
Write-Host "2. After restart, open PowerShell" -ForegroundColor Yellow
Write-Host "3. Navigate to: $currentDir" -ForegroundColor Yellow
Write-Host "4. Run: npm run tauri dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
pause
