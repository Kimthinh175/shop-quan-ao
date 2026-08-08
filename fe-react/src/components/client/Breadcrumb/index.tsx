"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "mb-4" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center flex-wrap gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2 md:gap-3">
            {item.href ? (
              <Link href={item.href} className="hover:text-slate-900 dark:hover:text-[#EBC563] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 dark:text-amber-300 line-clamp-1">{item.label}</span>
            )}
            {!isLast && <span className="opacity-40">/</span>}
          </div>
        );
      })}
    </nav>
  );
}
