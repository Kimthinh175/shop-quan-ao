"use client";

import { useState, useEffect, useCallback } from "react";
import ProductCard from "../../../components/client/ProductCard";
import Breadcrumb from "../../../components/client/Breadcrumb";
import SidebarFilter, {
  FilterOptionsData,
  ActiveFiltersState,
} from "../../../components/client/SidebarFilter";
import ProductSort from "../../../components/client/ProductSort";
import { productService } from "../../../services/productService";
import { Product } from "../../../types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>({});
  const [activeFilters, setActiveFilters] = useState<ActiveFiltersState>({});
  const [sortOption, setSortOption] = useState<string>("newest");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Infinity Scroll States (Tối đa 12 sản phẩm mỗi lần cuộn)
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // 1. Fetch Filter Metadata Options via ProductService
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const data = await productService.getFilterOptions();
        setFilterOptions(data);
      } catch (err) {
        console.warn("Failed to load filter options via productService", err);
      }
    }
    loadFilterOptions();
  }, []);

  // 2. Fetch Filtered Products via ProductService
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        limit: 100, // Load dataset to enable smooth 12-item batch infinite scroll
        sort: sortOption,
        ...activeFilters,
      });

      const items = Array.isArray(response)
        ? response
        : response.results || response.data || [];

      setProducts(items);
      setTotalCount(response.totalResults || response.total || items.length);
      setVisibleCount(12); // Reset to 12 items on new filter/sort
    } catch (err) {
      console.error("Error fetching filtered products via productService:", err);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, sortOption]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  // Window scroll listener for Infinity Scroll
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        if (visibleCount < products.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 12, products.length));
            setIsLoadingMore(false);
          }, 400);
        }
      }
    };

    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [visibleCount, products.length, isLoadingMore]);

  const handleResetFilters = () => {
    setActiveFilters({});
    setSortOption("newest");
  };

  const displayedProducts = products.slice(0, visibleCount);

  return (
    <div className="bg-[#faf9f6] dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {mobileFilterOpen && (
        <div
          onClick={() => setMobileFilterOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Filter */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-[#faf9f6] dark:bg-[#171717] text-slate-900 dark:text-slate-100 z-[160] shadow-2xl transition-transform duration-300 overflow-y-auto lg:hidden border-r border-slate-200 dark:border-slate-800 ${
          mobileFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
            Bộ lọc sản phẩm
          </h3>
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="p-6">
          <SidebarFilter
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={(newF) => {
              setActiveFilters(newF);
              setMobileFilterOpen(false);
            }}
            onReset={handleResetFilters}
          />
        </div>
      </aside>

      {/* Header Banner & Breadcrumb */}
      <header className="bg-slate-100/70 dark:bg-[#121212] border-b border-slate-200/80 dark:border-slate-800/80 py-10 transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Cửa hàng", href: "/shop" },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-[#EBC563]">
                Bộ Sưu Tập Quiet Luxury
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Tất Cả Sản Phẩm
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xl">
                Hiển thị {displayedProducts.length} / {totalCount} sản phẩm (Cuộn vô tận 12 sản phẩm / lượt cuộn).
              </p>
            </div>

            {/* Toolbar: Layout Grid Switch & Sort */}
            <div className="flex items-center gap-4 self-start md:self-auto">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-4 py-2.5 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-sliders" />
                <span>Bộ lọc</span>
              </button>

              <div className="hidden sm:flex items-center bg-white dark:bg-[#171717] border border-slate-200/80 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setGridCols(3)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    gridCols === 3
                      ? "bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                  title="Xem 3 cột"
                >
                  <i className="fa-solid fa-table-cells-large text-xs" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    gridCols === 4
                      ? "bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                  title="Xem 4 cột"
                >
                  <i className="fa-solid fa-[#fa-grid-2] fa-table-cells text-xs" />
                </button>
              </div>

              <ProductSort
                options={[
                  { value: "newest", label: "Sắp xếp: Mới nhất" },
                  { value: "best-seller", label: "Bán chạy nhất" },
                  { value: "price-asc", label: "Giá: Thấp → Cao" },
                  { value: "price-desc", label: "Giá: Cao → Thấp" },
                ]}
                defaultValue={sortOption}
                onChange={(newSort) => setSortOption(newSort)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Shop Section */}
      <main className="py-12 bg-[#faf9f6] dark:bg-[#0B0B0B] min-h-[60vh] transition-colors">
        <div className="container mx-auto px-4 md:px-8 flex gap-8 lg:gap-10">
          {/* Desktop Sidebar Filter */}
          <SidebarFilter
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={(newF) => setActiveFilters(newF)}
            onReset={handleResetFilters}
          />

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl aspect-[3/4] p-4 flex flex-col justify-end"
                  >
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center px-4 shadow-sm">
                <i className="fa-solid fa-box-open text-5xl text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                  Rất tiếc, không có sản phẩm nào khớp với các tiêu chí lọc hiện tại. Thử xóa bớt bộ lọc xem sao!
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 rounded-full text-xs font-bold hover:bg-indigo-700 dark:hover:bg-[#EBC563] transition-all shadow-md"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 ${
                    gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"
                  } gap-4 md:gap-6`}
                >
                  {displayedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Infinity Scroll Loading Footer Indicator */}
                <div className="pt-10 flex flex-col items-center justify-center gap-2">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-[#EBC563] text-xs font-bold animate-pulse">
                      <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                      <span>Đang tải thêm 12 sản phẩm...</span>
                    </div>
                  ) : visibleCount < products.length ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-2">
                      <i className="fa-solid fa-arrow-down text-indigo-500 dark:text-[#D4AF37] animate-bounce" />
                      Đã hiển thị {visibleCount} / {products.length} sản phẩm (Cuộn xuống để xem thêm)
                    </p>
                  ) : products.length > 0 ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check" />
                      Đã hiển thị toàn bộ {products.length} sản phẩm
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
