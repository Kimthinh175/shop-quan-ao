"use client";

import { useState } from "react";

export interface ColorOption {
  id: string;
  name: string;
  colorCode: string;
}

export interface ColorSwatchesProps {
  colors: ColorOption[];
  defaultColorId?: string;
  onChange?: (color: ColorOption) => void;
}

export default function ColorSwatches({ colors, defaultColorId, onChange }: ColorSwatchesProps) {
  const [selectedId, setSelectedId] = useState(defaultColorId || colors[0]?.id);

  const selectedColor = colors.find((c) => c.id === selectedId) || colors[0];

  const handleSelect = (color: ColorOption) => {
    setSelectedId(color.id);
    onChange?.(color);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Màu sắc: <span className="text-slate-900 dark:text-amber-300 font-extrabold ml-1">{selectedColor?.name}</span>
        </h4>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isActive = selectedId === color.id;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => handleSelect(color)}
              className={`w-9 h-9 rounded-full transition-all p-0.5 outline-none shadow-sm ${
                isActive
                  ? "ring-2 ring-indigo-600 dark:ring-[#D4AF37] ring-offset-2 dark:ring-offset-[#0B0B0B] scale-110"
                  : "border-2 border-slate-200 dark:border-slate-700 hover:scale-105"
              }`}
              title={color.name}
              style={{ backgroundColor: color.colorCode }}
            />
          );
        })}
      </div>
    </div>
  );
}
