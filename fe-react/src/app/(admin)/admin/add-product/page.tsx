"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productService } from "../../../../services/productService";

export interface VariantRow {
  id: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string;
  price: number;
  quantity: number;
}

// --- RI TYPES ---
type RiType = "color_full_size" | "size_full_color";

interface SizeQty {
  size: string;
  quantity: number;
}
interface ColorQty {
  color_hex: string;
  quantity: number;
}

interface Ri {
  id: string;
  type: RiType;
  // for color_full_size: fixed color + qty per size
  color_hex?: string;
  size_quantities?: SizeQty[];
  // for size_full_color: fixed size + qty per color
  size?: string;
  color_quantities?: ColorQty[];
  // price adjustment
  price_adjustment_type: "percent" | "fixed"; // percent or fixed VND
  price_adjustment: number; // positive = increase, negative = decrease
}

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

const ALL_COLORS = [
  { hex: "#1b2a47", label: "Navy Blue" },
  { hex: "#121212", label: "Midnight Black" },
  { hex: "#f5f5f0", label: "Cream White" },
  { hex: "#334155", label: "Charcoal Grey" },
  { hex: "#3f4e38", label: "Olive Green" },
  { hex: "#8B3A3A", label: "Burgundy" },
  { hex: "#C19A6B", label: "Camel" },
  { hex: "#FFFFFF", label: "Pure White" },
];

const COLOR_MAP: Record<string, string> = Object.fromEntries(
  ALL_COLORS.map((c) => [c.hex, c.label])
);

function getColorLabel(hex: string) {
  return COLOR_MAP[hex] || hex;
}

function calcVariantPrice(basePrice: number, ri: Ri): number {
  if (ri.price_adjustment_type === "percent") {
    return Math.round(basePrice * (1 + ri.price_adjustment / 100));
  }
  return Math.round(basePrice + ri.price_adjustment);
}

