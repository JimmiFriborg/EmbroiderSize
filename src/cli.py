"""Command-line interface for EmbroiderSize."""

import click
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from .resizer import EmbroideryResizer
from .validator import ValidationLevel
from .utils import format_size

console = Console()


def print_pattern_info(info: dict):
    """Print pattern information in a nice table."""
    table = Table(title="Pattern Information", show_header=True, header_style="bold cyan")
    table.add_column("Property", style="cyan")
    table.add_column("Value", style="white")

    table.add_row("Width", format_size(info["width_mm"]))
    table.add_row("Height", format_size(info["height_mm"]))
    table.add_row("Stitch Count", f"{info['stitch_count']:,}")
    table.add_row("Thread Colors", str(info["thread_count"]))
    table.add_row("Color Changes", str(info["color_changes"]))
    table.add_row("Stitch Density", f"{info['stitch_density_mm']:.3f}mm")

    console.print(table)


def print_resize_results(results: dict):
    """Print resize results in a nice format."""
    # Create comparison table
    table = Table(title="Resize Results", show_header=True, header_style="bold cyan")
    table.add_column("Property", style="cyan")
    table.add_column("Original", style="yellow")
    table.add_column("New", style="green")

    table.add_row(
        "Width",
        format_size(results["original_width"]),
        format_size(results["new_width"]),
    )
    table.add_row(
        "Height",
        format_size(results["original_height"]),
        format_size(results["new_height"]),
    )
    table.add_row(
        "Scale Factor",
        "100%",
        f"{results['scale_factor'] * 100:.1f}%",
    )
    table.add_row(
        "Stitch Count",
        f"{results['original_stitch_count']:,}",
        f"{results['new_stitch_count']:,}",
    )

    if results.get("original_density") and results.get("estimated_new_density"):
        table.add_row(
            "Stitch Density",
            f"{results['original_density']:.3f}mm",
            f"{results['estimated_new_density']:.3f}mm",
        )

    console.print(table)

    # Print validation results
    if results.get("validation_results"):
        console.print("\n")
        for result in results["validation_results"]:
            level = result.level
            if level == ValidationLevel.SAFE:
                style = "green"
                icon = "✓"
            elif level == ValidationLevel.WARNING:
                style = "yellow"
                icon = "⚠"
            elif level == ValidationLevel.DANGER:
                style = "orange"
                icon = "⚠"
            else:  # CRITICAL
                style = "red"
                icon = "✗"

            console.print(f"[{style}]{icon} {result.message}[/{style}]")

    if results.get("note"):
        console.print("\n")
        console.print(Panel(results["note"], title="Note", border_style="blue"))


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """EmbroiderSize - Resize embroidery stitch files without ruining the stitches."""
    pass


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
def info(input_file):
    """Display information about an embroidery file."""
    try:
        with console.status(f"[bold blue]Loading {input_file}..."):
            resizer = EmbroideryResizer()
            resizer.load_pattern(input_file)

        info_data = resizer.get_pattern_info()
        print_pattern_info(info_data)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise click.Abort()


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
@click.argument("output_file", type=click.Path())
@click.option(
    "--width",
    "-w",
    type=float,
    help="Target width in millimeters",
)
@click.option(
    "--height",
    "-h",
    type=float,
    help="Target height in millimeters",
)
@click.option(
    "--scale",
    "-s",
    type=float,
    help="Scale percentage (e.g., 150 for 150%, 50 for 50%)",
)
@click.option(
    "--mode",
    "-m",
    type=click.Choice(["simple", "smart"]),
    default="simple",
    help="Resize mode: 'simple' (fast, changes density) or 'smart' (maintains density)",
)
@click.option(
    "--force",
    "-f",
    is_flag=True,
    help="Force resize even if validation warnings occur",
)
@click.option(
    "--preview",
    "-p",
    is_flag=True,
    help="Preview the resize without writing output file",
)
def resize(input_file, output_file, width, height, scale, mode, force, preview):
    """
    Resize an embroidery file.

    Specify target size using --width, --height, or --scale.

    Examples:

        # Resize to 100mm width (maintains aspect ratio)
        embroider-resize resize input.pes output.pes --width 100

        # Scale to 150% of original size
        embroider-resize resize input.pes output.pes --scale 150

        # Resize to specific dimensions
        embroider-resize resize input.pes output.pes --width 100 --height 80

        # Preview resize without saving
        embroider-resize resize input.pes output.pes --scale 50 --preview
    """
    # Validate arguments
    if not any([width, height, scale]):
        console.print("[red]Error: Must specify --width, --height, or --scale[/red]")
        raise click.Abort()

    try:
        # Load pattern
        with console.status(f"[bold blue]Loading {input_file}..."):
            resizer = EmbroideryResizer()
            resizer.load_pattern(input_file)

        console.print("[green]✓[/green] Pattern loaded successfully\n")

        # Show original info
        info_data = resizer.get_pattern_info()
        print_pattern_info(info_data)
        console.print("\n")

        # Perform resize (or preview)
        if preview:
            with console.status("[bold blue]Calculating resize..."):
                # Calculate what would happen
                scale_factor, new_width, new_height = resizer.calculate_scale_factor(
                    width, height, scale
                )
                new_density = info_data["stitch_density_mm"] * scale_factor
                can_proceed, validation_results = resizer.validate_resize(
                    new_width, new_height, new_density
                )

            results = {
                "scale_factor": scale_factor,
                "original_width": info_data["width_mm"],
                "original_height": info_data["height_mm"],
                "new_width": new_width,
                "new_height": new_height,
                "original_stitch_count": info_data["stitch_count"],
                "new_stitch_count": info_data["stitch_count"],
                "original_density": info_data["stitch_density_mm"],
                "estimated_new_density": new_density,
                "validation_results": validation_results,
                "can_proceed": can_proceed,
            }

            console.print(Panel("[bold yellow]PREVIEW MODE - No file will be written[/bold yellow]", border_style="yellow"))
            console.print()
            print_resize_results(results)

            if not can_proceed and not force:
                console.print("\n[red]Resize validation failed. Use --force to override.[/red]")

        else:
            with console.status(f"[bold blue]Resizing with {mode} mode..."):
                results = resizer.resize(
                    output_file,
                    target_width=width,
                    target_height=height,
                    scale_percent=scale,
                    mode=mode,
                )

            print_resize_results(results)

            if not results["can_proceed"] and not force:
                console.print("\n[red]Resize validation failed. Output file may have quality issues.[/red]")
                console.print("[yellow]Use --force to suppress this warning.[/yellow]")
            else:
                console.print(f"\n[green]✓[/green] Resized file saved to: {output_file}")

    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        raise click.Abort()


@cli.command()
@click.argument("input_file", type=click.Path(exists=True))
@click.argument("output_file", type=click.Path())
@click.option(
    "--format",
    "-f",
    type=str,
    help="Output format (e.g., pes, dst, jef). Auto-detected from extension if not specified.",
)
def convert(input_file, output_file, format):
    """
    Convert an embroidery file to a different format.

    The output format is automatically detected from the file extension.

    Examples:

        # Convert PES to DST
        embroider-resize convert input.pes output.dst

        # Convert with explicit format
        embroider-resize convert input.pes output.xxx --format dst
    """
    try:
        import pyembroidery

        with console.status(f"[bold blue]Converting {input_file}..."):
            if format:
                pyembroidery.convert(input_file, output_file, {"format": format})
            else:
                pyembroidery.convert(input_file, output_file)

        console.print(f"[green]✓[/green] Converted file saved to: {output_file}")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise click.Abort()


if __name__ == "__main__":
    cli()
