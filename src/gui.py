"""
Graphical User Interface for EmbroiderSize.

A modern, user-friendly GUI for resizing embroidery files.
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from pathlib import Path
import threading
from typing import Optional
from .resizer import EmbroideryResizer
from .validator import ValidationLevel
from .utils import format_size

# Configure appearance
ctk.set_appearance_mode("System")  # "System", "Dark", "Light"
ctk.set_default_color_theme("blue")  # "blue", "green", "dark-blue"


class EmbroiderSizeGUI(ctk.CTk):
    """Main GUI window for EmbroiderSize."""

    def __init__(self):
        super().__init__()

        # Window configuration
        self.title("EmbroiderSize - Smart Embroidery Resizer")
        self.geometry("900x1000")
        self.minsize(800, 900)

        # Initialize resizer
        self.resizer = EmbroideryResizer()
        self.current_file = None
        self.output_file = None

        # Create UI
        self._create_widgets()
        self._layout_widgets()

        # Bind drag-and-drop (will be enhanced with tkinterdnd2 if available)
        self._setup_drag_drop()

    def _create_widgets(self):
        """Create all GUI widgets."""

        # ===== Header =====
        self.header_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.title_label = ctk.CTkLabel(
            self.header_frame,
            text="EmbroiderSize",
            font=ctk.CTkFont(size=28, weight="bold"),
        )
        self.subtitle_label = ctk.CTkLabel(
            self.header_frame,
            text="Resize embroidery files without compromising quality",
            font=ctk.CTkFont(size=14),
            text_color="gray",
        )

        # ===== File Selection Frame =====
        self.file_frame = ctk.CTkFrame(self)
        self.file_label = ctk.CTkLabel(
            self.file_frame,
            text="📁 Input File",
            font=ctk.CTkFont(size=16, weight="bold"),
        )

        self.file_path_var = ctk.StringVar(value="No file selected")
        self.file_path_label = ctk.CTkLabel(
            self.file_frame,
            textvariable=self.file_path_var,
            font=ctk.CTkFont(size=12),
            anchor="w",
        )

        self.select_file_btn = ctk.CTkButton(
            self.file_frame,
            text="Browse File",
            command=self._select_input_file,
            width=120,
        )

        self.drop_label = ctk.CTkLabel(
            self.file_frame,
            text="Or drag and drop a file here",
            font=ctk.CTkFont(size=11),
            text_color="gray",
        )

        # ===== Pattern Info Frame =====
        self.info_frame = ctk.CTkFrame(self)
        self.info_title = ctk.CTkLabel(
            self.info_frame,
            text="📊 Pattern Information",
            font=ctk.CTkFont(size=16, weight="bold"),
        )

        self.info_text = ctk.CTkTextbox(
            self.info_frame,
            height=150,
            font=ctk.CTkFont(size=12),
            wrap="word",
        )
        self.info_text.configure(state="disabled")

        # ===== Hoop Size Presets Frame =====
        self.hoop_frame = ctk.CTkFrame(self)
        self.hoop_title = ctk.CTkLabel(
            self.hoop_frame,
            text="🎯 Hoop Size Presets",
            font=ctk.CTkFont(size=16, weight="bold"),
        )

        self.hoop_desc_label = ctk.CTkLabel(
            self.hoop_frame,
            text="Quick resize to fit common embroidery hoop sizes",
            font=ctk.CTkFont(size=10),
            text_color="gray",
        )

        # Define common hoop sizes (width, height in mm)
        self.hoop_presets = {
            "Brother PP1 (4×4\")": (100, 100),
            "Small (2×2\")": (50, 50),
            "Medium (5×7\")": (130, 180),
            "Large (8×8\")": (200, 200),
            "XL (8×12\")": (200, 300),
            "Jumbo (14×14\")": (360, 360),
        }

        # Create preset buttons in a grid
        self.hoop_buttons = {}
        for i, (name, _) in enumerate(self.hoop_presets.items()):
            btn = ctk.CTkButton(
                self.hoop_frame,
                text=name,
                command=lambda n=name: self._apply_hoop_preset(n),
                width=120,
                height=30,
                font=ctk.CTkFont(size=11),
            )
            self.hoop_buttons[name] = btn

        # Unit selector for hoop sizes
        self.hoop_unit_var = ctk.StringVar(value="mm")
        self.hoop_unit_label = ctk.CTkLabel(
            self.hoop_frame,
            text="Display units:",
            font=ctk.CTkFont(size=10),
        )
        self.hoop_unit_menu = ctk.CTkSegmentedButton(
            self.hoop_frame,
            values=["mm", "inches"],
            variable=self.hoop_unit_var,
            width=150,
            height=25,
        )

        # ===== Resize Controls Frame =====
        self.resize_frame = ctk.CTkFrame(self)
        self.resize_title = ctk.CTkLabel(
            self.resize_frame,
            text="📐 Resize Settings",
            font=ctk.CTkFont(size=16, weight="bold"),
        )

        # Mode selector
        self.mode_label = ctk.CTkLabel(
            self.resize_frame,
            text="Resize Mode:",
            font=ctk.CTkFont(size=12),
        )
        self.mode_var = ctk.StringVar(value="simple")
        self.mode_var.trace_add("write", self._on_mode_changed)
        self.mode_menu = ctk.CTkSegmentedButton(
            self.resize_frame,
            values=["simple", "smart"],
            variable=self.mode_var,
        )

        # Mode description label
        self.mode_desc_label = ctk.CTkLabel(
            self.resize_frame,
            text="Simple mode: Fast scaling by changing stitch spacing (may affect density)",
            font=ctk.CTkFont(size=10),
            text_color="gray",
            wraplength=600,
            justify="left",
        )

        # Resize by selector
        self.resize_by_label = ctk.CTkLabel(
            self.resize_frame,
            text="Resize By:",
            font=ctk.CTkFont(size=12),
        )
        self.resize_by_var = ctk.StringVar(value="")
        self.resize_by_menu = ctk.CTkSegmentedButton(
            self.resize_frame,
            values=["scale", "width", "height", "both"],
            variable=self.resize_by_var,
            command=self._on_resize_by_changed,
        )

        # Scale percentage input
        self.scale_label = ctk.CTkLabel(
            self.resize_frame,
            text="Scale (%):",
            font=ctk.CTkFont(size=12),
        )
        self.scale_entry = ctk.CTkEntry(
            self.resize_frame,
            placeholder_text="e.g., 150 for 1.5x larger, 50 for half size",
            width=100,
        )
        # Will be set to 150 when file is loaded

        # Width input
        self.width_label = ctk.CTkLabel(
            self.resize_frame,
            text="Width (mm):",
            font=ctk.CTkFont(size=12),
        )
        self.width_entry = ctk.CTkEntry(
            self.resize_frame,
            placeholder_text="Auto",
            width=100,
        )

        # Height input
        self.height_label = ctk.CTkLabel(
            self.resize_frame,
            text="Height (mm):",
            font=ctk.CTkFont(size=12),
        )
        self.height_entry = ctk.CTkEntry(
            self.resize_frame,
            placeholder_text="Auto",
            width=100,
        )

        # All input fields shown by default - will update when user selects resize mode

        # ===== Validation Frame =====
        self.validation_frame = ctk.CTkFrame(self)
        self.validation_title = ctk.CTkLabel(
            self.validation_frame,
            text="⚠️  Validation Results",
            font=ctk.CTkFont(size=16, weight="bold"),
        )

        self.validation_text = ctk.CTkTextbox(
            self.validation_frame,
            height=120,
            font=ctk.CTkFont(size=11),
            wrap="word",
        )
        self.validation_text.configure(state="disabled")

        # ===== Action Buttons Frame =====
        self.action_frame = ctk.CTkFrame(self, fg_color="transparent")

        self.preview_btn = ctk.CTkButton(
            self.action_frame,
            text="Preview Resize",
            command=self._preview_resize,
            width=150,
            height=40,
            font=ctk.CTkFont(size=14),
            state="disabled",  # Initially disabled until file is loaded
        )

        self.resize_btn = ctk.CTkButton(
            self.action_frame,
            text="Resize & Save",
            command=self._perform_resize,
            width=150,
            height=40,
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color="green",
            hover_color="darkgreen",
            state="disabled",  # Initially disabled until file is loaded
        )

        # ===== Progress bar =====
        self.progress_bar = ctk.CTkProgressBar(self, mode="indeterminate")
        self.progress_bar.set(0)

        self.status_label = ctk.CTkLabel(
            self,
            text="Ready",
            font=ctk.CTkFont(size=11),
            text_color="gray",
        )

    def _layout_widgets(self):
        """Layout all widgets using grid."""

        # Configure grid weights
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        self.grid_rowconfigure(3, weight=1)

        # Header
        self.header_frame.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="ew")
        self.title_label.pack()
        self.subtitle_label.pack()

        # File selection
        self.file_frame.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        self.file_frame.grid_columnconfigure(0, weight=1)
        self.file_label.grid(row=0, column=0, padx=15, pady=(15, 5), sticky="w")
        self.file_path_label.grid(row=1, column=0, padx=15, pady=5, sticky="ew")
        self.select_file_btn.grid(row=1, column=1, padx=15, pady=5)
        self.drop_label.grid(row=2, column=0, columnspan=2, padx=15, pady=(5, 15))

        # Pattern info
        self.info_frame.grid(row=2, column=0, padx=20, pady=10, sticky="nsew")
        self.info_frame.grid_columnconfigure(0, weight=1)
        self.info_frame.grid_rowconfigure(1, weight=1)
        self.info_title.grid(row=0, column=0, padx=15, pady=(15, 5), sticky="w")
        self.info_text.grid(row=1, column=0, padx=15, pady=(5, 15), sticky="nsew")

        # Hoop size presets
        self.hoop_frame.grid(row=3, column=0, padx=20, pady=10, sticky="ew")
        self.hoop_frame.grid_columnconfigure(0, weight=1)
        self.hoop_frame.grid_columnconfigure(1, weight=1)
        self.hoop_frame.grid_columnconfigure(2, weight=1)

        self.hoop_title.grid(row=0, column=0, columnspan=3, padx=15, pady=(15, 5), sticky="w")
        self.hoop_desc_label.grid(row=1, column=0, columnspan=3, padx=15, pady=(0, 10), sticky="w")

        # Layout preset buttons in 2 rows of 3
        for i, (name, btn) in enumerate(self.hoop_buttons.items()):
            row = 2 + (i // 3)
            col = i % 3
            btn.grid(row=row, column=col, padx=5, pady=5, sticky="ew")

        # Unit selector at the bottom
        self.hoop_unit_label.grid(row=4, column=0, padx=(15, 5), pady=(10, 15), sticky="e")
        self.hoop_unit_menu.grid(row=4, column=1, columnspan=2, padx=(5, 15), pady=(10, 15), sticky="w")

        # Resize controls
        self.resize_frame.grid(row=4, column=0, padx=20, pady=10, sticky="nsew")
        self.resize_frame.grid_columnconfigure(1, weight=1)

        self.resize_title.grid(row=0, column=0, columnspan=4, padx=15, pady=(15, 10), sticky="w")

        self.mode_label.grid(row=1, column=0, padx=(15, 5), pady=5, sticky="w")
        self.mode_menu.grid(row=1, column=1, columnspan=3, padx=(5, 15), pady=5, sticky="ew")
        self.mode_desc_label.grid(row=2, column=0, columnspan=4, padx=15, pady=(0, 10), sticky="w")

        self.resize_by_label.grid(row=3, column=0, padx=(15, 5), pady=5, sticky="w")
        self.resize_by_menu.grid(row=3, column=1, columnspan=3, padx=(5, 15), pady=5, sticky="ew")

        self.scale_label.grid(row=4, column=0, padx=(15, 5), pady=5, sticky="w")
        self.scale_entry.grid(row=4, column=1, padx=(5, 15), pady=5, sticky="w")

        self.width_label.grid(row=5, column=0, padx=(15, 5), pady=5, sticky="w")
        self.width_entry.grid(row=5, column=1, padx=(5, 15), pady=5, sticky="w")

        self.height_label.grid(row=6, column=0, padx=(15, 5), pady=5, sticky="w")
        self.height_entry.grid(row=6, column=1, padx=(5, 15), pady=5, sticky="w")

        # Validation results
        self.validation_frame.grid(row=5, column=0, padx=20, pady=10, sticky="nsew")
        self.validation_frame.grid_columnconfigure(0, weight=1)
        self.validation_frame.grid_rowconfigure(1, weight=1)
        self.validation_title.grid(row=0, column=0, padx=15, pady=(15, 5), sticky="w")
        self.validation_text.grid(row=1, column=0, padx=15, pady=(5, 15), sticky="nsew")

        # Action buttons
        self.action_frame.grid(row=6, column=0, padx=20, pady=10, sticky="ew")
        self.action_frame.grid_columnconfigure(0, weight=1)
        self.action_frame.grid_columnconfigure(1, weight=1)
        self.preview_btn.grid(row=0, column=0, padx=10, pady=5, sticky="e")
        self.resize_btn.grid(row=0, column=1, padx=10, pady=5, sticky="w")

        # Progress and status
        self.progress_bar.grid(row=7, column=0, padx=20, pady=(10, 5), sticky="ew")
        self.progress_bar.grid_remove()  # Hide initially
        self.status_label.grid(row=8, column=0, padx=20, pady=(5, 10))

    def _setup_drag_drop(self):
        """Setup drag and drop functionality."""
        # Try to use tkinterdnd2 if available
        try:
            import tkinterdnd2
            # Will implement full drag-drop with tkinterdnd2
            # For now, just keyboard shortcut Ctrl+O
        except ImportError:
            pass

        # Keyboard shortcuts
        self.bind("<Control-o>", lambda e: self._select_input_file())
        self.bind("<Control-q>", lambda e: self.quit())

    def _on_mode_changed(self, *args):
        """Update mode description when mode changes."""
        mode = self.mode_var.get()
        if mode == "simple":
            self.mode_desc_label.configure(
                text="Simple mode: Fast scaling by changing stitch spacing (may affect density)"
            )
        elif mode == "smart":
            self.mode_desc_label.configure(
                text="Smart mode: Attempts to preserve stitch density by adjusting stitch count (Note: Currently uses simplified algorithm)"
            )

    def _apply_hoop_preset(self, preset_name: str):
        """Apply a hoop size preset to resize the design to fit."""
        if not self.resizer.pattern:
            messagebox.showwarning("No File", "Please load an embroidery file first")
            return

        # Get hoop dimensions
        hoop_width, hoop_height = self.hoop_presets[preset_name]

        # Get current pattern dimensions
        info = self.resizer.get_pattern_info()
        current_width = info['width_mm']
        current_height = info['height_mm']

        # Calculate scale to fit within hoop (with 5mm margin for safety)
        margin = 5  # mm
        max_width = hoop_width - margin
        max_height = hoop_height - margin

        # Calculate scale factors needed for width and height
        scale_width = max_width / current_width if current_width > 0 else 1
        scale_height = max_height / current_height if current_height > 0 else 1

        # Use the smaller scale to ensure it fits in both dimensions
        scale_factor = min(scale_width, scale_height)

        # Calculate new dimensions
        new_width = current_width * scale_factor
        new_height = current_height * scale_factor

        # Update the resize mode and values
        self.resize_by_var.set("both")
        self._on_resize_by_changed("both")

        # Set the new dimensions
        self.width_entry.delete(0, "end")
        self.width_entry.insert(0, f"{new_width:.2f}")
        self.height_entry.delete(0, "end")
        self.height_entry.insert(0, f"{new_height:.2f}")

        # Clear scale
        self.scale_entry.delete(0, "end")

        # Show a message
        self._set_status(
            f"Preset applied: {preset_name} - Design will fit within {hoop_width}×{hoop_height}mm with {margin}mm margin",
            processing=False
        )

        # Trigger preview automatically
        self._preview_resize()

    def _on_resize_by_changed(self, value):
        """Handle resize by mode change."""
        # Show all fields by default (when value is empty or None)
        if not value or value == "":
            # Show all options initially
            self.scale_label.grid()
            self.scale_entry.grid()
            self.width_label.grid()
            self.width_entry.grid()
            self.height_label.grid()
            self.height_entry.grid()
        elif value == "scale":
            self.scale_label.grid()
            self.scale_entry.grid()
            self.width_label.grid_remove()
            self.width_entry.grid_remove()
            self.height_label.grid_remove()
            self.height_entry.grid_remove()
        elif value == "width":
            self.scale_label.grid_remove()
            self.scale_entry.grid_remove()
            self.width_label.grid()
            self.width_entry.grid()
            self.height_label.grid_remove()
            self.height_entry.grid_remove()
        elif value == "height":
            self.scale_label.grid_remove()
            self.scale_entry.grid_remove()
            self.width_label.grid_remove()
            self.width_entry.grid_remove()
            self.height_label.grid()
            self.height_entry.grid()
        elif value == "both":
            self.scale_label.grid_remove()
            self.scale_entry.grid_remove()
            self.width_label.grid()
            self.width_entry.grid()
            self.height_label.grid()
            self.height_entry.grid()

    def _select_input_file(self):
        """Open file dialog to select input file."""
        file_path = filedialog.askopenfilename(
            title="Select Embroidery File",
            filetypes=[
                ("All Embroidery Files", "*.pes *.dst *.jef *.exp *.vp3 *.xxx"),
                ("PES Files", "*.pes"),
                ("DST Files", "*.dst"),
                ("JEF Files", "*.jef"),
                ("All Files", "*.*"),
            ],
        )

        if file_path:
            self._load_file(file_path)

    def _load_file(self, file_path: str):
        """Load an embroidery file."""
        self._set_status("Loading file...", processing=True)

        def load():
            try:
                self.resizer.load_pattern(file_path)
                self.current_file = file_path
                self.after(0, self._on_file_loaded)
            except Exception as e:
                self.after(0, lambda: self._on_error(f"Failed to load file: {e}"))

        thread = threading.Thread(target=load, daemon=True)
        thread.start()

    def _on_file_loaded(self):
        """Handle successful file load."""
        self.file_path_var.set(self.current_file)
        self._update_pattern_info()
        self._set_status("File loaded. Choose resize settings and click Preview or Resize & Save", processing=False)
        self._clear_validation()

        # Set a helpful default scale (150% = 1.5x larger)
        self.scale_entry.delete(0, "end")
        self.scale_entry.insert(0, "150")

        # Enable action buttons now that file is loaded
        self.preview_btn.configure(state="normal")
        self.resize_btn.configure(state="normal")

    def _update_pattern_info(self):
        """Update the pattern information display."""
        if not self.resizer.pattern:
            return

        info = self.resizer.get_pattern_info()

        info_text = f"""Width:          {format_size(info['width_mm'])}
