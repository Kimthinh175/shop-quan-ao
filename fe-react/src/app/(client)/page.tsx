"use client";

import Link from "next/link";
import VideoScrubberBanner from "../../components/client/VideoScrubberBanner";
import ClothingRailSlider from "../../components/client/ClothingRailSlider";
import PromotionProducts from "../../components/client/PromotionProducts";
import GiftPromotions from "../../components/client/GiftPromotions";
import { Product } from "../../types";

const MEN_PRODUCTS: Product[] = [
  {
    _id: "m1",
    name: "Classic Midnight Suit",
    description: "Bộ suit đen cổ điển được cắt may thủ công.",
    default_price: 7500000,
    main_img:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "c1", name: "Đồ Âu Cao Cấp", slug: "do-au" }],
    variants: [
      {
        color: "Navy Blue",
        color_hex: "#1e1b4b",
        size: "M",
        price: 7500000,
        quantity: 12,
      },
      {
        color: "Charcoal",
        color_hex: "#334155",
        size: "L",
        price: 7500000,
        quantity: 8,
      },
      {
        color: "Black",
        color_hex: "#0f172a",
        size: "XL",
        price: 7500000,
        quantity: 15,
      },
    ],
  },
  {
    _id: "m2",
    name: "Heritage Oxford Shirt",
    description: "Sơ mi chất liệu Oxford thoáng khí.",
    default_price: 1850000,
    main_img:
      "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "c2", name: "Áo Sơ Mi", slug: "ao-so-mi" }],
    variants: [
      {
        color: "Pure White",
        color_hex: "#ffffff",
        size: "S",
        price: 1850000,
        quantity: 20,
      },
      {
        color: "Sky Blue",
        color_hex: "#bae6fd",
        size: "M",
        price: 1850000,
        quantity: 18,
      },
    ],
  },
  {
    _id: "m3",
    name: "Minimalist Wool Blazer",
    description: "Áo Blazer dạ len phong cách Quiet Luxury.",
    default_price: 4900000,
    main_img:
      "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "c1", name: "Đồ Âu Cao Cấp", slug: "do-au" }],
    variants: [
      {
        color: "Camel Brown",
        color_hex: "#b45309",
        size: "M",
        price: 4900000,
        quantity: 5,
      },
      {
        color: "Sand Beige",
        color_hex: "#d97706",
        size: "L",
        price: 4900000,
        quantity: 10,
      },
    ],
  },
  {
    _id: "m4",
    name: "Tailored Chino Trousers",
    description: "Quần Chino dáng suông thanh lịch.",
    default_price: 1450000,
    main_img:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "c3", name: "Quần Nam", slug: "quan-nam" }],
    variants: [
      {
        color: "Dark Olive",
        color_hex: "#365314",
        size: "30",
        price: 1450000,
        quantity: 14,
      },
    ],
  },
  {
    _id: "m5",
    name: "Silk Polo Shirt",
    description: "Áo polo dệt kim dệt từ sợi tơ tằm mềm mại.",
    default_price: 2100000,
    main_img:
      "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "c4", name: "Áo Thun & Polo", slug: "polo" }],
    variants: [
      {
        color: "Off White",
        color_hex: "#f8fafc",
        size: "L",
        price: 2100000,
        quantity: 22,
      },
    ],
  },
];

const WOMEN_PRODUCTS: Product[] = [
  {
    _id: "w1",
    name: "Silk Wrap Midi Dress",
    description: "Váy lụa dáng dài mềm mại thướt tha.",
    default_price: 3800000,
    main_img:
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "cw1", name: "Đầm & Váy", slug: "dam-vay" }],
    variants: [
      {
        color: "Rose Gold",
        color_hex: "#fda4af",
        size: "S",
        price: 3800000,
        quantity: 10,
      },
      {
        color: "Emerald Green",
        color_hex: "#065f46",
        size: "M",
        price: 3800000,
        quantity: 7,
      },
    ],
  },
  {
    _id: "w2",
    name: "Cashmere Knit Cardigan",
    description: "Áo khoác len Cashmere mềm mại cao cấp.",
    default_price: 2950000,
    main_img:
      "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "cw2", name: "Knitwear Nữ", slug: "knitwear-nu" }],
    variants: [
      {
        color: "Ivory White",
        color_hex: "#fffbeb",
        size: "M",
        price: 2950000,
        quantity: 16,
      },
    ],
  },
  {
    _id: "w3",
    name: "Pleated Linen Trousers",
    description: "Quần ống rộng vải linen thoáng mát.",
    default_price: 1950000,
    main_img:
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "cw3", name: "Quần Nữ", slug: "quan-nu" }],
    variants: [
      {
        color: "Soft Sand",
        color_hex: "#fde68a",
        size: "S",
        price: 1950000,
        quantity: 11,
      },
    ],
  },
  {
    _id: "w4",
    name: "Structured Double Blazer",
    description: "Blazer 2 hàng khuy phong cách hiện đại.",
    default_price: 4500000,
    main_img:
      "https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: [{ _id: "cw4", name: "Áo Khoác Nữ", slug: "ao-khoac-nu" }],
    variants: [
      {
        color: "Deep Black",
        color_hex: "#09090b",
        size: "M",
        price: 4500000,
        quantity: 9,
      },
    ],
  },
];