const generateSkuFromNameAndCat = (nameStr: string, catStr: string) => {
  const cleanStr = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

  const prefix = "CLO";
  let catCode = cleanStr(catStr).slice(0, 4);
  if (!catCode) catCode = "SUIT";
  let nameCode = cleanStr(nameStr).slice(0, 4);
  if (!nameCode) nameCode = "ITEM";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${catCode}-${nameCode}-${randomNum}`;
};

// Build a new empty ri
function createRi(type: RiType, basePrice: number): Ri {
  if (type === "color_full_size") {
    return {
      id: `ri-${Date.now()}-${Math.random()}`,
      type,
      color_hex: ALL_COLORS[0].hex,
      size_quantities: ALL_SIZES.map((s) => ({ size: s, quantity: 10 })),
      price_adjustment_type: "percent",
      price_adjustment: 0,
    };
  } else {
    return {
      id: `ri-${Date.now()}-${Math.random()}`,
      type,
      size: ALL_SIZES[2], // L
      color_quantities: ALL_COLORS.slice(0, 3).map((c) => ({
        color_hex: c.hex,
        quantity: 10,
      })),
      price_adjustment_type: "percent",
      price_adjustment: 0,
    };
  }
}

function generateVariantsFromRiList(
  riList: Ri[],
  basePrice: number,
  baseSku: string
): VariantRow[] {
  const variantMap = new Map<string, VariantRow>();

  for (const ri of riList) {
    const variantPrice = calcVariantPrice(basePrice, ri);

    if (ri.type === "color_full_size" && ri.color_hex && ri.size_quantities) {
      const colLabel = getColorLabel(ri.color_hex);
      for (const sq of ri.size_quantities) {
        if (sq.quantity <= 0) continue;
        const key = `${sq.size}-${ri.color_hex}`;
        
        if (variantMap.has(key)) {
          const existing = variantMap.get(key)!;
          existing.quantity += sq.quantity;
          existing.price = variantPrice; // Latest Ri overrides price
        } else {
          variantMap.set(key, {
            id: key,
            sku: `${baseSku}-${sq.size}-${ri.color_hex.replace("#", "")}`,
            size: sq.size,
            color: colLabel,
            color_hex: ri.color_hex,
            price: variantPrice,
            quantity: sq.quantity,
          });
        }
      }
    } else if (ri.type === "size_full_color" && ri.size && ri.color_quantities) {
      for (const cq of ri.color_quantities) {
        if (cq.quantity <= 0) continue;
        const key = `${ri.size}-${cq.color_hex}`;
        
        if (variantMap.has(key)) {
          const existing = variantMap.get(key)!;
          existing.quantity += cq.quantity;
          existing.price = variantPrice; // Latest Ri overrides price
        } else {
          variantMap.set(key, {
            id: key,
            sku: `${baseSku}-${ri.size}-${cq.color_hex.replace("#", "")}`,
            size: ri.size,
            color: getColorLabel(cq.color_hex),
            color_hex: cq.color_hex,
            price: variantPrice,
            quantity: cq.quantity,
          });
        }
      }
    }
  }

  return Array.from(variantMap.values());
}

// ─── RiCard Component ──────────────────────────────────────────────────────────
function RiCard({
  ri,
  basePrice,
  index,
  onChange,
  onRemove,
}: {
  ri: Ri;
  basePrice: number;
  index: number;
  onChange: (updated: Ri) => void;
  onRemove: () => void;
}) {
  const variantPrice = calcVariantPrice(basePrice, ri);

  const updateField = <K extends keyof Ri>(field: K, value: Ri[K]) => {
    onChange({ ...ri, [field]: value });
  };

  const updateSizeQty = (size: string, qty: number) => {
    onChange({
      ...ri,
      size_quantities: (ri.size_quantities || []).map((sq) =>
        sq.size === size ? { ...sq, quantity: qty } : sq
      ),
    });
  };

  const updateColorQty = (hex: string, qty: number) => {
    onChange({
      ...ri,
      color_quantities: (ri.color_quantities || []).map((cq) =>
        cq.color_hex === hex ? { ...cq, quantity: qty } : cq
      ),
    });
  };

  const toggleColorInRi = (hex: string) => {
    const current = ri.color_quantities || [];
    const exists = current.find((c) => c.color_hex === hex);
    if (exists) {
      onChange({ ...ri, color_quantities: current.filter((c) => c.color_hex !== hex) });
    } else {
      onChange({ ...ri, color_quantities: [...current, { color_hex: hex, quantity: 10 }] });
    }
  };

  const priceClass =
    ri.price_adjustment > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : ri.price_adjustment < 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-500 dark:text-slate-400";

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/40">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[10px] font-black flex items-center justify-center">
            {index + 1}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...ri,
                  type: "color_full_size",
                  color_hex: ri.color_hex || ALL_COLORS[0].hex,
                  size_quantities: ALL_SIZES.map((s) => ({ size: s, quantity: 10 })),
                })
              }
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                ri.type === "color_full_size"
                  ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400"
              }`}
            >
              <i className="fa-solid fa-palette mr-1" />1 Màu · Full Size
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...ri,
                  type: "size_full_color",
                  size: ri.size || "L",
                  color_quantities: ALL_COLORS.slice(0, 3).map((c) => ({
                    color_hex: c.hex,
                    quantity: 10,
                  })),
                })
              }
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                ri.type === "size_full_color"
                  ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400"
              }`}
            >
              <i className="fa-solid fa-ruler mr-1" />1 Size · Full Màu
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Type: 1 Color + full sizes */}
        {ri.type === "color_full_size" && (
          <div className="space-y-4">
            {/* Color picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Chọn màu sắc cho ri này:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {ALL_COLORS.map((col) => (
                  <button
                    type="button"
                    key={col.hex}
                    onClick={() => updateField("color_hex", col.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      ri.color_hex === col.hex
                        ? "border-indigo-600 dark:border-[#D4AF37] bg-indigo-50 dark:bg-amber-950/40 text-indigo-700 dark:text-amber-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300/60 dark:border-slate-600/60"
                      style={{ backgroundColor: col.hex }}
                    />
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size quantities */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Số lượng từng size:
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {ALL_SIZES.map((sz) => {
                  const sq = (ri.size_quantities || []).find((s) => s.size === sz);
                  return (
                    <div key={sz} className="space-y-1.5">
                      <span className="text-[10px] font-black text-center block text-slate-700 dark:text-slate-300">
                        {sz}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={sq?.quantity ?? 0}
                        onChange={(e) => updateSizeQty(sz, parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-center text-indigo-600 dark:text-[#EBC563] outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Type: 1 Size + full colors */}
        {ri.type === "size_full_color" && (
          <div className="space-y-4">
            {/* Size picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Chọn size cho ri này:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {ALL_SIZES.map((sz) => (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => updateField("size", sz)}
                    className={`w-11 h-11 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      ri.size === sz
                        ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color + quantity grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Chọn màu &amp; nhập số lượng:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALL_COLORS.map((col) => {
                  const cq = (ri.color_quantities || []).find(
                    (c) => c.color_hex === col.hex
                  );
                  const isActive = !!cq;
                  return (
                    <div
                      key={col.hex}
                      className={`rounded-xl border p-2.5 flex flex-col gap-2 transition-all ${
                        isActive
                          ? "border-indigo-500 dark:border-[#D4AF37] bg-indigo-50/60 dark:bg-amber-950/20"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleColorInRi(col.hex)}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <span
                          className={`w-3 h-3 rounded-full border-2 transition-all ${
                            isActive
                              ? "border-indigo-600 dark:border-[#D4AF37]"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                        <span
                          className={`text-[10px] font-bold leading-tight ${
                            isActive
                              ? "text-indigo-700 dark:text-amber-300"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {col.label}
                        </span>
                      </button>
                      {isActive && (
                        <input
                          type="number"
                          min="0"
                          value={cq?.quantity ?? 0}
                          onChange={(e) =>
                            updateColorQty(col.hex, parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-[#D4AF37]/60 rounded-lg text-xs font-black text-center text-indigo-600 dark:text-[#EBC563] outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Price Adjustment */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[160px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Điều chỉnh giá ri này
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateField("price_adjustment_type", "percent")}
                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                  ri.price_adjustment_type === "percent"
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 border-transparent"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                % Phần trăm
              </button>
              <button
                type="button"
                onClick={() => updateField("price_adjustment_type", "fixed")}
                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                  ri.price_adjustment_type === "fixed"
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 border-transparent"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                ₫ Số tiền
              </button>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {ri.price_adjustment_type === "percent"
                ? "Tăng / Giảm (%) — VD: -10 hoặc +5"
                : "Tăng / Giảm (₫) — VD: -50000 hoặc +100000"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-black">
                {ri.price_adjustment_type === "percent" ? "%" : "₫"}
              </span>
              <input
                type="number"
                step={ri.price_adjustment_type === "percent" ? 1 : 10000}
                value={ri.price_adjustment}
                onChange={(e) =>
                  updateField("price_adjustment", parseFloat(e.target.value) || 0)
                }
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-black text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          {/* Price preview */}
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
              Giá biến thể ri này
            </span>
            <span className={`text-base font-black ${priceClass}`}>
              {variantPrice.toLocaleString("vi-VN")}₫
            </span>
            {ri.price_adjustment !== 0 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                gốc: {basePrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAddProductPage() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [materialInfo, setMaterialInfo] = useState("");
  const [price, setPrice] = useState("950000");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Áo Sơ Mi");
  const [status, setStatus] = useState<"PUBLIC" | "DRAFT">("PUBLIC");
  const [collection, setCollection] = useState("Quiet Luxury 2026");
  const [isAutoSku, setIsAutoSku] = useState(true);

  // Scroll tracking for Action Bar
  const [showActionBar, setShowActionBar] = useState(false);
  const riBuilderRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (riBuilderRef.current) {
      const rect = riBuilderRef.current.getBoundingClientRect();
      // Show action bar when the top of RiBuilder is visible in the viewport
      setShowActionBar(rect.top < window.innerHeight - 100);
    }
  };

  // Ri list
  const [riList, setRiList] = useState<Ri[]>([]);

  // Toast & submitting
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice = parseFloat(price) || 950000;
  const baseSku = sku || "CLO-PROD";

  // Derive all variant rows from ri list
  const variantRows = useMemo(
    () => generateVariantsFromRiList(riList, basePrice, baseSku),
    [riList, basePrice, baseSku]
  );

  const totalVariantStock = useMemo(
    () => variantRows.reduce((sum, v) => sum + v.quantity, 0),
    [variantRows]
  );

  const handleGenerateSku = () => {
    setSku(generateSkuFromNameAndCat(productName, category));
    setIsAutoSku(true);
  };

  const handleProductNameChange = (val: string) => {
    setProductName(val);
    if (isAutoSku || !sku) setSku(generateSkuFromNameAndCat(val, category));
  };

  const handleAddRi = (type: RiType) => {
    setRiList((prev) => [...prev, createRi(type, basePrice)]);
  };

  const handleUpdateRi = (index: number, updated: Ri) => {
    setRiList((prev) => prev.map((r, i) => (i === index ? updated : r)));
  };

  const handleRemoveRi = (index: number) => {
    setRiList((prev) => prev.filter((_, i) => i !== index));
  };

  // Images
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([
    "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400",
    "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=400",
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrlPrompt = () => {
    const url = window.prompt("Nhập URL hình ảnh sản phẩm từ internet:");
    if (url && url.trim()) setImages((prev) => [...prev, url.trim()]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const numPrice = basePrice;
      const formattedVariants = variantRows.map((v) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        price: Number(v.price) || numPrice,
        quantity: Math.max(0, Number(v.quantity) || 0),
      }));

      await productService.createProduct({
        name: productName,
        description,
        default_price: numPrice,
        status: status === "PUBLIC" ? "ACTIVE" : "DRAFT",
        main_img:
          images[0] ||
          "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800",
        images,
        variants:
          formattedVariants.length > 0
            ? formattedVariants
            : [{ price: numPrice, quantity: 10 }],
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi tạo sản phẩm:", err);
      alert("Đã xảy ra lỗi khi tạo sản phẩm. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-600 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <i className="fa-solid fa-circle-check text-lg" />
          <span>Đã thêm sản phẩm & biến thể thành công! Đang chuyển hướng...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 dark:text-slate-500 mb-1">
              <Link href="/admin/products" className="hover:text-indigo-600 dark:hover:text-[#D4AF37]">
                Sản phẩm
              </Link>
              <span>/</span>
              <span className="text-slate-800 dark:text-slate-200">Tạo mới</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Thêm Sản Phẩm & Biến Thể Mới
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Hủy / Quay lại
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-2xl bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-sm" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check text-sm" />
                  <span>Lưu & Đăng Bán</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grid: Main + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-file-pen text-indigo-600 dark:text-[#EBC563]" />
                Thông tin cơ bản
              </h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    placeholder="Ví dụ: Áo Sơ Mi Oxford Quiet Luxury Midnight..."
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Mã SKU gốc <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => { setSku(e.target.value); setIsAutoSku(false); }}
                        placeholder="CLO-SUIT-NV-2026"
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-slate-900 dark:text-white transition-all uppercase pr-24 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-[#D4AF37] hover:bg-indigo-600 hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        ⚡ Tự sinh
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Chất liệu & Phom dáng
                    </label>
                    <input
                      type="text"
                      value={materialInfo}
                      onChange={(e) => setMaterialInfo(e.target.value)}
                      placeholder="Ví dụ: 100% Cotton Ai Cập · Regular Fit"
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Mô tả chi tiết sản phẩm
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả phong cách thiết kế, chi tiết chất liệu, phom dáng và hướng dẫn sử dụng sản phẩm..."
                    className="w-full h-32 px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-medium text-slate-900 dark:text-white transition-all resize-none custom-scrollbar"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-images text-indigo-600 dark:text-[#EBC563]" />
                  Bộ sưu tập hình ảnh
                </h2>
                <span className="text-[10px] font-extrabold text-slate-400">{images.length} hình</span>
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-500 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37] hover:bg-indigo-50/50 dark:hover:bg-amber-950/20 cursor-pointer transition-all group"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-2xl group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-center">+ Tải ảnh từ máy</span>
                </div>
                <div
                  onClick={handleAddImageUrlPrompt}
                  className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-500 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37] hover:bg-indigo-50/50 dark:hover:bg-amber-950/20 cursor-pointer transition-all group"
                >
                  <i className="fa-solid fa-link text-xl group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-center">+ Thêm URL ảnh</span>
                </div>
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl relative group overflow-hidden border border-slate-200/80 dark:border-slate-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={`Ảnh ${idx + 1}`}
                    />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                        Ảnh chính
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                    >
                      <i className="fa-solid fa-trash text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-8">
            {/* Price Card */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-coins text-indigo-600 dark:text-[#EBC563]" />
                Tổng Quan Giá & Kho
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Giá gốc chuẩn (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="950000"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] font-black text-indigo-600 dark:text-[#EBC563] text-sm transition-all"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    Giá này là chuẩn cơ sở để tính giá cho từng ri
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Giá gốc (Trước giảm)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="1200000"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all"
                  />
                </div>

                {/* Summary */}
                <div className="bg-indigo-50 dark:bg-amber-950/30 rounded-2xl p-4 space-y-2 border border-indigo-100 dark:border-amber-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Tổng biến thể
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-[#EBC563]">
                      {variantRows.length} SKU
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Tổng số lượng kho
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-[#EBC563]">
                      {totalVariantStock.toLocaleString()} sp
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Số ri đã tạo
                    </span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                      {riList.length} ri
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-tags text-indigo-600 dark:text-[#EBC563]" />
                Phân loại & Trạng thái
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-bold text-slate-900 dark:text-white transition-all"
                  >
                    <option value="Áo Sơ Mi">Áo Sơ Mi</option>
                    <option value="Quần Âu">Quần Âu</option>
                    <option value="Vest / Blazer">Vest / Blazer</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Bộ sưu tập
                  </label>
                  <input
                    type="text"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    placeholder="Quiet Luxury 2026"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Trạng thái hiển thị
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("PUBLIC")}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${
                        status === "PUBLIC"
                          ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Công khai
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("DRAFT")}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${
                        status === "DRAFT"
                          ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Bản nháp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RI BUILDER — Full Width */}
        <div ref={riBuilderRef} className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-indigo-600 dark:text-[#EBC563]" />
                Nhập Biến Thể theo Ri
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 max-w-xl">
                Mỗi <strong className="text-slate-600 dark:text-slate-300">ri</strong> là một lô nhập hàng loạt — chọn kiểu ri, thiết lập số lượng và điều chỉnh giá (%) so với giá gốc. Hệ thống tự tạo biến thể tương ứng.
              </p>
            </div>
          </div>

          {/* Ri cards */}
          {riList.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-amber-950/40 flex items-center justify-center">
                <i className="fa-solid fa-layer-group text-2xl text-indigo-400 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-500 dark:text-slate-400">Chưa có ri nào</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Nhấn <strong>+ Ri: 1 Màu · Full Size</strong> hoặc <strong>+ Ri: 1 Size · Full Màu</strong> để bắt đầu
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {riList.map((ri, idx) => (
                <RiCard
                  key={ri.id}
                  ri={ri}
                  basePrice={basePrice}
                  index={idx}
                  onChange={(updated) => handleUpdateRi(idx, updated)}
                  onRemove={() => handleRemoveRi(idx)}
                />
              ))}
            </div>
          )}

          {/* Preview table */}
          {variantRows.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <i className="fa-solid fa-table text-indigo-500 dark:text-[#EBC563]" />
                  Xem trước biến thể sẽ được tạo
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-amber-950/60 text-indigo-700 dark:text-[#EBC563] text-xs">
                    {variantRows.length} biến thể · {totalVariantStock} sản phẩm
                  </span>
                </h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">SKU Biến Thể</th>
                      <th className="py-3 px-4">Màu</th>
                      <th className="py-3 px-4 text-center">Size</th>
                      <th className="py-3 px-4 text-right">Số Lượng</th>
                      <th className="py-3 px-4 text-right">Giá Bán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#171717]">
                    {variantRows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {row.sku}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                              style={{ backgroundColor: row.color_hex }}
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {row.color}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-800 dark:text-white text-[10px]">
                            {row.size}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-indigo-600 dark:text-[#EBC563]">
                          {row.quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-800 dark:text-slate-200">
                          {row.price.toLocaleString("vi-VN")}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className={`sticky -bottom-6 md:-bottom-10 -mx-6 md:-mx-10 z-40 flex items-center justify-center p-4 md:p-5 bg-white/95 dark:bg-[#222222]/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-slate-200 dark:border-slate-700/80 mt-12 transition-all duration-500 ease-out ${
          showActionBar ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-[150%] opacity-0 pointer-events-none"
        }`}>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                handleAddRi("color_full_size");
                // Scroll slightly down to make room for new ri
                setTimeout(() => window.scrollBy({ top: 400, behavior: "smooth" }), 100);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-[#EBC563] border border-indigo-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <i className="fa-solid fa-palette text-sm" />
              + Ri: 1 Màu · Full Size
            </button>
            <button
              type="button"
              onClick={() => {
                handleAddRi("size_full_color");
                setTimeout(() => window.scrollBy({ top: 400, behavior: "smooth" }), 100);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-slate-700 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <i className="fa-solid fa-ruler text-sm" />
              + Ri: 1 Size · Full Màu
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}