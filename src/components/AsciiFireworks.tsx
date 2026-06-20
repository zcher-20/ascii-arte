"use client";

import { useEffect, useRef, useState } from "react";

type FrameCell = [number, number, string, string]; // col, row, char, hex color
type FrameData = FrameCell[];

const JEWEL_PALETTE = [
  "#a8d8ea", "#aa96da", "#fcbad3", "#f9e2ae",
  "#b8e6d0", "#c3aed6", "#e8a0bf", "#95e1d3",
  "#dbb4f3", "#f4c2c2", "#b5ead7", "#c7ceea",
];

function toJewel(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  const brightness = (r + g + b) / 3;
  if (brightness < 30) return hex;
  const idx = (r * 7 + g * 13 + b * 3) % JEWEL_PALETTE.length;
  return JEWEL_PALETTE[idx];
}

export default function AsciiFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [frames, setFrames] = useState<FrameData[] | null>(null);

  useEffect(() => {
    fetch("/fireworks.json")
      .then((r) => r.json())
      .then((data: FrameData[]) => setFrames(data));
  }, []);

  useEffect(() => {
    if (!frames || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    let w = canvas.width;
    let h = canvas.height;

    const COLS = 77;
    const ROWS = 40;
    let frameIndex = 0;
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 50;

    function animate(time: number) {
      if (time - lastFrameTime >= FRAME_INTERVAL) {
        lastFrameTime = time;
        frameIndex = (frameIndex + 1) % frames!.length;

        ctx.clearRect(0, 0, w, h);

        const cellW = w / COLS;
        const cellH = h / ROWS;
        const fontSize = Math.max(Math.min(cellW, cellH) * 0.9, 4);

        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const frame = frames![frameIndex];
        for (let i = 0; i < frame.length; i++) {
          const [col, row, char, color] = frame[i];
          ctx.fillStyle = toJewel(color);
          ctx.globalAlpha = 0.9;
          ctx.fillText(char, col * cellW + cellW / 2, row * cellH + cellH / 2);
        }
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
      w = canvas.width;
      h = canvas.height;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [frames]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
