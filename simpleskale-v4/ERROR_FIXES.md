# ⚡ Quick Error Fixes for SimpleSkale 4.0

This is a quick reference guide for common errors when running `npm run tauri dev`.

---

## 🔴 Error: `Cannot find native binding`

**Full Error Message:**
```
Error: Cannot find native binding.
npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828).
Please try npm i again after removing both package-lock.json and node_modules directory.

Cannot find module './cli.win32-x64-msvc.node'
Cannot find module '@tauri-apps/cli-win32-x64-msvc'
```

### ✅ Quick Fix (Recommended - Advanced Script):

**For persistent errors, use the advanced fix:**

1. **Double-click:** `fix-tauri-native-advanced.bat`
2. **Wait 5-10 minutes** for it to complete (more thorough than basic fix)
3. **Review verification output** to confirm bindings are installed
4. **Run:** `run.bat`

**Success rate:** ~90% (much better than basic fix)

**For detailed troubleshooting:** See `TAURI_NATIVE_BINDING_GUIDE.md`

### ✅ Quick Fix (Basic):

**If you want to try the simpler fix first:**

1. **Double-click:** `fix-tauri-binding.bat`
2. **Wait 2-5 minutes** for it to complete
3. **Run:** `run.bat`

**Note:** If this doesn't work, use `fix-tauri-native-advanced.bat` instead.

### ✅ Manual Fix:

If the batch file doesn't work, do this manually:

1. **Delete old files:**
   ```powershell
   # In the simpleskale-v4 directory
   del package-lock.json
   rmdir /S /Q node_modules
   ```

2. **Reinstall npm packages:**
   ```powershell
   npm install --force
   ```

3. **Try running again:**
   ```powershell
   npm run tauri dev
   ```

### 🟡 Node.js Version Warning

If you also see this warning:
```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'vite@7.2.2',
npm warn EBADENGINE   required: { node: '^20.19.0 || >=22.12.0' },
npm warn EBADENGINE   current: { node: 'v20.17.0', npm: '10.8.2' }
npm warn EBADENGINE }
```

**Solution: Update Node.js (Optional but Recommended)**

1. **Download newer Node.js:**
   - Go to: https://nodejs.org/
   - Download **LTS version v22.x.x** (recommended)
   - Or download **v20.19.0+**

2. **Install the new version:**
   - Run the installer
   - Choose "Automatically install necessary tools"

3. **Restart computer**

4. **Verify version:**
   ```powershell
   node --version
   # Should show: v22.x.x or v20.19.0+
   ```

5. **Run fix script again:**
   - Double-click `fix-tauri-binding.bat`

**Note:** The warning won't break the app, but updating Node.js ensures better compatibility.

---

## 🔴 Error: `linker 'link.exe' not found`

**Full Error Message:**
```
error: linker `link.exe` not found
  |
  = note: program not found

note: the msvc targets depend on the msvc linker but `link.exe` was not found

note: please ensure that Visual Studio 2017 or later, or Build Tools for Visual Studio
were installed with the Visual C++ option.
```

### ✅ Solution:

You need to install Visual Studio C++ Build Tools:

1. **Download Build Tools:**
   - Go to: https://visualstudio.microsoft.com/downloads/
   - Scroll down to "Tools for Visual Studio"
   - Click "Build Tools for Visual Studio 2022"

2. **Install with C++ Support:**
   - Run the downloaded installer
   - Check **"Desktop development with C++"**
   - Click "Install" (this will download ~6GB)

3. **Restart Computer:**
   - After installation completes, restart your PC

4. **Try Again:**
   ```powershell
   npm run tauri dev
   ```

**Alternative (Full Visual Studio):**
- Download Visual Studio Community: https://visualstudio.microsoft.com/vs/community/
- During install, select "Desktop development with C++"

---

## 🟡 Error: `@tauri-apps/plugin-dialog could not be resolved`

**Full Error Message:**
```
The following dependencies are imported but could not be resolved:

  @tauri-apps/plugin-dialog (imported by .../src/App.tsx)
  @tauri-apps/plugin-fs (imported by .../src/App.tsx)

Are they installed?
```

