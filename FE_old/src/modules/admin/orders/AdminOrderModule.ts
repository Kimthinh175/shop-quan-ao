import { ApiClient } from "../../../api/ApiClient";
import { AdminSidebar } from "../../../components/AdminSidebar";
import { AdminHeader } from "../../../components/AdminHeader";

interface IOrder {
  _id?: number | string;
  customer_info?: { full_name?: string; email?: string; phone?: string } | null;
  receiver_name?: string;
  receiver_phone?: string;
  total_amount?: number;
  status?: string;
  payment_method?: string;
  create_at?: string;
}

export class AdminOrderModule {
  private state = {
    orders: [] as IOrder[],
    loading: true,
    filter: 'all' as string,
    search: '' as string,
    page: 1,
    total: 0,
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();
    await this.fetchOrders();
    app.innerHTML = this.template();
    this.bindEvents();
  }

  private async fetchOrders() {
    this.state.loading = true;
    try {
      const res = await ApiClient.adminGet<{ data: IOrder[]; pagination: { total: number } }>("/orders?limit=100");
      this.state.orders = res.data || [];
      this.state.total = res.pagination?.total || this.state.orders.length;
    } catch (e) {
      console.error(e);
      this.state.orders = [];
      this.state.total = 0;
    } finally {
      this.state.loading = false;
    }
  }

  private getFiltered(): IOrder[] {
    let list = this.state.orders;
    if (this.state.filter !== 'all') {
      list = list.filter(o => o.status?.toLowerCase() === this.state.filter.toLowerCase());
    }
    if (this.state.search.trim()) {
      const q = this.state.search.toLowerCase();
      list = list.filter(o => {
        const name = (o.customer_info?.full_name || o.receiver_name || '').toLowerCase();
        const id = String(o._id || '');
        const phone = (o.customer_info?.phone || o.receiver_phone || '').toLowerCase();
        return name.includes(q) || id.includes(q) || phone.includes(q);
      });
    }
    return list;
  }

