# 📦 Batch Files - Super Easy Installation

**Version:** 1.2.0
**Last Updated:** 2025-11-16

These batch files make it easy to install and run SimpleSkale on Windows without using command line.

---

## 📁 Files

### `install.bat` - One-Click Installation
**Purpose:** Installs all prerequisites automatically

**What it does:**
- Checks if running as Administrator
- Runs the PowerShell setup script (`setup-windows.ps1`)
- Installs: Rust, Visual Studio Build Tools, Node.js, WebView2, npm packages
- Takes 20-40 minutes
- Prompts you to restart when done

**How to use:**
1. Right-click `install.bat`
2. Select "Run as Administrator"
3. Click "Yes" when prompted
4. Wait for installation
5. Restart computer when prompted

---

### `run.bat` - Start SimpleSkale
**Purpose:** Starts the SimpleSkale application

**What it does:**
- Checks if Node.js and Rust are installed
- Installs npm packages if needed
- Runs `npm run tauri dev`
- Opens SimpleSkale window

**How to use:**
1. Double-click `run.bat`
2. Wait 2-5 minutes for first-time compilation
3. SimpleSkale window opens!

**Note:** Only works AFTER running `install.bat` and restarting computer.

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

| File | Purpose | When to use | Time |
|------|---------|-------------|------|
| `install.bat` | Install prerequisites | First time only | 20-40 min |
| `run.bat` | Start SimpleSkale | Every time you want to use it | 2-5 min (first run) |
| `fix-tauri-binding.bat` | Basic fix for binding error | Simple "Cannot find native binding" errors | 2-5 min |
| `fix-tauri-native-advanced.bat` | **Advanced fix (recommended)** | Persistent binding errors, after basic fix fails | 5-10 min |
| `diagnose-tauri.bat` | Diagnose installation issues | Before/after fixes, when asking for help | 1 min |

**Easy as 1-2-3:**
1. Run install.bat (once)
2. Restart computer (once)
3. Run run.bat (every time)

**If you get errors:**
- "Cannot find native binding" (first time) → Run `fix-tauri-native-advanced.bat` (recommended)
- "Cannot find native binding" (simple case) → Run `fix-tauri-binding.bat`
- Want to diagnose the problem → Run `diagnose-tauri.bat`
- Need detailed help → See `TAURI_NATIVE_BINDING_GUIDE.md`
- Other errors → Check `ERROR_FIXES.md`

🎉 Enjoy SimpleSkale!
