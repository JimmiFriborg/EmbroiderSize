#!/usr/bin/env python3
"""
Build script for creating a standalone EmbroiderSize executable.

This script automates the process of creating a standalone executable
using PyInstaller that can be distributed to users who don't have Python installed.
"""

import subprocess
import sys
import os
from pathlib import Path


def check_dependencies():
    """Check if required build dependencies are installed."""
    print("Checking dependencies...")

    required = ['pyinstaller']
    missing = []

    for package in required:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} (missing)")
            missing.append(package)

    if missing:
        print("\nMissing dependencies. Installing...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
        print("✓ Dependencies installed")
    else:
        print("✓ All dependencies present")


def clean_build():
    """Clean previous build artifacts."""
    print("\nCleaning previous builds...")

    dirs_to_clean = ['build', 'dist']
    files_to_clean = ['EmbroiderSize.spec.bak']

    for dir_name in dirs_to_clean:
        dir_path = Path(dir_name)
        if dir_path.exists():
            import shutil
            shutil.rmtree(dir_path)
            print(f"  Removed {dir_name}/")

    for file_name in files_to_clean:
        file_path = Path(file_name)
        if file_path.exists():
            file_path.unlink()
            print(f"  Removed {file_name}")

    print("✓ Clean complete")


def build_executable():
    """Build the executable using PyInstaller."""
    print("\nBuilding executable...")
    print("This may take a few minutes...\n")

    spec_file = Path('EmbroiderSize.spec')

    if not spec_file.exists():
        print(f"Error: {spec_file} not found")
        return False

    try:
        subprocess.check_call(['pyinstaller', '--clean', str(spec_file)])
        print("\n✓ Build complete!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Build failed: {e}")
        return False


def show_results():
    """Show the location of the built executable."""
    print("\n" + "=" * 60)
    print("BUILD SUCCESSFUL!")
    print("=" * 60)

    dist_dir = Path('dist') / 'EmbroiderSize'

    if sys.platform == 'win32':
        exe_path = dist_dir / 'EmbroiderSize.exe'
    elif sys.platform == 'darwin':
        exe_path = Path('dist') / 'EmbroiderSize.app'
    else:
        exe_path = dist_dir / 'EmbroiderSize'

    if exe_path.exists():
        print(f"\nExecutable created at:")
        print(f"  {exe_path.absolute()}")
        print("\nYou can now distribute the entire 'dist/EmbroiderSize' folder")
        print("to users who don't have Python installed.")
    else:
        print(f"\nWarning: Expected executable not found at {exe_path}")
        print("Check the dist/ folder for the build output.")

    print("\n" + "=" * 60)


def main():
    """Main build process."""
    print("=" * 60)
    print("EmbroiderSize Executable Builder")
    print("=" * 60)

    # Change to project directory
    os.chdir(Path(__file__).parent)

    # Run build steps
    check_dependencies()
    clean_build()

    if build_executable():
        show_results()
    else:
        print("\n✗ Build failed. Please check the error messages above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
