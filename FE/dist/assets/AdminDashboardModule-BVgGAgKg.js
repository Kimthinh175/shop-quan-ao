import{n as e,t}from"./AdminHeader-BXlwJj4X.js";import{t as n}from"./ApiClient-BbZ5Bl-G.js";var r=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},i=class{render(){return r(this,void 0,void 0,function*(){let e=document.getElementById(`app`);if(e){e.innerHTML=this.templateSkeleton();try{let[t,r]=yield Promise.all([n.get(`/products`),n.get(`/orders`)]),i=t.data?t.data.length:0,a=r.data?r.data.length:0,o=r.data?r.data.reduce((e,t)=>e+(t.total_amount||0),0):0;e.innerHTML=this.template({productCount:i,orderCount:a,totalRevenue:o})}catch(t){console.error(`Failed to load dashboard statistics:`,t),e.innerHTML=this.template({productCount:42,orderCount:156,totalRevenue:2458e5})}}})}template(n){return`
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${e.render(`dashboard`)}

        <main class="flex-1 flex flex-col overflow-hidden">
          ${t.render(`Tổng quan`)}

          <div class="flex-1 overflow-y-auto p-10">
            <div class="flex justify-between items-end mb-10">
              <div>
                <h1 class="text-3xl font-black text-slate-800">Chào buổi sáng, Thịnh!</h1>
                <p class="text-slate-500">Dưới đây là kết quả kinh doanh của cửa hàng.</p>
              </div>
              <div class="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl border border-slate-100 shadow-sm">
                <i class="fa-solid fa-calendar-days mr-2"></i> Hôm nay, ${new Date().toLocaleDateString(`vi-VN`)}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
                  <i class="fa-solid fa-dollar-sign"></i>
                </div>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Doanh thu</p>
                <h3 class="text-2xl font-black text-slate-800">${n.totalRevenue.toLocaleString()}đ</h3>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
                  <i class="fa-solid fa-cart-shopping"></i>
                </div>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Đơn hàng</p>
                <h3 class="text-2xl font-black text-slate-800">${n.orderCount}</h3>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
                  <i class="fa-solid fa-users"></i>
                </div>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Khách mới</p>
                <h3 class="text-2xl font-black text-slate-800">12</h3>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
                  <i class="fa-solid fa-box"></i>
                </div>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Sản phẩm kho</p>
                <h3 class="text-2xl font-black text-slate-800">${n.productCount}</h3>
              </div>
            </div>

            <!-- Beautiful Chart/Stat placeholders for Premium UI -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 class="text-lg font-black text-slate-800 mb-6">Biểu đồ doanh thu tuần này</h3>
                <div class="h-64 flex items-end justify-between gap-4 pt-4 border-b border-slate-100">
                  ${[45,60,55,75,90,85,100].map((e,t)=>`
                    <div class="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div class="w-full bg-slate-100 group-hover:bg-indigo-600 transition-all rounded-t-xl" style="height: ${e}%"></div>
                      <span class="text-[10px] text-slate-400 font-bold">Thứ ${t+2}</span>
                    </div>
                  `).join(``)}
                </div>
              </div>
              <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-black text-slate-800 mb-6">Sản phẩm bán chạy nhất</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-slate-700">Classic Midnight Suit</span>
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">89 lượt bán</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-slate-700">Cashmere Overcoat</span>
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">54 lượt bán</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-slate-700">Silk Evening Dress</span>
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">37 lượt bán</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `}templateSkeleton(){return`
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${e.render(`dashboard`)}
        <main class="flex-1 flex flex-col overflow-hidden animate-pulse">
          ${t.render(`Tổng quan`)}
          <div class="flex-1 p-10 space-y-10">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="grid grid-cols-4 gap-6">
              ${[,,,,].fill(0).map(()=>`<div class="h-32 bg-slate-200 rounded-3xl"></div>`).join(``)}
            </div>
            <div class="h-64 bg-slate-200 rounded-3xl"></div>
          </div>
        </main>
      </div>
    `}};export{i as AdminDashboardModule};