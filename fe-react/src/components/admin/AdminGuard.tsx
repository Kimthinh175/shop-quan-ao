"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        setAuthorized(false);
        router.push("/login?redirect=/admin");
      } else {
        setAuthorized(true);
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B0B0B]">
        <div className="w-12 h-12 border-4 border-indigo-600 dark:border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Đang xác thực quyền Quản Trị Viên...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B0B0B] p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mb-4">
          <i className="fa-solid fa-lock" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Yêu Cầu Đăng Nhập Quản Trị Viên
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          Bạn cần đăng nhập với tài khoản Quản trị (Admin) để có quyền thao tác dữ liệu.
        </p>
        <button
          onClick={() => router.push("/login?redirect=/admin")}
          className="px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
        >
          Đăng Nhập Admin Ngay
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
