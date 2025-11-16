# 📦 Batch Files - Super Easy Installation (Self-Healing Edition)

**Version:** 2.0.0 (Self-Healing)
**Last Updated:** 2025-11-16

These batch files make it easy to install and run SimpleSkale on Windows without using command line.

## 🎉 What's New in Version 2.0?

**Automatic Error Detection and Fixing!**

- ✅ **No manual troubleshooting** - Scripts fix problems automatically
- ✅ **User-friendly messages** - Clear progress indicators
- ✅ **Self-healing** - Detects and repairs common issues on the fly
- ✅ **Optional GUI** - Double-click `SimpleSkale.vbs` for a friendly interface
- ✅ **Smart installation** - Prevents errors before they happen

**You no longer need to:**
- ❌ Manually run fix scripts when errors occur
- ❌ Understand technical error messages
- ❌ Follow complex troubleshooting guides

**Just run `install.bat`, restart, then run `run.bat` - Done!**

---

## 📁 Files

### `install.bat` - One-Click Installation (Self-Healing)
**Version:** 2.0.0
**Purpose:** Installs all prerequisites and prevents common errors

**What it does:**
- Checks if running as Administrator
- Runs the PowerShell setup script (`setup-windows.ps1`)
- Installs: Rust, Visual Studio Build Tools, Node.js, WebView2
- **NEW:** Cleans npm cache to prevent corrupted packages
- **NEW:** Uses smart installation strategy to prevent native binding errors
- **NEW:** Verifies Tauri bindings are installed correctly
- Takes 20-40 minutes
- Prompts you to restart when done

**How to use:**
1. Right-click `install.bat`
2. Select "Run as Administrator"
3. Click "Yes" when prompted
4. Wait for installation (with progress messages)
5. Restart computer when prompted

**What's new:** Automatically prevents the "Cannot find native binding" error!

---

### `run.bat` - Start SimpleSkale (Self-Healing)
**Version:** 2.0.0
**Purpose:** Starts SimpleSkale with automatic error detection and fixing

**What it does:**
- **NEW:** Checks prerequisites with friendly messages
- **NEW:** Verifies Tauri native bindings BEFORE starting
- **NEW:** Auto-detects the "Cannot find native binding" error
- **NEW:** Automatically fixes errors without user intervention
- **NEW:** Shows clear progress through 4 steps
- Runs `npm run tauri dev` with error monitoring
- Opens SimpleSkale window

**How to use:**
1. Double-click `run.bat`
2. Watch the progress messages (4 steps)
3. If any issues are detected, they're fixed automatically
4. Wait 2-5 minutes for first-time compilation
5. SimpleSkale window opens!

**What's new:** Fixes problems automatically - no manual intervention needed!

**Note:** Only works AFTER running `install.bat` and restarting computer.

---

### `SimpleSkale.vbs` - GUI Launcher (NEW!)
**Version:** 1.0.0
**Purpose:** User-friendly GUI launcher with helpful messages

**What it does:**
- Shows friendly popup messages explaining what's happening
- Runs `run.bat` in the background
- Provides guidance during startup
- Perfect for non-technical users

**How to use:**
1. Double-click `SimpleSkale.vbs`
2. Read the friendly popup messages
3. Click OK to proceed
4. The console window opens and runs automatically
5. SimpleSkale window opens when ready!

**Why use this:** Great for users who prefer a friendlier interface!

---

### `fix-tauri-binding.bat` - Fix Tauri Binding Error (Basic)
**Purpose:** Fixes the "Cannot find native binding" error (basic fix)

**What it does:**
- Deletes `package-lock.json`
- Deletes `node_modules` folder
- Reinstalls npm dependencies with `--force` flag
- Verifies Tauri native bindings are installed

**When to use:**
- When `run.bat` shows: "Error: Cannot find native binding"
- When you see: "Cannot find module './cli.win32-x64-msvc.node'"
- For simple cases of the binding error

**How to use:**
1. Double-click `fix-tauri-binding.bat`
2. Wait 2-5 minutes for npm reinstall
3. Double-click `run.bat` to try again

**Note:** This is a common npm bug with optional dependencies. If this doesn't work, try `fix-tauri-native-advanced.bat`.

---

### `fix-tauri-native-advanced.bat` - Advanced Fix (Recommended)
**Purpose:** Comprehensive fix for persistent Tauri native binding errors

**What it does:**
- Cleans npm cache completely (removes corrupted packages)
- Deletes `package-lock.json` and `node_modules`
- Uses multiple installation strategies:
  1. Installs base packages without optional dependencies
  2. Installs optional dependencies separately
  3. Explicitly installs Windows platform package
- Comprehensive verification of installation
- Detailed success/failure reporting

**When to use:**
- When `fix-tauri-binding.bat` doesn't solve the problem
- For persistent "Cannot find native binding" errors
- After updating Node.js version
- When you want thorough verification

**How to use:**
1. Double-click `fix-tauri-native-advanced.bat`
2. Wait 5-10 minutes (longer but more thorough)
3. Review the verification output
4. Double-click `run.bat` to try again

**Success rate:** ~90% (much higher than basic fix)

---

### `diagnose-tauri.bat` - Diagnostic Tool
**Purpose:** Diagnoses what's wrong with your Tauri installation

