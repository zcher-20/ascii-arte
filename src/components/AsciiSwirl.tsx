"use client";

import { useEffect, useRef } from "react";

const DENSE_CHARS = "0#@*c";
const MID_CHARS = "0#@*+:;!co";
const LIGHT_CHARS = ":;^.,'-`";

interface SpiralChar {
  baseAngle: number;
  radius: number;
  char: string;
  size: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

export default function AsciiSwirl() {
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

    let chars: SpiralChar[] = [];

    function buildSpiral() {
      chars = [];
      const maxR = Math.min(w, h) * 0.36;
      const arms = 3;
      const totalTurns = 4;

      for (let arm = 0; arm < arms; arm++) {
        const armOffset = (arm / arms) * Math.PI * 2;
        const pointsOnArm = 120;

        for (let i = 0; i < pointsOnArm; i++) {
          const t = i / pointsOnArm;
          const theta = t * totalTurns * Math.PI * 2 + armOffset;
          const r = t * maxR + 5;

          // spread along the arm
          const spread = 3 + t * 12;
          const ox = (Math.random() - 0.5) * spread;
          const oy = (Math.random() - 0.5) * spread;

          let charSet: string;
          let size: number;
          let opacity: number;

          if (t < 0.3) {
            charSet = DENSE_CHARS;
            size = 7 + Math.random() * 5;
            opacity = 0.7 + Math.random() * 0.3;
          } else if (t < 0.7) {
            charSet = MID_CHARS;
            size = 5 + Math.random() * 5;
            opacity = 0.5 + Math.random() * 0.3;
          } else {
            charSet = LIGHT_CHARS;
            size = 4 + Math.random() * 4;
            opacity = 0.3 + Math.random() * 0.3;
          }

          chars.push({
            baseAngle: theta,
            radius: r,
            char: charSet[Math.floor(Math.random() * charSet.length)],
            size,
            opacity,
            offsetX: ox,
            offsetY: oy,
          });

          // extra density in inner regions
          if (t < 0.4 && Math.random() < 0.5) {
            chars.push({
              baseAngle: theta + (Math.random() - 0.5) * 0.15,
              radius: r + (Math.random() - 0.5) * 8,
              char: DENSE_CHARS[Math.floor(Math.random() * DENSE_CHARS.length)],
              size: 6 + Math.random() * 5,
              opacity: 0.6 + Math.random() * 0.4,
              offsetX: (Math.random() - 0.5) * 6,
              offsetY: (Math.random() - 0.5) * 6,
            });
          }
        }
      }

      // scattered outer fragments
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = maxR * (0.85 + Math.random() * 0.2);
        chars.push({
          baseAngle: angle,
          radius: r,
          char: LIGHT_CHARS[Math.floor(Math.random() * LIGHT_CHARS.length)],
          size: 3 + Math.random() * 3,
          opacity: 0.2 + Math.random() * 0.2,
          offsetX: (Math.random() - 0.5) * 15,
          offsetY: (Math.random() - 0.5) * 15,
        });
      }
    }

    buildSpiral();

    function animate(time: number) {
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const rotation = time * 0.0003;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const c of chars) {
        const angle = c.baseAngle + rotation;
        const x = cx + Math.cos(angle) * c.radius + c.offsetX;
        const y = cy + Math.sin(angle) * c.radius + c.offsetY;

        if (Math.random() < 0.002) {
          const charSet = c.radius < 50 ? DENSE_CHARS : c.radius < 100 ? MID_CHARS : LIGHT_CHARS;
          c.char = charSet[Math.floor(Math.random() * charSet.length)];
        }

        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = `hsl(195, 60%, ${68 + Math.random() * 10}%)`;
        ctx.font = `${c.size}px monospace`;
        ctx.fillText(c.char, x, y);
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
      buildSpiral();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
