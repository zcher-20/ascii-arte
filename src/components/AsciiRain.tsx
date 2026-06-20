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

export default function AsciiRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        y: -Math.floor(Math.random() * rows),
        speed: 0.3 + Math.random() * 0.7,
        length: len,
        chars,
        mutateRate: 0.02 + Math.random() * 0.04,
      };
    }

    const streamCount = Math.floor(cols * 0.55);
    for (let i = 0; i < streamCount; i++) {
      streams.push(spawnStream());
    }

    let lastTime = 0;

    function animate(time: number) {
      const dt = time - lastTime;
      lastTime = time;

      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (let s = streams.length - 1; s >= 0; s--) {
        const stream = streams[s];
        stream.y += stream.speed;

        for (let i = 0; i < stream.length; i++) {
          const row = Math.floor(stream.y) - i;
          if (row < 0 || row >= rows) continue;

          const x = stream.col * colWidth + colWidth / 2;
          const y = row * fontSize;

          // mutate characters randomly
          if (Math.random() < stream.mutateRate) {
            stream.chars[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }

          if (i === stream.length - 1 || i === stream.length - 2) {
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 0.95;
          } else if (i === 0) {
            ctx.fillStyle = "#f0dde0";
            ctx.globalAlpha = 0.9;
          } else {
            const fade = 1 - i / stream.length;
            const lightness = 55 + fade * 20;
            ctx.fillStyle = `hsl(340, 15%, ${lightness}%)`;
            ctx.globalAlpha = fade * 0.7;
          }

          ctx.fillText(stream.chars[i], x, y);
        }

        // respawn when fully off screen
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
