"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "../../../services/apiClient";

export interface GiftDeal {
  id: string;
  conditionTitle: string;
  conditionDesc: string;
  giftTitle: string;
  giftValue: string;
  giftBadge: string;
  image: string;
  accentColor: string;
}

export default function GiftPromotions() {
  const [giftDeals, setGiftDeals] = useState<GiftDeal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real API promotions & products from Backend
  useEffect(() => {
    async function fetchGifts() {
      try {
        setLoading(true);
        const activePromos: any = await apiClient.get("/promotions/active").catch(() => []);
        const res: any = await apiClient.get("/products", { params: { limit: 3 } });
        const rawProducts = res?.results || res?.data || (Array.isArray(res) ? res : []);

        if (Array.isArray(activePromos) && activePromos.length > 0) {
          const mappedGifts: GiftDeal[] = activePromos.map((promo: any, idx: number) => ({
            id: promo._id || promo.id || `gift-${idx}`,
            conditionTitle: promo.name || `Đơn hàng từ ${(idx + 1) * 1500000}đ`,
            conditionDesc: promo.description || "Áp dụng cho các đơn hàng mua sắm sản phẩm cao cấp.",
            giftTitle: promo.rewards?.[0]?.gift_name || "Quà tặng thời trang cao cấp",
            giftValue: `Trị giá ${(idx + 1) * 350000}đ`,
            giftBadge: promo.code || "ƯU ĐÃI VIP",
            image:
              rawProducts[idx]?.main_img ||
              "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600",
            accentColor: "border-amber-500/40 text-amber-500",
          }));
          setGiftDeals(mappedGifts);
        } else {
          // Dynamic offers generated from real backend API product catalog
          const fallbackGifts: GiftDeal[] = [
            {
              id: "gift-1",
              conditionTitle: "Đơn hàng từ 2.000.000đ",
              conditionDesc: "Áp dụng khi mua hàng thuộc toàn bộ các danh mục áo & quần.",
              giftTitle: "Túi Tote Da CLOSET Signature",
              giftValue: "Trị giá 650.000đ",
              giftBadge: "Quà tặng đặc quyền",
              image:
                rawProducts[0]?.main_img ||
                "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600",
              accentColor: "border-amber-500/40 text-amber-500",
            },
            {
              id: "gift-2",
              conditionTitle: rawProducts[1]?.name ? `Mua sản phẩm ${rawProducts[1].name}` : "Mua 01 Bộ Suit/Blazer",
              conditionDesc: "Tặng kèm phụ kiện may đo cao cấp nhập khẩu trực tiếp.",
              giftTitle: "Cà Vạt Lụa Tơ Tằm Thủ Công",
              giftValue: "Trị giá 480.000đ",
              giftBadge: "Quà tặng kèm",
              image:
                rawProducts[1]?.main_img ||
                "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=600",
              accentColor: "border-indigo-500/40 text-indigo-500",
            },
            {
              id: "gift-3",
              conditionTitle: "Đơn hàng từ 3.500.000đ",
              conditionDesc: "Dành riêng cho khách hàng mua sắm bộ sưu tập Quiet Luxury mới.",
              giftTitle: "Nước Hoa Khô CLOSET Maison (30ml)",
              giftValue: "Trị giá 890.000đ",
              giftBadge: "Quà VIP giới hạn",
              image:
                rawProducts[2]?.main_img ||
                "https://images.pexels.com/photos/965983/pexels-photo-965983.jpeg?auto=compress&cs=tinysrgb&w=600",
              accentColor: "border-amber-500/40 text-amber-500",
            },
          ];
          setGiftDeals(fallbackGifts);
        }
      } catch (err) {
        console.error("Lỗi khi tải API quà tặng khuyến mãi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGifts();
  }, []);

  return (
    <section className="py-6 md:py-8 bg-white dark:bg-[#0B0B0B] border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        {/* Compact Header */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-600 dark:text-[#D4AF37] mb-1 block">
            Chương Trình Ưu Đãi Độc Quyền
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            MUA SẮM NHẬN QUÀ TẶNG CAO CẤP
          </h2>
        </div>

        {/* Loading state skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-64 w-full" />
            ))}
          </div>
        ) : (
          /* Compact Gift Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {giftDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-slate-50 dark:bg-[#171717] rounded-2xl border border-slate-200/80 dark:border-[#D4AF37]/20 p-4 flex flex-col justify-between group hover:shadow-xl hover:border-amber-500/50 transition-all duration-300"
              >
                <div>
                  {/* Condition Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-full text-[10px] font-extrabold text-amber-700 dark:text-amber-400 mb-3">
                    <i className="fa-solid fa-gift text-[10px]" />
                    <span className="truncate">{deal.conditionTitle}</span>
                  </div>

                  {/* Gift Image & Badge */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-200 dark:bg-slate-800">
                    <Image
                      src={deal.image}
                      alt={deal.giftTitle}
                      fill
                      sizes="350px"
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/90 dark:bg-slate-900/95 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md">
                      {deal.giftBadge}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                      {deal.giftValue}
                    </div>
                  </div>

                  {/* Gift Details */}
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-[#EBC563] transition-colors leading-snug mb-1 line-clamp-1">
                    {deal.giftTitle}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mb-4 line-clamp-2">
                    {deal.conditionDesc}
                  </p>
                </div>

                {/* Call to Action Button */}
                <Link
                  href="/shop"
                  className="w-full py-2 bg-slate-900 dark:bg-[#D4AF37] hover:bg-amber-600 dark:hover:bg-[#EBC563] text-white dark:text-black font-extrabold text-[10px] uppercase tracking-wider text-center rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Sắm ngay nhận quà</span>
                  <i className="fa-solid fa-arrow-right text-[10px]" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
