"use client";

import { useState } from "react";

interface ColorPickerProps {
  bgColor: string;
  textColor: string;
  onBgChange: (color: string) => void;
  onTextChange: (color: string) => void;
}

export default function ColorPicker({ bgColor, textColor, onBgChange, onTextChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 font-[family-name:var(--font-inter)]" style={{ color: textColor }}>
      {open && (
        <div
          className="mb-3 flex items-center gap-6 px-5 py-3 rounded border"
          style={{
            background: bgColor,
            borderColor: textColor + "33",
          }}
        >
          <label className="flex items-center gap-3 text-xs tracking-wide opacity-60">
            Background
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgChange(e.target.value)}
              className="w-6 h-6 cursor-pointer border-0 bg-transparent"
            />
          </label>
          <label className="flex items-center gap-3 text-xs tracking-wide opacity-60">
            Text
            <input
              type="color"
              value={textColor}
              onChange={(e) => onTextChange(e.target.value)}
              className="w-6 h-6 cursor-pointer border-0 bg-transparent"
            />
          </label>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="block mx-auto opacity-30 hover:opacity-80 transition-opacity cursor-pointer"
        style={{ color: textColor }}
      >
        <span style={{ display: "block", width: "32px", height: "1px", background: textColor }} />
      </button>
    </div>
  );
}
