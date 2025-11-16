# 🚀 SimpleSkale 4.0 - Quick Start Guide

This guide will help you launch and test the SimpleSkale 4.0 demo application.

## ⚡ FASTEST METHOD: Automated Setup (Windows)

**If you're on Windows, use the automated setup script to install everything:**

1. **Open PowerShell as Administrator**
   - Press Windows key, type "PowerShell"
   - Right-click "Windows PowerShell" → "Run as Administrator"

2. **Navigate to simpleskale-v4 directory**
   ```powershell
   cd C:\Users\YourUsername\Documents\GitHub\EmbroiderSize\simpleskale-v4
   ```

3. **Run the automated setup script**
   ```powershell
   .\setup-windows.ps1
   ```

4. **Wait for installation (20-40 minutes)**
   - Installs: Rust, Visual Studio Build Tools, Node.js, WebView2, npm packages
   - Everything is automatic

5. **Restart your computer when prompted**

6. **After restart, run SimpleSkale**
   ```powershell
   npm run tauri dev
   ```

**Done!** 🎉 The automated script handles all prerequisites.

---

## 🚨 Getting Errors? Start Here!

**If `npm run tauri dev` is giving you errors:**

👉 **See [ERROR_FIXES.md](ERROR_FIXES.md) for immediate solutions!**

Common errors:
- ❌ `linker 'link.exe' not found` → Run automated setup script OR see [FIX_LINKER_ERROR.md](FIX_LINKER_ERROR.md)
- ❌ `cargo: command not found` → Run automated setup script OR install Rust manually
- ❌ `@tauri-apps/plugin-* could not be resolved` → Run `npm install`

## 🪟 Windows Manual Setup (If Automated Script Fails)

**If the automated script doesn't work, install manually:**

👉 **See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for step-by-step manual setup!**

Manual checklist:
1. Install Rust from https://rustup.rs/
2. Install Visual Studio C++ Build Tools
3. **Close and reopen PowerShell** after installing Rust
4. Verify with `cargo --version`
5. Then continue with this guide

---

## 📋 Prerequisites

Before running SimpleSkale 4.0, ensure you have:

- ✅ **Node.js 18+** (current: v22.21.1)
- ✅ **Rust 1.70+** (current: v1.91.1) - [Windows Setup Guide](WINDOWS_SETUP.md)
- ✅ **npm 10+**

### Linux Additional Requirements

On Linux, Tauri requires additional system dependencies:

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel

# Arch
sudo pacman -S webkit2gtk-4.1 \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg
```

## 🎯 Two Applications - Important!

This repository contains **TWO separate applications**:

### 1. **Python Legacy App** (EmbroiderSize v0.1.0)
- Located in: `/src/` (root)
- Technology: Python + CustomTkinter
- Status: Fully functional ✅
- Purpose: Backwards compatibility, scripting

### 2. **SimpleSkale 4.0** (New Tauri App)
- Located in: `/simpleskale-v4/`
- Technology: Tauri + React + TypeScript
- Status: Phase 1 Complete ✅
- Purpose: Modern desktop app

**This guide focuses on SimpleSkale 4.0.**

---

## 🚀 Launch SimpleSkale 4.0

### Step 1: Navigate to the SimpleSkale 4.0 Directory

```bash
cd /home/user/EmbroiderSize/simpleskale-v4
```

**Important:** You must be in the `simpleskale-v4/` directory, not the root!

### Step 2: Install Dependencies (First Time Only)

```bash
npm install
```

This installs all Node.js dependencies. You only need to run this once, or after pulling updates.

### Step 3: Run in Development Mode

```bash
npm run dev
```

**Note:** This runs Vite dev server only. To run the full Tauri app, use:

```bash
npm run tauri dev
```

**Expected behavior:**
- Tauri window opens with SimpleSkale 4.0 UI
- You'll see "🧵 SimpleSkale 4.0" header
- Control panel on the left
- Canvas area on the right

### Step 4: Test the Application

1. Click **"Load Test Pattern"** button
2. You should see:
   - A red square and blue triangle rendered on canvas
   - Design info panel showing stats
   - Brother PP1 machine profile info
   - Zoom/pan controls at bottom right

3. Try the **scale slider** (currently visual only - engine integration is next phase)

---

## 🐛 Troubleshooting

### Error: "webkit2gtk not found" (Linux only)

**Solution:** Install the system dependencies listed in Prerequisites section above.

### Error: "npm: command not found"

**Solution:** Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Error: "cargo: command not found"

**Solution:** Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Tauri Window Opens but Shows Blank Screen

**Solution:** Check browser console in the Tauri window:
- Right-click → Inspect Element
- Look for errors in Console tab
- Most likely a TypeScript compilation error

### "Module not found" Errors

**Solution:** Ensure you're in the correct directory:
```bash
pwd  # Should show: /home/user/EmbroiderSize/simpleskale-v4
npm install  # Reinstall dependencies
```

---

## 📝 Development Workflow

### Running the App

```bash
# Development mode (hot reload)
npm run tauri dev

