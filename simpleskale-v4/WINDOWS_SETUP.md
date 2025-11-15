# 🪟 Windows Setup Guide for SimpleSkale 4.0

This guide will help you set up SimpleSkale 4.0 on Windows.

## ⚠️ Current Issue: Cargo Not Found

If you're seeing this error:
```
failed to run 'cargo metadata' command to get workspace directory:
program not found
```

**This means Rust is not installed.** Follow the steps below to fix it.

---

## 📋 Step-by-Step Windows Setup

### Step 1: Install Rust

**Method A: Using rustup-init.exe (Recommended)**

1. Download Rust installer:
   - Visit: https://rustup.rs/
   - Click "Download rustup-init.exe (64-bit)"

2. Run `rustup-init.exe`
   - When prompted, press **1** and Enter to proceed with default installation
   - Wait for installation to complete (may take 5-10 minutes)

3. **IMPORTANT:** Close and reopen PowerShell/Terminal
   - Rust tools are added to PATH, but require a new shell session

4. Verify installation:
   ```powershell
   rustc --version
   cargo --version
   ```

   Expected output:
   ```
   rustc 1.xx.x (...)
   cargo 1.xx.x (...)
   ```

**Method B: Using Chocolatey**

If you have Chocolatey installed:
```powershell
choco install rust
```

### Step 2: Install Node.js (if not already installed)

1. Download from: https://nodejs.org/
2. Choose LTS version (v20.x or higher)
3. Run installer with default options
4. Verify:
   ```powershell
   node --version
   npm --version
   ```

### Step 3: Install Visual Studio C++ Build Tools

Tauri requires C++ build tools for Windows:

**Option A: Visual Studio Build Tools (Smaller)**
1. Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Run installer
3. Select "Desktop development with C++"
4. Install

**Option B: Full Visual Studio Community (Larger)**
1. Download: https://visualstudio.microsoft.com/vs/community/
2. Install with "Desktop development with C++" workload

### Step 4: Install WebView2

Windows 11 includes WebView2 by default. For Windows 10:

1. Download: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
2. Download "Evergreen Standalone Installer"
3. Run installer

---

## 🚀 Running SimpleSkale 4.0 on Windows

Once Rust is installed:

```powershell
# Navigate to the project
cd C:\Users\YourUsername\Documents\GitHub\EmbroiderSize\simpleskale-v4

# Install npm dependencies (first time only)
npm install

# Run the application
npm run tauri dev
```

---

## 🐛 Troubleshooting Windows Issues

### Error: "rustc is not recognized"

**Solution:** Restart PowerShell/Terminal after installing Rust. PATH changes require a new shell.

### Error: "link.exe not found"

**Solution:** Install Visual Studio C++ Build Tools (see Step 3 above).

### Error: "WebView2 not found"

**Solution:** Install WebView2 runtime (see Step 4 above).

### Error: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Permission Denied Errors

**Solution:** Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Navigate to project and try again

### Long Path Issues

If you get path too long errors:

```powershell
# Enable long paths in Windows
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 1
```

Then restart your computer.

---

## ✅ Verification Checklist

Run these commands to verify everything is installed:

```powershell
# Check Rust
rustc --version
cargo --version

# Check Node.js
node --version
npm --version

# Check Git (optional but recommended)
git --version
```

All commands should show version numbers, not "not recognized" errors.

---

## 🎯 Quick Fix for Your Current Error

Since you have the error right now, here's the immediate fix:

1. **Install Rust:**
   - Go to https://rustup.rs/
   - Download and run `rustup-init.exe`
   - Choose option 1 (default)
   - Wait for installation

2. **Close and reopen PowerShell** (IMPORTANT!)

3. **Verify Rust is installed:**
   ```powershell
   cargo --version
   ```

4. **Try running SimpleSkale again:**
   ```powershell
   npm run tauri dev
   ```

---

## 📝 Environment Variables

After installing Rust, these should be automatically added to your PATH:
- `C:\Users\YourUsername\.cargo\bin`

If Rust commands don't work after installation, manually add this to your PATH:

1. Search for "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "User variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add: `%USERPROFILE%\.cargo\bin`
7. Click OK on all dialogs
8. Restart PowerShell

---

## 🔄 If Issues Persist

1. **Completely restart your computer** after installing Rust
2. **Check antivirus** - Some antivirus software blocks Rust/Cargo
3. **Try Windows Terminal** instead of PowerShell
4. **Check Windows version** - Windows 10 1809 or higher required

---

## 💡 Pro Tips for Windows

- Use **Windows Terminal** for better experience
- Install **Git Bash** for Unix-like commands
- Use **VS Code** with Rust and Tauri extensions
- Enable **Developer Mode** in Windows Settings

---

## 🆘 Still Having Issues?

If you're still stuck:

1. Check the main [QUICKSTART.md](QUICKSTART.md) for general troubleshooting
2. Verify you're in the correct directory: `C:\...\EmbroiderSize\simpleskale-v4\`
3. Make sure you've restarted PowerShell after installing Rust
4. Try running `rustup update` to ensure latest Rust version

---

**Once Rust is installed and you can run `cargo --version` successfully, you're ready to run SimpleSkale 4.0!** 🎉
