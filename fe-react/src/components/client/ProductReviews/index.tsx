"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../../../services/apiClient";

export interface ReviewItem {
  id: string | number;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  variantInfo?: string;
  content: string;
  images?: string[];
  isVerified?: boolean;
  likesCount?: number;
}

export default function ProductReviews({ productId }: { productId: string | number }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStarFilter, setActiveStarFilter] = useState<number | null>(null);



  // Fetch real reviews from Backend API `/api/reviews/product/:productId`
  useEffect(() => {
    async function fetchReviews() {
      if (!productId) return;
      try {
        setLoading(true);
        const endpoint = `/reviews/product/${productId}`;
        const queryParams = activeStarFilter ? { rating: activeStarFilter } : undefined;
        const res: any = await apiClient.get(endpoint, { params: queryParams }).catch(() => null);

        const rawResults = res?.results || (Array.isArray(res) ? res : []);

        const mapped: ReviewItem[] = rawResults.map((item: any, idx: number) => ({
          id: item._id || item.id || `rev-${idx}`,
          userName: item.user_id?.name || item.user_id?.username || "Khách hàng CLOSET",
          userAvatar: item.user_id?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.user_id?.name || "User"}`,
          rating: item.rating || 5,
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "",
          variantInfo: "",
          content: item.content || "",
          images: item.images || [],
          isVerified: true, // If it's a real review, they must have bought it
          likesCount: 0,
        }));
        setReviews(mapped);
      } catch (err) {
        console.error("Lỗi khi nạp đánh giá sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productId, activeStarFilter]);

  // Calculate rating stats
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1) : "4.9";

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-[#EBC563] mb-1">
              Phản hồi thực tế
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ĐÁNH GIÁ TỪ KHÁCH HÀNG
            </h2>
          </div>
        </div>

        {/* Rating Summary Box */}
        <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-[#D4AF37]/20 p-6 md:p-8 mb-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
          {/* Left Average Score */}
          <div className="text-center md:border-r md:border-slate-200 dark:md:border-slate-800 md:pr-10 shrink-0">
            <span className="text-5xl font-black text-slate-900 dark:text-amber-400 block mb-1">
              {avgRating}
            </span>
            <div className="flex items-center justify-center gap-1 text-amber-400 text-sm mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="fa-solid fa-star" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {totalCount} Đánh giá đã xác thực
            </span>
          </div>

          {/* Star Filter Pills */}
          <div className="flex-1 w-full">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">
              Lọc đánh giá theo số sao:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveStarFilter(null)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  activeStarFilter === null
                    ? "bg-indigo-600 text-white border-indigo-600 dark:bg-[#D4AF37] dark:text-black dark:border-[#D4AF37]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                }`}
              >
                Tất cả ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setActiveStarFilter(star)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                    activeStarFilter === star
                      ? "bg-indigo-600 text-white border-indigo-600 dark:bg-[#D4AF37] dark:text-black dark:border-[#D4AF37]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{star}</span>
                  <i className="fa-solid fa-star text-amber-400 text-[10px]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <i className="fa-solid fa-comments text-4xl text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Chưa có đánh giá nào cho mức sao này.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:border-indigo-200 dark:hover:border-slate-700 transition-all"
              >
                {/* Reviewer Info Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {rev.userName}
                        </span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                            <i className="fa-solid fa-circle-check text-[10px]" />
                            <span>Đã mua hàng</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {rev.date} {rev.variantInfo && `• ${rev.variantInfo}`}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i
                        key={s}
                        className={`fa-solid fa-star ${s <= rev.rating ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  {rev.content}
                </p>

                {/* Optional Review Images */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex items-center gap-3 mb-4 overflow-x-auto">
                    {rev.images.map((imgSrc, i) => (
                      <img
                        key={i}
                        src={imgSrc}
                        alt="Review Image"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Like / Helpful footer */}
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <button className="hover:text-indigo-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <i className="fa-solid fa-thumbs-up text-xs" />
                    <span>Hữu ích ({rev.likesCount || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


      </div>
    </section>
  );
}
