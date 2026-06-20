"use client";

import { useEffect, useRef } from "react";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-:;.,";

interface RainDrop {
  col: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  mutateRate: number;
}

export default function HeroRain({ color = "#ffd4de", bgColor = "#000000" }: { color?: string; bgColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  colorRef.current = color;
  const bgRef = useRef(bgColor);
  bgRef.current = bgColor;
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    let w = canvas.width;
    let h = canvas.height;

    const fontSize = 7;
    const colWidth = fontSize * 0.6;
    let cols = Math.floor(w / colWidth);
    let rows = Math.floor(h / fontSize);

    const streams: RainDrop[] = [];

    function spawnStream(col?: number): RainDrop {
      const c = col ?? Math.floor(Math.random() * cols);
      const len = 5 + Math.floor(Math.random() * 20);
      const chars: string[] = [];
      for (let i = 0; i < len; i++) {
        chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
      }
      return {
        col: c,
        y: Math.floor(Math.random() * rows),
        speed: 0.5 + Math.random() * 0.8,
        length: len,
        chars,
        mutateRate: 0.02 + Math.random() * 0.04,
      };
    }

    const streamCount = Math.floor(cols * 0.35);
    for (let i = 0; i < streamCount; i++) {
      streams.push(spawnStream());
    }

    function animate() {
      const b = bgRef.current;
      const isLight = b === "#ffffff" || b === "#fff";
      ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const c = colorRef.current;

      for (let s = streams.length - 1; s >= 0; s--) {
        const stream = streams[s];
        stream.y += stream.speed;

        for (let i = 0; i < stream.length; i++) {
          const row = Math.floor(stream.y) - i;
          if (row < 0 || row >= rows) continue;

          const x = stream.col * colWidth + colWidth / 2;
          const y = row * fontSize;

          if (Math.random() < stream.mutateRate) {
            stream.chars[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }

          const fade = 1 - i / stream.length;
          ctx.fillStyle = c;
          ctx.globalAlpha = fade * 0.15;
          ctx.fillText(stream.chars[i], x, y);
        }

        if (Math.floor(stream.y) - stream.length > rows) {
          streams[s] = spawnStream(stream.col);
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
      w = canvas.width;
      h = canvas.height;
      cols = Math.floor(w / colWidth);
      rows = Math.floor(h / fontSize);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
