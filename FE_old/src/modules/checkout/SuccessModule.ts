import { ApiClient } from "../../api/ApiClient";

export class SuccessModule {
  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;
    
    app.innerHTML = this.templateSkeleton();

    // Lấy ID đơn hàng từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderCode") || urlParams.get("id");
    const isCancelled = urlParams.get("cancel") === "true";

    if (isCancelled) {
      app.innerHTML = this.templateError("Bạn đã huỷ thanh toán cho đơn hàng này.");
      return;
    }

    if (!orderId) {
      app.innerHTML = this.templateError("Không tìm thấy thông tin đơn hàng.");
      return;
    }

    try {
      // Gọi API lấy thông tin đơn hàng thật
      const order = await ApiClient.get<any>(`/orders/${orderId}`);
      app.innerHTML = this.templateSuccess(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("403") || err.message.includes("401")) {
        app.innerHTML = this.templateError("Bạn không có quyền xem đơn hàng này. Vui lòng đăng nhập đúng tài khoản.");
      } else {
        app.innerHTML = this.templateError("Không thể tải thông tin đơn hàng. " + err.message);
      }
    }
  }

  private templateSkeleton(): string {
    return `
      
        <main class="flex-1 flex items-center justify-center py-20">
          <div class="text-center">
            <i class="fa-solid fa-spinner fa-spin text-4xl text-[#2a83e9] mb-4"></i>
            <p class="text-slate-500 font-bold">Đang tải thông tin đơn hàng...</p>
          </div>
        </main>
        
    `;
  }

  private templateError(msg: string): string {
    return `
      
        <main class="flex-1 flex items-center justify-center py-20 px-4">
          <div class="bg-white p-10 rounded-3xl text-center shadow-sm border border-red-100 max-w-lg w-full">
            <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <h1 class="text-2xl font-black text-slate-900 font-serif mb-4">Lỗi Đơn Hàng</h1>
            <p class="text-slate-500 mb-8">${msg}</p>
            <a href="/" class="bg-[#2a83e9] text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-blue-600 transition-colors">Về Trang Chủ</a>
          </div>
        </main>
        
    `;
  }

  private templateSuccess(data: any): string {
    const o = data.order || data;
    const items = data.items || [];
    const isPaid = o.payment_status === 'PAID';
    const totalAmount = o.total_amount ? o.total_amount.toLocaleString('vi-VN') : '0';

    return `
      
        
        <main class="flex-1 max-w-3xl mx-auto w-full px-5 pt-6 pb-10 lg:pb-16">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Header Banner -->
            <div class="bg-[#2a83e9] text-white text-center p-10 relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div class="relative z-10 flex flex-col items-center">
                <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 animate-[scaleIn_0.5s_ease-out]">
                  <i class="fa-solid fa-check text-4xl text-[#2a83e9]"></i>
                </div>
                <h1 class="text-3xl font-black font-serif mb-2">Đặt Hàng Thành Công!</h1>
                <p class="text-blue-100 mb-4 max-w-md">Cảm ơn bạn đã tin tưởng CLOSET. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
                <div class="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold text-sm tracking-wider">
                  MÃ ĐƠN: #${o._id ? o._id.toString().slice(-6).toUpperCase() : ''}
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div class="p-8 md:p-12">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 pb-10 border-b border-slate-100">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-regular fa-address-card"></i> Giao hàng đến</h3>
                  <p class="font-bold text-slate-900 text-lg mb-1">${o.receiver_name || o.customer_name || 'Khách hàng'}</p>
                  <p class="text-slate-600 text-sm mb-1">${o.receiver_phone || o.customer_phone || ''}</p>
                  <p class="text-slate-600 text-sm leading-relaxed">${o.receiver_address || o.address || ''}</p>
                </div>
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-regular fa-credit-card"></i> Thanh toán</h3>
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                      ${o.payment_method === 'COD' ? '<i class="fa-solid fa-money-bill-wave"></i>' : '<i class="fa-solid fa-qrcode"></i>'}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">${o.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản QRCode'}</p>
                      <p class="text-slate-500 mb-2">Ngày đặt hàng</p>
                      <p class="font-bold text-slate-800">${new Date(o.create_at || new Date()).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                      <p class="text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-500' : 'text-amber-500'}">${isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product List -->
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><i class="fa-solid fa-box-open"></i> Sản phẩm đã đặt</h3>
              <div class="space-y-4 mb-8">
                ${items && items.length > 0 ? items.map((item: any) => `
                  <div class="flex gap-4">
                    <div class="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                       <img src="${item.variant_snapshot?.image || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 flex flex-col justify-center">
                      <p class="text-sm font-bold text-slate-900 line-clamp-2">${item.variant_snapshot?.name || 'Sản phẩm'}</p>
                      <p class="text-xs text-slate-500 mt-1">SL: ${item.total_quantity} | ${item.variant_snapshot?.color || ''} ${item.variant_snapshot?.size || ''}</p>
                    </div>
                    <div class="text-right flex flex-col justify-center">
                      <p class="text-[#2a83e9] font-black text-sm">${((item.unit_price || 0) * (item.total_quantity || 1)).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                `).join('') : '<p class="text-sm text-slate-500 italic">Không tải được danh sách sản phẩm</p>'}
              </div>

              <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div class="flex justify-between items-center text-sm font-bold text-slate-600 mb-2">
                  <span>Tổng tiền hàng</span>
                  <span>${totalAmount}đ</span>
                </div>
                <div class="flex justify-between items-center text-sm font-bold text-slate-600 mb-4 pb-4 border-b border-slate-200">
                  <span>Phí vận chuyển</span>
                  <span>Tính theo thực tế</span>
                </div>
                <div class="flex justify-between items-end">
                  <span class="text-slate-900 font-bold uppercase tracking-wider text-sm">Tổng cộng</span>
                  <span class="text-2xl font-black text-[#2a83e9]">${totalAmount}đ</span>
                </div>
              </div>

              <div class="mt-10 flex flex-col sm:flex-row gap-4">
                <a href="/account/orders" class="flex-1 text-center py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg">Xem Đơn Hàng</a>
                <a href="/products" class="flex-1 text-center py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-white border-2 border-slate-200 text-slate-700 hover:border-[#2a83e9] hover:text-[#2a83e9] transition-colors">Tiếp Tục Mua Sắm</a>
              </div>
            </div>
          </div>
        </main>
        
      <style>
        @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      </style>
    `;
  }
}
