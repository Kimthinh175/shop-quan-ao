var e=class{static render(e=`dashboard`){return`
      <aside class="w-72 bg-slate-900 h-full flex flex-col py-8 px-6 text-slate-300 shrink-0">
        <div class="text-3xl font-black mb-12 tracking-tighter text-white">CLOSET.</div>
        <nav class="flex-1 space-y-2">
          ${[{id:`dashboard`,href:`/admin`,label:`Tổng quan`,icon:`fa-chart-pie`},{id:`pos`,href:`/admin/pos`,label:`Bán hàng (POS)`,icon:`fa-cash-register`},{id:`products`,href:`/admin/products`,label:`Quản lý kho`,icon:`fa-box`},{id:`orders`,href:`/admin/orders`,label:`Đơn hàng`,icon:`fa-receipt`}].map(t=>`
            <a href="${t.href}" class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${e===t.id?`bg-indigo-600 text-white shadow-lg shadow-indigo-600/30`:`hover:bg-slate-800 hover:text-white`}">
              <i class="fa-solid ${t.icon} text-lg"></i> ${t.label}
            </a>
          `).join(``)}
        </nav>
        <div class="mt-auto pt-8 border-t border-slate-800">
          <a href="/" class="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-medium text-slate-400">
            <i class="fa-solid fa-house text-lg"></i> Về Trang chủ
          </a>
        </div>
      </aside>
    `}},t=class{static render(e=`Tổng quan`){return`
      <header class="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-bold text-slate-800">${e}</h2>
        </div>
        <div class="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div class="text-right">
            <p class="text-sm font-bold text-slate-900">Thịnh Admin</p>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-black">Chủ sở hữu</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">T</div>
        </div>
      </header>
    `}};export{e as n,t};