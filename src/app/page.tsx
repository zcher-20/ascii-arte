"use client";

import { useState, useEffect, useRef } from "react";
import AsciiCanvas from "@/components/AsciiCanvas";
import ColorPicker from "@/components/ColorPicker";
import AsciiFireworks from "@/components/AsciiFireworks";
import AsciiSwirl from "@/components/AsciiSwirl";
import AsciiRain from "@/components/AsciiRain";
import AsciiFireplace from "@/components/AsciiFireplace";
import HeroRain from "@/components/HeroRain";
import BottomCloud from "@/components/BottomCloud";
import Sparkles from "@/components/Sparkles";
import AsciiGenerator from "@/components/AsciiGenerator";
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
      ctx.fillStyle = light ? "#222" : "#ffffff";

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

function FilmStrip({ light, cardBg, cardBorder }: { light: boolean; cardBg: string; cardBorder: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const cards = [
    { num: "( 01. )", comp: <AsciiRain /> },
    { num: "( 02. )", comp: <AsciiFireplace /> },
    { num: "( 03. )", comp: <AsciiFireworks /> },
    { num: "( 04. )", comp: <AsciiSwirl /> },
  ];

  const scroll = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector<HTMLElement>("[data-card]")?.offsetWidth || 400;
    track.scrollBy({ left: dir * (cardWidth + 20), behavior: "smooth" });
  };

  const arrowColor = light ? "#333" : "#fff";

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "hidden",
          padding: "0 calc(50vw - 20vw)",
          scrollbarWidth: "none",
        }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {cards.map(({ num, comp }) => (
          <div key={num} data-card style={{ flex: "0 0 40vw", maxWidth: "500px" }}>
            <div style={{ textAlign: "center", marginBottom: "12px", fontSize: "11px", letterSpacing: "2px", color: arrowColor, opacity: 0.6 }} className="font-[family-name:var(--font-inter)]">
              {num}
            </div>
            <div
              className="rounded overflow-hidden relative"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                transition: "background 0.5s ease, border-color 0.5s ease",
                aspectRatio: "16/9",
                width: "100%",
              }}
            >
              {comp}
              <CornerSparkles light={light} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "20px" }}>
        <button
          onClick={() => scroll(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            fontFamily: "monospace",
            color: arrowColor,
            opacity: 0.5,
            transition: "opacity 0.2s",
            padding: "4px 12px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
        >
          ←
        </button>
        <button
          onClick={() => scroll(1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            fontFamily: "monospace",
            color: arrowColor,
            opacity: 0.5,
            transition: "opacity 0.2s",
            padding: "4px 12px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
        >
          →
        </button>
      </div>
    </div>
  );
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

      <section className="relative" style={{ width: "100%", background: sectionBg, paddingTop: "80px", paddingBottom: "80px", transition: "background 0.5s ease", overflow: "hidden" }}>
        <Sparkles light={light} />

        <div style={{ padding: "0 24px", marginBottom: "48px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <AsciiTitle light={light} />
        </div>

        <FilmStrip light={light} cardBg={cardBg} cardBorder={cardBorder} />

        <div style={{ padding: "0 24px", marginTop: "64px", marginBottom: "48px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <AsciiLabel text="generate" light={light} />
        </div>

        <div style={{ position: "relative", zIndex: 1, marginBottom: "64px" }}>
          <AsciiGenerator light={light} />
        </div>

      </section>

      <div style={{ position: "relative", background: sectionBg, transition: "background 0.5s ease" }}>
        <BottomCloud color={light ? "rgba(0,0,0,0.15)" : "#ffd4de"} light={light} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2, padding: "0 24px", textAlign: "center", width: "100%" }}>
          <a href="https://github.com/zcher-20" target="_blank" rel="noopener noreferrer" style={{ display: "block", cursor: "pointer" }}>
            <AsciiLabel text="github repo" light={light} />
          </a>
        </div>
      </div>

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
