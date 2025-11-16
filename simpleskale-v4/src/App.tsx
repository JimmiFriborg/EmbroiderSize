/**
 * SimpleSkale 4.0 - Main Application
 *
 * Main React component for SimpleSkale embroidery scaling application.
 */

import { useState, useEffect } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import "./App.css";
import type { DesignDocument, ValidationResult } from "./types";
import { BROTHER_PP1_PROFILE } from "./types";
import { StitchCanvas } from "./components/StitchCanvas";
import { scaleDesign } from "./engine/simpleskale";
import { parseEmbroideryFile } from "./lib/parsers";
import { writeEmbroideryFile, getFileExtension } from "./lib/writers";

function App() {
  const [originalDesign, setOriginalDesign] = useState<DesignDocument | null>(null);
  const [scaledDesign, setScaledDesign] = useState<DesignDocument | null>(null);
  const [scale, setScale] = useState<number>(100);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isScaling, setIsScaling] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSplitView, setShowSplitView] = useState(false);

  // Demo: Create a simple test design
  const createTestDesign = () => {
    const testDesign: DesignDocument = {
      id: crypto.randomUUID(),
      name: "Test Pattern",
      originalFormat: "DEMO",
      colorBlocks: [
        {
          colorIndex: 0,
          stitches: [
            { position: { x: 0, y: 0 }, type: "run", colorIndex: 0 },
            { position: { x: 100, y: 0 }, type: "run", colorIndex: 0 },
            { position: { x: 100, y: 100 }, type: "run", colorIndex: 0 },
            { position: { x: 0, y: 100 }, type: "run", colorIndex: 0 },
            { position: { x: 0, y: 0 }, type: "run", colorIndex: 0 },
          ],
        },
        {
          colorIndex: 1,
          stitches: [
            { position: { x: 50, y: 50 }, type: "run", colorIndex: 1 },
            { position: { x: 150, y: 50 }, type: "run", colorIndex: 1 },
            { position: { x: 100, y: 150 }, type: "run", colorIndex: 1 },
            { position: { x: 50, y: 50 }, type: "run", colorIndex: 1 },
          ],
        },
      ],
      threads: [
        { color: "#ff0000", colorName: "Red", brand: "Brother" },
        { color: "#0000ff", colorName: "Blue", brand: "Brother" },
      ],
      machineProfile: BROTHER_PP1_PROFILE,
      metadata: {
        originalWidthMm: 15,
        originalHeightMm: 15,
        scaleFactor: 1.0,
        originalStitchCount: 9,
        currentStitchCount: 9,
      },
    };

    setOriginalDesign(testDesign);
    setScaledDesign(testDesign); // Initially show original
    setScale(100); // Reset scale
  };

  // File upload handler
  const handleFileUpload = async () => {
    try {
      // Open file picker
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Embroidery Files",
            extensions: ["pes", "dst"],
          },
        ],
      });

      if (!selected) return; // User canceled

      // Read the file
      const fileData = await readFile(selected.path);

      // Parse the embroidery file
      const fileName = selected.name || "Unknown";
      const design = parseEmbroideryFile(fileData.buffer, fileName);

      // Set the design
      setOriginalDesign(design);
      setScaledDesign(design);
      setScale(100);
    } catch (error) {
      console.error("Failed to load file:", error);
      alert(`Failed to load file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // File export handler
  const handleFileExport = async () => {
    if (!scaledDesign) return;

    try {
      // Determine file extension based on original format
      const defaultExt = getFileExtension(scaledDesign);
      const defaultFileName = `${scaledDesign.name}_${scale}%`;

      // Open save dialog
      const savePath = await save({
        defaultPath: `${defaultFileName}.${defaultExt}`,
        filters: [
          {
            name: "PES Files",
            extensions: ["pes"],
          },
          {
            name: "DST Files",
            extensions: ["dst"],
          },
        ],
      });

      if (!savePath) return; // User canceled

      // Write the scaled design to file
      const buffer = writeEmbroideryFile(scaledDesign, savePath);
      await writeFile(savePath, new Uint8Array(buffer));

      alert(`File saved successfully to:\n${savePath}`);
    } catch (error) {
      console.error("Failed to save file:", error);
      alert(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Apply scaling when scale changes
  useEffect(() => {
    if (!originalDesign || scale === 100) {
      setScaledDesign(originalDesign);
      setValidationResults([]);
      return;
    }

    // Debounce the scaling operation
    setIsScaling(true);
    const timer = setTimeout(() => {
      const result = scaleDesign(
        originalDesign,
        {
          scalePercent: scale,
          preserveAspectRatio: true,
        },
        {
          safeMode: true, // Enable Brother PP1 safe mode
          targetDensityMm: 0.425,
        }
      );

      if (result.success && result.design) {
        setScaledDesign(result.design);
        setValidationResults(result.validationResults);
      } else {
        // Keep original if scaling failed
        setScaledDesign(originalDesign);
        setValidationResults(result.validationResults);
      }
      setIsScaling(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [originalDesign, scale]);

  return (
    <main style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1>🧵 SimpleSkale 4.0</h1>
        <p style={{ color: "#666" }}>
          Fast, safe, Brother PP1-friendly embroidery scaling
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
        {/* Control Panel */}
        <aside className="control-panel">
          <h2 style={{ fontSize: "18px", marginBottom: "20px", color: "#2d3748" }}>Controls</h2>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleFileUpload}
              className="btn-success"
              style={{
                width: "100%",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              📁 Open PES/DST File
            </button>
            <button
              onClick={handleFileExport}
              disabled={!scaledDesign}
              className="btn-primary"
              style={{
                width: "100%",
                marginBottom: "10px",
                fontSize: "14px",
                opacity: scaledDesign ? 1 : 0.5,
                cursor: scaledDesign ? "pointer" : "not-allowed",
              }}
            >
              💾 Export Scaled File
            </button>
            <button
              onClick={createTestDesign}
              className="btn-secondary"
              style={{
                width: "100%",
                fontSize: "13px",
              }}
            >
              Load Test Pattern
            </button>
          </div>

          {originalDesign && scaledDesign && (
            <>
              <div className="slider-container">
                <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", color: "#2d3748" }}>
                  Scale: {scale}% {isScaling && "⏳"}
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#718096", marginTop: "8px" }}>
                  <span>20%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "10px", background: "#f9f9f9", borderRadius: "4px" }}>
                <h3 style={{ fontSize: "13px", marginBottom: "10px", fontWeight: "bold" }}>View Options</h3>
                <label style={{ display: "flex", alignItems: "center", marginBottom: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showSplitView}
                    onChange={(e) => setShowSplitView(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  <span style={{ fontSize: "12px" }}>Before/After Split View</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", marginBottom: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  <span style={{ fontSize: "12px" }}>Show Density Heatmap</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  <span style={{ fontSize: "12px" }}>Show Grid</span>
                </label>
                {showHeatmap && (
                  <div style={{ marginTop: "10px", padding: "8px", background: "#fff", borderRadius: "4px", fontSize: "10px" }}>
                    <strong>Heatmap Legend:</strong>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#00ff00", display: "inline-block", marginRight: "4px" }}></span>
                      <span>Safe (&lt;5 st/mm²)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "2px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#ffff00", display: "inline-block", marginRight: "4px" }}></span>
                      <span>Warning (5-10)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "2px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#ff8800", display: "inline-block", marginRight: "4px" }}></span>
                      <span>Caution (10-15)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "2px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#ff0000", display: "inline-block", marginRight: "4px" }}></span>
                      <span>Danger (&gt;15)</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Design Info</h3>
                <p><strong>Name:</strong> {scaledDesign.name}</p>
                <p><strong>Format:</strong> {scaledDesign.originalFormat}</p>
                <p><strong>Colors:</strong> {scaledDesign.threads.length}</p>
                <p>
                  <strong>Stitches:</strong> {scaledDesign.metadata.originalStitchCount.toLocaleString()} →{" "}
                  <span style={{ color: scale === 100 ? "inherit" : "#007bff" }}>
                    {scaledDesign.metadata.currentStitchCount.toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong>Size:</strong> {originalDesign.metadata.originalWidthMm.toFixed(1)}mm ×{" "}
                  {originalDesign.metadata.originalHeightMm.toFixed(1)}mm
                  {scale !== 100 && (
                    <span style={{ color: "#007bff" }}>
                      {" "}
                      → {(originalDesign.metadata.originalWidthMm * scale / 100).toFixed(1)}mm ×{" "}
                      {(originalDesign.metadata.originalHeightMm * scale / 100).toFixed(1)}mm
                    </span>
                  )}
                </p>
              </div>

              {validationResults.length > 0 && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "10px",
                    background: validationResults.some(v => !v.canProceed) ? "#fff3cd" : "#d4edda",
                    border: `1px solid ${validationResults.some(v => !v.canProceed) ? "#ffc107" : "#28a745"}`,
                    borderRadius: "4px",
                    fontSize: "11px",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "8px" }}>Validation:</strong>
                  {validationResults.map((result, i) => (
                    <div key={i} style={{ marginBottom: "4px" }}>
                      {result.level === "safe" && "✅"}
                      {result.level === "warning" && "⚠️"}
                      {result.level === "danger" && "⚠️"}
                      {result.level === "critical" && "❌"}
                      {" "}{result.message}
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  background: "#e8f4f8",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <strong>Machine Profile:</strong>
                <p style={{ margin: "5px 0" }}>{scaledDesign.machineProfile.name}</p>
                <p style={{ margin: "5px 0", fontSize: "11px", color: "#666" }}>
                  Max Hoop: {scaledDesign.machineProfile.maxHoopWidthMm}mm ×{" "}
                  {scaledDesign.machineProfile.maxHoopHeightMm}mm
                </p>
              </div>
            </>
          )}

          <div style={{ marginTop: "30px", fontSize: "11px", color: "#999" }}>
            <p>
              <strong>Status:</strong> Phase 3 In Progress... 🚀
            </p>
            <ul style={{ marginTop: "10px", paddingLeft: "20px", lineHeight: "1.6" }}>
              <li><strong>Phase 2 Complete:</strong></li>
              <li style={{ marginLeft: "10px" }}>✅ File upload & export</li>
              <li style={{ marginLeft: "10px" }}>✅ Real-time scaling</li>
              <li><strong>Phase 3:</strong></li>
              <li style={{ marginLeft: "10px" }}>✅ Density heatmap</li>
              <li style={{ marginLeft: "10px" }}>✅ Before/After split view</li>
              <li style={{ marginLeft: "10px" }}>⏭️ Enhanced styling</li>
            </ul>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className="canvas-container">
          {scaledDesign ? (
            showSplitView && originalDesign && scale !== 100 ? (
              <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
                <div>
                  <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold", color: "#2d3748" }}>
                    Before (Original)
                  </h3>
                  <StitchCanvas
                    design={originalDesign}
                    width={800}
                    height={400}
                    showJumps={false}
                    showGrid={showGrid}
                    showHeatmap={showHeatmap}
                  />
                </div>
                <div>
                  <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold", color: "#2d3748" }}>
                    After (Scaled {scale}%)
                  </h3>
                  <StitchCanvas
                    design={scaledDesign}
                    width={800}
                    height={400}
                    showJumps={false}
                    showGrid={showGrid}
                    showHeatmap={showHeatmap}
                  />
                </div>
              </div>
            ) : (
              <StitchCanvas
                design={scaledDesign}
                width={800}
                height={600}
                showJumps={false}
                showGrid={showGrid}
                showHeatmap={showHeatmap}
              />
            )
          ) : (
            <div
              style={{
                width: "800px",
                height: "600px",
                border: "2px dashed #cbd5e0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a0aec0",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              Click "Load Test Pattern" to begin
            </div>
          )}
        </section>
      </div>

      <footer style={{ marginTop: "40px", textAlign: "center", color: "#999", fontSize: "12px" }}>
        <p>SimpleSkale 4.0 - Part of the EmbroiderSize Project</p>
        <p>Built with Tauri + React + TypeScript</p>
      </footer>
    </main>
  );
}

export default App;