export default function Page() {
  return (
    <>
      {/* Scroll-driven Video Banner */}
      <VideoScrubberBanner />

      {/* ── STYLISH GLASSMORPHISM CATEGORY BAR ── */}
      <div className="sticky top-[64px] md:top-[72px] z-30 bg-white/90 dark:bg-[#171717]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#D4AF37]/20 py-3 shadow-sm transition-all duration-300 overflow-x-auto scrollbar-none">
        <div className="container mx-auto px-4 min-w-max">
          <div className="flex justify-center items-center gap-3 md:gap-4 text-xs font-bold uppercase tracking-wider">
            {[
              {
                id: "promotion",
                label: "Ưu Đãi Hot",
                icon: "fa-solid fa-fire text-amber-500",
              },
              {
                id: "quatang",
                label: "Quà Tặng VIP",
                icon: "fa-solid fa-gift text-indigo-500",
              },
              {
                id: "nam",
                label: "Thời Trang Nam",
                icon: "fa-solid fa-user-tie",
              },
              {
                id: "nu",
                label: "Thời Trang Nữ",
                icon: "fa-solid fa-person-dress",
              },
              { id: "phukien", label: "Phụ Kiện", icon: "fa-solid fa-glasses" },
            ].map(({ id, label, icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-100/80 dark:bg-[#232223] text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-black hover:border-indigo-600 dark:hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
              >
                <i
                  className={`${icon} group-hover:text-white dark:group-hover:text-black transition-colors text-sm`}
                />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROMOTION PRODUCTS SECTION WITH COUNTDOWN TIMER ── */}
      <div id="promotion">
        <PromotionProducts />
      </div>

      {/* ── GIFT WITH PURCHASE ITEM PROMOTIONS SECTION ── */}
      <div id="quatang">
        <GiftPromotions />
      </div>

      {/* ── INTERACTIVE CLOTHES RAIL SLIDER: THỜI TRANG NAM ── */}
      <div id="nam">
        <ClothingRailSlider
          title="Thời Trang Nam"
          subtitle="Trang phục hàng ngày thiết yếu dành cho nam giới. Rà chuột hoặc lướt qua để xem từng chiếc móc đung đưa."
          products={MEN_PRODUCTS}
          viewAllLink="/shop"
        />
      </div>

      {/* ── INTERACTIVE CLOTHES RAIL SLIDER: THỜI TRANG NỮ ── */}
      <div id="nu">
        <ClothingRailSlider
          title="Thời Trang Nữ"
          subtitle="Tôn vinh vẻ đẹp tối giản và thanh lịch trong từng đường kim mũi chỉ."
          products={WOMEN_PRODUCTS}
          viewAllLink="/shop"
        />
      </div>

      {/* BLOG HIGHLIGHTS */}
      <section className="pt-22 pb-10 bg-white dark:bg-[#0B0B0B] border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-[#EBC563] mb-1">
                Tạp chí thời trang
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                BÀI VIẾT MỚI NHẤT
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-[#D4AF37] hover:text-indigo-800 dark:hover:text-[#EBC563] transition-colors"
            >
              Xem tất cả bài viết →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="group cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4 bg-slate-100 dark:bg-slate-800/80">
                <img
                  src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Blog 1"
                />
              </div>
              <p className="text-[10px] font-extrabold text-indigo-600 dark:text-[#EBC563] uppercase tracking-widest mb-1">
                Xu hướng 2026
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-[#EBC563] transition-colors leading-snug mb-2">
                Quiet Luxury: Xu hướng thời trang tối giản thanh lịch lên ngôi
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                Khám phá phong cách Quiet Luxury với các gam màu trung tính và
                chất liệu cao cấp từ BST mới nhất.
              </p>
            </article>

            <article className="group cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4 bg-slate-100 dark:bg-slate-800/80">
                <img
                  src="https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Blog 2"
                />
              </div>
              <p className="text-[10px] font-extrabold text-indigo-600 dark:text-[#EBC563] uppercase tracking-widest mb-1">
                Bảo quản đồ
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-[#EBC563] transition-colors leading-snug mb-2">
                Bí quyết giặt & bảo quản áo Sơ mi Oxford luôn phom dáng
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                Những mẹo nhỏ giúp giữ cho chiếc áo sơ mi chất liệu Oxford luôn
                bền màu và chuẩn phom qua nhiều năm.
              </p>
            </article>

            <article className="group cursor-pointer">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4 bg-slate-100 dark:bg-slate-800/80">
                <img
                  src="https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=800"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Blog 3"
                />
              </div>
              <p className="text-[10px] font-extrabold text-indigo-600 dark:text-[#EBC563] uppercase tracking-widest mb-1">
                Mix & Match
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-[#EBC563] transition-colors leading-snug mb-2">
                Gợi ý 5 cách phối đồ nam phong cách Smart Casual công sở
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                Nâng tầm phong cách công sở hàng ngày với những sự kết hợp hiện
                đại giữa Blazer, Chinos và Sneakers.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
