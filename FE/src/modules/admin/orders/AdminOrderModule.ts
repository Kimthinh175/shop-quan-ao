import { AdminSidebar } from "../../../components/AdminSidebar";
import { AdminHeader } from "../../../components/AdminHeader";
import { ApiClient } from "../../../api/ApiClient";

export class AdminOrderModule {
  private state = {
    orders: [] as any[],
    loading: true
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    await this.fetchOrders();
    app.innerHTML = this.template();
  }

  private async fetchOrders() {
    this.state.loading = true;
    try {
      const res = await ApiClient.get<{ data: any[] }>("/orders?limit=50");
      this.state.orders = res.data || [];
    } catch (e) {
      console.error(e);
      // Fallback mocks
      this.state.orders = [
        {
          _id: 1,
          customer_id: { full_name: "Nguyễn Văn A", email: "a@example.com" },
          total_amount: 12500000,
          order_status: "completed",
          created_at: new Date().toISOString()
        }
      ];
    } finally {
      this.state.loading = false;
    }
  }

  private template(): string {
    return `
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${AdminSidebar.render('orders')}

        <main class="flex-1 flex flex-col overflow-hidden">
          ${AdminHeader.render('Đơn hàng')}

          <div class="flex-1 overflow-y-auto p-10">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h1 class="text-2xl font-black text-slate-800">Quản lý đơn hàng</h1>
                <p class="text-slate-500">Xem và quản lý các giao dịch đơn hàng online/offline.</p>
              </div>
            </div>

            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th class="px-8 py-6">Mã đơn hàng</th>
                    <th class="px-8 py-6">Khách hàng</th>
                    <th class="px-8 py-6">Ngày đặt</th>
                    <th class="px-8 py-6">Tổng tiền</th>
                    <th class="px-8 py-6">Trạng thái</th>
                    <th class="px-8 py-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  ${this.state.orders.map(o => {
                    const statusColors = {
                      pending: 'bg-amber-50 text-amber-600',
                      processing: 'bg-blue-50 text-blue-600',
                      shipping: 'bg-indigo-50 text-indigo-600',
                      completed: 'bg-emerald-50 text-emerald-600',
                      delivered: 'bg-emerald-50 text-emerald-600',
                      cancelled: 'bg-rose-50 text-rose-600'
                    };

                    const statusColor = statusColors[o.order_status as keyof typeof statusColors] || 'bg-slate-50 text-slate-600';
                    const customerName = o.customer_id?.full_name || "Khách vãng lai";
                    const customerEmail = o.customer_id?.email || "Offline Store";
                    const orderDate = new Date(o.created_at || o.createdAt).toLocaleDateString('vi-VN');

                    return `
                      <tr class="hover:bg-slate-50 transition-all group">
                        <td class="px-8 py-6 font-bold text-indigo-600">#ORD-${o._id || o.id}</td>
                        <td class="px-8 py-6">
                          <p class="font-bold text-slate-800">${customerName}</p>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${customerEmail}</p>
                        </td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">${orderDate}</td>
                        <td class="px-8 py-6 font-black text-slate-800">${(o.total_amount || 0).toLocaleString()}đ</td>
                        <td class="px-8 py-6">
                          <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${statusColor}">
                            ${o.order_status}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <button class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${AdminSidebar.render('orders')}
        <main class="flex-1 flex flex-col overflow-hidden animate-pulse">
          ${AdminHeader.render('Đơn hàng')}
          <div class="flex-1 p-10 space-y-6">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </main>
      </div>
    `;
  }
}
