"use client";

import { useEffect, useRef } from "react";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-:;.,";

interface Particle {
  x: number;
  y: number;
  char: string;
  alpha: number;
  flickerSpeed: number;
  flickerPhase: number;
}

interface RisingStream {
  col: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
}

export default function BottomCloud({ color = "#ffd4de", light = false }: { color?: string; light?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  colorRef.current = color;
  const lightRef = useRef(light);
  lightRef.current = light;
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

    const particles: Particle[] = [];
    const streams: RisingStream[] = [];

    function build() {
      particles.length = 0;
      streams.length = 0;
      cols = Math.floor(w / colWidth);
      rows = Math.floor(h / fontSize);

      const density = Math.floor(w * 0.3);
      for (let i = 0; i < density; i++) {
        const yBias = Math.random() * Math.random();
        particles.push({
          x: Math.random() * w,
          y: h - yBias * h * 0.25,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          alpha: 0.1 + Math.random() * 0.25,
          flickerSpeed: 1 + Math.random() * 3,
          flickerPhase: Math.random() * Math.PI * 2,
        });
      }

      const streamCount = Math.floor(cols * 0.2);
      for (let i = 0; i < streamCount; i++) {
        streams.push(spawnStream());
      }
    }

    function spawnStream(): RisingStream {
      const isLong = Math.random() < 0.2;
      const len = isLong
        ? 20 + Math.floor(Math.random() * 25)
        : 3 + Math.floor(Math.random() * 10);
      const chars: string[] = [];
      for (let i = 0; i < len; i++) {
        chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
      }
      return {
        col: Math.floor(Math.random() * cols),
        y: rows + Math.floor(Math.random() * 5),
        speed: isLong ? 0.2 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5,
        length: len,
        chars,
      };
    }

    build();

    function animate(time: number) {
      const isLight = lightRef.current;
      ctx.fillStyle = isLight ? "rgba(255,255,255,0.12)" : "rgba(10,10,10,0.12)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const c = colorRef.current;
      const t = time * 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const flicker = Math.sin(t * p.flickerSpeed + p.flickerPhase);
        const a = p.alpha * (0.5 + flicker * 0.5);
        if (a < 0.01) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = c;
        ctx.fillText(p.char, p.x, p.y);
        if (Math.random() < 0.003) {
          p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      for (let s = streams.length - 1; s >= 0; s--) {
        const stream = streams[s];
        stream.y -= stream.speed;

        for (let i = 0; i < stream.length; i++) {
          const row = Math.floor(stream.y) + i;
          if (row < 0 || row >= rows) continue;
          const x = stream.col * colWidth + colWidth / 2;
          const y = row * fontSize;
          const fade = 1 - i / stream.length;
          ctx.fillStyle = c;
          ctx.globalAlpha = fade * 0.25;
          ctx.fillText(stream.chars[i], x, y);
        }

        if (Math.floor(stream.y) + stream.length < 0) {
          streams[s] = spawnStream();
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
      build();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "280px", display: "block" }} />;
}
