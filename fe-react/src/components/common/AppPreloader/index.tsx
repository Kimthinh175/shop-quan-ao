"use client";

import { useEffect, useState } from "react";

export default function AppPreloader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hide preloader smoothly after DOM hydration / mount
    const timer = setTimeout(() => {
      setMounted(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  if (mounted) return null;

  return (
    <div
      id="app-preloader"
      className="fixed inset-0 z-[9999] bg-[#faf9f6] flex flex-col items-center justify-center p-6 transition-opacity duration-300 pointer-events-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#faf9f6",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Brand Skeleton Logo */}
      <div className="flex flex-col items-center gap-3 mb-8 animate-pulse">
        <div className="font-serif text-3xl font-black tracking-tighter text-slate-900">
          CLOSET.
        </div>
        <div className="h-1 w-16 bg-indigo-600 rounded-full" />
      </div>

      {/* Skeleton Page Layout Placeholders */}
      <div className="w-full max-w-4xl space-y-4 px-4">
        {/* Header Skeleton Bar */}
        <div className="h-12 w-full bg-slate-200/80 rounded-2xl animate-pulse" />
        
        {/* Banner Skeleton */}
        <div className="h-48 w-full bg-slate-200/60 rounded-3xl animate-pulse" />

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-slate-200/50 rounded-2xl animate-pulse flex flex-col justify-end p-3"
            >
              <div className="h-3 w-3/4 bg-slate-300 rounded mb-2" />
              <div className="h-2 w-1/2 bg-slate-300 rounded" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 animate-pulse">
        Đang tải dữ liệu & giao diện...
      </p>
    </div>
  );
}
