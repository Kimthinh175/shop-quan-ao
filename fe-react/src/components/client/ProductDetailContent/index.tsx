"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Breadcrumb";
import Accordion from "../Accordion";
import ProductVariantSelector from "../ProductVariantSelector";
import TrustPolicies from "../TrustPolicies";
import ProductGallery from "../ProductGallery";
import ProductReviews from "../ProductReviews";
import { productService } from "../../../services/productService";
import { Product } from "../../../types";
import { useCart } from "../../../context/CartContext";

export default function ProductDetailContent({
  productId,
}: {
  productId?: string | number;
}) {
  const router = useRouter();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  // States for user selection
  const [selectedColor, setSelectedColor] = useState<{ id: string; name: string; colorCode: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Load Product API
  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await productService.getProductById(productId);
        if (data) {
          setProduct(data);
        }
      } catch (err) {
        console.warn(
          "Could not fetch product from API, using fallback data:",
          err,
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const getColorHex = (colorName?: string, hex?: string): string => {
    if (hex && hex.startsWith("#")) return hex;
    const name = (colorName || "").toLowerCase();
    if (name.includes("đen") || name.includes("black")) return "#121212";
    if (name.includes("trắng") || name.includes("white")) return "#ffffff";
    if (name.includes("navy") || name.includes("xanh đen") || name.includes("xanh navy")) return "#1b2a47";
    if (name.includes("xanh") || name.includes("blue")) return "#2563eb";
    if (name.includes("xám") || name.includes("grey") || name.includes("gray")) return "#475569";
    if (name.includes("đỏ") || name.includes("red")) return "#dc2626";
    if (name.includes("nâu") || name.includes("brown")) return "#78350f";
    if (name.includes("kem") || name.includes("cream") || name.includes("beige")) return "#fef3c7";
    return "#1e1b4b";
  };

  // Colors & Sizes from real API variants
  const colorList =
    product?.variants && product.variants.length > 0
      ? Array.from(
          new Map(
            product.variants.map((v) => {
              const cName = v.color || "Xanh Navy";
              const cHex = getColorHex(cName, v.color_hex);
              return [cName, { id: cName, name: cName, colorCode: cHex }];
            })
          ).values()
        )
      : [
          { id: "Xanh Navy", name: "Xanh Navy", colorCode: "#1b2a47" },
          { id: "Đen Tuyền", name: "Đen Tuyền", colorCode: "#121212" },
          { id: "Xám Than", name: "Xám Than", colorCode: "#334155" },
        ];

  const sizeList =
    product?.variants && product.variants.length > 0
      ? Array.from(
          new Set(product.variants.map((v) => v.size || "M").filter(Boolean))
        )
      : ["S", "M", "L", "XL", "XXL"];

  // Sync default selection when product or variants change
  useEffect(() => {
    if (colorList.length > 0 && !selectedColor) setSelectedColor(colorList[0]);
    if (sizeList.length > 0 && !selectedSize) setSelectedSize(sizeList[0]);
  }, [product, colorList, sizeList, selectedColor, selectedSize]);

  const handleAddToCart = () => {
    cart.addToCart({
      product_variant_id: (currentVariant as any)?._id || null,
      product_id: productId,
      name,
      price,
      quantity: 1,
      size: activeSize,
      color: activeColor?.name,
      image: rawImages?.[0] || '',
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleAddCrossSell = (item: any) => {
    cart.addToCart({
      product_variant_id: null,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.img,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    cart.addToCart({
      product_variant_id: (currentVariant as any)?._id || null,
      product_id: productId,
      name,
      price,
      quantity: 1,
      size: activeSize,
      color: activeColor?.name,
      image: rawImages?.[0] || '',
    });
    setAddedToast(true);
    setTimeout(() => {
      router.push('/checkout');
    }, 400);
  };

  if (loading) {
    return (
      <main className="pt-24 pb-20 min-h-screen bg-[#faf9f6] dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
            Đang tải sản phẩm...
          </span>
        </div>
      </main>
    );
  }

  // Display details of API product or default fallback
  const name = product?.name || "Bộ Suit Nam Midnight Quiet Luxury";
  const discountPercent = 23;
  const categoryName =
    product?.category && product.category.length > 0
      ? product.category[0].name
      : "Thời Trang Xa Xỉ";
  const description =
    product?.description ||
    "Dòng trang phục Quiet Luxury cao cấp được cắt may theo tỉ lệ chuẩn. Tích hợp sợi tự nhiên cao cấp thấm hút thông minh, bề mặt vải bóng nhẹ quý phái tôn vinh vóc dáng người mặc.";

  // Images
  const rawImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.main_img
        ? [product.main_img]
        : [
            "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800",
          ];

  const galleryImages = rawImages.map((src, i) => ({
    src,
    alt: `${name} góc ${i + 1}`,
  }));

  // Active color & size resolved
  const activeColor = selectedColor || colorList[0];
  const activeSize = selectedSize || sizeList[0];

  // Match currently selected variant
  const currentVariant = product?.variants?.find(
    (v) =>
      (v.color === activeColor?.name || getColorHex(v.color, v.color_hex) === activeColor?.colorCode) &&
      v.size === activeSize
  ) || product?.variants?.[0];

  const price = currentVariant?.price || product?.default_price || (product?.variants && product.variants[0]?.price) || 4500000;
  const originalPrice = Math.round(price * 1.3);
  const variantStock = currentVariant?.quantity ?? (currentVariant as any)?.stock ?? (product as any)?.stock ?? 15;

  return (
    <main className="pt-8 pb-20 bg-[#faf9f6] dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      {/* Added Toast */}
      {addedToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-base" />
          <span>Đã thêm sản phẩm vào giỏ hàng!</span>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Gallery & Complete The Look Recommendations */}
          <div className="lg:col-span-7 space-y-10">
            <ProductGallery badge="BÁN CHẠY" images={galleryImages} />

            {/* ── GỢI Ý PHỐI ĐỒ HOÀN HẢO (COMPLETE THE LOOK) ── */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-[#EBC563] text-[9px] font-black uppercase tracking-widest rounded-lg">
                      Outfit Suggestion
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <i className="fa-solid fa-gift text-xs" />
                      Giảm 10% khi mua cùng
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Gợi ý phối đồ hoàn hảo
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Kết hợp các sản phẩm dưới đây để tạo nên trang phục Quiet Luxury đẳng cấp.
                  </p>
                </div>

                <Link
                  href="/shop"
                  className="text-xs font-black text-indigo-600 dark:text-[#EBC563] hover:underline whitespace-nowrap self-start sm:self-auto"
                >
                  Xem tất cả bộ sưu tập →
                </Link>
              </div>

              {/* Cross-Sell Recommended Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 4,
                    name: "Quần Âu Slim Fit Chinos",
                    price: 1290000,
                    originalPrice: 1590000,
                    category: "Quần Âu",
                    img: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600",
                  },
                  {
                    id: 3,
                    name: "Giày Da Premium Leather",
                    price: 3980000,
                    originalPrice: 4800000,
                    category: "Giày Da",
                    img: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600",
                  },
                  {
                    id: 6,
                    name: "Khăn Lụa Cài Túi Pocket Square",
                    price: 650000,
                    originalPrice: 850000,
                    category: "Phụ kiện",
                    img: "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=600",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 group hover:border-indigo-500 dark:hover:border-[#D4AF37] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2.5 bg-slate-200 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-slate-950/80 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug line-clamp-1 mb-1 group-hover:text-indigo-600 dark:group-hover:text-[#EBC563] transition-colors">
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-black text-indigo-600 dark:text-[#EBC563] text-xs">
                          {item.price.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {item.originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <button
                        onClick={() => handleAddCrossSell(item)}
                        className="flex-1 py-2 bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      >
                        <i className="fa-solid fa-plus text-[9px]" />
                        <span>Thêm giỏ</span>
                      </button>
                      <Link
                        href={`/product/${item.id}`}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-[#EBC563] flex items-center justify-center border border-slate-200 dark:border-slate-700 text-xs transition-all"
                        title="Xem chi tiết"
                      >
                        <i className="fa-solid fa-eye" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Product Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-5">
              <header>
                <Breadcrumb
                  items={[
                    { label: "Trang chủ", href: "/" },
                    { label: "Sản phẩm", href: "/shop" },
                    {
                      label: categoryName,
                      href: `/shop?category=${categoryName}`,
                    },
                    { label: name },
                  ]}
                />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight text-slate-900 dark:text-white">
                  {name}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-black text-indigo-600 dark:text-[#EBC563]">
                    {price.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-base font-medium text-slate-400 line-through">
                    {originalPrice.toLocaleString("vi-VN")}đ
                  </p>
                  <span className="bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-black uppercase px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50">
                    -{discountPercent}%
                  </span>
                </div>
              </header>

              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Variant Selectors */}
              <ProductVariantSelector
                colors={colorList}
                sizes={sizeList}
                selectedColorId={activeColor?.id}
                selectedSize={activeSize}
                onColorChange={(col) => setSelectedColor(col)}
                onSizeChange={(sz) => setSelectedSize(sz)}
                stockQty={variantStock}
              />

              {/* Action Buttons: MUA NGAY & THÊM VÀO GIỎ HÀNG */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mua Ngay Button */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 dark:bg-[#D4AF37] dark:hover:bg-[#EBC563] text-white dark:text-slate-950 text-xs font-black uppercase tracking-[0.2em] hover:shadow-xl transition-all duration-300 rounded-2xl active:scale-98 shadow-md flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-bolt text-sm" />
                    <span>MUA NGAY</span>
                  </button>

                  {/* Thêm vào giỏ hàng Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-slate-950 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-slate-700 text-white dark:text-slate-100 text-xs font-black uppercase tracking-[0.15em] hover:shadow-xl transition-all duration-300 rounded-2xl active:scale-98 shadow-md flex items-center justify-center gap-2 border border-slate-900 dark:border-slate-700"
                  >
                    <i className="fa-solid fa-bag-shopping text-sm" />
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                </div>

                <TrustPolicies />
              </div>

              {/* Product Accordion Info */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <Accordion title="Chi tiết chất liệu & Phom dáng">
                  Chất liệu: 100% Super 150s Merino Wool nhập khẩu từ Ý. Phom dáng Tailored Fit ôm vừa vặn độ mở vai, tôn dáng thanh lịch tự nhiên.
                </Accordion>
                <Accordion title="Hướng dẫn bảo quản & Giặt ủi">
                  Chỉ giặt khô chuyên nghiệp. Sử dụng móc treo gỗ có đệm vai. Tránh phơi trực tiếp dưới ánh nắng gay gắt.
                </Accordion>
                <Accordion title="Chính sách giao hàng & Đổi trả">
                  Miễn phí giao hàng hỏa tốc toàn quốc. Đổi hàng tận nhà trong vòng 30 ngày kể từ ngày nhận sản phẩm.
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-20">
          <ProductReviews productId={productId || 1} />
        </div>
      </div>
    </main>
  );
}
