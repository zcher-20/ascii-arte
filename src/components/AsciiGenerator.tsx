"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const ASCII_CHARS_NORMAL = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const ASCII_CHARS_INVERTED = ASCII_CHARS_NORMAL.split("").reverse().join("");

interface AsciiPixel {
  char: string;
  r: number;
  g: number;
  b: number;
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function imageToAscii(img: HTMLImageElement, density: number): AsciiPixel[][] {
  const chars = ASCII_CHARS_NORMAL;
  const charInterval = chars.length / 256;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const scaleFactor = Math.min(density / img.width, 1);
  const w = Math.floor(img.width * scaleFactor);
  const h = Math.floor(img.height * scaleFactor * 0.6);

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
      const brightness = Math.floor(r / 3 + g / 3 + b / 3);
      const charIndex = Math.min(Math.floor(brightness * charInterval), chars.length - 1);
      row.push({ char: chars[charIndex], r, g, b });
    }
    grid.push(row);
  }

  return grid;
}

function renderBaseCanvas(grid: AsciiPixel[][], fontSize: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const cw = Math.ceil(fontSize * 0.65);
  const ch = Math.ceil(fontSize * 1.1);

  canvas.width = grid[0].length * cw;
  canvas.height = grid.length * ch;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const p = grid[y][x];
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.fillText(p.char, x * cw, y * ch);
    }
  }

  return canvas;
}

function renderBaseCanvasInverted(grid: AsciiPixel[][], fontSize: number): HTMLCanvasElement {
  const chars = ASCII_CHARS_INVERTED;
  const charInterval = chars.length / 256;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const cw = Math.ceil(fontSize * 0.65);
  const ch = Math.ceil(fontSize * 1.1);

  canvas.width = grid[0].length * cw;
  canvas.height = grid.length * ch;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const p = grid[y][x];
      const brightness = Math.floor(p.r / 3 + p.g / 3 + p.b / 3);
      const charIndex = Math.min(Math.floor(brightness * charInterval), chars.length - 1);
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.fillText(chars[charIndex], x * cw, y * ch);
    }
  }

  return canvas;
}

function Slider({ label, value, min, max, step, onInput, fg }: {
  label: string; value: number; min: number; max: number; step: number;
  onInput: (v: number) => void; fg: string;
}) {
  return (
    <div style={{ flex: 1, minWidth: "80px" }}>
      <div style={{ fontSize: "12px", color: fg, opacity: 0.6, marginBottom: "4px" }}>
        {label}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        onInput={(e) => onInput(parseFloat(e.currentTarget.value))}
        style={{ width: "100%", accentColor: "#ffd4de", cursor: "pointer", height: "3px" }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange, fg, border }: {
  label: string; value: boolean; onChange: (v: boolean) => void; fg: string; border: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="font-[family-name:var(--font-inter)]"
      style={{
        background: "none",
        border: `1px solid ${border}`,
        padding: "4px 10px",
        cursor: "pointer",
        fontSize: "11px",
        color: fg,
        opacity: value ? 0.8 : 0.4,
        transition: "opacity 0.2s",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {label}: {value ? "on" : "off"}
    </button>
  );
}

export default function AsciiGenerator({ light = false }: { light?: boolean }) {
  const [hasImage, setHasImage] = useState(false);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [density, setDensity] = useState(80);
  const [invert, setInvert] = useState(false);
  const [bgBlack, setBgBlack] = useState(true);

  const fileRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const origImgRef = useRef<HTMLImageElement>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const gridRef = useRef<AsciiPixel[][] | null>(null);
  const baseCacheRef = useRef<HTMLCanvasElement | null>(null);
  const baseCacheInvRef = useRef<HTMLCanvasElement | null>(null);
  const brightnessRef = useRef(100);
  const contrastRef = useRef(100);
  const saturationRef = useRef(100);
  const rafRef = useRef<number>(0);

  const fg = light ? "#222" : "#fff";
  const border = light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";

  const requestDraw = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const display = displayRef.current;
      const base = invert ? baseCacheInvRef.current : baseCacheRef.current;
      if (!display || !base) return;

      const ctx = display.getContext("2d")!;
      display.width = base.width;
      display.height = base.height;

      ctx.clearRect(0, 0, display.width, display.height);
      ctx.fillStyle = bgBlack ? "#000" : "#fff";
      ctx.fillRect(0, 0, display.width, display.height);

      ctx.filter = `brightness(${brightnessRef.current}%) contrast(${contrastRef.current}%) saturate(${saturationRef.current}%)`;
      ctx.drawImage(base, 0, 0);
      ctx.filter = "none";
    });
  }, [invert, bgBlack]);

  const rebuildCache = useCallback((img: HTMLImageElement, dens: number) => {
    const grid = imageToAscii(img, dens);
    gridRef.current = grid;
    baseCacheRef.current = renderBaseCanvas(grid, 14);
    baseCacheInvRef.current = renderBaseCanvasInverted(grid, 14);
    requestDraw();
  }, [requestDraw]);

  useEffect(() => {
    requestDraw();
  }, [invert, bgBlack, requestDraw]);

  useEffect(() => {
    if (loadedImgRef.current) {
      rebuildCache(loadedImgRef.current, density);
    }
  }, [density, rebuildCache]);

  const handleFile = useCallback((file: File) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalSrc(src);
      const img = new Image();
      img.onload = () => {
        loadedImgRef.current = img;
        rebuildCache(img, density);
        setHasImage(true);
        setProcessing(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [density, rebuildCache]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const download = () => {
    const display = displayRef.current;
    if (!display) return;
    const link = document.createElement("a");
    link.download = "ascii-art.png";
    link.href = display.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
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

      {hasImage && (
        <div style={{ marginTop: "24px" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: `1px solid ${border}`,
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
            className="font-[family-name:var(--font-inter)]"
          >
            <Slider label="Density" value={80} min={40} max={200} step={10}
              onInput={(v) => setDensity(v)} fg={fg} />
            <Slider label="Brightness" value={100} min={50} max={200} step={5}
              onInput={(v) => { brightnessRef.current = v; requestDraw(); }} fg={fg} />
            <Slider label="Contrast" value={100} min={50} max={200} step={5}
              onInput={(v) => { contrastRef.current = v; requestDraw(); }} fg={fg} />
            <Slider label="Saturation" value={100} min={0} max={200} step={5}
              onInput={(v) => { saturationRef.current = v; requestDraw(); }} fg={fg} />
            <Toggle label="Invert" value={invert} onChange={setInvert} fg={fg} border={border} />
            <Toggle label="Bg" value={bgBlack} onChange={setBgBlack} fg={fg} border={border} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "center" }}>
            {originalSrc && (
              <div style={{ border: `1px solid ${border}`, overflow: "hidden", padding: "2.5%" }}>
                <img ref={origImgRef} src={originalSrc} alt="Original" style={{ width: "100%", display: "block" }} />
              </div>
            )}
            <div style={{ border: `1px solid ${border}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <canvas ref={displayRef} style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }} />
            </div>
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
