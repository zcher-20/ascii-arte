"use client";

import { useEffect, useRef, useCallback } from "react";
import { CharCell, sampleTextToGrid } from "@/lib/particle";

const TEXT = "arte ascii";
const FONT_SIZE = 6;
const GAP = 8;

export default function AsciiCanvas({ textColor = "#ffffff" }: { textColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellsRef = useRef<CharCell[]>([]);
  const decosRef = useRef<{
    homeX: number; homeY: number;
    x: number; y: number;
    vx: number; vy: number;
    driftX: number; driftY: number;
    lines: string[]; baseLines: string[][];
    opacity: number; phase: number;
  }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false, dragging: false, exploded: false });
  const textColorRef = useRef(textColor);
  textColorRef.current = textColor;
  const rafRef = useRef<number>(0);
  const lastColorRef = useRef("");

  const buildBgCache = useCallback((w: number, h: number, color: string) => {
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement("canvas");
    }
    const bg = bgCanvasRef.current;
    bg.width = w;
    bg.height = h;
    const bctx = bg.getContext("2d")!;
    bctx.font = `${FONT_SIZE}px monospace`;
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.globalAlpha = 0.08;
    bctx.fillStyle = color;
    for (let by = 0; by < h; by += GAP) {
      for (let bx = 0; bx < w; bx += GAP) {
        bctx.fillText(".", bx, by);
      }
    }
    lastColorRef.current = color;
  }, []);

  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    cellsRef.current = sampleTextToGrid(TEXT, canvas.width, canvas.height, GAP);
    buildBgCache(canvas.width, canvas.height, textColorRef.current);

    const patterns: string[][] = [
      ["#"], ["%"], ["*"], ["."], [";"], [":"], ["@"], ["="],
      ["TT"], ["##"], ["@@"], [".."], ["::"], ["; ;"], [". ."],
      ["##:", "##"], [":", ":"], ["= ="], ["--"], ["++"],
      ["444", "  4"], [": ##"], ["#", "#:"], [". .", "."],
    ];

    const textBounds = {
      left: canvas.width * 0.1,
      right: canvas.width * 0.9,
      top: canvas.height * 0.25,
      bottom: canvas.height * 0.75,
    };

    const decos: typeof decosRef.current = [];
    const count = Math.floor((canvas.width * canvas.height) / 60000);
    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        attempts++;
      } while (
        attempts < 20 &&
        x > textBounds.left && x < textBounds.right &&
        y > textBounds.top && y < textBounds.bottom
      );

      const baseLines = patterns[Math.floor(Math.random() * patterns.length)];
      const charArrays = baseLines.map(line => line.split(""));

      decos.push({
        homeX: x, homeY: y, x, y,
        vx: 0, vy: 0,
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.3,
        lines: baseLines.slice(),
        baseLines: charArrays,
        opacity: 0.15 + Math.random() * 0.25,
        phase: Math.random() * 1000,
      });
    }
    decosRef.current = decos;
  }, [buildBgCache]);

  useEffect(() => {
    document.fonts.ready.then(() => initGrid());

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => { mouseRef.current.active = false; };

    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const onTouchEnd = () => { mouseRef.current.active = false; };

    let dragMoved = false;

    const onMouseDown = () => {
      mouseRef.current.dragging = true;
      dragMoved = false;
    };

    const onMouseUp = () => {
      if (!dragMoved) {
        const { x, y } = mouseRef.current;
        mouseRef.current.exploded = true;
        const cells = cellsRef.current;
        for (let i = 0; i < cells.length; i++) {
          cells[i].explode(x, y);
        }
      }
      mouseRef.current.dragging = false;
      mouseRef.current.exploded = false;
    };

    const onMouseMoveDrag = (e: MouseEvent) => {
      onMouseMove(e);
      if (mouseRef.current.dragging) dragMoved = true;
    };

    canvas.addEventListener("mousemove", onMouseMoveDrag, { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave, { passive: true });
    canvas.addEventListener("mousedown", onMouseDown, { passive: true });
    canvas.addEventListener("mouseup", onMouseUp, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initGrid, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const decoChars = "*+#.:-=|/\\@%&~^;!?";

    const animate = (time: number) => {
      const { x: mx, y: my, active, dragging, exploded } = mouseRef.current;
      const cells = cellsRef.current;
      const tc = textColorRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // rebuild bg cache if color changed
      if (tc !== lastColorRef.current && bgCanvasRef.current) {
        buildBgCache(canvas.width, canvas.height, tc);
      }

      // stamp cached bg grid
      if (bgCanvasRef.current) {
        ctx.drawImage(bgCanvasRef.current, 0, 0);
      }

      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // decos
      const decos = decosRef.current;
      const lineH = FONT_SIZE + 1;
      for (let i = 0; i < decos.length; i++) {
        const d = decos[i];

        const sway = Math.sin(time * 0.001 + d.phase * 6.28);
        d.x = d.homeX + sway * 8 * d.driftX * 20;
        d.y = d.homeY + Math.cos(time * 0.0008 + d.phase * 6.28) * 5 * d.driftY * 15;

        if (active) {
          const ddx = d.x - mx;
          const ddy = d.y - my;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < 120 && dist > 0) {
            const push = 300 / (dist * dist);
            d.vx += (ddx / dist) * push;
            d.vy += (ddy / dist) * push;
          }
        }
        d.vx *= 0.9;
        d.vy *= 0.9;
        d.x += d.vx;
        d.y += d.vy;

        if (Math.sin(time * 0.004 + d.phase * 3.14) > 0.85) {
          for (let l = 0; l < d.baseLines.length; l++) {
            const chars = d.baseLines[l];
            const mutated: string[] = [];
            for (let c = 0; c < chars.length; c++) {
              if (chars[c] !== " " && Math.random() < 0.3) {
                mutated.push(decoChars[Math.floor(Math.random() * decoChars.length)]);
              } else {
                mutated.push(chars[c]);
              }
            }
            d.lines[l] = mutated.join("");
          }
        }

        const flicker = 0.7 + 0.3 * Math.sin(time * 0.002 + d.phase * 6.28);
        ctx.globalAlpha = d.opacity * flicker;
        ctx.fillStyle = tc;
        for (let l = 0; l < d.lines.length; l++) {
          ctx.fillText(d.lines[l], d.x, d.y + l * lineH);
        }
      }

      // main text particles
      ctx.fillStyle = tc;
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        cell.update(mx, my, active, dragging, exploded, time);
        ctx.globalAlpha = cell.opacity;
        ctx.fillText(cell.currentChar, cell.x, cell.y);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMouseMoveDrag);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [initGrid, buildBgCache]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
    />
  );
}