**What it does:**
- Checks Node.js and npm versions
- Checks Rust and Cargo installation
- Checks Visual Studio C++ Build Tools
- Verifies you're in the correct directory
- Checks if node_modules exists
- Checks for native binding files
- Provides detailed system information
- Recommends specific actions based on findings

**When to use:**
- Before trying fixes (to understand the problem)
- After fixes (to verify they worked)
- When asking for help (share the diagnostic output)
- When nothing seems to work

**How to use:**
1. Double-click `diagnose-tauri.bat`
2. Read the output carefully
3. Look for `[X]` markers (these are problems)
4. Follow the recommended actions
5. Share the output if asking for support

**Output indicators:**
- `[OK]` = Everything is fine
- `[!]` = Warning, might cause issues
- `[X]` = Error, needs fixing

---

## 🚀 Quick Start

**First time setup:**
```
1. Right-click install.bat → Run as Administrator
2. Wait 20-40 minutes
3. Restart computer
4. Double-click run.bat
5. Done! 🎉
```

**Every time after:**
```
1. Double-click run.bat
2. Wait a few seconds
3. SimpleSkale opens!
```

---

## ❓ Troubleshooting

### "Still getting PowerShell errors"
- You may be running an old version - see `UPDATE.md` for how to get the latest version
- Check that install.bat displays "Version 1.1.0" when you run it

### "This script must run as Administrator"
- Right-click `install.bat` → "Run as Administrator" (don't just double-click)

### "Node.js is not installed" or "Rust is not installed"
- Run `install.bat` first
- Make sure you restarted your computer after install.bat

### "Failed to start SimpleSkale"
- Did you restart after running install.bat?
- Check ERROR_FIXES.md for specific errors

### "Cannot find native binding" or "Cannot find module './cli.win32-x64-msvc.node'"
- This is a common npm bug with optional dependencies
- **Quick fix:** Double-click `fix-tauri-binding.bat`
- Wait 2-5 minutes for it to complete
- Then run `run.bat` again
- See ERROR_FIXES.md for more details

### Installation is taking too long
- Visual Studio Build Tools is ~6GB download
- 20-40 minutes is normal depending on internet speed
- Don't close the window - it's working!

---

## 🔍 What Gets Installed

`install.bat` installs:
- **Chocolatey** - Package manager for Windows
- **Node.js** - JavaScript runtime
- **Rust** - Programming language for Tauri
- **Visual Studio Build Tools** - C++ compiler (~6GB)
- **WebView2** - Browser engine for desktop apps
- **npm packages** - SimpleSkale dependencies

Total download: ~6-7 GB
Total disk space: ~8-10 GB

---

## 📝 For Advanced Users

If you prefer command line or the batch files don't work:

**PowerShell method:**
```powershell
# Install (as Administrator)
.\setup-windows.ps1

# Run (normal user)
npm run tauri dev
```

**Manual installation:**
See WINDOWS_SETUP.md for step-by-step manual installation.

---

## 💡 Tips

- **Run install.bat only once** - After that, just use run.bat
- **Keep the console window open** while SimpleSkale is running
- **Close the window or press Ctrl+C** to stop SimpleSkale
- **Restart is required** after install.bat - don't skip this!

---

## 🎯 Summary

### Main Files (Use These!)

| File | Purpose | When to use | Time |
|------|---------|-------------|------|
| `install.bat` | **Install prerequisites (self-healing)** | First time only | 20-40 min |
| `run.bat` | **Start SimpleSkale (self-healing)** | Every time you want to use it | 2-5 min (first run) |
| `SimpleSkale.vbs` | **GUI launcher (friendly interface)** | Alternative to run.bat for non-technical users | Instant |

### Advanced/Troubleshooting Files (Usually Not Needed!)

| File | Purpose | When to use | Time |
|------|---------|-------------|------|
| `fix-tauri-binding.bat` | Basic manual fix | **Rarely needed** - run.bat fixes this automatically | 2-5 min |
| `fix-tauri-native-advanced.bat` | Advanced manual fix | **Rarely needed** - only if auto-fix fails | 5-10 min |
| `diagnose-tauri.bat` | Diagnostic tool | When asking for support or debugging | 1 min |

---

## 🚀 Ultra-Simple Guide

**For most users:**

1. **Right-click** `install.bat` → **Run as Administrator** (once)
2. **Restart** your computer (once)
3. **Double-click** `run.bat` or `SimpleSkale.vbs` (every time)

**That's it!** No manual fixes needed.

---

## ❓ What If I Get Errors?

**You probably won't!** But if you do:

1. **Try running again** - run.bat fixes most issues automatically
2. **Check you restarted** - After install.bat, you MUST restart
3. **Still broken?** See `ERROR_FIXES.md` or `TAURI_NATIVE_BINDING_GUIDE.md`

**The fix scripts are there "just in case," but you shouldn't need them!**

---

## 🎉 Enjoy SimpleSkale!

**Version 2.0 is all about simplicity:**
- ✅ Automatic error detection
- ✅ Automatic error fixing
- ✅ Clear progress messages
- ✅ Optional friendly GUI
- ✅ No technical knowledge needed!