Height:         {format_size(info['height_mm'])}
Stitch Count:   {info['stitch_count']:,}
Thread Colors:  {info['thread_count']}
Color Changes:  {info['color_changes']}
Stitch Density: {info['stitch_density_mm']:.3f}mm
"""

        self.info_text.configure(state="normal")
        self.info_text.delete("1.0", "end")
        self.info_text.insert("1.0", info_text)
        self.info_text.configure(state="disabled")

        # Auto-fill dimensions
        self.width_entry.delete(0, "end")
        self.width_entry.insert(0, f"{info['width_mm']:.2f}")
        self.height_entry.delete(0, "end")
        self.height_entry.insert(0, f"{info['height_mm']:.2f}")

    def _preview_resize(self):
        """Preview the resize without saving."""
        if not self.resizer.pattern:
            messagebox.showwarning("No File", "Please load an embroidery file first")
            return

        try:
            width, height, scale = self._get_resize_parameters()
        except ValueError as e:
            messagebox.showerror("Invalid Input", str(e))
            return

        self._set_status("Calculating preview...", processing=True)

        def preview():
            try:
                scale_factor, new_width, new_height = self.resizer.calculate_scale_factor(
                    width, height, scale
                )
                info = self.resizer.get_pattern_info()
                new_density = info["stitch_density_mm"] * scale_factor
                can_proceed, validation_results = self.resizer.validate_resize(
                    new_width, new_height, new_density
                )

                result = {
                    "scale_factor": scale_factor,
                    "new_width": new_width,
                    "new_height": new_height,
                    "new_density": new_density,
                    "validation_results": validation_results,
                    "can_proceed": can_proceed,
                }

                self.after(0, lambda: self._on_preview_done(result))
            except Exception as e:
                self.after(0, lambda: self._on_error(f"Preview failed: {e}"))

        thread = threading.Thread(target=preview, daemon=True)
        thread.start()

    def _on_preview_done(self, result):
        """Handle preview completion."""
        self._display_validation_results(result)
        self._set_status("Preview complete", processing=False)

    def _perform_resize(self):
        """Perform the actual resize and save."""
        if not self.resizer.pattern:
            messagebox.showwarning("No File", "Please load an embroidery file first")
            return

        # Get resize parameters
        try:
            width, height, scale = self._get_resize_parameters()
        except ValueError as e:
            messagebox.showerror("Invalid Input", str(e))
            return

        # Get output file
        default_name = Path(self.current_file).stem + "_resized" + Path(self.current_file).suffix
        output_file = filedialog.asksaveasfilename(
            title="Save Resized File",
            initialfile=default_name,
            defaultextension=Path(self.current_file).suffix,
            filetypes=[
                ("Same as Input", f"*{Path(self.current_file).suffix}"),
                ("PES Files", "*.pes"),
                ("DST Files", "*.dst"),
                ("JEF Files", "*.jef"),
                ("All Files", "*.*"),
            ],
        )

        if not output_file:
            return

        self._set_status("Resizing pattern...", processing=True)

        def resize():
            try:
                mode = self.mode_var.get()
                results = self.resizer.resize(
                    output_file,
                    target_width=width,
                    target_height=height,
                    scale_percent=scale,
                    mode=mode,
                )
                self.after(0, lambda: self._on_resize_done(results, output_file))
            except Exception as e:
                self.after(0, lambda: self._on_error(f"Resize failed: {e}"))

        thread = threading.Thread(target=resize, daemon=True)
        thread.start()

    def _on_resize_done(self, results, output_file):
        """Handle resize completion."""
        self._display_validation_results(results)
        self._set_status(f"Saved to {output_file}", processing=False)

        if results["can_proceed"]:
            messagebox.showinfo(
                "Success",
                f"File resized successfully!\n\nSaved to:\n{output_file}",
            )
        else:
            messagebox.showwarning(
                "Warning",
                f"File resized with warnings.\n\nSaved to:\n{output_file}\n\nPlease check validation results.",
            )

    def _get_resize_parameters(self):
        """Get and validate resize parameters from inputs."""
        resize_by = self.resize_by_var.get()

        width = None
        height = None
        scale = None

        # If no mode selected, auto-detect based on which fields have values
        if not resize_by or resize_by == "":
            scale_text = self.scale_entry.get().strip()
            width_text = self.width_entry.get().strip()
            height_text = self.height_entry.get().strip()

            # Count how many fields have values
            has_scale = bool(scale_text)
            has_width = bool(width_text)
            has_height = bool(height_text)

            if has_scale and not has_width and not has_height:
                resize_by = "scale"
            elif has_width and not has_scale and not has_height:
                resize_by = "width"
            elif has_height and not has_scale and not has_width:
                resize_by = "height"
            elif has_width and has_height and not has_scale:
                resize_by = "both"
            elif not has_scale and not has_width and not has_height:
                raise ValueError("Please enter resize values (scale, width, and/or height)")
            else:
                raise ValueError("Please select a resize mode or enter values in only one method (scale OR width OR height OR both width and height)")

        if resize_by == "scale":
            scale_text = self.scale_entry.get().strip()
            if not scale_text:
                raise ValueError("Please enter a scale percentage")
            try:
                scale = float(scale_text)
                if scale <= 0:
                    raise ValueError("Scale must be positive")
            except ValueError:
                raise ValueError("Invalid scale value")

        elif resize_by == "width":
            width_text = self.width_entry.get().strip()
            if not width_text:
                raise ValueError("Please enter a width")
            try:
                width = float(width_text)
                if width <= 0:
                    raise ValueError("Width must be positive")
            except ValueError:
                raise ValueError("Invalid width value")

        elif resize_by == "height":
            height_text = self.height_entry.get().strip()
            if not height_text:
                raise ValueError("Please enter a height")
            try:
                height = float(height_text)
                if height <= 0:
                    raise ValueError("Height must be positive")
            except ValueError:
                raise ValueError("Invalid height value")

        elif resize_by == "both":
            width_text = self.width_entry.get().strip()
            height_text = self.height_entry.get().strip()

            if not width_text or not height_text:
                raise ValueError("Please enter both width and height")

            try:
                width = float(width_text)
                height = float(height_text)
                if width <= 0 or height <= 0:
                    raise ValueError("Dimensions must be positive")
            except ValueError:
                raise ValueError("Invalid dimension values")

        return width, height, scale

    def _display_validation_results(self, results):
        """Display validation results."""
        validation_results = results.get("validation_results", [])

        output = []
        output.append("RESIZE PREVIEW")
        output.append("=" * 50)
        output.append(f"New size: {format_size(results['new_width'])} × {format_size(results['new_height'])}")
        output.append(f"Scale factor: {results['scale_factor'] * 100:.1f}%")

        if results.get("new_density"):
            output.append(f"New stitch density: {results['new_density']:.3f}mm")

        if results.get("original_density"):
            output.append(f"Original density: {results.get('original_density', 0):.3f}mm")

        output.append("\n" + "QUALITY ASSESSMENT")
        output.append("=" * 50)

        if validation_results:
            has_critical = any(vr.level == ValidationLevel.CRITICAL for vr in validation_results)
            has_danger = any(vr.level == ValidationLevel.DANGER for vr in validation_results)

            for vr in validation_results:
                icon = self._get_validation_icon(vr.level)
                output.append(f"{icon} {vr.message}")

            if has_critical:
                output.append("\n⛔ CRITICAL: This resize is not recommended!")
            elif has_danger:
                output.append("\n⚠️  WARNING: Proceed with caution!")
            else:
                output.append("\n✅ This resize should produce acceptable results.")
        else:
            output.append("✅ No validation issues detected!")
            output.append("This resize is within safe parameters.")

        if results.get("note"):
            output.append("\n" + "NOTE")
            output.append("=" * 50)
            output.append(results['note'])

        self.validation_text.configure(state="normal")
        self.validation_text.delete("1.0", "end")
        self.validation_text.insert("1.0", "\n".join(output))
        self.validation_text.configure(state="disabled")

    def _get_validation_icon(self, level):
        """Get icon for validation level."""
        if level == ValidationLevel.SAFE:
            return "✓"
        elif level == ValidationLevel.WARNING:
            return "⚠️"
        elif level == ValidationLevel.DANGER:
            return "⚠️"
        else:  # CRITICAL
            return "✗"

    def _clear_validation(self):
        """Clear validation display."""
        self.validation_text.configure(state="normal")
        self.validation_text.delete("1.0", "end")
        self.validation_text.insert("1.0", "Load a file and click 'Preview Resize' to see validation results.\n\nThe preview will show:\n• New dimensions\n• Scale factor\n• Stitch density warnings\n• Quality recommendations")
        self.validation_text.configure(state="disabled")

    def _set_status(self, message: str, processing: bool = False):
        """Update status message."""
        self.status_label.configure(text=message)

        if processing:
            self.progress_bar.grid()
            self.progress_bar.start()
        else:
            self.progress_bar.stop()
            self.progress_bar.grid_remove()

    def _on_error(self, message: str):
        """Handle errors."""
        self._set_status("Error", processing=False)
        messagebox.showerror("Error", message)


def main():
    """Run the GUI application."""
    app = EmbroiderSizeGUI()
    app.mainloop()


if __name__ == "__main__":
    main()
