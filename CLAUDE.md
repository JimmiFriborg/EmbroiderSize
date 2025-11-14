# CLAUDE.md - AI Assistant Guide for EmbroiderSize

**Last Updated:** 2025-11-14
**Repository:** JimmiFriborg/EmbroiderSize
**Status:** Alpha - Core Functionality Implemented

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Conventions](#coding-conventions)
5. [Key Files and Their Purpose](#key-files-and-their-purpose)
6. [Common Tasks](#common-tasks)
7. [Testing Guidelines](#testing-guidelines)
8. [Deployment](#deployment)
9. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

### Purpose
EmbroiderSize is a Python-based command-line tool for intelligently resizing embroidery stitch files (.pes, .dst, .jef, and 40+ other formats) without compromising quality. Unlike simple image resizing, embroidery files require careful manipulation to maintain proper stitch density and prevent quality issues.

### Current State
- **Phase:** Alpha - Core functionality implemented
- **Language:** Python 3.8+
- **Primary Features:**
  - Resize embroidery files by width, height, or percentage
  - Intelligent validation with safety warnings
  - Format conversion between 40+ embroidery formats
  - Preview mode for checking results before saving
  - Beautiful CLI with detailed pattern information

### Technology Stack
- **Core Library:** PyEmbroidery (embroidery file reading/writing)
- **CLI Framework:** Click (command-line interface)
- **UI Library:** Rich (terminal formatting and tables)
- **Testing:** pytest (unit testing framework)
- **Package Management:** pip, setuptools

---

## Repository Structure

```
EmbroiderSize/
├── src/                    # Source code
│   ├── __init__.py         # Package initialization
│   ├── cli.py              # Command-line interface (Click)
│   ├── resizer.py          # Core resizing logic
│   ├── validator.py        # Safety validation and checks
│   └── utils.py            # Helper functions (dimensions, density, etc.)
├── tests/                  # Test files
│   ├── __init__.py
│   └── test_resizer.py     # Unit tests for resizer module
├── examples/               # Usage examples (future: sample files)
├── .git/                   # Git version control
├── .gitignore              # Git ignore rules
├── requirements.txt        # Python dependencies
├── setup.py                # Package configuration
├── README.md               # Project documentation
└── CLAUDE.md               # This file - AI assistant guide
```

---

## Development Workflow

### Branch Strategy

- **Main Branch:** `main` or `master` (protected)
- **Feature Branches:** `claude/claude-md-*` or `feature/*`
- **Current Development Branch:** `claude/claude-md-mhzczw6d0f0afa0a-01K34iYBdLKfqVuNPmcPqwdk`

### Git Workflow

1. **Creating a New Feature:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Committing Changes:**
   ```bash
   git add .
   git commit -m "Clear, descriptive commit message"
   ```

3. **Pushing Changes:**
   ```bash
   git push -u origin branch-name
   ```

4. **Creating Pull Requests:**
   - Ensure all tests pass
   - Provide clear description of changes
   - Reference any related issues

### Commit Message Conventions

- Use clear, descriptive messages
- Start with a verb (Add, Update, Fix, Remove, Refactor)
- Be specific about what changed and why
- Examples:
  - `Add initial embroidery sizing algorithm`
  - `Fix calculation error in stitch density`
  - `Update documentation for API endpoints`
  - `Refactor image processing pipeline`

---

## Coding Conventions

### General Principles

1. **Readability First:** Code should be self-documenting
2. **DRY (Don't Repeat Yourself):** Avoid code duplication
3. **SOLID Principles:** Follow object-oriented design principles
4. **Error Handling:** Always handle errors gracefully
5. **Security:** Never commit secrets, API keys, or credentials

### Code Style

**Python (PEP 8):**
- Use 4 spaces for indentation (no tabs)
- Maximum line length: 100 characters (reasonable flexibility)
- Use snake_case for functions and variables
- Use PascalCase for class names
- Use UPPER_CASE for constants
- Type hints are encouraged for function signatures
- Use double quotes for strings (consistency with existing code)

### Comments and Documentation

- Write comments for complex logic
- Document all public APIs
- Keep comments up-to-date with code changes
- Use docstrings for functions and classes

---

## Key Files and Their Purpose

| File | Purpose | Modify Frequency | Line Count |
|------|---------|------------------|------------|
| src/cli.py | Command-line interface with Click and Rich | Medium | ~300 |
| src/resizer.py | Core embroidery resizing logic | High | ~250 |
| src/validator.py | Safety validation and quality checks | Medium | ~180 |
| src/utils.py | Helper functions for dimensions, density, formatting | Low | ~150 |
| tests/test_resizer.py | Unit tests for resizer module | As features added | ~80 |
| requirements.txt | Python dependencies | Low | ~3 |
| setup.py | Package configuration and entry points | Low | ~40 |
| README.md | Comprehensive user documentation | Medium | ~350 |
| CLAUDE.md | AI assistant guide (this file) | As project evolves | ~330+ |

### Critical Modules

**src/cli.py** - Main user interface
- Commands: `info`, `resize`, `convert`
- Rich terminal output with tables and colored text
- User-friendly error messages

**src/resizer.py** - Core logic
- `EmbroideryResizer` class for pattern manipulation
- Simple and smart resize modes
- Pattern loading, validation, and writing

**src/validator.py** - Safety system
- `ResizeValidator` class for quality checks
- Validates resize percentages (±20% safe limit)
- Validates stitch density (0.4-0.45mm optimal)
- ValidationLevel enum for severity (SAFE, WARNING, DANGER, CRITICAL)

---

## Common Tasks

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/JimmiFriborg/EmbroiderSize.git
cd EmbroiderSize

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install package in development mode
pip install -e .
```

### Running the Tool

```bash
# Display pattern information
python -m src.cli info design.pes

# Resize a pattern
python -m src.cli resize input.pes output.pes --width 100

# Convert between formats
python -m src.cli convert input.pes output.dst

# Preview resize without saving
python -m src.cli resize input.pes output.pes --scale 150 --preview
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_resizer.py

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=src --cov-report=html
```

### Development Workflow

```bash
# Check code before committing
python -m src.cli info examples/sample.pes  # Test basic functionality

# Run tests
pytest

# Check git status
git status

# Commit changes
git add .
git commit -m "Description of changes"

# Push to branch
git push -u origin branch-name
```

---

## Testing Guidelines

### Test Structure

Tests are located in `tests/` directory using pytest framework.

**Current Tests:**
- `test_resizer.py` - Core resizer functionality
  - Pattern dimension calculation
  - Scale factor calculation
  - Validation checks

### Test Coverage Goals
- Aim for >80% code coverage
- All critical paths must be tested
- Include edge cases and error scenarios
- Test both success and failure cases

### Testing Best Practices

1. **Use Test Fixtures** - Create reusable test patterns
2. **Test Edge Cases** - Very small/large designs, extreme resize percentages
3. **Test Error Handling** - Invalid files, missing parameters
4. **Test Validation** - All validation levels (SAFE, WARNING, DANGER, CRITICAL)
5. **Clean Up** - Remove temporary files after tests

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test
pytest tests/test_resizer.py::test_pattern_dimensions
```

---

## Deployment

### Distribution

The tool is distributed as a Python package:

```bash
# Install from source
pip install -e .

# Future: Install from PyPI (when published)
pip install embroider-size
```

### Entry Points

After installation, the tool can be run as:
```bash
# Via module
python -m src.cli <command>

# Future: Via console script (after pip install)
embroider-resize <command>
```

### Environment Variables

No environment variables required. All configuration is via command-line arguments.

### Brother PP1 Integration Notes

The Brother PP1 (Skitch) embroidery machine:
- Uses **Bluetooth** connectivity (not USB)
- Requires **Artspira mobile app** for file transfer
- Has **100mm × 100mm (4" × 4")** working area
- Supports **.pes format** (primary)

**Workflow for PP1:**
1. Resize file with EmbroiderSize to fit PP1 hoop (< 100mm)
2. Transfer via Artspira app over Bluetooth
3. Verify design fits in PP1's 4" × 4" hoop

---

## AI Assistant Guidelines

### When Working on This Project

1. **Always Check Current State:**
   - Run `git status` before starting work
   - Check which branch you're on
   - Review recent commits with `git log`

2. **File Operations:**
   - Prefer editing existing files over creating new ones
   - Always read files before modifying them
   - Don't create unnecessary documentation files

3. **Code Quality:**
   - Follow existing code patterns
   - Validate all changes before committing
   - Check for security vulnerabilities (SQL injection, XSS, etc.)
   - Never commit secrets or credentials

4. **Testing:**
   - Run tests before committing (when available)
   - Add tests for new functionality
   - Ensure all tests pass

5. **Communication:**
   - Be concise and clear
   - Provide file paths with line numbers when referencing code
   - Format: `file_path:line_number`

6. **Task Management:**
   - Use TodoWrite tool for complex multi-step tasks
   - Mark tasks as completed immediately after finishing
   - Keep only one task in_progress at a time

### Common Patterns to Follow

**Before Making Changes:**
```bash
# Check current state
git status
git log --oneline -5

# Read relevant files
# Use Read tool for existing files
```

**After Making Changes:**
```bash
# Stage and commit
git add .
git commit -m "Descriptive message"

# Push to current branch
git push -u origin <branch-name>
```

### What to Avoid

- ❌ Don't create files without necessity
- ❌ Don't use bash tools for file operations (use Read, Edit, Write)
- ❌ Don't commit without clear commit messages
- ❌ Don't push to main/master without explicit permission
- ❌ Don't use emojis unless explicitly requested
- ❌ Don't skip error handling
- ❌ Don't hardcode sensitive information

### Project-Specific Considerations

**Embroidery Sizing Domain:**
- Be mindful of measurement units (mm, inches, stitches)
- Consider thread tension and fabric types
- Understand embroidery file formats (DST, PES, JEF, etc.)
- Account for scaling algorithms and quality preservation

**File Format Handling:**
- Be careful with binary embroidery files
- Preserve file format specifications
- Validate input/output data

**Algorithm Considerations:**
- Precision is critical for sizing calculations
- Test edge cases (very small/large designs)
- Consider performance for complex designs

---

## Project Evolution

### Completed
✅ Technology stack chosen (Python 3.8+, PyEmbroidery, Click, Rich)
✅ Core resizing functionality implemented
✅ Validation and safety checks implemented
✅ CLI interface with beautiful terminal output
✅ Format conversion support
✅ Basic unit tests
✅ Comprehensive documentation (README and CLAUDE.md)
✅ Brother PP1 connectivity research

### Next Steps (Roadmap)

1. **Enhanced Smart Resize** - Implement true density-preserving resize with stitch interpolation/reduction
2. **GUI Interface** - Create graphical user interface for non-technical users
3. **Batch Processing** - Process multiple files at once
4. **Machine Presets** - Add presets for specific embroidery machines (Brother, Janome, Bernina)
5. **Stitch Visualization** - Preview embroidery patterns visually before/after resize
6. **CI/CD Pipeline** - Automated testing and deployment
7. **PyPI Publication** - Publish to Python Package Index for easy installation
8. **Advanced Validation** - More sophisticated quality checks based on stitch types

### Updating This Document

When significant changes occur:
- Update the "Last Updated" date at the top
- Add new sections as the project grows
- Keep examples relevant and current
- Remove outdated information
- Document new patterns and conventions

---

## Resources

### Internal Documentation
- [README.md](README.md) - Comprehensive user guide and documentation
- [CLAUDE.md](CLAUDE.md) - This file, AI assistant guidelines

### External Resources

**Core Dependencies:**
- [PyEmbroidery](https://github.com/EmbroidePy/pyembroidery) - Embroidery file reading/writing library
- [Click](https://click.palletsprojects.com/) - Python CLI framework
- [Rich](https://rich.readthedocs.io/) - Terminal formatting library

**Embroidery File Format Specifications:**
- [PES Format Documentation](https://edutechwiki.unige.ch/en/Embroidery_format_PES) - Technical PES format details
- [DST Format Information](https://www.fileformat.wiki/misc/dst/) - DST format specification
- [Embroidery Formats Overview](https://edutechwiki.unige.ch/en/Embroidery_format) - General embroidery format information

**Domain Knowledge:**
- Industry standard: ±20% safe resize limit
- Optimal stitch density: 0.4-0.45mm between stitches
- PyEmbroidery units: 1/10mm internally

**Brother PP1 Resources:**
- Brother Skitch PP1 (100mm × 100mm working area)
- Artspira App (Bluetooth connectivity)
- Supports .pes format primarily

---

## Questions or Issues?

If you encounter issues or need clarification:
1. Check this CLAUDE.md file first
2. Review the README.md
3. Check git commit history for context
4. Ask the repository owner (JimmiFriborg)

---

**Remember:** This is a living document. Keep it updated as the project evolves to ensure it remains a valuable resource for AI assistants and developers working on EmbroiderSize.
