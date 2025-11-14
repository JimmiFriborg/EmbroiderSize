# EmbroiderSize

**A smart tool for resizing embroidery stitch files without ruining quality**

[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

EmbroiderSize is a Python-based command-line tool designed to resize embroidery stitch files (.pes, .dst, .jef, and 40+ other formats) intelligently. Unlike simple image resizing, embroidery files contain stitch coordinates that require careful manipulation to maintain quality.

### The Challenge

Embroidery files like PES and DST store actual stitch coordinates rather than vector graphics. This makes resizing challenging because:

- **Simple scaling changes stitch density** - Making a design smaller creates overly dense stitches that can break needles, while making it larger creates sparse stitches with poor coverage
- **Safe resize limits** - Industry experts recommend staying within ±20% of the original size for quality results
- **Not just coordinates** - Underlay stitches, color changes, and stitch types all need consideration

### The Solution

EmbroiderSize provides:

- **Modern GUI interface** - Easy-to-use graphical interface for non-technical users
- **Intelligent validation** - Warns you about unsafe resize operations before you waste time and materials
- **Two resize modes** - Simple (fast) and Smart (quality-preserving)
- **Format support** - Reads 40+ formats, writes 20+ formats via PyEmbroidery
- **User-friendly CLI** - Beautiful terminal interface with clear feedback
- **Quality metrics** - Shows stitch density, dimensions, and counts before/after
- **Portable executable** - Build standalone apps for Windows, Mac, and Linux

## Features

- 🖥️ **Modern GUI** - User-friendly graphical interface (NEW!)
- 📏 **Resize by width, height, or percentage**
- 🎯 **Smart validation** with safety warnings
- 🔍 **Preview mode** to see results before saving
- 📊 **Detailed pattern information** display
- 🔄 **Format conversion** between embroidery file types
- ⚡ **Fast and efficient** processing
- 🎨 **Beautiful terminal UI** with color-coded feedback
- 📦 **Portable executable** - Build standalone apps for distribution

## Supported Formats

**Input formats (40+):** .pes, .dst, .exp, .jef, .vp3, .hus, .vip, .sew, .xxx, .pec, .pcs, and many more

**Output formats (20+):** .pes, .dst, .exp, .jef, .vp3, .u01, .pec, .xxx, .tbf, .gcode, and more

See [PyEmbroidery documentation](https://github.com/EmbroidePy/pyembroidery) for complete format list.

## Installation

### Requirements

- Python 3.8 or higher
- pip

### Install from source

```bash
# Clone the repository
git clone https://github.com/JimmiFriborg/EmbroiderSize.git
cd EmbroiderSize

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install the package in development mode
pip install -e .
```

## Quick Start

EmbroiderSize can be used in two ways: **GUI (Graphical Interface)** or **CLI (Command Line)**.

## Using the GUI (Recommended for Most Users)

The GUI provides a simple, intuitive interface for resizing embroidery files without using the command line.

### Launching the GUI

**Option 1: Direct Launch (Simplest)**
```bash
python EmbroiderSize.py
```

**Option 2: After Installation**
```bash
# If you installed with pip
embroider-size-gui

# Or using Python module
python -m src.gui
```

**Option 3: Double-Click (After Building Executable)**
- Build the standalone executable (see Building Standalone Executable section)
- Double-click `EmbroiderSize.exe` (Windows) or `EmbroiderSize.app` (Mac)
- No Python installation required!

### Using the GUI

1. **Load a File**
   - Click "Browse File" button
   - Select your embroidery file (.pes, .dst, .jef, etc.)
   - Pattern information will display automatically

2. **Choose Resize Method**
   - **Scale** - Resize by percentage (e.g., 150% = 1.5x larger)
   - **Width** - Set target width (maintains aspect ratio)
   - **Height** - Set target height (maintains aspect ratio)
   - **Both** - Set both width and height explicitly

3. **Preview Changes**
   - Click "Preview Resize" to see validation results
   - Check for warnings about stitch density
   - Review new dimensions before saving

4. **Resize & Save**
   - Click "Resize & Save"
   - Choose output location and format
   - Done! Your resized file is ready to use

### GUI Features

- **Drag & Drop** - Drag embroidery files directly into the window (coming soon)
- **Real-time Validation** - See warnings about extreme resizes
- **Pattern Info** - View dimensions, stitch count, colors, and density
- **Multiple Formats** - Open and save in 40+ embroidery formats
- **Progress Feedback** - Visual progress indicators during processing
- **Keyboard Shortcuts** - `Ctrl+O` to open files, `Ctrl+Q` to quit

## Using the CLI (Command Line)

For automation, scripting, or batch processing, use the command-line interface.

### Display Pattern Information

```bash
python -m src.cli info my_design.pes
```

This shows:
- Dimensions (mm and inches)
- Stitch count
- Thread colors
- Stitch density

### Resize a Pattern

**Resize to specific width (maintains aspect ratio):**
```bash
python -m src.cli resize input.pes output.pes --width 100
```

**Scale by percentage:**
```bash
python -m src.cli resize input.pes output.pes --scale 150
```

**Resize to specific dimensions:**
```bash
python -m src.cli resize input.pes output.pes --width 100 --height 80
```

**Preview before saving:**
```bash
python -m src.cli resize input.pes output.pes --scale 50 --preview
```

### Convert Between Formats

```bash
python -m src.cli convert input.pes output.dst
```

## Usage Examples

### Example 1: Safe Resize with Validation

```bash
$ python -m src.cli resize design.pes resized.pes --width 85

Pattern Information
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ Property        ┃ Value             ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│ Width           │ 100.00mm (3.94")  │
│ Height          │ 100.00mm (3.94")  │
│ Stitch Count    │ 5,432             │
│ Thread Colors   │ 3                 │
│ Stitch Density  │ 0.420mm           │
└─────────────────┴───────────────────┘

Resize Results
┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━┓
┃ Property        ┃ Original          ┃ New              ┃
┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━┩
│ Width           │ 100.00mm (3.94")  │ 85.00mm (3.35")  │
│ Height          │ 100.00mm (3.94")  │ 85.00mm (3.35")  │
│ Scale Factor    │ 100%              │ 85.0%            │
└─────────────────┴───────────────────┴──────────────────┘

✓ Resize of 15.0% is within safe limits (±20%)
✓ Resized file saved to: resized.pes
```

### Example 2: Warning for Large Resize

```bash
$ python -m src.cli resize design.pes big.pes --scale 200

⚠ Resize of 100.0% is significant and may cause problems
⚠ Stitch density (0.840mm) is sparser than optimal (0.400-0.450mm)
```

### Example 3: Preview Mode

```bash
python -m src.cli resize design.pes test.pes --scale 50 --preview
```

Shows what the resize would look like without creating the output file.

## Command Reference

### `info` - Display Pattern Information

```bash
python -m src.cli info <input_file>
```

Shows detailed information about an embroidery file including dimensions, stitch count, colors, and density.

### `resize` - Resize a Pattern

```bash
python -m src.cli resize [OPTIONS] <input_file> <output_file>
```

**Options:**
- `--width, -w FLOAT` - Target width in millimeters
- `--height, -h FLOAT` - Target height in millimeters
- `--scale, -s FLOAT` - Scale percentage (e.g., 150 for 150%, 50 for 50%)
- `--mode, -m [simple|smart]` - Resize mode (default: simple)
- `--force, -f` - Force resize even if validation fails
- `--preview, -p` - Preview without saving

**Note:** You must specify at least one of `--width`, `--height`, or `--scale`.

### `convert` - Convert File Format

```bash
python -m src.cli convert [OPTIONS] <input_file> <output_file>
```

**Options:**
- `--format, -f TEXT` - Explicit output format (usually auto-detected from extension)

## Understanding Resize Modes

### Simple Mode (Default)

**How it works:** Uses PyEmbroidery's built-in scaling to proportionally resize all stitch coordinates.

**Pros:**
- Fast and efficient
- Preserves design structure exactly
- Works with all embroidery formats

**Cons:**
- Changes stitch density
- May be too dense when downsizing
- May be too sparse when upsizing

**Best for:**
- Resizes within ±20%
- Quick adjustments
- When stitch density changes are acceptable

### Smart Mode (Experimental)

**How it works:** Attempts to maintain optimal stitch density by intelligently adjusting stitches.

**Note:** Currently uses simple scaling with validation. Full smart resizing (adding/removing stitches while maintaining density) is a complex operation that may require professional re-digitizing for best results.

**Best for:**
- Understanding what the resize will do
- Getting validation feedback
- Future enhancement

## Building Standalone Executable

You can build a standalone executable that runs without Python installed. This is perfect for distributing to users who don't have Python.

### Quick Build

```bash
# Install PyInstaller (if not already installed)
pip install pyinstaller

# Run the build script
python build_executable.py
```

The build script will:
1. Check and install required dependencies
2. Clean previous builds
3. Build the executable using PyInstaller
4. Create a distributable folder in `dist/`

### Manual Build

```bash
# Install PyInstaller
pip install pyinstaller

# Build using the spec file
pyinstaller --clean EmbroiderSize.spec
```

### Distribution

After building, you'll find:
- **Windows:** `dist/EmbroiderSize/EmbroiderSize.exe`
- **macOS:** `dist/EmbroiderSize.app`
- **Linux:** `dist/EmbroiderSize/EmbroiderSize`

Simply distribute the entire `dist/EmbroiderSize` folder (or the `.app` on macOS) to users.

### Requirements for Building

- Python 3.8+
- PyInstaller
- All EmbroiderSize dependencies

**Note:** Build on the target platform (build on Windows for Windows, macOS for macOS, etc.)

## Brother PP1 / Skitch Connectivity

The Brother PP1 (Skitch) embroidery machine uses Bluetooth connectivity through the Artspira mobile app rather than direct USB connection.

### How to Use Files with Brother PP1

1. **Prepare your file** - Resize using EmbroiderSize and export as .pes format
2. **Transfer via app** - Use the Artspira mobile app to transfer the file to your PP1
3. **Verify dimensions** - PP1 has a 100mm × 100mm (4" × 4") working area

### Recommended Settings for PP1

```bash
# Ensure design fits PP1's 100mm x 100mm hoop
python -m src.cli resize design.pes output.pes --width 95
python -m src.cli info output.pes  # Verify it fits
```

## Safety Guidelines

### Resize Limits

- **✅ Safe (±20%)** - Generally produces good results
- **⚠️ Warning (20-30%)** - May affect quality, test before production
- **⚠️ Danger (30-50%)** - Significant quality issues likely
- **❌ Critical (>50%)** - Re-digitizing strongly recommended

### Stitch Density Guidelines

- **Optimal:** 0.4 - 0.45mm between stitches
- **Too dense (<0.2mm):** Risk of needle breaks, fabric damage
- **Too sparse (>1.0mm):** Poor coverage, unprofessional appearance

## Troubleshooting

### "No stitches found in pattern"

The file may be corrupted or empty. Try opening it in embroidery software to verify.

### "Resize validation failed"

The resize percentage is too extreme. Consider:
- Reducing the resize amount
- Using `--force` if you understand the risks
- Re-digitizing the design at the target size

### Output file has quality issues

- Keep resizes within ±20%
- Check stitch density with `info` command
- Consider professional re-digitizing for drastic size changes

## Technical Details

### Architecture

EmbroiderSize is built with:
- **PyEmbroidery** - Core embroidery file manipulation
- **CustomTkinter** - Modern GUI framework (NEW!)
- **Click** - User-friendly CLI framework
- **Rich** - Beautiful terminal output
- **Pillow** - Image processing support

### Project Structure

```
EmbroiderSize/
├── src/
│   ├── cli.py                # Command-line interface
│   ├── gui.py                # Graphical user interface (NEW!)
│   ├── resizer.py            # Core resizing logic
│   ├── validator.py          # Safety validation
│   └── utils.py              # Helper functions
├── tests/
│   └── test_resizer.py       # Unit tests
├── EmbroiderSize.py          # GUI launcher script (NEW!)
├── EmbroiderSize.spec        # PyInstaller spec file (NEW!)
├── build_executable.py       # Executable build script (NEW!)
├── requirements.txt          # Python dependencies
├── setup.py                  # Package configuration
└── README.md                 # This file
```

### Measurement Units

- **Internal:** 1/10mm (PyEmbroidery standard)
- **Display:** Millimeters and inches
- **Stitch density:** Millimeters between stitches

## Contributing

Contributions are welcome! Areas for improvement:

- Enhanced smart resizing algorithm with stitch interpolation
- Additional validation rules for different fabric types
- Support for more machine-specific requirements
- Machine presets (Brother, Janome, Bernina, etc.)
- Advanced drag-and-drop with tkinterdnd2
- Stitch visualization and preview
- Batch processing improvements

## License

MIT License - See LICENSE file for details

## Credits

- Built with [PyEmbroidery](https://github.com/EmbroidePy/pyembroidery) by EmbroidePy
- Developed for the embroidery community

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review CLAUDE.md for AI assistant guidelines

## Roadmap

- [x] **GUI interface** - ✅ COMPLETED!
- [ ] Full smart resize implementation with stitch density adjustment
- [ ] Machine-specific presets (Brother, Janome, etc.)
- [ ] Advanced validation rules
- [ ] Stitch visualization
- [ ] Automatic format detection and conversion
- [ ] Batch processing for multiple files
- [ ] Enhanced drag-and-drop support with tkinterdnd2

---

**Happy Embroidering! 🧵**