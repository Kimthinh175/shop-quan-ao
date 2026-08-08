"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../../../types";

export interface HangerProductCardProps {
  product: Product;
  angle?: number;
}

export default function HangerProductCard({
  product,
  angle = 0,
}: HangerProductCardProps) {
  const [addedToast, setAddedToast] = useState(false);

  const price =
    product.default_price ||
    (product.variants && product.variants.length > 0
      ? product.variants[0].price
      : 0);

  const colors = product.variants
    ? Array.from(
        new Map(product.variants.map((v) => [v.color_hex, v])).values()
      )
    : [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div
      className="relative flex flex-col items-center select-none group"
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: "top center",
        transition: "transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)",
        willChange: "transform",
      }}
    >
      {/* Toast Notification */}
      {addedToast && (
        <div className="absolute top-12 z-50 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl flex items-center justify-center gap-1.5 animate-bounce">
          <i className="fa-solid fa-circle-check text-xs" />
          <span>Đã thêm giỏ!</span>
        </div>
      )}

      {/* Hanger Hook Graphic */}
      <div className="relative z-20 -mb-1 pointer-events-none flex flex-col items-center">
        <svg
          width="44"
          height="54"
          viewBox="0 0 44 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm filter"
        >
          <path
            d="M 22 2 C 14 2, 9 8, 12 15 C 14 20, 22 23, 22 30"
            stroke="url(#metalGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 4 48 Q 22 36 40 48"
            stroke="url(#woodGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="22" cy="36" r="3" fill="#475569" />

          <defs>
            <linearGradient id="metalGradient" x1="0" y1="0" x2="44" y2="54">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="woodGradient" x1="0" y1="0" x2="44" y2="0">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Product Card Body */}
      <div
        className="w-[240px] md:w-[260px] bg-white dark:bg-[#171717] rounded-2xl border border-slate-200/80 dark:border-[#D4AF37]/20 p-3 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col"
        style={{
          boxShadow: `${-angle * 0.8}px ${12 + Math.abs(angle)}px ${
            20 + Math.abs(angle) * 2
          }px rgba(0, 0, 0, 0.12)`,
        }}
      >
        {/* Image Frame */}
        <div className="relative overflow-hidden aspect-[3/4] bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-3">
          {product.main_img ? (
            <Image
              src={product.main_img}
              alt={product.name}
              fill
              sizes="300px"
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 font-semibold text-xs">
              CLOSET.
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-all duration-300" />

          {/* Quick Action Buttons (Chi tiết & Thêm giỏ) */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 z-20">
            <Link
              href={`/product/${product._id}`}
              className="flex-1 py-2 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider text-center rounded-xl shadow-lg hover:bg-indigo-600 dark:hover:bg-[#D4AF37] dark:hover:text-slate-950 transition-all flex items-center justify-center gap-1"
            >
              <i className="fa-solid fa-eye text-[10px]" />
              <span>Chi tiết</span>
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-2 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-wider text-center rounded-xl shadow-lg hover:bg-indigo-700 dark:hover:bg-[#EBC563] transition-all flex items-center justify-center gap-1"
              title="Thêm vào giỏ hàng"
            >
              <i className="fa-solid fa-bag-shopping text-[10px]" />
              <span>+ Thêm giỏ</span>
            </button>
          </div>
        </div>

        {/* Color Swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            {colors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-inner"
                style={{ backgroundColor: c.color_hex }}
                title={c.color}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                +{colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Product Details */}
        <div className="flex justify-between items-start px-1 mt-auto">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors line-clamp-1">
              <Link href={`/product/${product._id}`}>{product.name}</Link>
            </h3>
            {product.category && product.category.length > 0 && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                {product.category[0].name}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-extrabold text-indigo-600 dark:text-[#EBC563]">
              {price.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
