'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import OrderSummary from '../../../components/client/OrderSummary';

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();
  const { items, removeFromCart, updateQuantity, getCartTotal, getItemCount } = cart;

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + 'đ';

  if (items.length === 0) {
    return (
      <main className="pt-28 pb-20 bg-slate-50 dark:bg-[#0B0B0B] min-h-screen transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <h1 className="font-serif text-4xl md:text-5xl font-black italic mb-10 text-slate-900 dark:text-white">Giỏ hàng của bạn.</h1>
          <div className="bg-white dark:bg-[#171717] border border-transparent dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-bag-shopping text-4xl text-slate-300 dark:text-slate-600"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Giỏ hàng trống</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-sm font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 dark:hover:bg-[#EBC563] transition-all">
              <i className="fa-solid fa-bag-shopping text-xs"></i> Khám phá ngay
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 bg-slate-50 dark:bg-[#0B0B0B] min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <h1 className="font-serif text-4xl md:text-5xl font-black italic mb-10 text-slate-900 dark:text-white">Giỏ hàng của bạn.</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Loyalty Banner */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-crown text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nhận ngay <span className="text-indigo-600 dark:text-indigo-400">Voucher -15%</span> khi tham gia CLOSET Club
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hoàn tiền trên mọi đơn hàng và nhiều ưu đãi độc quyền.</p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex-shrink-0">
                Tham gia
              </button>
            </div>

            {/* Cart Items List */}
            <div className="bg-white dark:bg-[#171717] border border-transparent dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="font-serif text-xl font-black italic text-slate-900 dark:text-white">Sản phẩm ({getItemCount()})</h2>
                <button onClick={() => cart.clearCart()} className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all">
                  <i className="fa-solid fa-trash-can mr-1"></i> Xóa tất cả
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={`${item.product_variant_id}-${item.size}-${item.color}-${idx}`} className="flex gap-5 pb-5 border-b border-slate-50 dark:border-slate-800/60 last:border-0 last:pb-0">
                  {/* Image */}
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                      {item.size && `Size: ${item.size}`}{item.color && ` | ${item.color}`}
                    </p>
                    <p className="text-sm font-black text-indigo-600 dark:text-[#EBC563] mt-2">{formatPrice(item.price)}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.product_variant_id, item.quantity - 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs"
                        >
                          <i className="fa-solid fa-minus text-[10px]"></i>
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-xs font-black text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_variant_id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                        </button>
                      </div>
                      <button
                         onClick={() => removeFromCart(item.product_variant_id, item.size, item.color)}
                        className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-[#EBC563]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-5">
              <OrderSummary
                itemCount={getItemCount()}
                subtotal={formatPrice(getCartTotal())}
                total={formatPrice(getCartTotal())}
                buttonText="Tiến hành thanh toán"
                onCheckout={() => router.push('/checkout')}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
