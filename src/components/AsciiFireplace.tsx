"use client";

import { useEffect, useRef } from "react";

const FIRE_CHARS = ".*^~\"'`,:;!|/\\{}()";
const SPARK_CHARS = ".*+`'";

interface Flame {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  life: number;
  maxLife: number;
  hue: number;
}

export default function AsciiFireplace() {
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

    const flames: Flame[] = [];
    const logChars = "═══════╔╗╚╝║║████▓▓▒▒░░";

    function spawnFlame() {
      const baseX = w * 0.25 + Math.random() * w * 0.5;
      const baseY = h * 0.65 + Math.random() * h * 0.05;
      flames.push({
        x: baseX,
        y: baseY,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.5 + Math.random() * 1.5),
        char: FIRE_CHARS[Math.floor(Math.random() * FIRE_CHARS.length)],
        life: 0,
        maxLife: 30 + Math.random() * 50,
        hue: 15 + Math.random() * 25,
      });
    }

    function animate(time: number) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // spawn new flames
      for (let i = 0; i < 6; i++) spawnFlame();

      // occasional spark
      if (Math.random() < 0.15) {
        const sx = w * 0.3 + Math.random() * w * 0.4;
        flames.push({
          x: sx,
          y: h * 0.62,
          vx: (Math.random() - 0.5) * 2,
          vy: -(2 + Math.random() * 3),
          char: SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)],
          life: 0,
          maxLife: 15 + Math.random() * 20,
          hue: 40 + Math.random() * 20,
        });
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // draw logs
      ctx.globalAlpha = 0.6;
      ctx.font = "8px monospace";
      ctx.fillStyle = "#8b5e3c";
      const logY = h * 0.7;
      for (let lx = w * 0.2; lx < w * 0.8; lx += 8) {
        const ch = logChars[Math.floor(Math.random() * logChars.length)];
        ctx.fillText(ch, lx, logY + Math.sin(lx * 0.1) * 3);
        ctx.fillText(ch, lx + 2, logY + 10 + Math.sin(lx * 0.15) * 2);
      }

      // update and draw flames
      for (let i = flames.length - 1; i >= 0; i--) {
        const f = flames[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vx += (Math.random() - 0.5) * 0.15;
        f.vy *= 0.99;
        f.life++;

        if (f.life > f.maxLife) {
          flames.splice(i, 1);
          continue;
        }

        if (Math.random() < 0.06) {
          f.char = FIRE_CHARS[Math.floor(Math.random() * FIRE_CHARS.length)];
        }

        const t = f.life / f.maxLife;
        const fade = t < 0.1 ? t * 10 : 1 - (t - 0.1) / 0.9;

        // color: orange-yellow at base, red in middle, dim at top
        const lightness = 50 + (1 - t) * 30;
        const saturation = 90 - t * 30;
        ctx.fillStyle = `hsl(${f.hue - t * 15}, ${saturation}%, ${lightness}%)`;
        ctx.globalAlpha = fade * 0.75;

        const size = 5 + (1 - t) * 4;
        ctx.font = `${size}px monospace`;
        ctx.fillText(f.char, f.x, f.y);
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
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
