# SimpleSkale 4.0

**EmbroiderSize 4.0 - "SimpleSkale"**
A fast, safe, Brother PP1-friendly stitch scaling application built with Tauri + React + TypeScript.

## 🚀 Quick Start (Self-Healing Installation)

**SimpleSkale now fixes problems automatically!**

### For First-Time Users

1. **Right-click** `install.bat` → **Run as Administrator**
2. **Wait** 20-40 minutes
3. **Restart** your computer
4. **Double-click** `run.bat` or `SimpleSkale.vbs`

That's it! No manual troubleshooting needed.

**What's different now:**
- ✅ `install.bat` prevents common errors automatically
- ✅ `run.bat` detects and fixes issues on its own
- ✅ No need to run fix scripts manually
- ✅ User-friendly progress messages
- ✅ Optional GUI launcher (`SimpleSkale.vbs`)

**For detailed setup:** See [QUICKSTART_SIMPLE.md](QUICKSTART_SIMPLE.md) or [QUICKSTART.md](QUICKSTART.md)

---

## 🎯 Project Status

**Current Phase:** Phase 3 - UI Polish ✅ **COMPLETE**

### Phase 1 Completed (100%)
- ✅ Tauri + React + TypeScript project initialized
- ✅ TypeScript data model defined (types/index.ts)
- ✅ Calculation utilities ported from Python (utils/calculations.ts)
- ✅ Validation engine ported from Python (engine/validator.ts)
- ✅ Brother PP1 machine profile configured
- ✅ **File parsers: PES and DST formats (lib/parsers/)**
- ✅ **Binary file reading utilities (lib/binary.ts)**
- ✅ **SimpleSkale engine with stitch interpolation/reduction (engine/simpleskale.ts)**
- ✅ **Canvas renderer component (components/StitchCanvas.tsx)**
- ✅ **Demo application with test pattern**

### Phase 2 Completed (100%)
- ✅ File upload dialog (Tauri file picker)
- ✅ Real-time scaling with live preview
- ✅ Live validation display
- ✅ **File export functionality (PES/DST)**
- ✅ **Binary file writing utilities (lib/binaryWriter.ts)**
- ✅ **File writers: PES and DST formats (lib/writers/)**

### Phase 3 Completed (100%)
- ✅ **Density heatmap visualization with color-coded overlay**
- ✅ **Heatmap legend (Safe/Warning/Caution/Danger zones)**
- ✅ **Before/After split view for design comparison**
- ✅ **Enhanced UI styling with gradient buttons**
- ✅ **Beautiful slider with custom styling**
- ✅ **Polished control panel and canvas containers**

### Next Phase - Advanced Features (Phase 4)
- ⏭️ Batch processing (multiple files)
- ⏭️ Machine-specific presets (Brother, Janome, Bernina)
- ⏭️ Advanced validation rules
- ⏭️ Export to additional formats (JEF, EXP, etc.)

### Roadmap
See `../SIMPLESKALE_READINESS_ANALYSIS.md` for the complete implementation plan and atomic task breakdown.

## 🏗️ Architecture

```
simpleskale-v4/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Calculation and utility functions
│   ├── engine/          # SimpleSkale core engine
│   ├── lib/             # File parsers and low-level utilities
│   ├── components/      # React UI components
│   └── App.tsx          # Main application
├── src-tauri/           # Rust backend (Tauri)
└── package.json
```

## 🔧 Tech Stack

- **Frontend:** React 19 + TypeScript 5.8
- **Desktop Framework:** Tauri 2
- **Build Tool:** Vite 7
- **State Management:** (TBD - Zustand or Jotai)
- **Canvas Rendering:** HTML5 Canvas (may upgrade to WebGL)
- **Testing:** Jest + React Testing Library (TBD)

## 🚀 Quick Start

**📖 See [QUICKSTART.md](QUICKSTART.md) for detailed launch instructions!**

### TL;DR - Launch the App

```bash
# Navigate to this directory
cd simpleskale-v4

# Install dependencies (first time only)
npm install

# Run the application
npm run tauri dev
```

**Then click "Load Test Pattern" to see the demo!**

### Prerequisites
- Node.js 18+ (current: v22.21.1)
- Rust 1.70+ (current: v1.91.1)
- npm 10+
- Linux: Additional webkit2gtk dependencies ([see QUICKSTART.md](QUICKSTART.md#linux-additional-requirements))

### Build Commands

```bash
# Development mode (hot reload)
npm run tauri dev

# Vite dev server only (UI testing)
npm run dev

# Production build
npm run tauri build
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage (when implemented)
npm test -- --coverage
```

## 📝 Design Principles

1. **UX First** - Zero-confusion UI, instant feedback, minimal jargon
2. **Safe Scaling** - Avoid broken designs (density, stitch length, machine limits)
3. **PP1-Optimized** - Designed for Brother Skitch PP1 (extensible to other machines)
4. **Modular Architecture** - SimpleSkale is a distinct module for future AI-based scaling

## 🎨 Key Features (Planned)

- ✅ Real-time preview with live scaling slider
- ✅ Density heatmap visualization
- ✅ PP1 Safe Mode with strict machine limit enforcement
- ✅ Before/After split view
- ✅ Inline warnings and quality assessment
- ✅ Quick presets (50%, 80%, fit to hoop)
- ✅ Undo/Redo support

## 🔗 Related Files

- **Implementation Plan:** `../EmbroiderSize 4.0 – "SimpleSkale" Implementation Plan.md`
- **Readiness Analysis:** `../SIMPLESKALE_READINESS_ANALYSIS.md`
- **Python Legacy Code:** `../src/` (reference for porting)

## 📦 Brother PP1 Profile

The default machine profile is optimized for the Brother Skitch PP1:
- Hoop Size: 100mm × 100mm
- Max Stitch Length: 3.0mm
- Safe Mode: Enabled by default
- Conservative density limits for hobby use

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 🤝 Contributing

This project is currently in active development. See the readiness analysis document for the complete task breakdown and implementation phases.

## 📄 License

MIT License - Same as EmbroiderSize parent project

---

**Part of the EmbroiderSize Project**
Fast, safe embroidery file resizing for hobby and professional use.
