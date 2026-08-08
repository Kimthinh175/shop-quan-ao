"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../common/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const router = useRouter();
  
  const totalItems = getItemCount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      id="main-nav"
      className="sticky top-0 w-full z-[100] bg-white/90 dark:bg-[#171717]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#D4AF37]/20 shadow-sm transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-6">
        {/* Logo & Tagline */}
        <Link
          href="/"
          className="shrink-0 flex items-center gap-3 group md:h-12 overflow-hidden"
        >
          <img
            src="/closet-logo.png"
            alt="CLOSET Logo"
            className="h-10 md:h-20 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-slate-700 dark:text-slate-200">
          <li>
            <Link
              href="/shop"
              className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors py-2"
            >
              Sản phẩm
            </Link>
          </li>
          <li>
            <Link
              href="/shop?discount=true"
              className="hover:text-indigo-600 dark:hover:text-[#D4AF37] transition-colors py-2 text-red-500 dark:text-amber-400 font-extrabold"
            >
              Giảm giá
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors py-2"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/lookbook"
              className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors py-2"
            >
              Lookbook
            </Link>
          </li>
        </ul>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Tìm kiếm áo thun, quần jean..."
            className="w-full bg-slate-100 dark:bg-[#232223] text-sm border border-transparent dark:border-slate-800 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200 shrink-0">
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-[#232223] hover:bg-slate-200 dark:hover:bg-[#333] border border-slate-200 dark:border-[#D4AF37]/30 text-slate-700 dark:text-[#D4AF37] transition-all duration-300 shadow-sm active:scale-90"
            title={
              theme === "dark"
                ? "Chuyển sang Giao diện Sáng (Light)"
                : "Chuyển sang Giao diện Tối (Dark)"
            }
          >
            {theme === "dark" ? (
              <i className="fa-solid fa-sun text-amber-400 text-sm group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <i className="fa-solid fa-moon text-slate-700 text-sm group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* User Icon & Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                title="Tài khoản"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-[#D4AF37] flex items-center justify-center text-white dark:text-black text-sm font-bold shadow-sm overflow-hidden border border-slate-200">
                  {user.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#171717] border border-slate-100 dark:border-[#D4AF37]/30 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {user.phone || user.email}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                      <i className="fa-solid fa-star text-[8px]"></i> 1.250 điểm
                    </div>
                  </div>
                  <div className="py-1">
                    {[
                      {
                        href: "/profile",
                        icon: "fa-regular fa-user",
                        label: "Thông tin cá nhân",
                      },
                      {
                        href: "/orders",
                        icon: "fa-solid fa-receipt",
                        label: "Đơn hàng của tôi",
                      },
                      {
                        href: "/address",
                        icon: "fa-solid fa-location-dot",
                        label: "Sổ địa chỉ",
                      },
                    ].map(({ href, icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                      >
                        <i
                          className={`${icon} w-4 text-center text-slate-400 dark:text-slate-500`}
                        ></i>
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                    <button onClick={() => { logout(); setDropdownOpen(false); router.push('/login'); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full">
                      <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors text-lg"
              title="Đăng nhập"
            >
              <i className="fa-regular fa-user"></i>
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors text-lg flex items-center"
            title="Giỏ hàng"
          >
            <i className="fa-solid fa-cart-shopping"></i>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.15s ease; }
      `}</style>
    </nav>
  );
}
