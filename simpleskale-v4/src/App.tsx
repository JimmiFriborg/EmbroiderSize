/**
 * SimpleSkale 4.0 - Main Application
 *
 * Main React component for SimpleSkale embroidery scaling application.
 */

import { useState } from "react";
import "./App.css";
import type { DesignDocument } from "./types";
import { BROTHER_PP1_PROFILE } from "./types";
import { StitchCanvas } from "./components/StitchCanvas";

function App() {
  const [design, setDesign] = useState<DesignDocument | null>(null);
  const [scale, setScale] = useState<number>(100);

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

    setDesign(testDesign);
  };

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
        <aside style={{ padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Controls</h2>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={createTestDesign}
              style={{
                width: "100%",
                padding: "10px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Load Test Pattern
            </button>
          </div>

          {design && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                  Scale: {scale}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ fontSize: "12px", color: "#666" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>Design Info</h3>
                <p>Name: {design.name}</p>
                <p>Format: {design.originalFormat}</p>
                <p>Colors: {design.threads.length}</p>
                <p>Stitches: {design.metadata.currentStitchCount}</p>
                <p>
                  Size: {design.metadata.originalWidthMm.toFixed(1)}mm ×{" "}
                  {design.metadata.originalHeightMm.toFixed(1)}mm
                </p>
              </div>

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
                <p style={{ margin: "5px 0" }}>{design.machineProfile.name}</p>
                <p style={{ margin: "5px 0", fontSize: "11px", color: "#666" }}>
                  Max Hoop: {design.machineProfile.maxHoopWidthMm}mm ×{" "}
                  {design.machineProfile.maxHoopHeightMm}mm
                </p>
              </div>
            </>
          )}

          <div style={{ marginTop: "30px", fontSize: "11px", color: "#999" }}>
            <p>
              <strong>Status:</strong> Phase 1 Foundation Complete
            </p>
            <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
              <li>✅ File parsers (PES/DST)</li>
              <li>✅ SimpleSkale engine</li>
              <li>✅ Canvas renderer</li>
              <li>⏭️ File upload (next)</li>
              <li>⏭️ Real-time scaling (next)</li>
            </ul>
          </div>
        </aside>

        {/* Canvas Area */}
        <section>
          {design ? (
            <StitchCanvas design={design} width={800} height={600} showJumps={false} showGrid={true} />
          ) : (
            <div
              style={{
                width: "800px",
                height: "600px",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "18px",
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
