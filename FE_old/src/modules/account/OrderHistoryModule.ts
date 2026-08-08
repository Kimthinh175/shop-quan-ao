import { ApiClient } from "../../api/ApiClient";

export class OrderHistoryModule {
  private user: any = null;
  private orders: any[] = [];

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Removed templateSkeleton() to avoid screen flashing when navigating

    try {
      // Get user
      this.user = await ApiClient.get<any>("/customers/me");
      
      const responseData = await ApiClient.get<any>("/orders/my-orders");
      this.orders = responseData.data || [];
      
      app.innerHTML = this.template();
      this.bindEvents();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("401")) {
        app.innerHTML = this.templateError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      } else {
        app.innerHTML = this.templateError("Có lỗi xảy ra: " + err.message);
      }
    }
  }

  private templateSkeleton(): string {
    return `
      
        <main class="flex-1 flex items-center justify-center py-20">
          <i class="fa-solid fa-spinner fa-spin text-4xl text-[#2a83e9]"></i>
        </main>
        
    `;
  }

  private templateError(msg: string): string {
    return `
      
        <main class="flex-1 flex items-center justify-center py-20 px-4">
          <div class="bg-white p-10 rounded-3xl text-center shadow-sm max-w-md w-full">
            <h1 class="text-2xl font-black text-slate-900 font-serif mb-4">Lỗi</h1>
            <p class="text-slate-500 mb-8">${msg}</p>
            <a href="/account/login" class="bg-[#2a83e9] text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-blue-600 transition-colors inline-block">Đăng Nhập</a>
          </div>
        </main>
        
    `;
  }

  private template(): string {
    return `
      
        
        <main class="flex-1 max-w-7xl mx-auto w-full px-5 lg:px-10 pt-6 pb-10 lg:pb-16">
          <div class="flex flex-col lg:flex-row gap-8">
            
            <!-- Sidebar -->
            <div class="w-full lg:w-1/4">
              <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
                <div class="flex items-center gap-4 mb-8">
                  <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold uppercase">
                    ${this.user?.full_name ? this.user.full_name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 line-clamp-1">${this.user?.full_name || 'Khách Hàng'}</p>
                    <p class="text-xs text-slate-500">${this.user?.phone || ''}</p>
                  </div>
                </div>
                
                <nav class="space-y-2">
                  <a href="/account/profile" class="block px-4 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <i class="fa-regular fa-user mr-3 opacity-50"></i> Thông tin cá nhân
                  </a>
                  <a href="/account/profile#address" class="block px-4 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <i class="fa-regular fa-map mr-3 opacity-50"></i> Sổ địa chỉ
                  </a>
                  <button class="w-full text-left px-4 py-3 rounded-xl font-bold text-sm bg-[#2a83e9] text-white transition-colors">
                    <i class="fa-solid fa-clock-rotate-left mr-3 opacity-100"></i> Lịch sử mua hàng
                  </button>
                  <button onclick="localStorage.removeItem('token'); window.location.href='/';" class="w-full text-left px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-colors mt-4">
                    <i class="fa-solid fa-arrow-right-from-bracket mr-3 opacity-50"></i> Đăng xuất
                  </button>
                </nav>
              </div>
            </div>

            <!-- Content -->
            <div class="w-full lg:w-3/4">
              <div class="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm">
                <h2 class="text-2xl font-black text-slate-900 font-serif mb-8">Lịch sử đơn hàng</h2>
                
                ${this.orders.length === 0 ? `
                  <div class="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <i class="fa-solid fa-box-open text-4xl text-slate-300"></i>
                    </div>
                    <p class="text-slate-500 font-bold mb-6">Bạn chưa có đơn hàng nào</p>
                    <a href="/products" class="bg-[#2a83e9] text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">Mua sắm ngay</a>
                  </div>
                ` : `
                  <div class="space-y-6">
                    ${this.orders.map(order => this.orderCardTemplate(order)).join('')}
                  </div>
                `}
              </div>
            </div>

          </div>
        </main>
        
        <!-- Modal Container -->
        <div id="order-modal-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
          <div id="order-modal-content" class="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden transform scale-95 transition-transform duration-300 max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 class="font-black text-slate-900 text-lg">Chi tiết đơn hàng</h3>
              <button id="btn-close-modal" class="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 hover:text-slate-700 transition-colors">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <!-- Modal Body -->
            <div id="order-modal-body" class="p-6 overflow-y-auto">
              <!-- Render by JS -->
            </div>
            
            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button id="btn-close-modal-footer" class="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">Đóng</button>
            </div>
          </div>
        </div>
        
        
        
    `;
  }

  private getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'text-amber-500 bg-amber-50',
      'PROCESSING': 'text-blue-500 bg-blue-50',
      'SHIPPED': 'text-indigo-500 bg-indigo-50',
      'DELIVERED': 'text-emerald-500 bg-emerald-50',
      'CANCELLED': 'text-red-500 bg-red-50'
    };
    return map[status] || 'text-slate-500 bg-slate-50';
  }

  private getStatusText(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'Chờ xác nhận',
      'PROCESSING': 'Đang chuẩn bị hàng',
      'SHIPPED': 'Đang giao hàng',
      'DELIVERED': 'Đã giao thành công',
      'CANCELLED': 'Đã hủy'
    };
    return map[status] || status;
  }

  private orderCardTemplate(order: any): string {
    const isPaid = order.payment_status === 'PAID';
    const date = new Date(order.create_at).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
        <!-- Order Header -->
        <div class="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold text-slate-500 mb-1">Mã đơn hàng</p>
            <p class="font-black text-slate-900 uppercase">#${order._id.toString().slice(-8)}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 mb-1">Ngày đặt</p>
            <p class="font-bold text-slate-700">${date}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${this.getStatusColor(order.status)}">${this.getStatusText(order.status)}</span>
            <span class="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${isPaid ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'}">${isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</span>
          </div>
        </div>

        <!-- Order Items -->
        <div class="p-6">
          <div class="space-y-4 mb-6">
            ${(order.items || []).slice(0, 2).map((item: any) => `
              <div class="flex gap-4">
                <div class="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                   <img src="${item.variant_snapshot?.image || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 flex flex-col justify-center">
                  <p class="text-sm font-bold text-slate-900 line-clamp-1">${item.variant_snapshot?.name || 'Sản phẩm'}</p>
                  <p class="text-xs text-slate-500 mt-1">Phân loại: ${item.variant_snapshot?.color || ''} ${item.variant_snapshot?.size || ''}</p>
                  <p class="text-xs font-bold text-slate-900 mt-1">x${item.total_quantity}</p>
                </div>
                  <div class="text-right flex flex-col justify-between items-end">
                    <p class="text-[#2a83e9] font-black text-sm mb-2">${((item.unit_price || 0) * (item.total_quantity || 1)).toLocaleString('vi-VN')}đ</p>
                    <a href="/products/${item.variant_snapshot?.product_id}" class="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">Mua Lại</a>
                  </div>
                </div>
              `).join('')}
              ${order.items?.length > 2 ? `<p class="text-center text-xs font-bold text-slate-400 pt-2 border-t border-slate-100">Và ${order.items.length - 2} sản phẩm khác...</p>` : ''}
          </div>

          <!-- Order Footer -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div class="text-center sm:text-left">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng cộng</p>
              <p class="text-2xl font-black text-[#2a83e9]">${(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
            </div>
            <div>
              <button type="button" data-id="${order._id}" class="btn-detail bg-white border-2 border-slate-200 text-slate-700 px-5 py-2 rounded-lg font-bold text-sm hover:border-[#2a83e9] hover:text-[#2a83e9] transition-colors">Chi Tiết</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const btnDetails = document.querySelectorAll('.btn-detail');
    const overlay = document.getElementById('order-modal-overlay');
    const content = document.getElementById('order-modal-content');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCloseFooter = document.getElementById('btn-close-modal-footer');
    const body = document.getElementById('order-modal-body');

    const closeModal = () => {
      overlay?.classList.replace('opacity-100', 'opacity-0');
      content?.classList.replace('scale-100', 'scale-95');
      setTimeout(() => overlay?.classList.add('hidden'), 300);
    };

    btnClose?.addEventListener('click', closeModal);
    btnCloseFooter?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    btnDetails.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const order = this.orders.find(x => x._id == id);
        if (!order || !body) return;

        const date = new Date(order.create_at).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        const isPaid = order.payment_status === 'PAID';

        body.innerHTML = `
          <div class="mb-6 flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-slate-500">Mã đơn hàng</p>
              <p class="text-lg font-black text-slate-900">#${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-slate-500">Ngày đặt</p>
              <p class="text-sm font-bold text-slate-800">${date}</p>
            </div>
          </div>
          
          <div class="mb-6 pb-6 border-b border-slate-100">
            <h4 class="text-xs font-black text-slate-400 uppercase mb-3">Người nhận</h4>
            <p class="font-bold text-slate-900">${order.receiver_name || order.customer_name || 'Khách hàng'}</p>
            <p class="text-sm text-slate-600">${order.receiver_phone || order.customer_phone || ''}</p>
            <p class="text-sm text-slate-600 mt-1">${order.receiver_address || order.address || ''}</p>
          </div>

          <div class="mb-6 pb-6 border-b border-slate-100">
            <h4 class="text-xs font-black text-slate-400 uppercase mb-3">Thanh toán</h4>
            <div class="flex justify-between items-center mb-2">
              <p class="text-sm font-bold text-slate-700">${order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản QRCode'}</p>
              <p class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${isPaid ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'}">${isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}</p>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-black text-slate-400 uppercase mb-4">Sản phẩm (${order.items?.length || 0})</h4>
            <div class="space-y-4">
              ${(order.items || []).map((item: any) => `
                <div class="flex gap-4">
                  <div class="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                     <img src="${item.variant_snapshot?.image || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 flex flex-col justify-center">
                    <p class="text-sm font-bold text-slate-900 line-clamp-2">${item.variant_snapshot?.name || 'Sản phẩm'}</p>
                    <p class="text-xs text-slate-500 mt-1">SL: ${item.total_quantity} | ${item.variant_snapshot?.color || ''} ${item.variant_snapshot?.size || ''}</p>
                    <div class="flex items-center gap-3 mt-2">
                      <p class="text-[#2a83e9] font-black text-sm">${((item.unit_price || 0) * (item.total_quantity || 1)).toLocaleString('vi-VN')}đ</p>
                      <a href="/products/${item.variant_snapshot?.product_id}" class="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm">Mua Lại</a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        overlay?.classList.remove('hidden');
        // Trigger reflow
        void overlay?.offsetWidth;
        overlay?.classList.replace('opacity-0', 'opacity-100');
        content?.classList.replace('scale-95', 'scale-100');
      });
    });
  }
}
