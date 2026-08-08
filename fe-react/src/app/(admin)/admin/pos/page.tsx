"use client";

import { useState, useCallback, useEffect } from "react";
import { productService } from "../../../../services/productService";
import { Product as APIProduct } from "../../../../types";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface POSProduct {
  id: number | string;
  name: string;
  price: number;
  stock: number;
  img: string;
  category: string;
  sku: string;
}

interface CartItem extends POSProduct {
  qty: number;
}

type PaymentMethod = "CASH" | "TRANSFER" | "CARD";
type POSStage = 1 | 2 | 3;

// High quality fallback Pexels images if API images fail to load
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "CASH", label: "Tiền mặt", icon: "fa-solid fa-money-bill-wave" },
  { key: "TRANSFER", label: "Chuyển khoản / QR", icon: "fa-solid fa-qrcode" },
  { key: "CARD", label: "Thẻ ATM / Quẹt", icon: "fa-solid fa-credit-card" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );

// ─── Component ───────────────────────────────────────────────────────────────
export default function POSPage() {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [loading, setLoading] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Sequential Stage Wizard State (Only 1 stage displayed at a time!)
  const [stage, setStage] = useState<POSStage>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // ── Fetch Real API Products & Filter Categories ─────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch Categories
        const optionsRes = await productService.getFilterOptions();
        if (optionsRes?.categories && optionsRes.categories.length > 0) {
          const catNames = optionsRes.categories.map((c) => c.name);
          setCategories(["Tất cả", ...catNames]);
        } else {
          setCategories(["Tất cả", "Áo Sơ Mi", "Quần Âu", "Vest / Blazer", "Phụ kiện"]);
        }

        // Fetch Real Products
        const prodRes = await productService.getProducts({ limit: 50 });
        const rawItems = Array.isArray(prodRes)
          ? prodRes
          : prodRes.results || prodRes.data || [];

        if (rawItems.length > 0) {
          const mapped: POSProduct[] = rawItems.map((p: any, idx: number) => {
            const stockVal =
              p.stock ??
              p.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) ??
              25;
            const priceVal =
              p.default_price || p.price || p.variants?.[0]?.price || 890000;
            const imgVal =
              p.main_img ||
              p.image ||
              p.thumbnail ||
              p.img ||
              (p.images && p.images.length > 0
                ? typeof p.images[0] === "string"
                  ? p.images[0]
                  : p.images[0].url
                : null) ||
              FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

            return {
              id: p._id || p.product_id || p.id || idx + 1,
              name: p.name || p.product_name || "Sản phẩm CLOSET",
              price: priceVal,
              stock: stockVal,
              img: imgVal,
              category: p.category_name || p.category?.name || "Áo Sơ Mi",
              sku: p.sku || p.code || `SKU-${1000 + idx}`,
            };
          });
          setProducts(mapped);
        } else {
          // Fallback mock products if backend API returns empty array
          setProducts(getFallbackProducts());
        }
      } catch (err) {
        console.error("Error fetching POS products:", err);
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getFallbackProducts(): POSProduct[] {
    return [
      {
        id: 1,
        name: "Classic Midnight Suit",
        price: 6990000,
        stock: 42,
        img: FALLBACK_IMAGES[0],
        category: "Vest / Blazer",
        sku: "SUIT-BLK-42",
      },
      {
        id: 2,
        name: "Merino Wool Sweater",
        price: 2490000,
        stock: 15,
        img: FALLBACK_IMAGES[1],
        category: "Áo Sơ Mi",
        sku: "SWT-MRN-M",
      },
      {
        id: 3,
        name: "Premium Leather Boots",
        price: 3980000,
        stock: 5,
        img: FALLBACK_IMAGES[2],
        category: "Phụ kiện",
        sku: "BOOT-LTH-42",
      },
      {
        id: 4,
        name: "Slim Fit Chinos",
        price: 1290000,
        stock: 30,
        img: FALLBACK_IMAGES[3],
        category: "Quần Âu",
        sku: "CHN-SLM-32",
      },
      {
        id: 5,
        name: "Oxford Button-Down",
        price: 890000,
        stock: 0,
        img: FALLBACK_IMAGES[4],
        category: "Áo Sơ Mi",
        sku: "OXF-WHT-M",
      },
      {
        id: 6,
        name: "Cashmere Scarf",
        price: 1590000,
        stock: 8,
        img: FALLBACK_IMAGES[5],
        category: "Phụ kiện",
        sku: "SCF-CSH-ONE",
      },
      {
        id: 7,
        name: "Tailored Blazer Navy",
        price: 4290000,
        stock: 12,
        img: FALLBACK_IMAGES[0],
        category: "Vest / Blazer",
        sku: "BLZ-NVY-L",
      },
      {
        id: 8,
        name: "Linen Dress Shirt",
        price: 750000,
        stock: 25,
        img: FALLBACK_IMAGES[1],
        category: "Áo Sơ Mi",
        sku: "SHT-LNN-L",
      },
    ];
  }

  // ── Cart logic ─────────────────────────────────────────────────────────────
  const addToCart = useCallback((product: POSProduct) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: number | string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, qty: Math.min(i.qty + delta, i.stock) } : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: number | string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setVoucherCode("");
    setCustomerSearch("");
    setPaymentMethod("CASH");
    setStage(1);
  };

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = discount;
  const total = Math.max(0, subtotal - discountAmount);

  // ── Filtered products ──────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchCat =
      activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Apply Voucher Code
  const handleApplyVoucher = (code: string, amount: number) => {
    setVoucherCode(code);
    setDiscount(amount);
  };

  // Final Payment Trigger
  const handleFinalPayment = () => {
    if (cart.length === 0) return;
    setShowSuccess(true);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="flex flex-1 overflow-hidden bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ── Left: Products Section ── */}
      <section className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        {/* Top Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="relative flex-1 w-full">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên sản phẩm hoặc quét mã SKU..."
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] outline-none text-xs font-semibold text-slate-900 dark:text-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-xs"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md scale-105"
                      : "bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-3 py-16">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-600 dark:text-[#D4AF37]" />
              <p className="font-semibold text-xs">Đang tải danh sách sản phẩm từ hệ thống...</p>
            </div>
          ) : !search.trim() && activeCategory === "Tất cả" ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-4 py-20">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-lg text-indigo-600 dark:text-[#D4AF37]">
                <i className="fa-solid fa-barcode text-3xl" />
              </div>
              <div className="text-center max-w-sm">
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Nhập từ khóa hoặc quét mã SKU để tìm sản phẩm
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Gõ tên sản phẩm, mã vạch SKU ở ô tìm kiếm hoặc chọn danh mục để hiển thị sản phẩm bán tại quầy.
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-3 py-16">
              <i className="fa-solid fa-box-open text-5xl" />
              <p className="font-semibold text-xs">Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product, idx) => {
                const inCart = cart.find((i) => i.id === product.id);
                const outOfStock = product.stock === 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`bg-white dark:bg-[#171717] p-3.5 rounded-3xl border transition-all group relative ${
                      outOfStock
                        ? "border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed"
                        : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-[#D4AF37] hover:shadow-xl cursor-pointer hover:-translate-y-1"
                    } ${
                      inCart
                        ? "border-indigo-600 dark:border-[#D4AF37] ring-2 ring-indigo-500/20 dark:ring-[#D4AF37]/30"
                        : ""
                    }`}
                  >
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.img}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={product.name}
                      />
                      <span
                        className={`absolute top-2 right-2 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm ${
                          outOfStock
                            ? "bg-slate-500"
                            : product.stock <= 5
                            ? "bg-amber-500"
                            : "bg-indigo-600 dark:bg-[#D4AF37] dark:text-slate-950"
                        }`}
                      >
                        {outOfStock ? "HẾT HÀNG" : `${product.stock} CÒN`}
                      </span>

                      {inCart && (
                        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-lg shadow-md animate-bounce">
                          ×{inCart.qty}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs mb-1 group-hover:text-indigo-600 dark:group-hover:text-[#EBC563] transition-colors leading-tight line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-[#EBC563] font-black text-sm">
                      {fmt(product.price)}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Right: Cart & Sequential Stage Checkout Panel ── */}
      <section className="w-[400px] lg:w-[440px] bg-white dark:bg-[#171717] border-l border-slate-200/80 dark:border-slate-800 flex flex-col shadow-2xl shrink-0">
        {/* Customer Info */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-user-check text-indigo-600 dark:text-[#EBC563]" />
              Khách hàng
            </h2>
            <button className="text-indigo-600 dark:text-[#EBC563] text-[10px] font-black hover:underline">
              + Thêm mới
            </button>
          </div>
          <div className="relative">
            <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Nhập Tên hoặc SĐT khách..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-bag-shopping text-indigo-600 dark:text-[#EBC563]" />
              Giỏ hàng
              <span className="text-[10px] bg-indigo-100 dark:bg-amber-950/60 text-indigo-700 dark:text-amber-300 px-2 py-0.5 rounded-lg font-black border border-indigo-200 dark:border-amber-800/40">
                {cartCount} Món
              </span>
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline transition-colors"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-600 gap-3">
              <i className="fa-solid fa-cart-shopping text-4xl" />
              <p className="text-xs font-bold">Chưa chọn sản phẩm nào</p>
              <p className="text-[10px] text-center text-slate-400">
                Click chọn các sản phẩm bên trái để đưa vào hóa đơn
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 group transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                    }}
                    className="w-12 h-12 object-cover rounded-xl shrink-0"
                    alt={item.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                      {item.sku}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors w-4 h-4 flex items-center justify-center"
                        >
                          <i className="fa-solid fa-minus text-[9px]" />
                        </button>
                        <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className={`transition-colors w-4 h-4 flex items-center justify-center ${
                            item.qty >= item.stock
                              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                              : "text-slate-400 hover:text-indigo-600 dark:hover:text-[#EBC563]"
                          }`}
                          disabled={item.qty >= item.stock}
                        >
                          <i className="fa-solid fa-plus text-[9px]" />
                        </button>
                      </div>

                      <span className="font-black text-indigo-600 dark:text-[#EBC563] text-xs">
                        {fmt(item.price * item.qty)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all self-start p-1"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SEQUENTIAL STAGE CHECKOUT CONTAINER (ONLY 1 STAGE VISIBLE AT A TIME) ── */}
        <div className="p-5 bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800">
          {/* ══════════════════ GIAI ĐOẠN 1: CHỌN PTTT ══════════════════ */}
          {stage === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Giai đoạn 1 / 3: Chọn Phương Thức Thanh Toán
                </span>
                <span className="text-[10px] font-black text-indigo-600 dark:text-[#EBC563]">
                  Tạm tính: {fmt(subtotal)}
                </span>
              </div>

              {/* 3 Payment Method Options */}
              <div className="grid grid-cols-3 gap-2.5">
                {PAYMENT_METHODS.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={`py-3 px-2 border-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-xs font-extrabold ${
                      paymentMethod === key
                        ? "border-indigo-600 dark:border-[#D4AF37] bg-indigo-50 dark:bg-amber-950/40 text-indigo-600 dark:text-amber-400 shadow-md scale-105"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <i className={`${icon} text-base`} />
                    <span className="truncate w-full text-center text-[10px]">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (cart.length === 0) return;
                  setStage(2);
                }}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                    : "bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 active:scale-95 cursor-pointer"
                }`}
              >
                <span>XÁC NHẬN</span>
                <i className="fa-solid fa-arrow-right text-xs" />
              </button>
            </div>
          )}

          {/* ══════════════════ GIAI ĐOẠN 2: NHẬP MÃ GIẢM GIÁ ══════════════════ */}
          {stage === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Giai đoạn 2 / 3: Nhập Mã Giảm Giá / Voucher
                </span>
                <span className="text-[10px] font-extrabold text-slate-500">
                  PTTT: {PAYMENT_METHODS.find((p) => p.key === paymentMethod)?.label}
                </span>
              </div>

              {/* Voucher Code Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <i className="fa-solid fa-tag absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Mã voucher (Ví dụ: GIAM10%...)"
                    className="w-full pl-9 pr-3 py-3 text-xs uppercase font-extrabold border border-slate-200 dark:border-slate-700 rounded-2xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyVoucher("DISCOUNT100", 100000)}
                  className="px-4 py-3 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:bg-indigo-700 transition-all"
                >
                  Áp dụng
                </button>
              </div>

              {/* Quick Voucher Presets */}
              <div className="flex gap-2">
                {[
                  { code: "GIAM5%", label: "-5%", amount: Math.round(subtotal * 0.05) },
                  { code: "GIAM10%", label: "-10%", amount: Math.round(subtotal * 0.1) },
                  { code: "KHADVIP", label: "-100k", amount: 100000 },
                ].map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => handleApplyVoucher(v.code, v.amount)}
                    className={`flex-1 py-2 px-2 border rounded-xl text-xs font-extrabold transition-all ${
                      voucherCode === v.code
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 shadow-sm"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Discount Status Badge */}
              {discountAmount > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check" /> Đã áp dụng giảm giá:
                  </span>
                  <span className="font-black text-emerald-700 dark:text-emerald-300">
                    -{fmt(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setStage(1)}
                  className="px-4 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-300 transition-all"
                >
                  ← Đổi PTTT
                </button>
                <button
                  onClick={() => setStage(3)}
                  className="flex-1 py-3.5 bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>XÁC NHẬN</span>
                  <i className="fa-solid fa-arrow-right text-xs" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════ GIAI ĐOẠN 3: THANH TOÁN ══════════════════ */}
          {stage === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Giai đoạn 3 / 3: Xác Nhận Hóa Đơn & Thanh Toán
                </span>
                <button
                  onClick={() => setStage(2)}
                  className="text-[10px] font-extrabold text-indigo-600 dark:text-[#EBC563] hover:underline"
                >
                  ← Sửa mã / PTTT
                </button>
              </div>

              {/* Special View for QR Transfer */}
              {paymentMethod === "TRANSFER" ? (
                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-center space-y-3 shadow-inner">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Quét VietQR Chuyển khoản
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.vietqr.io/image/970436-0908887766-compact2.jpg?amount=${total}&addInfo=POS%20CLOSET%20${cartCount}%20MON`}
                    alt="VietQR Payment"
                    className="w-44 h-44 object-contain mx-auto rounded-xl border border-slate-200"
                  />
                  <p className="text-[10px] font-black text-slate-400">
                    MBBank · STK: 0908887766 · STORE CLOSET HCM
                  </p>
                  <p className="text-xl font-black text-indigo-600 dark:text-[#EBC563]">
                    {fmt(total)}
                  </p>
                  <button
                    onClick={handleFinalPayment}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <i className="fa-solid fa-circle-check text-sm" />
                    <span>XÁC NHẬN</span>
                  </button>
                </div>
              ) : (
                /* Standard Cash / Card Summary & Payment Button */
                <div className="space-y-4">
                  <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs shadow-inner">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>PTTT đã chọn:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {PAYMENT_METHODS.find((p) => p.key === paymentMethod)?.label}
                      </span>
                    </div>
                    {voucherCode && (
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Mã ưu đãi:</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {voucherCode} (-{fmt(discountAmount)})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Tạm tính ({cartCount} món):</span>
                      <span className="font-bold text-slate-900 dark:text-white">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200/80 dark:border-slate-700">
                      <span>Tổng thanh toán:</span>
                      <span className="text-indigo-600 dark:text-[#EBC563] text-xl">
                        {fmt(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleFinalPayment}
                    className="w-full py-4 bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <i className="fa-solid fa-check-circle text-sm" />
                    <span>XÁC NHẬN</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Success Modal with Print Invoice ── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 flex flex-col items-center gap-4 animate-bounce-in max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-lg">
              <i className="fa-solid fa-check text-emerald-500 text-4xl" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Thanh toán thành công!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Đơn hàng tại quầy POS đã hoàn tất xử lý.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl w-full border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block">
                Tổng tiền đã thu:
              </span>
              <span className="font-black text-indigo-600 dark:text-[#EBC563] text-2xl">
                {fmt(total)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => {
                  window.open("/admin/invoice", "_blank");
                }}
                className="w-full py-3.5 bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-print text-sm" />
                <span>IN HÓA ĐƠN</span>
              </button>

              <button
                onClick={() => {
                  setShowSuccess(false);
                  clearCart();
                }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>TẠO ĐƠN MỚI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.4s ease; }
      `}</style>
    </div>
  );
}
