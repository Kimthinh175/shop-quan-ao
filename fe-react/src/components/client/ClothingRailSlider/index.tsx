"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import HangerProductCard from "../HangerProductCard";
import { Product } from "../../../types";

export interface ClothingRailSliderProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

export default function ClothingRailSlider({
  title,
  subtitle,
  products,
  viewAllLink = "/shop",
}: ClothingRailSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [angles, setAngles] = useState<number[]>(() =>
    new Array(products.length).fill(0),
  );

  // Dragging state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const lastScrollPos = useRef(0);
  const velocity = useRef(0);
  const animFrameId = useRef<number | null>(null);

  // Angles state ref to avoid closure issues in RAF
  const anglesRef = useRef<number[]>(new Array(products.length).fill(0));

  // Physics animation loop using RAF
  const updatePhysics = useCallback(() => {
    let activeSway = false;
    const currentVel = velocity.current;

    // Decay velocity
    velocity.current *= 0.85;

    const newAngles = anglesRef.current.map((currentAngle) => {
      // Calculate target angle based on current scroll velocity
      const targetAngle = Math.max(-18, Math.min(18, currentVel * 0.45));

      // Spring lerp towards target or returning to zero
      let nextAngle = currentAngle + (targetAngle - currentAngle) * 0.25;

      // Decay back to 0
      nextAngle *= 0.9;

      if (Math.abs(nextAngle) > 0.05) {
        activeSway = true;
      } else {
        nextAngle = 0;
      }
      return nextAngle;
    });

    anglesRef.current = newAngles;
    setAngles([...newAngles]);

    if (activeSway || Math.abs(velocity.current) > 0.1) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    } else {
      animFrameId.current = null;
    }
  }, []);

  const triggerSway = useCallback(
    (velAmount: number) => {
      velocity.current = velAmount;
      if (!animFrameId.current) {
        animFrameId.current = requestAnimationFrame(updatePhysics);
      }
    },
    [updatePhysics],
  );

  // Scroll event handler
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const currentPos = scrollRef.current.scrollLeft;
    const diff = currentPos - lastScrollPos.current;
    lastScrollPos.current = currentPos;

    if (Math.abs(diff) > 0.5) {
      triggerSway(-diff * 0.75);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollNav = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    triggerSway(direction === "left" ? 12 : -12);
  };

  return (
    <section className="pt-20 pb-4 bg-gradient-to-b from-slate-50 to-white dark:from-[#0B0B0B] dark:to-[#121212] overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 mb-6">
        {/* Section Header */}
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            {title && (
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll Navigation Buttons */}
            <button
              onClick={() => scrollNav("left")}
              aria-label="Previous"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-black hover:border-indigo-600 dark:hover:border-[#D4AF37] transition-all shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <button
              onClick={() => scrollNav("right")}
              aria-label="Next"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-black hover:border-indigo-600 dark:hover:border-[#D4AF37] transition-all shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* ── METALLIC CLOTHES RAIL SYSTEM ── */}
      <div className="relative w-full px-4 md:px-8">
        {/* Rail Top Metallic Bar Structure */}
        <div className="relative w-full max-w-7xl mx-auto h-4 mb-[-8px] z-10">
          {/* Main Metallic Bar */}
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 dark:from-amber-700/60 dark:via-[#D4AF37] dark:to-amber-700/60 shadow-md border-b border-slate-500/30 dark:border-amber-600/50" />

          {/* Metallic End Caps / Wall Brackets */}
          <div className="absolute -left-2 -top-1 w-5 h-5 rounded-md bg-gradient-to-b from-slate-600 to-slate-800 dark:from-amber-600 dark:to-amber-900 border border-slate-500 dark:border-amber-500 shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-amber-300" />
          </div>
          <div className="absolute -right-2 -top-1 w-5 h-5 rounded-md bg-gradient-to-b from-slate-600 to-slate-800 dark:from-amber-600 dark:to-amber-900 border border-slate-500 dark:border-amber-500 shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-amber-300" />
          </div>
        </div>

        {/* Scrollable Hanger List */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 md:gap-8 overflow-x-auto pt-2 pb-8 px-6 cursor-grab active:cursor-grabbing scrollbar-none"
          style={{
            scrollbarWidth: "none",
            scrollBehavior: "smooth",
          }}
        >
          {products.map((product, idx) => (
            <div key={product._id || idx} className="shrink-0">
              <HangerProductCard product={product} angle={angles[idx] || 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
