"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../../../types";
import { useCart } from "../../../context/CartContext";

export interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [addedToast, setAddedToast] = useState(false);

  const price =
    product.default_price ||
    (product.variants && product.variants.length > 0
      ? product.variants[0].price
      : 0);

  const colors = product.variants
    ? Array.from(new Map(product.variants.map((v) => [v.color_hex, v])).values())
    : [];

  const cart = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    cart.addToCart({
      product_variant_id: (product.variants?.[0] as any)?._id || null,
      product_id: product._id,
      name: product.name,
      price: price,
      quantity: 1,
      image: product.main_img || '',
      size: product.variants?.[0]?.size,
      color: product.variants?.[0]?.color,
    });
    
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="product-card group flex flex-col relative">
      {/* Toast Notification */}
      {addedToast && (
        <div className="absolute top-2 left-2 right-2 z-30 bg-emerald-600 text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl flex items-center justify-center gap-1.5 animate-bounce">
          <i className="fa-solid fa-circle-check text-xs" />
          <span>Đã thêm vào giỏ!</span>
        </div>
      )}

      {/* Image Frame */}
      <div className="relative overflow-hidden aspect-[3/4] bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-3 border border-slate-200/50 dark:border-slate-800 shadow-sm">
        {product.main_img ? (
          <Image
            src={product.main_img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            unoptimized
            className="card-img object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-xs">
            CLOSET.
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-all duration-500" />

        {/* Hover Action Buttons (Chi tiết & Thêm giỏ hàng) */}
        <div className="card-overlay absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 z-20">
          <Link
            href={`/product/${product._id}`}
            className="flex-1 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-wider text-center rounded-xl shadow-lg hover:bg-slate-950 hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-slate-950 transition-all flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-eye text-[10px]" />
            <span>Chi tiết</span>
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-wider text-center rounded-xl shadow-lg hover:bg-indigo-700 dark:hover:bg-[#EBC563] transition-all flex items-center justify-center gap-1.5"
            title="Thêm vào giỏ hàng"
          >
            <i className="fa-solid fa-bag-shopping text-[10px]" />
            <span>+ Thêm giỏ</span>
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5 px-1">
          {colors.slice(0, 4).map((c, idx) => (
            <span
              key={idx}
              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-inner"
              style={{ backgroundColor: c.color_hex }}
              title={c.color}
            />
          ))}
          {colors.length > 4 && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold ml-0.5">
              +{colors.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Details */}
      <div className="flex justify-between items-start px-1 mt-auto">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-1 leading-tight hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors line-clamp-2">
            <Link href={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          {product.category && product.category.length > 0 && (
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              {product.category[0].name}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] font-black text-indigo-600 dark:text-[#EBC563]">
            {price.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>
    </div>
  );
}
