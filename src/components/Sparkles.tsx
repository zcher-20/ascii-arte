"use client";

import { useEffect, useRef } from "react";

const SPARK_CHARS = [".", "݁", "₊", "⊹", "˖"];
const DARK_COLORS = ["#ffd4de", "#ffb8cc", "#ffe0e8", "#ffffff", "#fff0f5", "#e8d5f5", "#ddd0f0", "#f0d0f0", "#fce4ec"];
const LIGHT_COLORS = ["rgba(0,0,0,0.2)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.25)"];

interface Sparkle {
  x: number;
  y: number;
  char: string;
  phase: number;
  speed: number;
  size: number;
  maxAlpha: number;
  color: string;
}

export default function Sparkles({ light = false }: { light?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const sparkles: Sparkle[] = [];

    function spawn() {
      const count = Math.floor((w * h) / 5000);
      sparkles.length = 0;
      for (let i = 0; i < count; i++) {
        sparkles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          char: SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)],
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 2,
          size: 6 + Math.random() * 8,
          maxAlpha: 0.3 + Math.random() * 0.7,
          color: DARK_COLORS[Math.floor(Math.random() * DARK_COLORS.length)],
        });
      }
    }

    spawn();

    function animate(time: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const t = time * 0.001;

      for (const s of sparkles) {
        const pulse = Math.sin(t * s.speed + s.phase);
        const alpha = Math.max(0, pulse) * s.maxAlpha;

        if (alpha < 0.02) continue;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = lightRef.current
          ? LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)]
          : s.color;
        ctx.font = `${s.size * (0.7 + pulse * 0.3)}px serif`;
        ctx.fillText(s.char, s.x, s.y);
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
      spawn();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }} />;
}
