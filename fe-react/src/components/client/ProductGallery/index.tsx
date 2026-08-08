"use client";

import { useState } from "react";

export interface ProductGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  badge?: string;
}

export default function ProductGallery({ images, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xs">
        Chưa có hình ảnh
      </div>
    );
  }

  const mainImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container - Compact height fitting viewport */}
      <div className="relative w-full h-[420px] md:h-[480px] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden group border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center">
        <img
          src={mainImage.src}
          alt={mainImage.alt}
          className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition-all duration-700"
        />

        {/* Badge Overlay */}
        {badge && (
          <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-[0.2em] bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-[#EBC563] px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 shadow-md rounded-full flex items-center gap-1.5 backdrop-blur-md z-10">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-[#EBC563] animate-pulse" />
            {badge}
          </span>
        )}

        {/* Left & Right Arrow Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all z-20"
              aria-label="Ảnh trước"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all z-20"
              aria-label="Ảnh kế tiếp"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/50 shadow-md z-10">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails List - Horizontal Scrollable Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 transition-all p-0 outline-none ${
                  isActive
                    ? "border-2 border-indigo-600 dark:border-[#D4AF37] ring-2 ring-indigo-600/30 dark:ring-[#D4AF37]/30 scale-105 z-10"
                    : "border border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
