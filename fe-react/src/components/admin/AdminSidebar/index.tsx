"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  groupTitle: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(path);
  };

  const navSections: NavSection[] = [
    {
      groupTitle: "Kinh doanh & Bán hàng",
      items: [
        {
          label: "Tổng quan",
          href: "/admin",
          icon: "fa-chart-pie",
          exact: true,
        },
        {
          label: "Đơn hàng",
          href: "/admin/orders",
          icon: "fa-receipt",
          badge: "12",
          badgeColor: "bg-amber-500 text-slate-950 font-black",
        },
        {
          label: "Bán hàng (POS)",
          href: "/admin/pos",
          icon: "fa-cash-register",
          badge: "LIVE",
          badgeColor: "bg-emerald-500 text-white font-black animate-pulse",
        },
      ],
    },
    {
      groupTitle: "Quản lý Kho & Sản phẩm",
      items: [
        {
          label: "Sản phẩm",
          href: "/admin/products",
          icon: "fa-box",
        },
        {
          label: "Thêm sản phẩm",
          href: "/admin/add-product",
          icon: "fa-circle-plus",
        },
        {
          label: "Tồn kho",
          href: "/admin/inventory",
          icon: "fa-warehouse",
        },
        {
          label: "Danh mục",
          href: "/admin/categories",
          icon: "fa-tags",
        },
      ],
    },
    {
      groupTitle: "Hệ thống & Khách hàng",
      items: [
        {
          label: "Khách hàng",
          href: "/admin/customers",
          icon: "fa-users",
        },
        {
          label: "Hóa đơn & In",
          href: "/admin/invoice",
          icon: "fa-file-invoice-dollar",
        },
        {
          label: "Cài đặt hệ thống",
          href: "/admin/settings",
          icon: "fa-gear",
        },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#0B0F19] text-slate-300 flex flex-col py-5 px-3 shrink-0 border-r border-slate-800/80 shadow-2xl transition-all duration-300 relative z-40 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 mb-6 pb-4 border-b border-slate-800/80">
        <Link
          href="/admin"
          className="flex items-center gap-3 group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shrink-0 group-hover:scale-105 transition-transform">
            C
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-serif text-xl font-black text-white tracking-tight block leading-none">
                CLOSET.
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400 mt-1 block">
                Admin Panel
              </span>
            </div>
          )}
        </Link>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm shrink-0"
          title={collapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
        >
          <i
            className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"} text-xs`}
          />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-none pr-1">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 px-3 mb-2">
                {section.groupTitle}
              </h3>
            )}
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.href || pathname === `${item.href}/`
                : isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 font-extrabold border-l-4 border-amber-400 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-white"
                  }`}
                >
                  <i
                    className={`fa-solid ${item.icon} text-base w-6 text-center transition-transform group-hover:scale-110 ${
                      active
                        ? "text-amber-400"
                        : "text-slate-500 group-hover:text-slate-200"
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 truncate tracking-wide">
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase ${
                        item.badgeColor || "bg-indigo-600 text-white font-bold"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin User Profile & Switch Store Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        {!collapsed && (
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 text-xs font-bold transition-all"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-store text-xs" />
              <span>Xem Cửa hàng</span>
            </span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
          </Link>
        )}

        <div className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F19]" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-extrabold leading-tight truncate">
                Quản trị viên
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                admin@closet.vn
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
