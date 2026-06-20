"use client";

import { useState, useEffect, useRef } from "react";
import AsciiCanvas from "@/components/AsciiCanvas";
import ColorPicker from "@/components/ColorPicker";
import AsciiFireworks from "@/components/AsciiFireworks";
import AsciiSwirl from "@/components/AsciiSwirl";
import AsciiRain from "@/components/AsciiRain";
import AsciiFireplace from "@/components/AsciiFireplace";
import HeroRain from "@/components/HeroRain";
import Sparkles from "@/components/Sparkles";
import CornerSparkles from "@/components/CornerSparkles";

function CornerFrame({ color }: { color: string }) {
  const len = "40px";
  const weight = "1px";
  const offset = "20px";
  const c = color + "4d";

  const style = {
    position: "absolute" as const,
    pointerEvents: "none" as const,
  };

  return (
    <>
      <span style={{ ...style, top: offset, left: offset, width: len, height: weight, background: c }} />
      <span style={{ ...style, top: offset, left: offset, width: weight, height: len, background: c }} />
      <span style={{ ...style, top: offset, right: offset, width: len, height: weight, background: c }} />
      <span style={{ ...style, top: offset, right: offset, width: weight, height: len, background: c }} />
      <span style={{ ...style, bottom: offset, left: offset, width: len, height: weight, background: c }} />
      <span style={{ ...style, bottom: offset, left: offset, width: weight, height: len, background: c }} />
      <span style={{ ...style, bottom: offset, right: offset, width: len, height: weight, background: c }} />
      <span style={{ ...style, bottom: offset, right: offset, width: weight, height: len, background: c }} />
    </>
  );
}

function AsciiTitle({ light }: { light: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d")!;
      const w = canvas.width;
      const h = canvas.height;

      const text = "an ascii animation library.";
      const fontSize = Math.min(w / (text.length * 0.62), h * 0.6);

      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const octx = offscreen.getContext("2d", { willReadFrequently: true })!;
      octx.font = `italic 900 ${fontSize}px "Archivo Black", Impact, sans-serif`;
      octx.fillStyle = "white";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(text, w / 2, h / 2);

      const imageData = octx.getImageData(0, 0, w, h);
      const pixels = imageData.data;
      const chars = "0123456789@#$%&*+=?!.:;~^";
      const gap = 5;

      ctx.clearRect(0, 0, w, h);
      ctx.font = "5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = light ? "#222" : "#ffd4de";

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const i = (y * w + x) * 4;
          if (pixels[i] > 128) {
            ctx.globalAlpha = 0.9 + Math.random() * 0.1;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    document.fonts.ready.then(init);
    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, [light]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: "180px" }} />;
}

function AsciiLabel({ text, light }: { text: string; light: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d")!;
      const w = canvas.width;
      const h = canvas.height;

      const fontSize = Math.min(w / (text.length * 0.55), h * 0.65);

      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const octx = offscreen.getContext("2d", { willReadFrequently: true })!;
      octx.font = `italic 900 ${fontSize}px "Archivo Black", Impact, sans-serif`;
      octx.fillStyle = "white";
      octx.textAlign = "center";
      octx.textBaseline = "middle";

      octx.fillText(text, w / 2, h / 2);

      const imageData = octx.getImageData(0, 0, w, h);
      const pixels = imageData.data;
      const chars = "0123456789@#$%&*+=?!.:;~^";
      const gap = 4;

      ctx.clearRect(0, 0, w, h);
      ctx.font = "5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = light ? "#222" : "#ffffff";

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const i = (y * w + x) * 4;
          if (pixels[i] > 128) {
            ctx.globalAlpha = 0.95 + Math.random() * 0.05;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    document.fonts.ready.then(init);
    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, [text, light]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: "120px" }} />;
}

export default function Home() {
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [light, setLight] = useState(false);

  const bg = light ? "#ffffff" : bgColor;
  const fg = light ? "#111" : textColor;
  const sectionBg = light ? "#ffffff" : "#0a0a0a";
  const cardBg = "#000";
  const cardBorder = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
  const footerBorder = light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
  const footerText = light ? "#888" : "#737373";
  const linkColor = light ? "#555" : "#a3a3a3";

  return (
    <div style={{ background: sectionBg, transition: "background 0.5s ease" }}>
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "100vh", background: bg, transition: "background 0.5s ease" }}
      >
        <HeroRain color={light ? "rgba(0,0,0,0.15)" : "#ffd4de"} bgColor={bg} />
        <div className="absolute inset-0">
          <CornerFrame color={fg} />
          <AsciiCanvas textColor={fg} />
        </div>
        <ColorPicker
          bgColor={bgColor}
          textColor={textColor}
          onBgChange={setBgColor}
          onTextChange={setTextColor}
        />
      </section>

      <section className="relative" style={{ width: "100%", background: sectionBg, paddingTop: "80px", paddingBottom: "80px", transition: "background 0.5s ease" }}>
        <Sparkles light={light} />

        <div style={{ padding: "0 24px", marginBottom: "64px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <AsciiTitle light={light} />
        </div>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 48px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {[
              { num: "( 01. )", comp: <AsciiSwirl /> },
              { num: "( 02. )", comp: <AsciiFireworks /> },
              { num: "( 03. )", comp: <AsciiRain /> },
              { num: "( 04. )", comp: <AsciiFireplace /> },
            ].map(({ num, comp }) => (
              <div key={num}>
                <div style={{ textAlign: "center", marginBottom: "10px", fontSize: "11px", letterSpacing: "2px", color: light ? "#333" : "#fff", opacity: 0.6 }} className="font-[family-name:var(--font-inter)]">
                  {num}
                </div>
                <div className="aspect-[16/9] rounded overflow-hidden relative" style={{ background: cardBg, border: `1px solid ${cardBorder}`, transition: "background 0.5s ease, border-color 0.5s ease" }}>
                  {comp}
                  <CornerSparkles light={light} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 24px", marginTop: "64px", textAlign: "center" }}>
          <a href="https://github.com/zcher-20" target="_blank" rel="noopener noreferrer" style={{ display: "block", cursor: "pointer" }}>
            <AsciiLabel text="github repo" light={light} />
          </a>
        </div>
      </section>

      <footer style={{ width: "100%", background: sectionBg, borderTop: `1px solid ${footerBorder}`, padding: "32px 0", transition: "background 0.5s ease" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 48px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: footerText }} className="font-[family-name:var(--font-inter)]">
          <span>&copy; 2026 Arte Ascii</span>
          <span>
            Built by{" "}
            <a
              href="https://zaynebcherif.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: linkColor, transition: "color 0.3s" }}
            >
              Zayneb Cherif
            </a>
          </span>
        </div>
      </footer>

      <button
        onClick={() => setLight(!light)}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 50,
          background: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
          border: `1px solid ${light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
          borderRadius: "8px",
          padding: "8px 12px",
          cursor: "pointer",
          fontSize: "14px",
          fontFamily: "monospace",
          color: light ? "#333" : "#ccc",
          transition: "all 0.4s ease",
          backdropFilter: "blur(8px)",
        }}
      >
        {light ? "*)" : "(+"}
      </button>
    </div>
  );
}
