'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { orderService, OrderResponse } from '../../../services/orderService';

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      orderService.getOrderById(orderId)
        .then(res => {
          setOrderData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi tải đơn hàng:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const formatPrice = (p?: number) => (p || 0).toLocaleString('vi-VN') + 'đ';

  const order = orderData?.order || orderData;
  const items = orderData?.items || order?.items || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 dark:border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center text-slate-900 dark:text-white">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-file-circle-exclamation text-3xl text-slate-400"></i>
        </div>
        <h1 className="text-2xl font-bold mb-3">Không tìm thấy đơn hàng</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền xem.</p>
        <Link href="/" className="px-8 py-3 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-sm font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 dark:hover:bg-[#EBC563] transition-all">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ================== TOPBAR LOGO ================== */}
      <header className="w-full flex justify-center items-center py-7 px-4 border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="logo-text text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">CLOSET.</Link>
      </header>

      {/* ================== MAIN CONTENT ================== */}
      <main className="mx-auto px-4 pb-12 w-full max-w-xl text-slate-900 dark:text-white">
        {/* ── Success Hero ── */}
        <section className="text-center pt-12 pb-8">
          <div className="flex justify-center mb-7">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <i className="fa-solid fa-check text-4xl text-white"></i>
              </div>
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl italic font-bold mb-4">
            Đặt hàng thành công!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
            Cảm ơn bạn đã tin tưởng <strong className="text-slate-900 dark:text-white">CLOSET.</strong> Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200/60 dark:border-slate-700">
            <i className="fa-solid fa-receipt text-slate-500 dark:text-slate-400"></i>
            <span className="text-sm font-bold">Mã đơn hàng: {order.order_code || order._id}</span>
          </div>
        </section>

        {/* ── Order Summary Card ── */}
        <section className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden mb-8">
          {/* Shipping info */}
          <div className="p-6">
            <h2 className="font-serif text-lg italic font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-indigo-600 dark:text-[#EBC563] text-sm"></i>
              Thông tin giao hàng
            </h2>
            <div className="space-y-2">
              <div className="flex gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">Họ tên</span>
                <span className="font-medium">{order.receiver_name}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">Điện thoại</span>
                <span className="font-medium">{order.receiver_phone}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">Địa chỉ</span>
                <span className="font-medium">{order.receiver_address}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800 mx-6" />

          {/* Products */}
          <div className="p-6">
            <h2 className="font-serif text-lg italic font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-bag-shopping text-indigo-600 dark:text-[#EBC563] text-sm"></i>
              Sản phẩm đã đặt
            </h2>
            <div className="space-y-4">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.variant_snapshot?.main_img || item.image || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={item.variant_snapshot?.name || item.name || 'Sản phẩm'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold line-clamp-1">{item.variant_snapshot?.name || item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {(item.variant_snapshot?.size || item.size) && `Size: ${item.variant_snapshot?.size || item.size}`}
                      {(item.variant_snapshot?.color || item.color) && ` | ${item.variant_snapshot?.color || item.color}`}
                      {' - SL: '}{item.total_quantity || item.quantity || 1}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-indigo-600 dark:text-[#EBC563]">
                      {formatPrice((item.unit_price || item.price || 0) * (item.total_quantity || item.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800 mx-6" />

          {/* Totals & payment */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Phương thức thanh toán</span>
              <span className="text-sm font-bold flex items-center gap-1.5">
                {order.payment_method === 'COD' ? (
                  <><i className="fa-solid fa-money-bill-wave text-green-500"></i> Thanh toán khi nhận hàng (COD)</>
                ) : (
                  <><i className="fa-solid fa-building-columns text-blue-500"></i> Chuyển khoản ngân hàng</>
                )}
              </span>
            </div>
            {order.payment_method === 'TRANSFER' && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">Trạng thái thanh toán</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'}`}>
                  {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold">Tổng cộng</span>
              <span className="text-xl font-black text-indigo-600 dark:text-[#EBC563]">{formatPrice(order.total_amount || order.total_price)}</span>
            </div>
          </div>
        </section>

        {/* ── Action Buttons ── */}
        <section className="flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="px-6 py-3 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-sm font-bold rounded-full hover:bg-indigo-600 dark:hover:bg-[#EBC563] transition-colors flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping"></i> Tiếp tục mua sắm
          </Link>
          <Link href="/orders" className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <i className="fa-solid fa-list-check"></i> Xem đơn hàng
          </Link>
        </section>
      </main>
    </>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 dark:border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  );
}