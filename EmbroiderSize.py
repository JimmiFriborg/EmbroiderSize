#!/usr/bin/env python3
"""
EmbroiderSize GUI Launcher

Double-click this file to launch the EmbroiderSize GUI application.
"""

import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

if __name__ == "__main__":
    try:
        from src.gui import main
        main()
    except ImportError as e:
        print(f"Error: Failed to import required modules: {e}")
        print("\nPlease make sure all dependencies are installed:")
        print("  pip install -r requirements.txt")
        input("\nPress Enter to exit...")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        input("\nPress Enter to exit...")
        sys.exit(1)
