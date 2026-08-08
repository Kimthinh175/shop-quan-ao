"use client";

import { useState } from "react";

export interface SizeSelectionProps {
  sizes: string[];
  defaultSize?: string;
  onChange?: (size: string) => void;
  onSizeGuideClick?: () => void;
}

export default function SizeSelection({
  sizes,
  defaultSize,
  onChange,
  onSizeGuideClick,
}: SizeSelectionProps) {
  const [selectedSize, setSelectedSize] = useState(defaultSize || sizes[0]);

  const handleSelect = (size: string) => {
    setSelectedSize(size);
    onChange?.(size);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Kích thước:{" "}
          <span className="text-slate-900 dark:text-amber-300 font-extrabold ml-1">
            {selectedSize}
          </span>
        </h4>
        {onSizeGuideClick && (
          <button
            type="button"
            onClick={onSizeGuideClick}
            className="text-[11px] font-black uppercase tracking-[0.1em] text-indigo-600 dark:text-[#EBC563] hover:underline transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-ruler-combined" /> Hướng dẫn chọn size
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isActive = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => handleSelect(size)}
              className={`w-12 h-12 text-xs font-black flex items-center justify-center transition-all rounded-xl outline-none shadow-sm ${
                isActive
                  ? "bg-slate-950 dark:bg-[#D4AF37] text-white dark:text-slate-950 border-2 border-slate-950 dark:border-[#D4AF37] scale-105"
                  : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-slate-950"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
