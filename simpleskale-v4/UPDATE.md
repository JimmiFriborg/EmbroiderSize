# 🔄 How to Update SimpleSkale to Latest Version

**Current Version:** 1.1.0
**Last Updated:** 2025-11-16

---

## ⚠️ IMPORTANT: If You're Getting Errors

If you're experiencing PowerShell errors or other issues, you may be running an **older version** of the installation scripts. Follow the steps below to update to the latest version.

---

## 🔍 How to Check Your Current Version

### Check install.bat version:
1. Right-click `install.bat` → "Edit"
2. Look at line 3: Should say `REM Version: 1.1.0`

### Check setup-windows.ps1 version:
1. Right-click `setup-windows.ps1` → "Edit"
2. Look at line 2: Should say `# Version: 1.1.0`

### Check run.bat version:
1. Right-click `run.bat` → "Edit"
2. Look at line 3: Should say `REM Version: 1.1.0`

If any of these don't match **1.1.0**, you need to update!

---

## ✅ Method 1: Update Using Git (Recommended)

If you cloned this repository with `git clone`:

### Step 1: Open PowerShell
1. Press `Win + X` → Select "Windows PowerShell" or "Terminal"

### Step 2: Navigate to SimpleSkale Directory
```powershell
cd C:\Users\YourUsername\path\to\EmbroiderSize\simpleskale-v4
```
(Replace with your actual path)

### Step 3: Pull Latest Changes
```powershell
git pull origin claude/analyze-simpleskale-readiness-01GGpEjSUiKJ5HTZWRMzwfjM
```

### Step 4: Verify Version
```powershell
# Check if files updated
git log --oneline -5
```

You should see recent commits like:
- "Add version numbers to installation files"
- "Fix PowerShell syntax errors in setup script"

### Step 5: Run Updated Installer
1. Right-click `install.bat` → "Run as Administrator"
2. You should see "Version 1.1.0" displayed

---

## 🔄 Method 2: Manual Download (If Git Doesn't Work)

If you don't have git or it's not working:

### Step 1: Backup Your Current Files (Optional)
1. Copy the entire `simpleskale-v4` folder to `simpleskale-v4-backup`

### Step 2: Download Latest Files
1. Go to the GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Navigate to `simpleskale-v4` folder inside

### Step 3: Copy Updated Files
Copy these files from the downloaded folder to your existing folder:
- `install.bat`
- `run.bat`
- `setup-windows.ps1`

### Step 4: Verify Version
1. Right-click `install.bat` → "Edit"
2. Line 3 should say: `REM Version: 1.1.0`

---

## 🐛 What Was Fixed in Version 1.1.0

### PowerShell Syntax Errors (CRITICAL FIX)
**Problem:** PowerShell script failed with "Unexpected token '}'" errors

**Fixed in these locations:**
- `setup-windows.ps1:60-62` - Node.js environment variable refresh
- `setup-windows.ps1:92-98` - Rust environment variable refresh

**What changed:**
```powershell
# BEFORE (broken):
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + ...

# AFTER (fixed):
$machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = $machinePath + ';' + $userPath
```

### Version Tracking Added
- All batch files now display version numbers
- Easy to verify you're running the latest version
- Helps with troubleshooting

---

## 🎯 After Updating

1. **Verify Version:**
   - Run `install.bat` and check for "Version 1.1.0" in the output

2. **Run Installation:**
   - Right-click `install.bat` → "Run as Administrator"
   - The PowerShell syntax errors should be GONE

3. **Restart Computer:**
   - After install.bat completes, restart your computer

4. **Run SimpleSkale:**
   - Double-click `run.bat`
   - Wait for compilation
   - Window should open!

---

## ❓ Troubleshooting

### "git pull" says "Already up to date" but I still have old version
**Solution:**
1. Check which branch you're on: `git branch`
2. Should show: `claude/analyze-simpleskale-readiness-01GGpEjSUiKJ5HTZWRMzwfjM`
3. If different, switch: `git checkout claude/analyze-simpleskale-readiness-01GGpEjSUiKJ5HTZWRMzwfjM`
4. Try pull again: `git pull`

### Still getting PowerShell errors after updating
**Solution:**
1. Verify you updated the files (check version numbers)
2. Make sure you're running the `install.bat` from the updated folder
3. Try deleting `setup-windows.ps1` and re-downloading just that file

### Don't have git installed
**Solution:**
- Use Method 2 (Manual Download) above
- Or install git: https://git-scm.com/download/win

---

## 📞 Need Help?

If you're still having issues after updating:
1. Check `FIX_LINKER_ERROR.md` for specific error solutions
2. Check `README_BATCH_FILES.md` for usage instructions
3. Create an issue on GitHub with:
   - Version numbers you're seeing
   - Exact error message
   - Steps you've tried

---

## 📝 Version History

### Version 1.1.0 (2025-11-16)
- ✅ Fixed PowerShell syntax errors in setup-windows.ps1
- ✅ Added version tracking to all batch files
- ✅ Improved error messages
- ✅ Added UPDATE.md (this file)

### Version 1.0.0 (2025-11-15)
- Initial release of batch file installation system
- Automated setup with Chocolatey
- One-click installation and running

---

**Current Version: 1.1.0**
