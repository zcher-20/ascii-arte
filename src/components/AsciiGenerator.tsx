"use client";

import { useState, useRef, useCallback } from "react";

const ASCII_CHARS = "#%*+=-:. ";
const CHARS_LEN = ASCII_CHARS.length;

interface AsciiPixel {
  char: string;
  r: number;
  g: number;
  b: number;
}

function imageToAscii(
  img: HTMLImageElement,
  maxWidth: number,
): { grid: AsciiPixel[][]; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const charAspect = 0.6;
  const scale = Math.min(maxWidth / img.width, 1);
  const w = Math.floor(img.width * scale);
  const h = Math.floor(img.height * scale * charAspect);

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  const grid: AsciiPixel[][] = [];

  for (let y = 0; y < h; y++) {
    const row: AsciiPixel[] = [];
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const intensity = (r + g + b) / 3;
      const charIndex = Math.floor((intensity / 255) * (CHARS_LEN - 1));
      row.push({ char: ASCII_CHARS[charIndex], r, g, b });
    }
    grid.push(row);
  }

  return { grid, width: w, height: h };
}

function renderToCanvas(
  grid: AsciiPixel[][],
  fontSize: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const charW = fontSize * 0.6;
  const charH = fontSize;

  canvas.width = grid[0].length * charW;
  canvas.height = grid.length * charH;

  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  const bgLift = 0.3;
  const fgLift = 0.15;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const p = grid[y][x];
      const br = Math.min(255, Math.round(p.r + (255 - p.r) * bgLift));
      const bg = Math.min(255, Math.round(p.g + (255 - p.g) * bgLift));
      const bb = Math.min(255, Math.round(p.b + (255 - p.b) * bgLift));
      ctx.fillStyle = `rgb(${br},${bg},${bb})`;
      ctx.fillRect(x * charW, y * charH, charW, charH);

      const fr = Math.min(255, Math.round(p.r + (255 - p.r) * fgLift));
      const fg = Math.min(255, Math.round(p.g + (255 - p.g) * fgLift));
      const fb = Math.min(255, Math.round(p.b + (255 - p.b) * fgLift));
      ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
      ctx.fillText(p.char, x * charW, y * charH);
    }
  }

  return canvas;
}

export default function AsciiGenerator({ light = false }: { light?: boolean }) {
  const [result, setResult] = useState<HTMLCanvasElement | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [imgRatio, setImgRatio] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const fg = light ? "#222" : "#fff";
  const border = light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";

  const handleFile = useCallback((file: File) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalSrc(src);
      const img = new Image();
      img.onload = () => {
        setImgRatio(img.width / img.height);
        const { grid } = imageToAscii(img, 160);
        const output = renderToCanvas(grid, 6);
        setResult(output);
        setProcessing(false);

        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.innerHTML = "";
            previewRef.current.appendChild(output);
            output.style.width = "100%";
            output.style.height = "auto";
            output.style.display = "block";
          }
        }, 0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const download = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.download = "ascii-art.png";
    link.href = result.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${border}`,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.3s",
          color: fg,
          opacity: 0.6,
        }}
        className="font-[family-name:var(--font-inter)]"
      >
        <div style={{ fontSize: "20px", marginBottom: "8px" }}>+</div>
        <div style={{ fontSize: "12px" }}>
          {processing ? "Processing..." : "Drop an image or click to upload"}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {result && (
        <div style={{ marginTop: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {originalSrc && (
              <div style={{ border: `1px solid ${border}`, overflow: "hidden", aspectRatio: `${imgRatio}` }}>
                <img src={originalSrc} alt="Original" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            <div
              ref={previewRef}
              style={{
                border: `1px solid ${border}`,
                overflow: "hidden",
                aspectRatio: `${imgRatio}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              onClick={download}
              style={{
                background: "none",
                border: `1px solid ${border}`,
                padding: "8px 20px",
                cursor: "pointer",
                fontSize: "12px",
                color: fg,
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              className="font-[family-name:var(--font-inter)]"
            >
              download .png
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
