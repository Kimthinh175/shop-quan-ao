"use client";

import { useTheme } from "../../common/ThemeProvider";

export default function AdminHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 md:h-20 bg-white/90 dark:bg-[#171717]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 md:px-8 flex items-center justify-between shrink-0 transition-colors duration-300 relative z-30">
      {/* Quick Search */}
      <div className="relative w-72 md:w-96">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng..."
          className="w-full pl-11 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all shadow-inner"
        />
        <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-400 bg-slate-200 dark:bg-slate-700 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-sm"
          title={theme === "dark" ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <i className="fa-solid fa-sun text-base text-amber-400 animate-spin-slow" />
          ) : (
            <i className="fa-solid fa-moon text-base text-slate-700" />
          )}
        </button>

        {/* Notifications Bell */}
        <button
          className="relative w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-sm"
          title="Thông báo hệ thống"
        >
          <i className="fa-solid fa-bell text-sm" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        {/* Admin Profile Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
              Thịnh Admin
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-amber-400 mt-0.5">
              Super Admin
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-[#D4AF37] flex items-center justify-center text-white dark:text-slate-950 font-black text-sm shadow-md">
              T
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#171717]" />
          </div>
        </div>
      </div>
    </header>
  );
}
