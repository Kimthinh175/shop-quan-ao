export class AdminSidebar {
  public static render(activePage: string = 'dashboard'): string {
    const pages = [
      { id: 'dashboard', href: '/admin', label: 'Tổng quan', icon: 'fa-chart-pie' },
      { id: 'pos', href: '/admin/pos', label: 'Bán hàng (POS)', icon: 'fa-cash-register' },
      { id: 'products', href: '/admin/products', label: 'Quản lý kho', icon: 'fa-box' },
      { id: 'orders', href: '/admin/orders', label: 'Đơn hàng', icon: 'fa-receipt' }
    ];

    return `
      <aside class="w-72 bg-slate-900 h-full flex flex-col py-8 px-6 text-slate-300 shrink-0">
        <div class="text-3xl font-black mb-12 tracking-tighter text-white">CLOSET.</div>
        <nav class="flex-1 space-y-2">
          ${pages.map(p => `
            <a href="${p.href}" class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${activePage === p.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-white'}">
              <i class="fa-solid ${p.icon} text-lg"></i> ${p.label}
            </a>
          `).join('')}
        </nav>
        <div class="mt-auto pt-8 border-t border-slate-800">
          <a href="/" class="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-medium text-slate-400">
            <i class="fa-solid fa-house text-lg"></i> Về Trang chủ
          </a>
        </div>
      </aside>
    `;
  }
}
