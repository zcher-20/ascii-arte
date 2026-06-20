"use client";

import { useEffect, useRef } from "react";
import { noise2D } from "@/lib/noise";

const CHARS = ".·:;+*#%@=~-";

type Particle = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  layer: number;
  life: number;
  maxLife: number;
  seed: number;
  char: string;
};

export default function ParticleFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1, active: false });

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const overlayEl = overlayRef.current;
    if (!canvasEl || !overlayEl) return;
    const canvas = canvasEl;
    const overlay = overlayEl;
    const ctx = canvas.getContext("2d")!;
    const octx = overlay.getContext("2d")!;

    let w = 0, h = 0, cx = 0, cy = 0;
    let innerR = 0, outerR = 0;
    const particles: Particle[] = [];

    function spawn(layer: number): Particle {
      let x: number, y: number;
      if (layer === 0) {
        x = Math.random() * w;
        y = Math.random() * h;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const warp = noise2D(Math.cos(angle) * 2, Math.sin(angle) * 2) * 0.4;
        const minR = innerR * (1 + warp * 0.5);
        const maxR = outerR * (1 + warp);
        const r = minR + Math.random() * (maxR - minR);
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
      }
      return {
        x, y, prevX: x, prevY: y, vx: 0, vy: 0, layer,
        life: 0,
        maxLife: layer === 0 ? 400 + Math.random() * 300 : 80 + Math.random() * 200,
        seed: Math.random() * 1000,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
      };
    }

    function drawGrid() {
      octx.clearRect(0, 0, w, h);
      octx.strokeStyle = "rgba(48, 82, 210, 0.06)";
      octx.lineWidth = 0.5;
      const gap = 80;
      for (let gx = 0; gx < w; gx += gap) {
        octx.beginPath(); octx.moveTo(gx, 0); octx.lineTo(gx, h); octx.stroke();
      }
      for (let gy = 0; gy < h; gy += gap) {
        octx.beginPath(); octx.moveTo(0, gy); octx.lineTo(w, gy); octx.stroke();
      }
      octx.fillStyle = "rgba(48, 82, 210, 0.15)";
      octx.font = "9px monospace";
      octx.textAlign = "center";
      const cols = Math.floor(w / gap);
      for (let i = 0; i <= cols; i++) {
        octx.fillText(`${i * 10}m`, i * gap, h - 8);
      }
    }

    function init() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w; canvas.height = h;
      overlay.width = w; overlay.height = h;
      cx = w * 0.45; cy = h * 0.5;
      const scale = Math.min(w, h);
      innerR = scale * 0.13;
      outerR = scale * 0.38;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);

      particles.length = 0;
      for (let i = 0; i < 9000; i++) particles.push(spawn(1));
      for (let i = 0; i < 400; i++) particles.push(spawn(2));

      drawGrid();
    }

    init();

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", init);

    let raf = 0, time = 0;

    function animate() {
      time += 0.006;
      const { x: mx, y: my, active } = mouseRef.current;

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;

        const ns = p.layer === 2 ? 0.002 : 0.0035;
        const n1 = noise2D(p.x * ns + time * 0.15, p.y * ns + p.seed * 0.01);
        const n2 = noise2D(p.x * ns + 200 + time * 0.1, p.y * ns + 200);
        const flowAngle = (n1 + n2 * 0.5) * Math.PI * 2.5;

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const nf = p.layer === 2 ? 0.07 : 0.055;
        p.vx += Math.cos(flowAngle) * nf;
        p.vy += Math.sin(flowAngle) * nf;

        if (dist > 1) {
          const tangent = Math.atan2(dy, dx) + Math.PI * 0.5;
          p.vx += Math.cos(tangent) * 0.012;
          p.vy += Math.sin(tangent) * 0.012;

          const targetR = (innerR + outerR) * 0.5;
          const drift = (dist - targetR) / targetR;
          p.vx -= (dx / dist) * drift * 0.008;
          p.vy -= (dy / dist) * drift * 0.008;
        }

        p.vx += (Math.random() - 0.5) * 0.04;
        p.vy += (Math.random() - 0.5) * 0.04;

        const damp = p.layer === 2 ? 0.965 : 0.94;
        p.vx *= damp;
        p.vy *= damp;

        if (active) {
          const cdx = p.x - mx;
          const cdy = p.y - my;
          const cd = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cd < 120 && cd > 1) {
            const f = (1 - cd / 120) * 0.8;
            p.vx += (cdx / cd) * f;
            p.vy += (cdy / cd) * f;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const dead = p.life > p.maxLife
          || d2(p.x, p.y, cx, cy) < innerR * 0.5
          || d2(p.x, p.y, cx, cy) > outerR * 1.8;

        if (dead) {
          const np = spawn(p.layer);
          p.x = np.x; p.y = np.y; p.prevX = np.x; p.prevY = np.y;
          p.vx = 0; p.vy = 0; p.life = 0;
          p.maxLife = np.maxLife; p.seed = np.seed; p.char = np.char;
          continue;
        }

        const lr = p.life / p.maxLife;
        const fade = lr < 0.08 ? lr / 0.08 : lr > 0.85 ? (1 - lr) / 0.15 : 1;

        ctx.fillStyle = p.layer === 1 ? "#2446d0" : "#1e3cc8";
        ctx.globalAlpha = fade * (p.layer === 1 ? 0.3 : 0.55);
        ctx.font = `${p.layer === 1 ? 4 : 5}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;

      // crosshair on overlay
      octx.clearRect(0, 0, w, h);
      drawGridStatic();
      if (active) {
        octx.strokeStyle = "rgba(48, 82, 210, 0.12)";
        octx.lineWidth = 0.5;
        octx.setLineDash([3, 3]);
        octx.beginPath(); octx.moveTo(mx, 0); octx.lineTo(mx, h); octx.stroke();
        octx.beginPath(); octx.moveTo(0, my); octx.lineTo(w, my); octx.stroke();
        octx.setLineDash([]);
      }

      raf = requestAnimationFrame(animate);
    }

    function drawGridStatic() {
      octx.strokeStyle = "rgba(48, 82, 210, 0.06)";
      octx.lineWidth = 0.5;
      const gap = 80;
      for (let gx = 0; gx < w; gx += gap) {
        octx.beginPath(); octx.moveTo(gx, 0); octx.lineTo(gx, h); octx.stroke();
      }
      for (let gy = 0; gy < h; gy += gap) {
        octx.beginPath(); octx.moveTo(0, gy); octx.lineTo(w, gy); octx.stroke();
      }
      octx.fillStyle = "rgba(48, 82, 210, 0.15)";
      octx.font = "9px monospace";
      octx.textAlign = "center";
      const cols = Math.floor(w / gap);
      for (let i = 0; i <= cols; i++) {
        octx.fillText(`${i * 10}m`, i * gap, h - 8);
      }
    }

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      overlay.removeEventListener("mousemove", onMouseMove);
      overlay.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <section className="relative w-full h-screen bg-white">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full cursor-crosshair pointer-events-auto" />
    </section>
  );
}

function d2(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2, dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
