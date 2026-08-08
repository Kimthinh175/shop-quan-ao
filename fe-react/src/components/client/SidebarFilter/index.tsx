"use client";

import { useState, ReactNode } from "react";
import styles from "./SidebarFilter.module.css";

export interface FilterOptionItem {
  _id?: number | string;
  id?: number | string;
  name: string;
}

export interface FilterOptionsData {
  categories?: FilterOptionItem[];
  brands?: FilterOptionItem[];
  seasons?: FilterOptionItem[];
  genders?: FilterOptionItem[];
  materials?: FilterOptionItem[];
  forms?: FilterOptionItem[];
  sports?: FilterOptionItem[];
  sizes?: string[];
  colors?: string[];
}

export interface ActiveFiltersState {
  category_id?: number | string | null;
  brand_id?: number | string | null;
  season_id?: number | string | null;
  gender_id?: number | string | null;
  sport_id?: number | string | null;
  material_id?: number | string | null;
  form_id?: number | string | null;
  min_price?: number | null;
  max_price?: number | null;
  size?: string | null;
  color?: string | null;
}

export interface SidebarFilterProps {
  filterOptions?: FilterOptionsData;
  activeFilters: ActiveFiltersState;
  onFilterChange: (newFilters: ActiveFiltersState) => void;
  onReset: () => void;
  isMobile?: boolean;
}

