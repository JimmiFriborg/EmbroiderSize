# CLAUDE.md - AI Assistant Guide for EmbroiderSize

**Last Updated:** 2025-11-14
**Repository:** JimmiFriborg/EmbroiderSize
**Status:** Early Development / Initial Setup

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
EmbroiderSize is a project focused on embroidery sizing and manipulation. The exact scope and functionality are still being defined.

### Current State
- **Phase:** Initial repository setup
- **Last Commit:** 620b68d (Initial commit)
- **Files:** README.md only
- **Language/Framework:** To be determined

### Technology Stack
*To be documented as the project develops*

---

## Repository Structure

```
EmbroiderSize/
├── .git/              # Git version control
├── README.md          # Project README
└── CLAUDE.md          # This file - AI assistant guide
```

### Expected Future Structure
As the project develops, the structure may include:

```
EmbroiderSize/
├── src/               # Source code
├── tests/             # Test files
├── docs/              # Documentation
├── examples/          # Usage examples
├── requirements.txt   # Python dependencies (if Python-based)
├── package.json       # Node dependencies (if JavaScript-based)
├── .gitignore         # Git ignore rules
├── LICENSE            # Project license
├── README.md          # Project README
└── CLAUDE.md          # This file
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
*To be defined based on chosen language/framework*

### Comments and Documentation

- Write comments for complex logic
- Document all public APIs
- Keep comments up-to-date with code changes
- Use docstrings for functions and classes

---

## Key Files and Their Purpose

### Current Files

| File | Purpose | Modify Frequency |
|------|---------|------------------|
| README.md | Project overview and setup instructions | Medium |
| CLAUDE.md | AI assistant guide (this file) | As project evolves |

### Future Key Files
*To be documented as they are added*

---

## Common Tasks

### Setting Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd EmbroiderSize

# Install dependencies (example - adjust based on actual stack)
# For Python: pip install -r requirements.txt
# For Node: npm install
```

### Running Tests

```bash
# To be defined when tests are added
```

### Building the Project

```bash
# To be defined based on project type
```

---

## Testing Guidelines

### Test Structure
*To be defined when testing framework is chosen*

### Test Coverage Goals
- Aim for >80% code coverage
- All critical paths must be tested
- Include edge cases and error scenarios

### Running Tests
*To be documented when testing is implemented*

---

## Deployment

### Deployment Process
*To be documented when deployment pipeline is established*

### Environment Variables
*To be documented when environment configuration is needed*

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

### Next Steps
As the project develops, update this document with:

1. **Technology stack details** once chosen
2. **API documentation** when endpoints are created
3. **Database schema** if database is used
4. **Dependency management** setup
5. **CI/CD pipeline** configuration
6. **Deployment procedures**
7. **Code style guides** based on chosen language
8. **Testing frameworks** and procedures

### Updating This Document

When significant changes occur:
- Update the "Last Updated" date at the top
- Add new sections as the project grows
- Keep examples relevant and current
- Remove outdated information
- Document new patterns and conventions

---

## Resources

### Documentation
- [Main README](README.md)

### External Resources
*Add relevant links as the project develops:*
- Embroidery file format specifications
- Relevant libraries and frameworks
- Design pattern documentation

---

## Questions or Issues?

If you encounter issues or need clarification:
1. Check this CLAUDE.md file first
2. Review the README.md
3. Check git commit history for context
4. Ask the repository owner (JimmiFriborg)

---

**Remember:** This is a living document. Keep it updated as the project evolves to ensure it remains a valuable resource for AI assistants and developers working on EmbroiderSize.
