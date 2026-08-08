"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AdminTable from "../../../../components/admin/AdminTable";
import { productService } from "../../../../services/productService";
import { Product } from "../../../../types";
import { FilterOptionItem } from "../../../../components/client/SidebarFilter";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<FilterOptionItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Infinity Scroll States (Tối đa 12 sản phẩm mỗi lần cuộn)
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Categories for filter dropdown
  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await productService.getFilterOptions();
        setCategories(opts.categories || []);
      } catch (err) {
        console.warn("Failed to load filter options", err);
      }
    }
    loadOptions();
  }, []);

  // Fetch Products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        limit: 100, // Load dataset to enable smooth 12-item batch infinite scroll
        keyword: searchKeyword,
        category_id: selectedCategory || null,
      });

      let items = Array.isArray(res) ? res : res.results || res.data || [];

      // Filter by stock status if selected
      if (selectedStatus) {
        items = items.filter((p) => {
          const totalStock =
            p.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) ?? 50;
          if (selectedStatus === "in-stock") return totalStock >= 10;
          if (selectedStatus === "low-stock") return totalStock > 0 && totalStock < 10;
          if (selectedStatus === "out-stock") return totalStock === 0;
          return true;
        });
      }

      setProducts(items);
      setVisibleCount(12); // Reset to 12 items on new search/filter
    } catch (err) {
      console.error("Error loading admin products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Infinity Scroll on Container
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    // When scrolling near bottom (within 150px)
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleCount < products.length && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 12, products.length));
          setIsLoadingMore(false);
        }, 400);
      }
    }
  }, [visibleCount, products.length, isLoadingMore]);

  // Handle product deletion
  const handleDeleteProduct = async (id: number | string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        await productService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => (p._id || (p as any).id) !== id));
        alert("Đã xóa sản phẩm thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        alert("Có lỗi xảy ra khi xóa sản phẩm.");
      }
    }
  };

  // Toggle selection
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(
        products.map((p) => p._id || (p as any).id).filter(Boolean) as (number | string)[]
      );
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number | string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Calculations for Stat Cards
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => {
    const stock = p.variants?.reduce((s: number, v: any) => s + (v.quantity || 0), 0) ?? 45;
    return acc + stock;
  }, 0);
  const lowStockCount = products.filter((p) => {
    const stock = p.variants?.reduce((s: number, v: any) => s + (v.quantity || 0), 0) ?? 45;
    return stock > 0 && stock < 10;
  }).length;

  const displayedProducts = products.slice(0, visibleCount);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Top Header & New Product CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Quản lý Sản phẩm</span>
            <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-amber-950/60 text-indigo-700 dark:text-amber-300 rounded-full border border-indigo-200 dark:border-amber-800/40 font-black">
              12 SP / lượt cuộn
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Danh sách toàn bộ sản phẩm với phân trang dạng Infinity Scroll (cuộn vô tận).
          </p>
        </div>

        <Link
          href="/admin/add-product"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-indigo-600 dark:bg-[#D4AF37] hover:bg-indigo-700 dark:hover:bg-[#EBC563] text-white dark:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <i className="fa-solid fa-plus text-sm" />
          <span>Thêm sản phẩm mới</span>
        </Link>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#171717] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Tổng sản phẩm
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalProducts}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              <i className="fa-solid fa-check mr-1" /> Đang kinh doanh
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-lg">
            <i className="fa-solid fa-box" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#171717] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Tổng tồn kho
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalStock}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              sản phẩm trong kho
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-lg">
            <i className="fa-solid fa-warehouse" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#171717] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Sắp hết hàng
            </span>
            <p className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              {lowStockCount}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              tồn kho dưới 10
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-lg">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#171717] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Danh mục
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {categories.length || 5}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              nhóm sản phẩm
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 flex items-center justify-center text-lg">
            <i className="fa-solid fa-layer-group" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#171717] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, SKU..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="in-stock">Còn hàng (≥10)</option>
            <option value="low-stock">Sắp hết (&lt;10)</option>
            <option value="out-stock">Hết hàng (0)</option>
          </select>
        </div>

        {/* Selected count info */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50 dark:bg-amber-950/60 border border-indigo-200 dark:border-amber-800/60 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-amber-300">
            <span>Đã chọn {selectedIds.length} sản phẩm</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-indigo-500 dark:text-amber-400 hover:underline text-[10px] font-black"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {/* Main Products Table */}
      <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto custom-scrollbar">
          <AdminTable>
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
                <th className="px-5 py-4 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 && selectedIds.length === products.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4 whitespace-nowrap">Sản phẩm</th>
                <th className="px-5 py-4 whitespace-nowrap">Danh mục</th>
                <th className="px-5 py-4 whitespace-nowrap">Giá bán</th>
                <th className="px-5 py-4 whitespace-nowrap">Tồn kho</th>
                <th className="px-5 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-5 py-4 text-right whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center whitespace-nowrap">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-600 dark:text-[#D4AF37] mb-2" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      Đang tải danh sách sản phẩm...
                    </p>
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center whitespace-nowrap">
                    <i className="fa-solid fa-box-open text-4xl text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Không tìm thấy sản phẩm nào
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedProducts.map((product) => {
                  const prodId = product._id || (product as any).id || 0;
                  const isChecked = selectedIds.includes(prodId);
                  const stock =
                    product.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) ?? 45;
                  const price =
                    product.default_price ||
                    product.variants?.[0]?.price ||
                    (product as any).price ||
                    0;
                  const categoryName =
                    typeof product.category === "object"
                      ? (product.category as any)?.name
                      : product.category || "Thời trang";

                  return (
                    <tr
                      key={prodId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all ${
                        isChecked ? "bg-indigo-50/30 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(prodId)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Product details */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.main_img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.main_img}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <i className="fa-solid fa-shirt text-slate-400 dark:text-slate-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                              ID: #{prodId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold rounded-lg">
                          {categoryName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 text-xs font-black text-indigo-600 dark:text-[#EBC563] whitespace-nowrap">
                        {price.toLocaleString("vi-VN")}đ
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {stock}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            sp
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {stock === 0 ? (
                          <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-black rounded-lg uppercase">
                            Hết hàng
                          </span>
                        ) : stock < 10 ? (
                          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-black rounded-lg uppercase">
                            Sắp hết ({stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black rounded-lg uppercase">
                            Còn hàng
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product?id=${prodId}`}
                            target="_blank"
                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-slate-950 flex items-center justify-center text-xs transition-all"
                            title="Xem chi tiết"
                          >
                            <i className="fa-solid fa-eye" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(prodId, product.name)}
                            className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-all"
                            title="Xóa sản phẩm"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </AdminTable>
        </div>
      </div>

      {/* Infinity Scroll Footer Indicator */}
      <div className="py-4 flex flex-col items-center justify-center gap-2">
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-indigo-600 dark:text-[#EBC563] text-xs font-bold animate-pulse">
            <i className="fa-solid fa-circle-notch fa-spin text-sm" />
            <span>Đang tải thêm 12 sản phẩm tiếp theo...</span>
          </div>
        ) : visibleCount < products.length ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-2">
            <i className="fa-solid fa-arrow-down text-indigo-500 dark:text-[#D4AF37] animate-bounce" />
            Đã hiển thị {visibleCount} / {products.length} sản phẩm (Cuộn xuống để tải thêm)
          </p>
        ) : products.length > 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-circle-check" />
            Đã hiển thị toàn bộ {products.length} sản phẩm
          </p>
        ) : null}
      </div>
    </div>
  );
}