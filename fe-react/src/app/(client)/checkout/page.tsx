'use client';

import { useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import OrderSummary from '../../../components/client/OrderSummary';
import CheckoutForm, { CheckoutFormData } from '../../../components/client/CheckoutForm';
import PaymentMethods from '../../../components/client/PaymentMethods';
import { orderService } from '../../../services/orderService';

interface CheckoutState {
  formData: CheckoutFormData | null;
  paymentMethod: string;
  shippingMethod: 'standard' | 'express';
  isSubmitting: boolean;
  error: string | null;
}

type CheckoutAction =
  | { type: 'SET_FORM_DATA'; payload: CheckoutFormData | null }
  | { type: 'SET_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_SHIPPING_METHOD'; payload: 'standard' | 'express' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialCheckoutState: CheckoutState = {
  formData: null,
  paymentMethod: 'COD',
  shippingMethod: 'standard',
  isSubmitting: false,
  error: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_SHIPPING_METHOD':
      return { ...state, shippingMethod: action.payload };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, error: null };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { isAuthenticated } = useAuth();
  const { items, getCartTotal, getItemCount, clearCart } = cart;

  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);
  const { formData, paymentMethod, shippingMethod, isSubmitting, error } = state;

  const shippingFee = shippingMethod === 'express' ? 30000 : 0;
  const totalWithShipping = getCartTotal() + shippingFee;

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + 'đ';

  const handlePlaceOrder = async () => {
    if (!formData?.fullName || !formData?.phone || !formData?.address) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ chi tiết.' });
      return;
    }
    if (items.length === 0) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Giỏ hàng trống. Vui lòng thêm sản phẩm.' });
      return;
    }

    dispatch({ type: 'SUBMIT_START' });

    try {
      const fullAddress = formData.address;

      const orderPayload = {
        receiver_name: formData.fullName.trim(),
        receiver_phone: formData.phone,
        receiver_address: fullAddress,
        note: formData.note || '',
        payment_method: paymentMethod as 'COD' | 'TRANSFER',
        items: items.map(item => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          color: item.color,
          size: item.size,
          image: item.image,
        })),
      };

      const result = await orderService.createOrder(orderPayload);
      const createdOrder = (result as any)?.order || result;
      const orderId = createdOrder?._id || createdOrder?.order_code || result?._id || '';

      dispatch({ type: 'SUBMIT_SUCCESS' });

      if (orderId) {
        clearCart();
        const payosUrl = result?.payos_checkout_url || (result as any)?.payosData?.checkoutUrl || (result as any)?.payosData?.checkout_url;

        // If TRANSFER and has PayOS checkout URL, redirect to payment
        if (paymentMethod === 'TRANSFER' && payosUrl) {
          window.location.href = payosUrl;
          return;
        }

        router.push(`/order-complete?orderId=${orderId}`);
      } else {
        clearCart();
        router.push('/order-complete');
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      dispatch({ type: 'SUBMIT_ERROR', payload: err?.message || 'Đặt hàng thất bại. Vui lòng thử lại.' });
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center py-20">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-bag-shopping text-4xl text-slate-300 dark:text-slate-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Chưa có sản phẩm để thanh toán</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-sm font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 dark:hover:bg-[#EBC563] transition-all">
            <i className="fa-solid fa-bag-shopping text-xs"></i> Mua sắm ngay
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <h1 className="font-serif text-4xl md:text-5xl font-black italic mb-10 text-slate-900 dark:text-white">Thanh toán.</h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-red-500"></i>
              <span className="text-sm font-bold text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
            {/* LEFT: Checkout Form */}
            <div className="lg:col-span-7 space-y-6">
              <CheckoutForm onChange={(data) => dispatch({ type: 'SET_FORM_DATA', payload: data })} />

              {/* Shipping Method */}
              <div className="card">
                <span className="section-label">Phương thức giao hàng</span>
                <div className="space-y-3">
                  <label
                    className={`pay-opt ${shippingMethod === 'standard' ? 'active' : ''} cursor-pointer`}
                    onClick={() => dispatch({ type: 'SET_SHIPPING_METHOD', payload: 'standard' })}
                  >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-truck text-orange-500 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Giao hàng tiêu chuẩn</p>
                      <p className="text-xs text-slate-400 mt-0.5">Dự kiến 3–5 ngày làm việc</p>
                    </div>
                    <span className="text-xs font-black text-green-600 dark:text-green-400">Miễn phí</span>
                  </label>

                  <label
                    className={`pay-opt ${shippingMethod === 'express' ? 'active' : ''} cursor-pointer`}
                    onClick={() => dispatch({ type: 'SET_SHIPPING_METHOD', payload: 'express' })}
                  >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-bolt text-indigo-500 dark:text-indigo-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Giao hàng nhanh</p>
                      <p className="text-xs text-slate-400 mt-0.5">Dự kiến 1–2 ngày làm việc</p>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">30.000đ</span>
                  </label>
                </div>
              </div>

              <PaymentMethods onChange={(method) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })} />

              {/* Privacy consent */}
              <div className="flex items-start gap-3 mt-5">
                <div className="check-box on mt-0.5" id="consent-box">
                  <i className="fa-solid fa-check text-white text-[9px]"></i>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bằng việc đặt hàng, bạn xác nhận đã đọc và đồng ý với{' '}
                  <a href="#" className="text-indigo-600 dark:text-[#EBC563] underline">Chính sách bảo mật</a> và{' '}
                  <a href="#" className="text-indigo-600 dark:text-[#EBC563] underline">Điều khoản sử dụng</a> của CLOSET.
                </p>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky-right space-y-5">
                {/* Items */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="section-label mb-0">Đơn hàng của bạn</span>
                    <Link href="/cart" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Sửa</Link>
                  </div>

                  {items.map((item, idx) => (
                    <div key={`${item.product_variant_id}-${idx}`} className="order-item">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {item.size && `Size: ${item.size}`}{item.color && ` | ${item.color}`}
                        </p>
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-[#EBC563] flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Voucher */}
                <div className="card">
                  <span className="section-label">Mã giảm giá</span>
                  <div className="voucher-bar">
                    <input type="text" id="voucher-input" placeholder="Nhập mã voucher..." />
                    <button>Áp dụng</button>
                  </div>
                </div>

                {/* Totals + CTA */}
                <OrderSummary
                  itemCount={getItemCount()}
                  subtotal={formatPrice(getCartTotal())}
                  shippingFee={shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  total={formatPrice(totalWithShipping)}
                  buttonText={isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                  onCheckout={handlePlaceOrder}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}