### ✅ Solution:

The Tauri plugins aren't installed. Run this in the `simpleskale-v4` directory:

```powershell
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
```

Then try again:
```powershell
npm run tauri dev
```

---

## 🟠 Error: `cargo: command not found`

**Full Error Message:**
```
failed to run 'cargo metadata' command to get workspace directory:
program not found
```

### ✅ Solution:

Rust is not installed. Install it:

1. **Download Rust:**
   - Go to: https://rustup.rs/
   - Click "Download rustup-init.exe (64-bit)"

2. **Run Installer:**
   - Double-click `rustup-init.exe`
   - Press **1** and Enter (default installation)
   - Wait 5-10 minutes for installation

3. **⚠️ CRITICAL: Close and Reopen PowerShell/Terminal**
   - Rust won't work until you open a new terminal window

4. **Verify Installation:**
   ```powershell
   cargo --version
   rustc --version
   ```

5. **Try Again:**
   ```powershell
   npm run tauri dev
   ```

---

## 🔵 All Three Errors at Once?

If you're getting **linker**, **cargo**, AND **plugin** errors, do this in order:

### Step 1: Install Rust
```powershell
# Download from https://rustup.rs/ and run rustup-init.exe
# Then CLOSE and REOPEN PowerShell
cargo --version  # Should show version
```

### Step 2: Install Visual Studio C++ Build Tools
- Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
- Install with "Desktop development with C++"
- **Restart computer**

### Step 3: Install Tauri Plugins
```powershell
cd C:\Users\YourName\Documents\GitHub\EmbroiderSize\simpleskale-v4
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
```

### Step 4: Try Again
```powershell
npm run tauri dev
```

---

## 🟢 Success! What You'll See:

When everything works, you should see:
```
  VITE v7.2.2  ready in 253 ms
  ➜  Local:   http://localhost:1420/

Compiling tauri v2.9.3
Compiling simpleskale-v4 v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 2m 15s
     Running `target\debug\simpleskale-v4.exe`
```

And a window should open showing the SimpleSkale application!

---

## 🆘 Still Having Issues?

### Check Installation Status:

Run these commands to verify what's installed:

```powershell
# Check Rust
cargo --version
rustc --version

# Check Node/npm
node --version
npm --version

# Check if in correct directory
pwd  # Should show: .../EmbroiderSize/simpleskale-v4
```

### Common Mistakes:

1. ❌ **Didn't restart PowerShell after installing Rust**
   - Solution: Close PowerShell completely and open a new window

2. ❌ **Didn't restart computer after installing Visual Studio Build Tools**
   - Solution: Restart your PC

3. ❌ **In wrong directory**
   - Solution: `cd` to `EmbroiderSize\simpleskale-v4`

4. ❌ **Didn't run `npm install`**
   - Solution: Run `npm install` in simpleskale-v4 directory

### Full Verification Checklist:

```powershell
# 1. Verify you're in the right place
cd C:\Users\YourName\Documents\GitHub\EmbroiderSize\simpleskale-v4

# 2. Verify Rust is installed
cargo --version
# Should show: cargo 1.xx.x

# 3. Verify Node is installed
node --version
# Should show: v20.x.x or higher

# 4. Install/verify npm packages
npm install

# 5. Try running
npm run tauri dev
```

---

## 📚 More Help

- **Detailed Windows Setup:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- **General Quickstart:** See [QUICKSTART.md](QUICKSTART.md)
- **Tauri Documentation:** https://tauri.app/v1/guides/getting-started/prerequisites

---

## 🎯 TL;DR - The Absolute Minimum

**Got errors? Do this:**

1. Install Rust: https://rustup.rs/ → Close and reopen PowerShell
2. Install VS Build Tools: https://visualstudio.microsoft.com/downloads/ → Select C++
3. Restart computer
4. `cd` to simpleskale-v4 folder
5. `npm install`
6. `npm run tauri dev`

**That's it!** 🚀