function FilterSection({
  title,
  icon,
  children,
  badgeCount = 0,
  defaultOpen = true,
}: {
  title: string;
  icon?: string;
  children: ReactNode;
  badgeCount?: number;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="filter-section pb-5 mb-5 border-b border-slate-200/70 dark:border-slate-800/80 last:border-b-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center mb-3.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-800 dark:text-slate-200 focus:outline-none hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors group"
      >
        <span className="flex items-center gap-2">
          {icon && <i className={`${icon} text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-[#EBC563] transition-colors`} />}
          <span>{title}</span>
          {badgeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[9px] font-black shadow-sm">
              {badgeCount}
            </span>
          )}
        </span>
        <i
          className={`fa-solid ${
            isOpen ? "fa-chevron-up" : "fa-chevron-down"
          } text-[9px] text-slate-400 dark:text-slate-500 transition-transform duration-300`}
        />
      </button>
      <div
        className={`space-y-2.5 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function SidebarFilter({
  filterOptions = {},
  activeFilters,
  onFilterChange,
  onReset,
  isMobile = false,
}: SidebarFilterProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [customMin, setCustomMin] = useState<string>("");
  const [customMax, setCustomMax] = useState<string>("");

  const categories = filterOptions.categories || [];
  const sports = filterOptions.sports || [];
  const genders = filterOptions.genders || [];
  const brands = filterOptions.brands || [];
  const materials = filterOptions.materials || [];
  const sizes = filterOptions.sizes || ["S", "M", "L", "XL", "2XL"];
  const colors = filterOptions.colors || ["Đen", "Xám", "Trắng", "Xanh Navy", "Nâu Tây", "Rêu"];

  // Active filter count
  const activeCount = Object.values(activeFilters).filter(
    (val) => val !== null && val !== undefined
  ).length;

  const handleCategorySelect = (id: number | string) => {
    const nextVal = activeFilters.category_id === id ? null : id;
    onFilterChange({ ...activeFilters, category_id: nextVal });
  };

  const handleGenderSelect = (id: number | string) => {
    const nextVal = activeFilters.gender_id === id ? null : id;
    onFilterChange({ ...activeFilters, gender_id: nextVal });
  };

  const handleSportSelect = (id: number | string) => {
    const nextVal = activeFilters.sport_id === id ? null : id;
    onFilterChange({ ...activeFilters, sport_id: nextVal });
  };

  const handleBrandSelect = (id: number | string) => {
    const nextVal = activeFilters.brand_id === id ? null : id;
    onFilterChange({ ...activeFilters, brand_id: nextVal });
  };

  const handleMaterialSelect = (id: number | string) => {
    const nextVal = activeFilters.material_id === id ? null : id;
    onFilterChange({ ...activeFilters, material_id: nextVal });
  };

  const handleSizeSelect = (sz: string) => {
    const nextVal = activeFilters.size === sz ? null : sz;
    onFilterChange({ ...activeFilters, size: nextVal });
  };

  const handleColorSelect = (clr: string) => {
    const nextVal = activeFilters.color === clr ? null : clr;
    onFilterChange({ ...activeFilters, color: nextVal });
  };

  const handlePriceRangeSelect = (min: number | null, max: number | null) => {
    if (activeFilters.min_price === min && activeFilters.max_price === max) {
      onFilterChange({ ...activeFilters, min_price: null, max_price: null });
    } else {
      onFilterChange({ ...activeFilters, min_price: min, max_price: max });
    }
  };

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = customMin ? Number(customMin) : null;
    const max = customMax ? Number(customMax) : null;
    onFilterChange({ ...activeFilters, min_price: min, max_price: max });
  };

  // Helper to remove individual filter item
  const removeFilter = (key: keyof ActiveFiltersState) => {
    onFilterChange({ ...activeFilters, [key]: null });
  };

  // If collapsed on desktop: show compact mini rail
  if (isSidebarCollapsed && !isMobile) {
    return (
      <aside className="hidden lg:flex flex-col items-center w-14 shrink-0 self-start sticky top-28 bg-white/90 dark:bg-[#171717]/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl py-4 shadow-xl backdrop-blur-md transition-all duration-300">
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all shadow-sm"
          title="Mở rộng bộ lọc"
        >
          <i className="fa-solid fa-sliders text-sm" />
        </button>
        {activeCount > 0 && (
          <span className="mt-3 w-5 h-5 rounded-full bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {activeCount}
          </span>
        )}
      </aside>
    );
  }

  return (
    <aside
      className={
        isMobile
          ? "w-full"
          : `hidden lg:block w-64 shrink-0 self-start sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-1.5 bg-white/90 dark:bg-[#171717]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl transition-all duration-300 ${styles.filterSidebarScroll}`
      }
    >
      {/* Sidebar Top Header */}
      <div className="flex justify-between items-center mb-5 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-[#fa-sliders] fa-filter-list text-xs text-indigo-600 dark:text-[#EBC563]" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
            Bộ lọc
          </h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-amber-950/60 text-indigo-600 dark:text-amber-300 text-[10px] font-black border border-indigo-200 dark:border-amber-800/40">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="text-[9px] font-black uppercase tracking-wider text-red-500 dark:text-amber-400 hover:underline transition-all"
            >
              Xóa tất cả
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs transition-colors p-1"
              title="Thu gọn bộ lọc"
            >
              <i className="fa-solid fa-compress text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Summary */}
      {activeCount > 0 && (
        <div className="mb-5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
            Đang lọc theo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.category_id && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold border border-slate-200 dark:border-slate-700 shadow-sm">
                {categories.find((c) => (c._id || c.id) === activeFilters.category_id)?.name || "Danh mục"}
                <button onClick={() => removeFilter("category_id")} className="hover:text-red-500 ml-0.5">
                  <i className="fa-solid fa-xmark text-[9px]" />
                </button>
              </span>
            )}
            {activeFilters.size && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold border border-slate-200 dark:border-slate-700 shadow-sm">
                Size: {activeFilters.size}
                <button onClick={() => removeFilter("size")} className="hover:text-red-500 ml-0.5">
                  <i className="fa-solid fa-xmark text-[9px]" />
                </button>
              </span>
            )}
            {activeFilters.color && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold border border-slate-200 dark:border-slate-700 shadow-sm">
                Màu: {activeFilters.color}
                <button onClick={() => removeFilter("color")} className="hover:text-red-500 ml-0.5">
                  <i className="fa-solid fa-xmark text-[9px]" />
                </button>
              </span>
            )}
            {(activeFilters.min_price !== null && activeFilters.min_price !== undefined) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold border border-slate-200 dark:border-slate-700 shadow-sm">
                Giá lọc
                <button onClick={() => { removeFilter("min_price"); removeFilter("max_price"); }} className="hover:text-red-500 ml-0.5">
                  <i className="fa-solid fa-xmark text-[9px]" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection
          title="Danh mục"
          icon="fa-solid fa-tags"
          badgeCount={activeFilters.category_id ? 1 : 0}
        >
          {categories.map((item) => {
            const itemId = item._id || item.id;
            const isChecked = activeFilters.category_id === itemId;
            return (
              <button
                key={itemId}
                type="button"
                onClick={() => itemId && handleCategorySelect(itemId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  isChecked
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md font-extrabold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{item.name}</span>
                {isChecked && <i className="fa-solid fa-check text-[10px]" />}
              </button>
            );
          })}
        </FilterSection>
      )}

      {/* Genders */}
      {genders.length > 0 && (
        <FilterSection
          title="Giới tính"
          icon="fa-solid fa-user-group"
          badgeCount={activeFilters.gender_id ? 1 : 0}
        >
          <div className="grid grid-cols-2 gap-2">
            {genders.map((item) => {
              const itemId = item._id || item.id;
              const isChecked = activeFilters.gender_id === itemId;
              return (
                <button
                  key={itemId}
                  type="button"
                  onClick={() => itemId && handleGenderSelect(itemId)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                    isChecked
                      ? "bg-slate-950 dark:bg-[#D4AF37] text-white dark:text-slate-950 border-slate-950 dark:border-[#D4AF37] shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      <FilterSection
        title="Kích thước"
        icon="fa-solid fa-ruler"
        badgeCount={activeFilters.size ? 1 : 0}
      >
        <div className="grid grid-cols-5 gap-1.5">
          {sizes.map((sz) => {
            const isActive = activeFilters.size === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleSizeSelect(sz)}
                className={`py-2 text-xs font-black rounded-xl transition-all border outline-none text-center ${
                  isActive
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 border-indigo-600 dark:border-[#D4AF37] shadow-md scale-105"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection
        title="Màu sắc"
        icon="fa-solid fa-[#fa-palette] fa-palette"
        badgeCount={activeFilters.color ? 1 : 0}
      >
        <div className="flex flex-wrap gap-2.5 pt-1">
          {colors.map((clrItem) => {
            const clrName = typeof clrItem === "string" ? clrItem : (clrItem as any).name || (clrItem as any).color || "";
            const isActive = activeFilters.color === clrName;

            const getColorHex = (name: string): string => {
              const str = name.trim().toLowerCase();
              const map: Record<string, string> = {
                black: "#171717",
                grey: "#64748b",
                gray: "#64748b",
                navy: "#1e1b4b",
                red: "#dc2626",
                white: "#ffffff",
                blue: "#2563eb",
                green: "#16a34a",
                yellow: "#eab308",
                pink: "#f43f5e",
                brown: "#78350f",
                purple: "#9333ea",
                orange: "#ea580c",
                "xanh dương": "#2563eb",
                "xanh lá": "#16a34a",
                "xanh navy": "#1e1b4b",
                "xám": "#64748b",
                "đen": "#171717",
                "đỏ": "#dc2626",
                "trắng": "#ffffff",
                "hồng": "#f43f5e",
                "vàng": "#eab308",
                "nâu": "#78350f",
                "nâu tây": "#78350f",
                "rêu": "#3f6212",
              };
              if (map[str]) return map[str];
              for (const [key, hex] of Object.entries(map)) {
                if (str.includes(key) || key.includes(str)) return hex;
              }
              return "#475569";
            };

            const bgHex = (clrItem as any).color_hex || getColorHex(clrName);
            const isWhite = bgHex.toLowerCase() === "#ffffff" || clrName.toLowerCase() === "white" || clrName.toLowerCase() === "trắng";

            return (
              <button
                key={clrName}
                type="button"
                onClick={() => handleColorSelect(clrName)}
                className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                  isActive
                    ? "ring-2 ring-indigo-600 dark:ring-[#D4AF37] ring-offset-2 dark:ring-offset-[#171717] scale-110 shadow-md"
                    : "border-slate-300 dark:border-slate-700 hover:scale-105"
                }`}
                style={{ backgroundColor: bgHex }}
                title={clrName}
              >
                {isActive && (
                  <i
                    className={`fa-solid fa-check text-[10px] ${
                      isWhite ? "text-slate-950" : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Khoảng giá"
        icon="fa-solid fa-[#fa-money-bill-wave] fa-coins"
        badgeCount={activeFilters.min_price !== null && activeFilters.min_price !== undefined ? 1 : 0}
      >
        <div className="space-y-1.5">
          {[
            { label: "Tất cả mức giá", min: null, max: null },
            { label: "Dưới 200.000đ", min: 0, max: 200000 },
            { label: "200.000đ – 400.000đ", min: 200000, max: 400000 },
            { label: "400.000đ – 700.000đ", min: 400000, max: 700000 },
            { label: "Trên 700.000đ", min: 700000, max: null },
          ].map((range, idx) => {
            const isSelected =
              activeFilters.min_price === range.min && activeFilters.max_price === range.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePriceRangeSelect(range.min, range.max)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md font-extrabold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <i className="fa-solid fa-check text-[10px]" />}
              </button>
            );
          })}
        </div>

        {/* Custom Price Range Input */}
        <form onSubmit={handleApplyCustomPrice} className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Tự nhập khoảng giá:
          </span>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              placeholder="Từ đ"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              placeholder="Đến đ"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] text-white dark:text-slate-100 dark:hover:text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all"
          >
            Áp dụng giá
          </button>
        </form>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection
          title="Thương hiệu"
          icon="fa-solid fa-award"
          badgeCount={activeFilters.brand_id ? 1 : 0}
        >
          {brands.map((item) => {
            const itemId = item._id || item.id;
            const isChecked = activeFilters.brand_id === itemId;
            return (
              <button
                key={itemId}
                type="button"
                onClick={() => itemId && handleBrandSelect(itemId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  isChecked
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md font-extrabold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{item.name}</span>
                {isChecked && <i className="fa-solid fa-check text-[10px]" />}
              </button>
            );
          })}
        </FilterSection>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <FilterSection
          title="Chất liệu"
          icon="fa-solid fa-shirt"
          badgeCount={activeFilters.material_id ? 1 : 0}
        >
          {materials.map((item) => {
            const itemId = item._id || item.id;
            const isChecked = activeFilters.material_id === itemId;
            return (
              <button
                key={itemId}
                type="button"
                onClick={() => itemId && handleMaterialSelect(itemId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  isChecked
                    ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-md font-extrabold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{item.name}</span>
                {isChecked && <i className="fa-solid fa-check text-[10px]" />}
              </button>
            );
          })}
        </FilterSection>
      )}
    </aside>
  );
}
