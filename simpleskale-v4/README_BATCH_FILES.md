# 📦 Batch Files - Super Easy Installation

**Version:** 1.1.0
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

| File | Purpose | When to use |
|------|---------|-------------|
| `install.bat` | Install prerequisites | First time only |
| `run.bat` | Start SimpleSkale | Every time you want to use it |

**Easy as 1-2-3:**
1. Run install.bat (once)
2. Restart computer (once)
3. Run run.bat (every time)

🎉 Enjoy SimpleSkale!
