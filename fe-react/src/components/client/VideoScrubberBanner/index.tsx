"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TOTAL_FRAMES = 240; // All 240 frames extracted for maximum 90FPS ultra-smooth playback

// Format: /banners/ezgif-frame-001.jpg -> /banners/ezgif-frame-090.jpg
const currentFrameUrl = (index: number) =>
  `/banners/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;

export default function VideoScrubberBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(1);

  // 1. Preload image sequence into RAM
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = currentFrameUrl(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= Math.floor(TOTAL_FRAMES * 0.3)) {
          // Allow rendering after 30% preloaded
          setIsLoaded(true);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    // Draw initial frame as soon as frame 1 arrives
    if (images[0]) {
      images[0].onload = () => {
        renderCanvasFrame(1);
        setIsLoaded(true);
      };
    }
  }, []);

  // 2. Draw frame on canvas
  const renderCanvasFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete) return;

    // Set canvas dimensions to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Object-cover calculations for Canvas
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );
  };

  // 3. Scroll Listener
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalScrollableDistance = container.offsetHeight - windowHeight;
      if (totalScrollableDistance <= 0) return;

      const currentScroll = -rect.top;
      let progress = currentScroll / totalScrollableDistance;
      progress = Math.max(0, Math.min(1, progress));

      // Calculate corresponding frame index (Instant response from first scroll pixel)
      const frameIndex = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1)
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        animationFrameId = requestAnimationFrame(() => {
          renderCanvasFrame(frameIndex);
        });
      }

      // Fade in text overlay near end of section (e.g. > 85% scroll)
      if (progress >= 0.85) {
        setShowContent(true);
      } else {
        setShowContent(false);
      }
    };

    const handleResize = () => {
      renderCanvasFrame(currentFrameRef.current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Render initial position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh] bg-slate-950">
      {/* Sticky Canvas Viewport (Aligned with Header height so 0px shift occurs on initial scroll) */}
      <div className="sticky top-[65px] md:top-[73px] w-full h-[calc(100vh-65px)] md:h-[calc(100vh-73px)] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dynamic Overlay - Light gradient for crystal clear video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

        {/* Hero Content Overlay */}
        <div
          className={`relative z-10 text-center text-white px-4 transition-all duration-700 transform ${
            showContent
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95 pointer-events-none"
          }`}
        >
          <p className="text-sm md:text-base font-bold uppercase tracking-widest mb-4 text-indigo-300">
            Bộ sưu tập Hè 2026
          </p>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
            Thời trang tĩnh lặng.
          </h1>
          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-white text-slate-900 font-extrabold uppercase tracking-wider text-sm rounded-full shadow-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
          >
            Mua ngay
          </Link>
        </div>

        {/* Scroll Prompt */}
        {!showContent && (
          <div className="absolute bottom-10 z-10 flex flex-col items-center text-white/70 animate-bounce">
            <span className="text-xs uppercase font-bold tracking-widest mb-2">Cuộn để xem</span>
            <i className="fa-solid fa-chevron-down text-sm"></i>
          </div>
        )}
      </div>
    </div>
  );
}
