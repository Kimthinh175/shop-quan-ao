"use client";

import { useState } from "react";
import ColorSwatches, { ColorOption } from "../ColorSwatches";
import SizeSelection from "../SizeSelection";
import SizeGuideModal from "../SizeGuideModal";

export interface ProductVariantSelectorProps {
  colors: ColorOption[];
  sizes: string[];
  selectedColorId?: string;
  selectedSize?: string;
  onColorChange?: (color: ColorOption) => void;
  onSizeChange?: (size: string) => void;
  stockQty?: number;
}

export default function ProductVariantSelector({
  colors,
  sizes,
  selectedColorId,
  selectedSize,
  onColorChange,
  onSizeChange,
  stockQty,
}: ProductVariantSelectorProps) {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  return (
    <div className="space-y-6 py-6 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
      <ColorSwatches
        colors={colors}
        defaultColorId={selectedColorId || colors[0]?.id}
        onChange={onColorChange}
      />

      <SizeSelection
        sizes={sizes}
        defaultSize={selectedSize || sizes[0]}
        onChange={onSizeChange}
        onSizeGuideClick={() => setIsSizeGuideOpen(true)}
      />

      {stockQty !== undefined && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">Trạng thái kho:</span>
          {stockQty > 5 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-200 dark:border-emerald-800">
              <i className="fa-solid fa-circle-check mr-1" /> Còn hàng ({stockQty} sản phẩm)
            </span>
          ) : stockQty > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-200 dark:border-amber-800">
              <i className="fa-solid fa-triangle-exclamation mr-1" /> Sắp hết hàng (chỉ còn {stockQty})
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold border border-rose-200 dark:border-rose-800">
              <i className="fa-solid fa-circle-xmark mr-1" /> Tạm hết hàng biến thể này
            </span>
          )}
        </div>
      )}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}
