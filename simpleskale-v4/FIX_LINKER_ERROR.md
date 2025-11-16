# 🔧 Explicit Fix Guide: "linker link.exe not found"

**Error you're seeing:**
```
error: linker `link.exe` not found
note: the msvc targets depend on the msvc linker but `link.exe` was not found
note: please ensure that Visual Studio 2017 or later, or Build Tools for Visual Studio
were installed with the Visual C++ option.
```

---

## ✅ SOLUTION: Install Visual Studio C++ Build Tools

This error means Windows doesn't have the Microsoft C++ compiler tools that Rust/Tauri needs. Here's how to fix it:

---

## 📥 STEP 1: Download Visual Studio Build Tools

1. **Open your web browser**

2. **Go to this URL:**
   ```
   https://visualstudio.microsoft.com/downloads/
   ```

3. **Scroll down** to the section called **"Tools for Visual Studio 2022"**

4. **Click** on **"Build Tools for Visual Studio 2022"**
   - It will download a file called `vs_BuildTools.exe` (about 3-4 MB)

5. **Wait for download to complete**

---

## 💿 STEP 2: Install Build Tools

1. **Double-click** the downloaded `vs_BuildTools.exe` file

2. **Click "Yes"** if Windows asks "Do you want to allow this app to make changes?"

3. **Wait** for the Visual Studio Installer to load (may take 1-2 minutes)

4. **You'll see a screen with different workload options**

5. **CHECK THE BOX** next to **"Desktop development with C++"**
   - ✅ Make sure this checkbox is selected!
   - This is in the left column of options

6. **On the right side**, you'll see "Installation details"
   - The installer will automatically select what's needed
   - Total download size will be about **6-7 GB**

7. **Click "Install"** button (bottom right)

8. **Wait for installation to complete**
   - This will take 15-30 minutes depending on your internet speed
   - You can see progress in the installer window
   - Do NOT close the window while installing

9. **When it says "Installation succeeded"**, click **"Close"**

---

## 🔄 STEP 3: Restart Your Computer

**THIS IS CRITICAL:**

1. **Close all programs**

2. **Restart your computer**
   - Click Start → Power → Restart
   - Or just restart normally

3. **Wait for Windows to fully restart**

**Why restart?** The C++ Build Tools add system environment variables that only work after a restart.

---

## ✅ STEP 4: Try Running SimpleSkale Again

1. **Open PowerShell** or **Command Prompt**

2. **Navigate to the SimpleSkale directory:**
   ```powershell
   cd C:\Users\YourUsername\Documents\GitHub\EmbroiderSize\simpleskale-v4
   ```
   (Replace `YourUsername` with your actual Windows username)

3. **Run the app:**
   ```powershell
   npm run tauri dev
   ```

4. **Wait for compilation**
   - First time will take 2-5 minutes as Rust compiles everything
   - You'll see lots of "Compiling..." messages - this is normal!

5. **Success looks like this:**
   ```
   Compiling tauri v2.9.3
   Compiling simpleskale-v4 v0.1.0
       Finished dev [unoptimized + debuginfo] target(s) in 2m 15s
        Running `target\debug\simpleskale-v4.exe`
   ```

6. **A window should open** showing the SimpleSkale application!

---

## 🚨 Alternative: Install Full Visual Studio (If Build Tools Don't Work)

If the Build Tools installer gives you trouble, you can install full Visual Studio instead:

1. **Go to:**
   ```
   https://visualstudio.microsoft.com/vs/community/
   ```

2. **Download "Visual Studio Community 2022"** (it's free)

3. **Run the installer**

4. **Select "Desktop development with C++"** workload

5. **Click Install**

6. **Restart computer**

7. **Try `npm run tauri dev` again**

---

## 🔍 How to Verify Build Tools Are Installed

After installing and restarting, verify the tools are working:

**Option 1: Check in Programs**
1. Open "Add or remove programs" in Windows
2. Search for "Microsoft Visual Studio"
3. You should see "Microsoft Visual Studio Build Tools 2022"

**Option 2: Check with Command**
```powershell
# Try to find the C++ compiler
where cl.exe
```
If it shows a path like `C:\Program Files\...`, the tools are installed.

---

## ❓ Troubleshooting

### Problem: Installer says "Not enough disk space"
**Solution:** You need at least 10 GB free on your C: drive. Free up space or install to a different drive.

### Problem: Installation fails or gets stuck
**Solution:**
1. Close the installer
2. Restart your computer
3. Try running the installer again
4. Make sure Windows is fully updated (Windows Update)

### Problem: Still getting link.exe error after installing
**Solution:**
1. Verify you selected "Desktop development with C++" workload
2. Make sure you restarted your computer
3. Try opening a NEW PowerShell window (close old ones)
4. Try running as Administrator (right-click PowerShell → "Run as Administrator")

### Problem: Installer won't download
**Solution:**
1. Check your internet connection
2. Temporarily disable antivirus
3. Try downloading from a different browser

---

## 📞 What Each Step Does

- **Build Tools:** Installs Microsoft C++ compiler (cl.exe) and linker (link.exe)
- **Desktop development with C++:** Ensures all C++ components are installed
- **Restart:** Loads new environment variables into Windows
- **npm run tauri dev:** Compiles Rust code using the newly installed tools

---

## ⏱️ Time Required

- **Download:** 2-5 minutes (depending on internet)
- **Installation:** 15-30 minutes (depending on computer speed)
- **Restart:** 2-3 minutes
- **First compile:** 2-5 minutes
- **TOTAL:** About 30-45 minutes

---

## ✨ After This Works

Once you successfully run `npm run tauri dev` and see the SimpleSkale window:

1. **Click "Load Test Pattern"** to see a demo embroidery design
2. **Move the slider** to scale from 20% to 200%
3. **Check "Show Density Heatmap"** to see color-coded density visualization
4. **Check "Before/After Split View"** to compare original vs scaled
5. **Click "Open PES/DST File"** to load your own embroidery files
6. **Click "Export Scaled File"** to save your scaled designs

---

## 🎯 Quick Summary for Impatient People

1. Download: https://visualstudio.microsoft.com/downloads/ → Build Tools
2. Install: Check "Desktop development with C++"
3. Restart computer (MUST DO THIS!)
4. Run: `npm run tauri dev`
5. Wait 2-5 minutes for first compile
6. Window opens = SUCCESS! 🎉

---

**Need more help?** Check ERROR_FIXES.md in the simpleskale-v4 folder for additional troubleshooting.
