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

const COLOR_MAP: Record<string, string> = {
  "#1b2a47": "Navy Blue",
  "#121212": "Midnight Black",
  "#f5f5f0": "Cream White",
  "#334155": "Charcoal Grey",
  "#3f4e38": "Olive Green",
};

export default function AdminAddProductPage() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [materialInfo, setMaterialInfo] = useState("");
  const [price, setPrice] = useState("950000");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("50");
  const [category, setCategory] = useState("Áo Sơ Mi");
  const [status, setStatus] = useState<"PUBLIC" | "DRAFT">("PUBLIC");
  const [collection, setCollection] = useState("Quiet Luxury 2026");

  // Selected sizes & colors state
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M", "L"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["#1b2a47", "#121212"]);

  // Toast feedback & submitting states
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSku, setIsAutoSku] = useState(true);

  // Variant Rows state matrix
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  // Helper function to auto-generate SKU
  const generateSkuFromNameAndCat = (nameStr: string, catStr: string) => {
    const cleanStr = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();

    const prefix = 'CLO';
    let catCode = cleanStr(catStr).slice(0, 4);
    if (!catCode) catCode = 'SUIT';

    let nameCode = cleanStr(nameStr).slice(0, 4);
    if (!nameCode) nameCode = 'ITEM';

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${catCode}-${nameCode}-${randomNum}`;
  };

  const handleGenerateSku = () => {
    const newSku = generateSkuFromNameAndCat(productName, category);
    setSku(newSku);
    setIsAutoSku(true);
  };

  const handleProductNameChange = (val: string) => {
    setProductName(val);
    if (isAutoSku || !sku) {
      setSku(generateSkuFromNameAndCat(val, category));
    }
  };

  // Synchronize variant rows when selectedSizes, selectedColors, base price or base sku changes
  useEffect(() => {
    const basePrice = parseFloat(price) || 950000;
    const baseSkuStr = sku || 'CLO-PROD';

    setVariantRows((prevRows) => {
      const newRows: VariantRow[] = [];

      for (const sz of selectedSizes) {
        for (const colHex of selectedColors) {
          const colLabel = COLOR_MAP[colHex] || 'Màu sắc';
          const expectedId = `${sz}-${colHex}`;

          const existing = prevRows.find((r) => r.id === expectedId || (r.size === sz && r.color_hex === colHex));

          if (existing) {
            newRows.push({
              ...existing,
              sku: existing.sku || `${baseSkuStr}-${sz}-${colHex.replace('#', '')}`,
            });
          } else {
            newRows.push({
              id: expectedId,
              sku: `${baseSkuStr}-${sz}-${colHex.replace('#', '')}`,
              size: sz,
              color: colLabel,
              color_hex: colHex,
              price: basePrice,
              quantity: 10,
            });
          }
        }
      }
      return newRows;
    });
  }, [selectedSizes, selectedColors, price, sku]);

  // Total calculated stock from variants
  const totalVariantStock = useMemo(() => {
    return variantRows.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
  }, [variantRows]);

  // Keep total stock field in sync if variants exist
  useEffect(() => {
    if (variantRows.length > 0) {
      setStock(String(totalVariantStock));
    }
  }, [totalVariantStock, variantRows.length]);

  const handleUpdateVariantField = (index: number, field: keyof VariantRow, value: any) => {
    setVariantRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariantRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomVariantRow = () => {
    const basePrice = parseFloat(price) || 950000;
    const baseSkuStr = sku || 'CLO-PROD';
    const newRow: VariantRow = {
      id: `custom-${Date.now()}`,
      sku: `${baseSkuStr}-CST-${Math.floor(100 + Math.random() * 900)}`,
      size: 'XL',
      color: 'Navy Blue',
      color_hex: '#1b2a47',
      price: basePrice,
      quantity: 10,
    };
    setVariantRows((prev) => [...prev, newRow]);
  };

  // Uploaded images preview list & file upload ref
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
    if (url && url.trim()) {
      setImages((prev) => [...prev, url.trim()]);
    }
  };

  const handleToggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const handleToggleColor = (hex: string) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const numPrice = parseFloat(price) || 950000;
      const numStock = parseInt(stock) || totalVariantStock || 10;

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
        main_img: images[0] || "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: images,
        variants: formattedVariants.length > 0 ? formattedVariants : [{ price: numPrice, quantity: numStock }],
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
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-600 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <i className="fa-solid fa-circle-check text-lg" />
          <span>Đã thêm sản phẩm & biến thể thành công! Đang chuyển hướng...</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <form onSubmit={handleSubmit} className="space-y-8">
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

        {/* Top Split Grid Layout (Basic Info & Images vs Price & Categorization) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Card */}
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
                        Mã SKU mẫu gốc <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[10px] font-extrabold text-indigo-600 dark:text-[#EBC563] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles" />
                        <span>Tự sinh SKU</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => {
                          setSku(e.target.value);
                          setIsAutoSku(false);
                        }}
                        placeholder="Mã SKU (Ví dụ: CLO-SUIT-NV-2026)"
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

            {/* Images Card */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-images text-indigo-600 dark:text-[#EBC563]" />
                  Bộ sưu tập hình ảnh
                </h2>
                <span className="text-[10px] font-extrabold text-slate-400">
                  {images.length} hình ảnh
                </span>
              </div>

              {/* Hidden File Input for Device Image Upload */}
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Upload File Action Tile */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-500 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37] hover:bg-indigo-50/50 dark:hover:bg-amber-950/20 cursor-pointer transition-all group"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-2xl group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-center">
                    + Tải ảnh từ máy
                  </span>
                </div>

                {/* Enter Image URL Tile */}
                <div
                  onClick={handleAddImageUrlPrompt}
                  className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-500 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37] hover:bg-indigo-50/50 dark:hover:bg-amber-950/20 cursor-pointer transition-all group"
                >
                  <i className="fa-solid fa-link text-xl group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-center">
                    + Thêm URL ảnh
                  </span>
                </div>

                {/* Images List */}
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

          {/* Right Sidebar Form Controls (1 Col) */}
          <div className="space-y-8">
            {/* Price & Stock Summary Card */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-coins text-indigo-600 dark:text-[#EBC563]" />
                Tổng Quan Giá & Tồn Kho
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Giá bán niêm yết chuẩn (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ví dụ: 950000"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] font-black text-indigo-600 dark:text-[#EBC563] text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Giá gốc (Trước giảm)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Ví dụ: 1200000"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all line-through"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Tổng số lượng tồn kho <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-[#EBC563]">
                      (Tự cộng từ {variantRows.length} biến thể)
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Ví dụ: 50"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] text-xs font-bold text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Categorization & Collection Card */}
            <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-tags text-indigo-600 dark:text-[#EBC563]" />
                Phân loại & Trạng thái
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Danh mục sản phẩm
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
                    placeholder="Ví dụ: Quiet Luxury 2026"
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

        {/* FULL WIDTH BOTTOM SECTION (100% Width): Variants Matrix & Stock Breakdown Table */}
        <div className="w-full">
          <div className="bg-white dark:bg-[#171717] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-sliders text-indigo-600 dark:text-[#EBC563]" />
                Tùy chọn Kích thước, Màu sắc & Ma Trận Biến Thể Chi Tiết
              </h2>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-[#EBC563] bg-indigo-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl">
                Bung rộng 100% màn hình
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Size Selector */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                    Kích thước có sẵn (Size):
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {["S", "M", "L", "XL", "XXL"].map((sz) => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`w-12 h-12 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md scale-105"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:border-slate-400"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Swatch Selector */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                    Bảng màu sắc (Color):
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { hex: "#1b2a47", label: "Navy Blue" },
                      { hex: "#121212", label: "Midnight Black" },
                      { hex: "#f5f5f0", label: "Cream White" },
                      { hex: "#334155", label: "Charcoal Grey" },
                      { hex: "#3f4e38", label: "Olive Green" },
                    ].map((col) => {
                      const isSelected = selectedColors.includes(col.hex);
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => handleToggleColor(col.hex)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 dark:border-[#D4AF37] bg-indigo-50 dark:bg-amber-950/40 text-indigo-700 dark:text-amber-300 font-extrabold shadow-sm"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-inner"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="text-xs">{col.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interactive Full Width Variants Matrix Table */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>Bảng Biến Thể Chi Tiết & Số Lượng Kho</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-amber-950/60 text-indigo-700 dark:text-[#EBC563] text-xs">
                        {variantRows.length} biến thể
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Chỉnh sửa số lượng kho, mã SKU và giá bán trực tiếp cho từng kích thước / màu sắc bên dưới.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomVariantRow}
                    className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-[#EBC563] hover:bg-indigo-600 hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                    <span>+ Thêm biến thể riêng</span>
                  </button>
                </div>

                {variantRows.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-semibold">
                    Chưa chọn biến thể nào. Vui lòng chọn Kích thước & Bảng màu ở trên!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-3.5 px-4">Mã SKU Biến Thể</th>
                          <th className="py-3.5 px-4">Màu Sắc</th>
                          <th className="py-3.5 px-4 text-center">Size</th>
                          <th className="py-3.5 px-4">Số Lượng Kho Tồn (bộ)</th>
                          <th className="py-3.5 px-4">Giá Bán Riêng (VNĐ)</th>
                          <th className="py-3.5 px-4 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#171717]">
                        {variantRows.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <input
                                type="text"
                                value={row.sku}
                                onChange={(e) => handleUpdateVariantField(idx, 'sku', e.target.value)}
                                className="w-48 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37]"
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                                  style={{ backgroundColor: row.color_hex }}
                                />
                                <span className="font-bold text-slate-800 dark:text-slate-200">{row.color}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white">
                                {row.size}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <input
                                type="number"
                                min="0"
                                value={row.quantity}
                                onChange={(e) => handleUpdateVariantField(idx, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-black text-indigo-600 dark:text-[#EBC563] focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37]"
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <input
                                type="number"
                                step="50000"
                                value={row.price}
                                onChange={(e) => handleUpdateVariantField(idx, 'price', parseFloat(e.target.value) || 0)}
                                className="w-40 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37]"
                              />
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantRow(idx)}
                                className="w-8 h-8 rounded-xl bg-red-50 dark:bg-rose-950/40 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto cursor-pointer shadow-sm hover:scale-105"
                              >
                                <i className="fa-solid fa-trash text-xs" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}