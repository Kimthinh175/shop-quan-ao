"use client";

import { ChangeEvent } from "react";

export interface SortOption {
  value: string;
  label: string;
}

export interface ProductSortProps {
  options: SortOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function ProductSort({
  options,
  defaultValue,
  onChange,
}: ProductSortProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="relative">
      <select
        onChange={handleChange}
        defaultValue={defaultValue}
        className="appearance-none text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 pr-10 bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-xl outline-none cursor-pointer text-slate-700 dark:text-slate-200 focus:border-slate-900 dark:focus:border-[#D4AF37] transition-all shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#171717] text-slate-900 dark:text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      <i className="fa-solid fa-chevron-down text-[9px] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500" />
    </div>
  );
}