  private statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã huỷ',
      PARTIAL_RETURNED: 'Hoàn trả 1 phần',
      RETURNED: 'Đã hoàn trả',
    };
    return map[s] || s;
  }

  private statusStyle(s: string): string {
    const map: Record<string, string> = {
      PENDING:    'background:#fffbeb; color:#d97706; border:1px solid #fde68a;',
      CONFIRMED:  'background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;',
      SHIPPING:   'background:#eef2ff; color:#4f46e5; border:1px solid #c7d2fe;',
      COMPLETED:  'background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;',
      CANCELLED:  'background:#fff1f2; color:#e11d48; border:1px solid #fecdd3;',
      PARTIAL_RETURNED: 'background:#fdf4ff; color:#c026d3; border:1px solid #fbcfe8;',
      RETURNED:   'background:#fdf4ff; color:#c026d3; border:1px solid #fbcfe8;',
    };
    return map[s] || 'background:#f8fafc; color:#64748b; border:1px solid #e2e8f0;';
  }

  private statusDot(s: string): string {
    const map: Record<string, string> = {
      PENDING: '#d97706', CONFIRMED: '#2563eb', SHIPPING: '#4f46e5',
      COMPLETED: '#16a34a', CANCELLED: '#e11d48',
      PARTIAL_RETURNED: '#c026d3', RETURNED: '#c026d3'
    };
    return map[s] || '#94a3b8';
  }

  private timeAgo(dateStr?: string): string {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    return `${d} ngày trước`;
  }

  private paymentIcon(method?: string): string {
    if (!method) return '<i class="fa-solid fa-circle-question" style="color:#94a3b8"></i>';
    const m = method.toLowerCase();
    if (m.includes('momo')) return '<span style="color:#ae2070; font-weight:700; font-size:11px;">MoMo</span>';
    if (m.includes('bank') || m.includes('transfer')) return '<i class="fa-solid fa-building-columns" style="color:#2563eb"></i>';
    if (m.includes('cod')) return '<i class="fa-solid fa-money-bill-wave" style="color:#16a34a"></i>';
    if (m.includes('vnpay')) return '<span style="color:#003087; font-weight:700; font-size:11px;">VNPay</span>';
    return '<i class="fa-solid fa-credit-card" style="color:#64748b"></i>';
  }

  private template(): string {
    const filtered = this.getFiltered();
    const allOrders = this.state.orders;

    const counts = {
      all: allOrders.length,
      pending: allOrders.filter(o => o.status === 'PENDING').length,
      confirmed: allOrders.filter(o => o.status === 'CONFIRMED').length,
      shipping: allOrders.filter(o => o.status === 'SHIPPING').length,
      completed: allOrders.filter(o => o.status === 'COMPLETED').length,
      cancelled: allOrders.filter(o => o.status === 'CANCELLED').length,
    };

    const totalRevenue = allOrders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const pendingRevenue = allOrders
      .filter(o => ['PENDING', 'CONFIRMED'].includes(o.status || ''))
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const tabDef = [
      { key: 'all',        label: 'Tất cả',         count: counts.all },
      { key: 'pending',    label: 'Chờ xác nhận',   count: counts.pending },
      { key: 'confirmed',  label: 'Đã xác nhận',    count: counts.confirmed },
      { key: 'shipping',   label: 'Đang giao',       count: counts.shipping },
      { key: 'completed',  label: 'Hoàn thành',     count: counts.completed },
      { key: 'cancelled',  label: 'Đã huỷ',         count: counts.cancelled },
    ];

    const statsCards = [
      { label: 'Tổng đơn hàng', value: counts.all, icon: 'fa-receipt', color: '#2a83e9', bg: '#eff6ff' },
      { label: 'Doanh thu hoàn tất', value: totalRevenue.toLocaleString('vi-VN') + 'đ', icon: 'fa-sack-dollar', color: '#16a34a', bg: '#f0fdf4' },
      { label: 'Chờ xác nhận', value: counts.pending, icon: 'fa-clock', color: '#d97706', bg: '#fffbeb' },
      { label: 'Doanh thu tạm giữ', value: pendingRevenue.toLocaleString('vi-VN') + 'đ', icon: 'fa-hourglass-half', color: '#7c3aed', bg: '#f5f3ff' },
    ];

    return `
      <div style="display:flex; flex-direction:column; gap:24px;">

        <!-- Page Title -->
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px;">
          <div>
            <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 4px 0; letter-spacing:-0.5px;">Quản lý đơn hàng</h1>
            <p style="font-size:13px; color:#64748b; margin:0;">Xem và xử lý toàn bộ đơn hàng online &amp; offline</p>
          </div>
          <button id="btn-export-orders" style="
            display:flex; align-items:center; gap:8px;
            padding:10px 18px; border-radius:10px;
            background:#01172D; color:white; border:none;
            font-size:13px; font-weight:700; cursor:pointer;
            transition:all 0.15s; letter-spacing:0.2px;
          " onmouseover="this.style.background='#0a2540'" onmouseout="this.style.background='#01172D'">
            <i class="fa-solid fa-file-arrow-down"></i>
            Xuất Excel
          </button>
        </div>

        <!-- Stats Cards -->
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
          ${statsCards.map(c => `
            <div style="
              background:white; border-radius:16px; padding:20px 22px;
              border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.04);
              display:flex; align-items:center; gap:16px;
            ">
              <div style="
                width:44px; height:44px; border-radius:12px;
                background:${c.bg}; display:flex; align-items:center; justify-content:center;
                flex-shrink:0;
              ">
                <i class="fa-solid ${c.icon}" style="font-size:18px; color:${c.color};"></i>
              </div>
              <div style="min-width:0;">
                <p style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 4px 0; white-space:nowrap;">${c.label}</p>
                <p style="font-size:20px; font-weight:800; color:#0f172a; margin:0; line-height:1; letter-spacing:-0.5px;">${c.value}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Toolbar: Tabs + Search -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">

          <!-- Tab pills -->
          <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
            ${tabDef.map(t => `
              <button
                class="order-filter-tab"
                data-filter="${t.key}"
                style="
                  display:flex; align-items:center; gap:6px;
                  padding:8px 14px; border:none; cursor:pointer;
                  font-size:13px; font-weight:700; white-space:nowrap;
                  border-radius:10px;
                  background:${this.state.filter === t.key ? '#2a83e9' : 'white'};
                  color:${this.state.filter === t.key ? 'white' : '#64748b'};
                  box-shadow:${this.state.filter === t.key ? '0 2px 8px rgba(42,131,233,0.25)' : '0 1px 3px rgba(0,0,0,0.06)'};
                  border:1.5px solid ${this.state.filter === t.key ? '#2a83e9' : '#e2e8f0'};
                  transition:all 0.15s;
                "
              >
                ${t.label}
                <span style="
                  padding:1px 7px; border-radius:20px; font-size:11px; font-weight:800;
                  background:${this.state.filter === t.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9'};
                  color:${this.state.filter === t.key ? 'white' : '#94a3b8'};
                ">${t.count}</span>
              </button>
            `).join('')}
          </div>

          <!-- Search Input -->
          <div style="display:flex; align-items:center; gap:8px; background:white; border:1.5px solid #e2e8f0; border-radius:12px; padding:10px 16px; width:300px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <i class="fa-solid fa-magnifying-glass" style="color:#94a3b8; font-size:14px;"></i>
            <input
              id="order-search"
              type="text"
              value="${this.state.search}"
              placeholder="Tìm mã đơn, tên, SĐT..."
              style="
                border:none; background:transparent; outline:none;
                font-size:14px; color:#0f172a; width:100%; font-weight:500;
              "
            >
          </div>
        </div>

        <!-- Orders Table Card -->
        <div style="background:white; border-radius:16px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.04); overflow:hidden;">

          <!-- Table -->
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; min-width:800px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; white-space:nowrap;">Mã đơn</th>
                  <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Khách hàng</th>
                  <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Thời gian</th>
                  <th style="padding:12px 20px; text-align:right; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Tổng tiền</th>
                  <th style="padding:12px 20px; text-align:center; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Thanh toán</th>
                  <th style="padding:12px 20px; text-align:center; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Trạng thái</th>
                  <th style="padding:12px 20px; text-align:center; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="7" style="padding:60px 20px; text-align:center;">
                      <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
                        <div style="width:60px; height:60px; border-radius:16px; background:#f1f5f9; display:flex; align-items:center; justify-content:center;">
                          <i class="fa-solid fa-inbox" style="font-size:24px; color:#cbd5e1;"></i>
                        </div>
                        <p style="font-size:15px; font-weight:700; color:#cbd5e1; margin:0;">Không có đơn hàng nào</p>
                      </div>
                    </td>
                  </tr>
                ` : filtered.map((o, idx) => {
                  const name = o.customer_info?.full_name || o.receiver_name || 'Khách vãng lai';
                  const phone = o.customer_info?.phone || o.receiver_phone || '—';
                  const id = String(o._id || '');
                  const amount = (o.total_amount || 0).toLocaleString('vi-VN');
                  const status = o.status || 'PENDING';
                  const time = this.timeAgo(o.create_at);

                  return `
                    <tr style="border-top:1px solid #f8fafc; transition:background 0.1s;" 
                        onmouseover="this.style.background='#f8fafc'" 
                        onmouseout="this.style.background=''"
                    >
                      <td style="padding:16px 20px;">
                        <span style="font-size:13px; font-weight:800; color:#2a83e9; font-family:monospace;">#${id.padStart(4,'0')}</span>
                      </td>
                      <td style="padding:16px 20px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                          <div style="
                            width:34px; height:34px; border-radius:10px; flex-shrink:0;
                            background:linear-gradient(135deg, #2a83e9, #6d28d9);
                            display:flex; align-items:center; justify-content:center;
                            color:white; font-weight:800; font-size:13px;
                          ">${name.charAt(0).toUpperCase()}</div>
                          <div>
                            <p style="font-size:13px; font-weight:700; color:#0f172a; margin:0 0 2px;">${name}</p>
                            <p style="font-size:11px; color:#94a3b8; font-weight:600; margin:0;">${phone}</p>
                          </div>
                        </div>
                      </td>
                      <td style="padding:16px 20px;">
                        <p style="font-size:12px; font-weight:600; color:#64748b; margin:0;">${time}</p>
                      </td>
                      <td style="padding:16px 20px; text-align:right;">
                        <span style="font-size:14px; font-weight:800; color:#0f172a;">${amount}đ</span>
                      </td>
                      <td style="padding:16px 20px; text-align:center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:5px; font-size:12px; font-weight:600; color:#64748b;">
                          ${this.paymentIcon(o.payment_method)}
                          <span>${o.payment_method || '—'}</span>
                        </div>
                      </td>
                      <td style="padding:16px 20px; text-align:center;">
                        <span style="
                          display:inline-flex; align-items:center; gap:5px;
                          padding:5px 12px; border-radius:20px;
                          font-size:11px; font-weight:700;
                          ${this.statusStyle(status)}
                        ">
                          <span style="width:6px; height:6px; border-radius:50%; background:${this.statusDot(status)}; flex-shrink:0; display:inline-block;"></span>
                          ${this.statusLabel(status)}
                        </span>
                      </td>
                      <td style="padding:16px 20px; text-align:center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
                          <button
                            class="btn-view-order" data-id="${id}"
                            title="Xem chi tiết"
                            style="
                              width:32px; height:32px; border-radius:8px;
                              background:#f1f5f9; border:none; cursor:pointer;
                              display:flex; align-items:center; justify-content:center;
                              color:#64748b; font-size:13px; transition:all 0.15s;
                            "
                            onmouseover="this.style.background='#01172D'; this.style.color='white'"
                            onmouseout="this.style.background='#f1f5f9'; this.style.color='#64748b'"
                          ><i class="fa-solid fa-eye"></i></button>
                          ${status === 'PENDING' ? `
                            <button
                              class="btn-confirm-order" data-id="${id}"
                              title="Xác nhận"
                              style="
                                width:32px; height:32px; border-radius:8px;
                                background:#f0fdf4; border:none; cursor:pointer;
                                display:flex; align-items:center; justify-content:center;
                                color:#16a34a; font-size:13px; transition:all 0.15s;
                              "
                              onmouseover="this.style.background='#16a34a'; this.style.color='white'"
                              onmouseout="this.style.background='#f0fdf4'; this.style.color='#16a34a'"
                            ><i class="fa-solid fa-check"></i></button>
                            <button
                              class="btn-cancel-order" data-id="${id}"
                              title="Huỷ đơn"
                              style="
                                width:32px; height:32px; border-radius:8px;
                                background:#fff1f2; border:none; cursor:pointer;
                                display:flex; align-items:center; justify-content:center;
                                color:#e11d48; font-size:13px; transition:all 0.15s;
                              "
                              onmouseover="this.style.background='#e11d48'; this.style.color='white'"
                              onmouseout="this.style.background='#fff1f2'; this.style.color='#e11d48'"
                            ><i class="fa-solid fa-xmark"></i></button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="
            padding:14px 24px; border-top:1px solid #f1f5f9;
            display:flex; align-items:center; justify-content:space-between;
            background:#fafbfc;
          ">
            <p style="font-size:12px; color:#94a3b8; font-weight:600; margin:0;">
              Hiển thị <strong style="color:#64748b;">${filtered.length}</strong> / ${allOrders.length} đơn hàng
            </p>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:12px; color:#94a3b8; font-weight:600;">Tổng doanh thu hoàn tất:</span>
              <span style="font-size:14px; font-weight:800; color:#16a34a;">${totalRevenue.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div style="height:32px; background:#e2e8f0; border-radius:8px; width:220px; animation:pulse 1.5s infinite;"></div>
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
          ${[0,1,2,3].map(() => `<div style="height:88px; background:#e2e8f0; border-radius:16px; animation:pulse 1.5s infinite;"></div>`).join('')}
        </div>
        <div style="height:480px; background:#e2e8f0; border-radius:16px; animation:pulse 1.5s infinite;"></div>
      </div>
      <style>@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }</style>
    `;
  }

  private bindEvents(): void {
    // Tab filters
    document.querySelectorAll<HTMLButtonElement>('.order-filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.filter = btn.dataset.filter || 'all';
        this.rerenderTable();
      });
    });

    // Search
    const searchInput = document.getElementById('order-search') as HTMLInputElement;
    if (searchInput) {
      let debounce: ReturnType<typeof setTimeout>;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this.state.search = searchInput.value;
          this.rerenderTable();
        }, 300);
      });
    }

    // View order button
    document.querySelectorAll<HTMLButtonElement>('.btn-view-order').forEach(btn => {
      btn.addEventListener('click', () => {
        alert(`Xem chi tiết đơn hàng #${btn.dataset.id} (tính năng đang phát triển)`);
      });
    });

    // Confirm order button
    document.querySelectorAll<HTMLButtonElement>('.btn-confirm-order').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm(`Xác nhận đơn hàng #${id}?`)) return;
        try {
          await ApiClient.adminPut(`/orders/${id}/status`, { status: 'CONFIRMED' });
        } catch {}
        const order = this.state.orders.find(o => String(o._id) === id);
        if (order) order.status = 'CONFIRMED';
        this.rerenderTable();
      });
    });

    // Cancel order button
    document.querySelectorAll<HTMLButtonElement>('.btn-cancel-order').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm(`Huỷ đơn hàng #${id}? Hành động này không thể hoàn tác.`)) return;
        try {
          await ApiClient.adminPut(`/orders/${id}/status`, { status: 'CANCELLED' });
        } catch {}
        const order = this.state.orders.find(o => String(o._id) === id);
        if (order) order.status = 'CANCELLED';
        this.rerenderTable();
      });
    });
  }

  private rerenderTable(): void {
    const app = document.getElementById("app-main");
    if (!app) return;
    app.innerHTML = this.template();
    this.bindEvents();
    // Restore search focus
    const s = document.getElementById('order-search') as HTMLInputElement;
    if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  }
}
