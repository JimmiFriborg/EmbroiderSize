/**
 * SimpleSkale 4.0 - Stitch Canvas Component
 *
 * React component for rendering embroidery stitch patterns on HTML5 Canvas.
 */

import { useEffect, useRef, useState } from "react";
import type { DesignDocument, ColorBlock, Stitch } from "../types";
import { calculateDensityHeatmap, type HeatmapGrid } from "../utils/heatmap";

interface StitchCanvasProps {
  design: DesignDocument | null;
  width?: number;
  height?: number;
  showJumps?: boolean;
  showGrid?: boolean;
  showHeatmap?: boolean;
}

/**
 * Canvas component for rendering embroidery stitches
 */
export function StitchCanvas({
  design,
  width = 800,
  height = 600,
  showJumps = false,
  showGrid = true,
  showHeatmap = false,
}: StitchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [heatmap, setHeatmap] = useState<HeatmapGrid | null>(null);

  // Calculate heatmap when design changes
  useEffect(() => {
    if (!design) {
      setHeatmap(null);
      return;
    }
    const hm = calculateDensityHeatmap(design, 5);
    setHeatmap(hm);
  }, [design]);

  useEffect(() => {
    if (!canvasRef.current || !design) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, width, height, zoom);
    }

    // Calculate scale to fit design in canvas
    const bounds = calculateBounds(design.colorBlocks);
    const scaleX = (width * 0.8) / bounds.width;
    const scaleY = (height * 0.8) / bounds.height;
    const scale = Math.min(scaleX, scaleY) * zoom;

    // Center the design
    const offsetX = (width - bounds.width * scale) / 2 - bounds.minX * scale + pan.x;
    const offsetY = (height - bounds.height * scale) / 2 - bounds.minY * scale + pan.y;

    // Draw heatmap if enabled (before stitches)
    if (showHeatmap && heatmap) {
      drawHeatmap(ctx, heatmap, scale, offsetX, offsetY);
    }

    // Draw each color block
    design.colorBlocks.forEach((block, index) => {
      const thread = design.threads[block.colorIndex % design.threads.length];
      drawColorBlock(ctx, block, thread.color, scale, offsetX, offsetY, showJumps);
    });

    // Draw design info overlay
    drawInfoOverlay(ctx, design, bounds, scale, heatmap, showHeatmap);
  }, [design, width, height, zoom, pan, showJumps, showGrid, showHeatmap, heatmap]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "move",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          display: "flex",
          gap: "8px",
        }}
      >
        <button onClick={() => setZoom((z) => Math.min(z + 0.2, 3.0))}>Zoom In</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}>Zoom Out</button>
        <button onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}>Reset</button>
      </div>
    </div>
  );
}

/**
 * Calculate bounding box of all stitches
 */
function calculateBounds(colorBlocks: ColorBlock[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  colorBlocks.forEach((block) => {
    block.stitches.forEach((stitch) => {
      minX = Math.min(minX, stitch.position.x);
      minY = Math.min(minY, stitch.position.y);
      maxX = Math.max(maxX, stitch.position.x);
      maxY = Math.max(maxY, stitch.position.y);
    });
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Draw a grid on the canvas
 */
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, zoom: number): void {
  const gridSize = 50 * zoom; // 50px grid
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw a color block
 */
function drawColorBlock(
  ctx: CanvasRenderingContext2D,
  block: ColorBlock,
  color: string,
  scale: number,
  offsetX: number,
  offsetY: number,
  showJumps: boolean
): void {
  if (block.stitches.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();

  for (let i = 0; i < block.stitches.length; i++) {
    const stitch = block.stitches[i];
    const x = stitch.position.x * scale + offsetX;
    const y = stitch.position.y * scale + offsetY;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevStitch = block.stitches[i - 1];

      // Handle different stitch types
      if (stitch.type === "jump") {
        if (showJumps) {
          ctx.strokeStyle = "#cccccc";
          ctx.setLineDash([5, 5]);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.setLineDash([]);
          ctx.strokeStyle = color;
        } else {
          ctx.moveTo(x, y);
        }
      } else if (stitch.type === "trim" || stitch.type === "stop") {
        // Don't draw line, just move
        ctx.moveTo(x, y);
      } else {
        // Regular stitch
        ctx.lineTo(x, y);
      }
    }
  }

  ctx.stroke();
}

/**
 * Draw density heatmap overlay
 */
function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  heatmap: HeatmapGrid,
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  ctx.globalAlpha = 0.5; // Semi-transparent overlay

  for (let row = 0; row < heatmap.rows; row++) {
    for (let col = 0; col < heatmap.cols; col++) {
      const cell = heatmap.cells[row][col];

      if (cell.stitchCount === 0) continue; // Skip empty cells

      const x = cell.x * scale + offsetX;
      const y = cell.y * scale + offsetY;
      const size = heatmap.gridSizeMm * scale;

      ctx.fillStyle = cell.color;
      ctx.fillRect(x, y, size, size);
    }
  }

  ctx.globalAlpha = 1.0; // Reset transparency
}

/**
 * Draw info overlay
 */
function drawInfoOverlay(
  ctx: CanvasRenderingContext2D,
  design: DesignDocument,
  bounds: { width: number; height: number },
  scale: number,
  heatmap: HeatmapGrid | null,
  showHeatmap: boolean
): void {
  const widthMm = bounds.width / 10;
  const heightMm = bounds.height / 10;
  const totalStitches = design.colorBlocks.reduce((sum, block) => sum + block.stitches.length, 0);

  const infoHeight = showHeatmap && heatmap ? 130 : 90;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(10, 10, 250, infoHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px monospace";
  ctx.fillText(`Design: ${design.name}`, 20, 30);
  ctx.fillText(`Size: ${widthMm.toFixed(1)}mm × ${heightMm.toFixed(1)}mm`, 20, 50);
  ctx.fillText(`Stitches: ${totalStitches.toLocaleString()}`, 20, 70);
  ctx.fillText(`Colors: ${design.threads.length}`, 20, 90);

  // Show heatmap stats if enabled
  if (showHeatmap && heatmap) {
    ctx.fillText(`Avg Density: ${heatmap.avgDensity.toFixed(2)} st/mm²`, 20, 110);
    ctx.fillText(`Max Density: ${heatmap.maxDensity.toFixed(2)} st/mm²`, 20, 130);
  }
}
