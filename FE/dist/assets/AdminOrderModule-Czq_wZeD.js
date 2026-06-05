import{n as e,t}from"./AdminHeader-BXlwJj4X.js";import{t as n}from"./ApiClient-BbZ5Bl-G.js";var r=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},i=class{constructor(){this.state={orders:[],loading:!0}}render(){return r(this,void 0,void 0,function*(){let e=document.getElementById(`app`);e&&(e.innerHTML=this.templateSkeleton(),yield this.fetchOrders(),e.innerHTML=this.template())})}fetchOrders(){return r(this,void 0,void 0,function*(){this.state.loading=!0;try{let e=yield n.get(`/orders?limit=50`);this.state.orders=e.data||[]}catch(e){console.error(e),this.state.orders=[{_id:1,customer_id:{full_name:`Nguyễn Văn A`,email:`a@example.com`},total_amount:125e5,order_status:`completed`,created_at:new Date().toISOString()}]}finally{this.state.loading=!1}})}template(){return`
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${e.render(`orders`)}

        <main class="flex-1 flex flex-col overflow-hidden">
          ${t.render(`Đơn hàng`)}

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
                  ${this.state.orders.map(e=>{let t={pending:`bg-amber-50 text-amber-600`,processing:`bg-blue-50 text-blue-600`,shipping:`bg-indigo-50 text-indigo-600`,completed:`bg-emerald-50 text-emerald-600`,delivered:`bg-emerald-50 text-emerald-600`,cancelled:`bg-rose-50 text-rose-600`}[e.order_status]||`bg-slate-50 text-slate-600`,n=e.customer_id?.full_name||`Khách vãng lai`,r=e.customer_id?.email||`Offline Store`,i=new Date(e.created_at||e.createdAt).toLocaleDateString(`vi-VN`);return`
                      <tr class="hover:bg-slate-50 transition-all group">
                        <td class="px-8 py-6 font-bold text-indigo-600">#ORD-${e._id||e.id}</td>
                        <td class="px-8 py-6">
                          <p class="font-bold text-slate-800">${n}</p>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${r}</p>
                        </td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">${i}</td>
                        <td class="px-8 py-6 font-black text-slate-800">${(e.total_amount||0).toLocaleString()}đ</td>
                        <td class="px-8 py-6">
                          <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${t}">
                            ${e.order_status}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <button class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    `}).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    `}templateSkeleton(){return`
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${e.render(`orders`)}
        <main class="flex-1 flex flex-col overflow-hidden animate-pulse">
          ${t.render(`Đơn hàng`)}
          <div class="flex-1 p-10 space-y-6">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </main>
      </div>
    `}};export{i as AdminOrderModule};