# Build for production
npm run tauri build

# Run Vite dev server only (for UI testing)
npm run dev
```

### File Structure You'll Work With

```
simpleskale-v4/
├── src/
│   ├── App.tsx              ← Main UI component
│   ├── types/index.ts       ← Type definitions
│   ├── engine/              ← Core scaling logic
│   ├── lib/parsers/         ← File parsers (PES/DST)
│   ├── components/          ← React components
│   └── utils/               ← Utilities
└── src-tauri/               ← Rust backend (Tauri)
```

### Making Changes

1. Edit files in `src/`
2. Save
3. Vite hot-reloads automatically
4. See changes immediately in Tauri window

---

## 🎨 Current Features (Phase 1 Complete)

### What Works ✅

- [x] Test pattern generation
- [x] Canvas rendering with zoom/pan
- [x] Design info display
- [x] Brother PP1 profile integration
- [x] File parsers (PES/DST) - backend ready
- [x] SimpleSkale engine - backend ready

### What's Next ⏭️ (Phase 2)

- [ ] File upload dialog (Tauri file picker)
- [ ] Real-time scaling when slider changes
- [ ] Validation results display
- [ ] Export functionality
- [ ] Density heatmap

---

## 🔄 For Python Legacy App Users

If you want to run the **original Python GUI** instead:

```bash
# From repository root
cd /home/user/EmbroiderSize

# Activate virtual environment (if using one)
source venv/bin/activate

# Run the GUI
python EmbroiderSize.py

# Or run the CLI
python -m src.cli info design.pes
```

**Both apps can coexist!** They serve different purposes:
- **Python app:** Quick command-line usage, scripting
- **SimpleSkale 4.0:** Modern desktop experience

---

## 💡 Tips

### Keyboard Shortcuts (in Tauri window)

- `Ctrl+R` - Reload window
- `Ctrl+Shift+I` - Open DevTools
- `F11` - Toggle fullscreen

### Performance

- First launch may take 30-60 seconds (Rust compilation)
- Subsequent launches are faster (~5 seconds)
- Hot reload during development is instant

### Logs

View Tauri logs:
```bash
# Tauri logs show in the terminal where you ran `npm run tauri dev`
# React logs show in browser DevTools (Ctrl+Shift+I)
```

---

## 📞 Getting Help

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Verify you're in the correct directory (`simpleskale-v4/`)
3. Try `npm install` again
4. Check the terminal output for error messages
5. Open DevTools (Ctrl+Shift+I) to see browser console errors

---

## ✅ Quick Verification

Run this checklist to verify everything is set up:

```bash
# 1. Check you're in the right directory
pwd
# Expected: /home/user/EmbroiderSize/simpleskale-v4

# 2. Check Node.js
node --version
# Expected: v18.0.0 or higher

# 3. Check npm
npm --version
# Expected: v9.0.0 or higher

# 4. Check Rust
rustc --version
# Expected: 1.70.0 or higher

# 5. Install dependencies
npm install
# Expected: Should complete without errors

# 6. Run the app
npm run tauri dev
# Expected: Tauri window opens with SimpleSkale 4.0 UI
```

---

**Ready to go!** Click "Load Test Pattern" and start exploring SimpleSkale 4.0! 🎉
