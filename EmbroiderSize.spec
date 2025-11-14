# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for EmbroiderSize GUI.

To build the standalone executable:
    pip install pyinstaller
    pyinstaller EmbroiderSize.spec

The executable will be created in the dist/ folder.
"""

import os
import sys
from pathlib import Path

block_cipher = None

# Get paths
project_dir = os.path.abspath(SPECPATH)
src_dir = os.path.join(project_dir, 'src')

a = Analysis(
    ['EmbroiderSize.py'],
    pathex=[project_dir, src_dir],
    binaries=[],
    datas=[
        # Include customtkinter themes and assets
        (os.path.join(os.path.dirname(__import__('customtkinter').__file__), 'assets'), 'customtkinter/assets'),
    ],
    hiddenimports=[
        'pyembroidery',
        'customtkinter',
        'PIL',
        'PIL._tkinter_finder',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'numpy',
        'scipy',
        'pandas',
        'pytest',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='EmbroiderSize',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # No console window for GUI
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon later: icon='icon.ico'
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='EmbroiderSize',
)

# For macOS, create an app bundle
if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='EmbroiderSize.app',
        icon=None,  # Add icon later: icon='icon.icns'
        bundle_identifier='com.embroidersize.app',
        info_plist={
            'CFBundleName': 'EmbroiderSize',
            'CFBundleDisplayName': 'EmbroiderSize',
            'CFBundleVersion': '0.1.0',
            'CFBundleShortVersionString': '0.1.0',
            'NSHighResolutionCapable': True,
        },
    )
