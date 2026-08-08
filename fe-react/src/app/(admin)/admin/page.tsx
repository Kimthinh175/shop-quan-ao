"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminStatsCard from "../../../components/admin/AdminStatsCard";
import RevenueChart from "../../../components/admin/RevenueChart";
import CategoryChart from "../../../components/admin/CategoryChart";
import { reportService, DashboardStatsResponse } from "../../../services/reportService";

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilterPopover, setShowFilterPopover] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const data = await reportService.getDashboardStats();
        setStatsData(data);
      } catch (err) {
        console.error("Error fetching BE dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const overview = statsData?.overview || {
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    newCustomers: 0,
  };

  const revenueChartData = statsData?.charts?.revenue7Days || [];
  const categoryChartData = statsData?.charts?.categories || [];
  const topProducts = statsData?.topProducts || [];
  const lowStock = statsData?.lowStock || [];
  const recentOrders = statsData?.recentOrders || [];

  const formatStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
            Hoàn tất
          </span>
        );
      case "SHIPPING":
        return (
          <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
            Đang giao
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
            Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-[#0B0B0B] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header & Date Range Selection */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Chào buổi sáng, Quản trị viên! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Dưới đây là tổng quan kết quả kinh doanh và báo cáo doanh số cửa hàng.
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="flex items-center bg-white dark:bg-[#171717] rounded-2xl p-1 border border-slate-200/80 dark:border-slate-800 gap-1 shadow-sm">
            <button className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <i className="fa-solid fa-chevron-left mr-1" /> Tháng trước
            </button>
            <button className="px-5 py-2 text-xs font-black text-white dark:text-slate-950 bg-indigo-600 dark:bg-[#D4AF37] rounded-xl shadow-md">
              Tháng 7, 2026
            </button>
            <button className="px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed">
              Tháng sau <i className="fa-solid fa-chevron-right ml-1" />
            </button>
          </div>

          <button
            onClick={() => setShowFilterPopover(!showFilterPopover)}
            className="w-10 h-10 bg-white dark:bg-[#171717] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#EBC563] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            title="Lọc ngày"
          >
            <i className="fa-solid fa-sliders" />
          </button>

          {/* Date Filter Popover */}
          {showFilterPopover && (
            <div className="absolute top-12 right-0 mt-2 bg-white dark:bg-[#171717] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-72 z-50 animate-fade-in">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">
                Tuỳ chỉnh thời gian
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilterPopover(false)}
                className="w-full mt-5 py-2.5 bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 font-black rounded-xl text-sm shadow-md hover:bg-indigo-700 dark:hover:bg-[#EBC563] transition-all"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-600 dark:text-[#D4AF37]" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Đang tải dữ liệu từ Backend...
          </p>
        </div>
      ) : (
        <>
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <AdminStatsCard
              title="Tổng doanh thu"
              value={`${overview.totalRevenue.toLocaleString("vi-VN")}đ`}
              icon="fa-solid fa-dollar-sign"
              colorClass="emerald"
            />
            <AdminStatsCard
              title="Tổng đơn hàng"
              value={String(overview.totalOrders)}
              icon="fa-solid fa-cart-shopping"
              colorClass="indigo"
            />
            <AdminStatsCard
              title="Lợi nhuận ước tính"
              value={`${overview.totalProfit.toLocaleString("vi-VN")}đ`}
              icon="fa-solid fa-chart-line"
              colorClass="amber"
            />
            <AdminStatsCard
              title="Khách hàng mới"
              value={String(overview.newCustomers)}
              icon="fa-solid fa-users"
              colorClass="sky"
            />
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Revenue 7 Days Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Doanh thu 7 ngày gần nhất
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Xu hướng doanh thu thực tế từ Backend
                  </p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-amber-950/60 border border-indigo-100 dark:border-amber-800/40 text-indigo-600 dark:text-amber-400 text-xs font-black rounded-full">
                  Live API
                </span>
              </div>

              <RevenueChart data={revenueChartData} />
            </div>

            {/* Top Category Donut Breakdown */}
            <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Tỷ trọng danh mục
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Số lượng sản phẩm theo danh mục
                  </p>
                </div>
              </div>

              <CategoryChart categories={categoryChartData} />
            </div>
          </div>

          {/* Top Selling Products & Low Stock Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Top Selling Products */}
            <div className="lg:col-span-2 bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Sản phẩm bán chạy nhất
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Dữ liệu doanh số bán ra thực tế
                  </p>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs font-bold text-indigo-600 dark:text-[#EBC563] hover:underline"
                >
                  Quản lý sản phẩm →
                </Link>
              </div>

              <div className="space-y-4 flex-1">
                {topProducts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">
                    Chưa có dữ liệu sản phẩm bán chạy
                  </div>
                ) : (
                  topProducts.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all border border-slate-100/60 dark:border-slate-800/60"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.main_img ? (
                            <img
                              src={p.main_img}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fa-solid fa-shirt text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                            {p.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                            Mã SKU: {p.sku}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-indigo-600 dark:text-[#EBC563]">
                          Đã bán: {p.sold} cái
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          Tồn kho: {p.quantity}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Warning */}
            <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <i className="fa-solid fa-triangle-exclamation text-xs" />
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Sắp hết hàng
                  </h2>
                </div>
                <Link
                  href="/admin/inventory"
                  className="text-xs font-bold text-indigo-600 dark:text-[#EBC563] hover:underline"
                >
                  Nhập hàng →
                </Link>
              </div>

              <div className="space-y-3.5 flex-1">
                {lowStock.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">
                    Tất cả sản phẩm đều đủ tồn kho
                  </div>
                ) : (
                  lowStock.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/30 rounded-2xl border border-red-100/60 dark:border-red-900/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                          {item.main_img ? (
                            <img
                              src={item.main_img}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fa-solid fa-box text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-black rounded-lg shrink-0">
                        Còn {item.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white dark:bg-[#171717] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Đơn hàng mới nhất
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Danh sách đơn hàng vừa được ghi nhận trong cơ sở dữ liệu
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-indigo-600 dark:text-[#EBC563] hover:underline"
              >
                Tất cả đơn hàng →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-white dark:bg-[#171717]">
                    <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      Mã ĐH
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      Loại đơn
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold"
                      >
                        Chưa có đơn hàng nào trong hệ thống
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => (
                      <tr
                        key={ord._id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                      >
                        <td className="px-6 py-4 font-extrabold text-indigo-600 dark:text-[#EBC563] text-sm">
                          #{ord._id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {ord.receiver_name || ord.customer_info?.full_name || "Khách hàng"}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                            {ord.createdAt
                              ? new Date(ord.createdAt).toLocaleDateString("vi-VN")
                              : "Gần đây"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {ord.is_pos ? "Bán tại quầy (POS)" : "Đơn hàng Online"}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                          {(ord.total_amount || 0).toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatStatusBadge(ord.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}