'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { orderService } from '../../../services/orderService';
import { apiClient } from '../../../services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImageUrls, setReviewImageUrls] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchOrders();
    }
  }, [user, isAuthLoading, router, activeFilter]);

  const fetchOrders = async () => {
    if (!user) return;
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

  const handleOpenReviewModal = (item: any) => {
    setSelectedOrderItem(item);
    setReviewRating(5);
    setReviewContent('');
    setReviewImages([]);
    setReviewImageUrls([]);
    setReviewSuccess(false);
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedOrderItem(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5); // max 5 images
      setReviewImages(filesArray);
      
      // Create preview URLs
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setReviewImageUrls(urls);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      // 1. Upload images if any
      const uploadedUrls: string[] = [];
      for (const file of reviewImages) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes: any = await apiClient.post('/upload', formData);
        if (uploadRes?.url) {
          uploadedUrls.push(uploadRes.url);
        }
      }

      // 2. Submit review
      await apiClient.post('/reviews', {
        order_item_id: selectedOrderItem._id,
        rating: reviewRating,
        content: reviewContent,
        images: uploadedUrls,
      });

      setReviewSuccess(true);
      setTimeout(() => {
        handleCloseReviewModal();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit review', err);
      setReviewError(err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmittingReview(false);
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

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: 'fa-regular fa-user' },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: 'fa-solid fa-box' },
    { id: 'address', label: 'Sổ địa chỉ', icon: 'fa-solid fa-location-dot' },
    { id: 'password', label: 'Đổi mật khẩu', icon: 'fa-solid fa-lock' },
  ];
  const activeTab = 'orders';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0B0B]">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0B0B0B] min-h-screen pt-8 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl mt-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <span onClick={() => router.push('/')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">Trang chủ</span>
          <i className="fa-solid fa-chevron-right text-xs"></i>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Tài khoản</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full md:w-[280px] flex-shrink-0">
            <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-[#171717] border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar || "https://i.pravatar.cc/150?img=12"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#171717] flex items-center justify-center">
                    <i className="fa-solid fa-check text-[10px] text-white"></i>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{user.full_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.phone}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-md">
                    Thành viên
                  </span>
                </div>
              </div>

              <div className="p-3">
                <nav className="space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'address') {
                          router.push('/address');
                        } else if (tab.id === 'orders') {
                          // Already here
                        } else {
                          router.push('/profile');
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <i className={`${tab.icon} w-5 text-center ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}></i>
                      {tab.label}
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4">
                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center opacity-80"></i>
                    Đăng xuất
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300">
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Đơn hàng của tôi
                </h2>
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
                        <Link href={`/product/${item.variant_snapshot?.product_id || item.product_id}`} className="w-18 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 block">
                          <img
                            src={item.variant_snapshot?.main_img || 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&w=150&q=80'}
                            alt={item.variant_snapshot?.name || 'Sản phẩm'}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.variant_snapshot?.product_id || item.product_id}`} className="group">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-[#D4AF37] transition-colors">
                              {item.variant_snapshot?.name}
                            </h4>
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Màu: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.variant_snapshot?.color || 'Mặc định'}</span>
                            {' · '}
                            Size: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.variant_snapshot?.size || 'Mặc định'}</span>
                          </p>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                            x{item.total_quantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <span className="font-black text-indigo-600 dark:text-[#EBC563] text-sm">
                            {formatPrice(item.unit_price)}
                          </span>
                          {order.status === 'COMPLETED' && (
                            <button
                              onClick={() => handleOpenReviewModal(item)}
                              className="text-[10px] px-3 py-1.5 bg-white dark:bg-[#171717] border border-indigo-600 dark:border-[#D4AF37] text-indigo-600 dark:text-[#D4AF37] rounded-lg font-bold hover:bg-indigo-50 dark:hover:bg-[#D4AF37]/10 transition-colors uppercase tracking-wider"
                            >
                              Viết đánh giá
                            </button>
                          )}
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
        </div>

      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-scaleIn">
            <button
              onClick={handleCloseReviewModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              ĐÁNH GIÁ SẢN PHẨM
            </h3>
            
            {selectedOrderItem && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <img
                  src={selectedOrderItem.variant_snapshot?.main_img || 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedOrderItem.variant_snapshot?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                    {selectedOrderItem.variant_snapshot?.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Màu: {selectedOrderItem.variant_snapshot?.color} - Size: {selectedOrderItem.variant_snapshot?.size}
                  </p>
                </div>
              </div>
            )}

            {reviewSuccess ? (
              <div className="py-8 text-center text-emerald-600 dark:text-emerald-400 space-y-2">
                <i className="fa-solid fa-circle-check text-4xl animate-bounce" />
                <p className="text-sm font-extrabold">Cảm ơn bạn đã gửi đánh giá!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                {reviewError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/50 text-center">
                    {reviewError}
                  </div>
                )}
                
                {/* Select Star Rating */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2 text-center">
                    Chất lượng sản phẩm
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                      >
                        <i
                          className={`fa-solid fa-star ${
                            star <= reviewRating ? "text-amber-400" : "text-slate-200 dark:text-slate-800"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Textarea */}
                <div>
                  <textarea
                    rows={4}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 dark:focus:border-amber-400 resize-none transition-colors"
                  />
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                    Thêm hình ảnh (Tối đa 5 ảnh)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {reviewImageUrls.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {reviewImageUrls.length < 5 && (
                      <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-[#D4AF37] hover:border-indigo-600 dark:hover:border-[#D4AF37] cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50">
                        <i className="fa-solid fa-plus" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-[#D4AF37] dark:hover:bg-[#EBC563] text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview && <i className="fa-solid fa-spinner fa-spin" />}
                  {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
