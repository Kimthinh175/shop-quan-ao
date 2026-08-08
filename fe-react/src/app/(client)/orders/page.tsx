'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderService } from '../../../services/orderService';

const STATUS_CONFIG: Record<string, { label: string; icon: string; badge: string }> = {
  PENDING:  { label: 'Chờ xác nhận', icon: 'fa-clock',        badge: 'bg-amber-100  dark:bg-amber-950/60  text-amber-700  dark:text-amber-400  border border-amber-200  dark:border-amber-800' },
  CONFIRMED:{ label: 'Đã xác nhận',  icon: 'fa-check-double',  badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' },
  SHIPPING: { label: 'Đang giao',    icon: 'fa-truck',         badge: 'bg-sky-100    dark:bg-sky-950/60    text-sky-700    dark:text-sky-400    border border-sky-200    dark:border-sky-800' },
  COMPLETED:{ label: 'Hoàn thành',  icon: 'fa-circle-check',  badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' },
  CANCELLED:{ label: 'Đã hủy',      icon: 'fa-circle-xmark',  badge: 'bg-red-100    dark:bg-red-950/60    text-red-700    dark:text-red-400    border border-red-200    dark:border-red-800' },
};

const FILTERS = [
  { id: 'ALL',       label: 'Tất cả' },
  { id: 'PENDING',   label: 'Chờ xác nhận' },
  { id: 'CONFIRMED', label: 'Đã xác nhận' },
  { id: 'SHIPPING',  label: 'Đang giao' },
  { id: 'COMPLETED', label: 'Hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (activeFilter !== 'ALL') params.status = activeFilter;
      const res = await orderService.getMyOrders(params);
      setOrders(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + ' ₫';

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0B0B0B] min-h-screen py-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="text-sm font-medium mb-2 text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-[#D4AF37] transition-colors">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 dark:text-slate-600" />
            <span className="text-slate-800 dark:text-slate-200">Đơn hàng của tôi</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Đơn hàng của tôi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Theo dõi và quản lý tất cả đơn hàng bạn đã đặt.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 overflow-hidden">
          <div className="flex overflow-x-auto hide-scrollbar">
            {FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-1 min-w-[110px] py-4 text-center text-sm font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'text-indigo-600 dark:text-[#D4AF37] border-b-2 border-indigo-600 dark:border-[#D4AF37] bg-indigo-50/50 dark:bg-[#D4AF37]/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#D4AF37] hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b-2 border-transparent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-5">
          {loading ? (
            <div className="bg-white dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 dark:border-[#D4AF37] border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-box-open text-4xl text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không có đơn hàng nào</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Bạn chưa có đơn hàng nào trong trạng thái này.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 font-bold text-sm hover:bg-indigo-700 dark:hover:bg-[#EBC563] transition-all"
              >
                <i className="fa-solid fa-bag-shopping" />
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || { label: order.status, icon: 'fa-circle', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' };
              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md dark:hover:shadow-slate-900 transition-all group"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-black text-slate-900 dark:text-white text-base">
                        #{order.order_code || order._id}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <i className="fa-regular fa-clock mr-1" />
                        {formatDate(order.create_at || order.createdAt)}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                      <i className={`fa-solid ${cfg.icon} text-[9px]`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 px-5">
                    {(order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-18 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={item.variant_snapshot?.main_img || 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&w=150&q=80'}
                            alt={item.variant_snapshot?.name || 'Sản phẩm'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                            {item.variant_snapshot?.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Màu: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.variant_snapshot?.color || 'Mặc định'}</span>
                            {' · '}
                            Size: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.variant_snapshot?.size || 'Mặc định'}</span>
                          </p>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                            x{item.total_quantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-indigo-600 dark:text-[#EBC563] text-sm">
                            {formatPrice(item.unit_price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Tổng tiền:</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-[#EBC563]">
                        {formatPrice(order.total_amount || order.total_price || 0)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {order.payment_method === 'TRANSFER' && order.payment_status !== 'PAID' && order.payos_checkout_url && (
                        <Link
                          href={order.payos_checkout_url}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-indigo-500 dark:border-[#D4AF37] text-indigo-600 dark:text-[#D4AF37] hover:bg-indigo-50 dark:hover:bg-[#D4AF37]/10 transition-colors"
                        >
                          <i className="fa-solid fa-credit-card mr-1.5" />
                          Thanh toán ngay
                        </Link>
                      )}
                      <Link
                        href={`/order-complete?orderId=${order._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <i className="fa-solid fa-eye mr-1.5" />
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
