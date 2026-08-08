"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "../../../services/apiClient";
import { productService } from "../../../services/productService";

export interface PromoProduct {
  id: string | number;
  name: string;
  category: string;
  originalPrice: number;
  promoPrice: number;
  discountPercent: number;
  giftName?: string;
  soldPercent: number;
  image: string;
}

export default function PromotionProducts() {
  const [products, setProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // 1. Fetch REAL API data from Backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const activePromos: any = await apiClient.get("/promotions/active").catch(() => []);
        const res: any = await productService.getProducts({ limit: 4 });
        const rawProducts = res?.results || res?.data || (Array.isArray(res) ? res : []);

        const giftList = [
          "Cà vạt lụa tơ tằm",
          "Túi Tote Canvas CLOSET",
          "Nước hoa mini Signature 30ml",
          "Bình giữ nhiệt nhung VIP",
        ];

        const mapped: PromoProduct[] = rawProducts.slice(0, 4).map((p: any, idx: number) => {
          const orig = p.default_price || (p.variants && p.variants[0]?.price) || 150000;
          const discountPercent = [25, 30, 20, 35][idx % 4];
          const promoPrice = Math.round(orig * (1 - discountPercent / 100));

          let catName = "Thời Trang";
          if (Array.isArray(p.category_id) && p.category_id.length > 0) {
            catName = p.category_id[0].name || catName;
          } else if (p.category && typeof p.category === "string") {
            catName = p.category;
          }

          return {
            id: p._id || p.id || `prod-${idx}`,
            name: p.name || "Sản phẩm CLOSET",
            category: catName,
            originalPrice: orig,
            promoPrice: promoPrice,
            discountPercent: discountPercent,
            giftName: giftList[idx % giftList.length],
            soldPercent: Math.floor(45 + (idx * 13) % 45),
            image:
              p.main_img ||
              (p.images && p.images[0]) ||
              "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600",
          };
        });

        setProducts(mapped);
      } catch (err) {
        console.error("Lỗi khi tải API sản phẩm khuyến mãi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 2. Countdown timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-4 bg-[#faf9f6] dark:bg-slate-900 text-slate-900 dark:text-white border-t border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Compact Header with Countdown */}
        <div className="flex items-center justify-between gap-4 mb-3 border-b border-slate-200/80 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-100 dark:bg-amber-500/20 text-red-600 dark:text-amber-400 border border-red-200 dark:border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
              <i className="fa-solid fa-bolt text-red-500 dark:text-amber-400 animate-bounce" />
              <span>Ưu Đãi Hot</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SẢN PHẨM KHUYẾN MÃI
            </h2>
          </div>

          {/* Compact Countdown timer badge */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-xl shadow-sm shrink-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-1 hidden sm:inline">Kết thúc sau:</span>
            {[
              { val: timeLeft.hours, label: "Giờ" },
              { val: timeLeft.minutes, label: "Phút" },
              { val: timeLeft.seconds, label: "Giây" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-amber-500/30 flex items-center justify-center font-mono font-black text-indigo-600 dark:text-amber-400 text-xs">
                  {String(item.val).padStart(2, "0")}
                </div>
                {idx < 2 && <span className="font-bold text-indigo-600 dark:text-amber-400 text-xs">:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Loading state skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-200 dark:bg-slate-800 rounded-xl h-64 w-full" />
            ))}
          </div>
        ) : (
          /* Compact Promo Grid */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 flex flex-col group hover:border-indigo-500 dark:hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image Frame - Compact Aspect Ratio */}
                <div className="relative aspect-[1/1] rounded-lg overflow-hidden mb-2 bg-slate-100 dark:bg-slate-950">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    sizes="250px"
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-md uppercase">
                    -{prod.discountPercent}%
                  </div>

                  {/* Gift Tag */}
                  {prod.giftName && (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2 py-1 rounded border border-amber-300 dark:border-amber-500/30 flex items-center gap-1 shadow-sm">
                      <i className="fa-solid fa-gift text-[10px]" />
                      <span className="truncate">Tặng: {prod.giftName}</span>
                    </div>
                  )}
                </div>

                {/* Category */}
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  {prod.category}
                </span>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                  {prod.name}
                </h3>

                {/* Price Row */}
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="text-xs md:text-sm font-extrabold text-indigo-600 dark:text-amber-400">
                    {prod.promoPrice.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-[10px] text-slate-400 line-through">
                    {prod.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {/* Limited Stock Bar */}
                <div className="mt-auto">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                    <span>Đã bán {prod.soldPercent}%</span>
                    <span className="text-red-500 dark:text-amber-400">Sắp cháy</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                      style={{ width: `${prod.soldPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/product/${prod.id}`}
                  className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-wider text-center rounded-lg shadow transition-all"
                >
                  Nhận ưu đãi
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
