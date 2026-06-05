import{n as e,t}from"./AdminHeader-BXlwJj4X.js";import{t as n}from"./ApiClient-BbZ5Bl-G.js";var r=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},i=class{constructor(){this.state={products:[],loading:!0}}render(){return r(this,void 0,void 0,function*(){let e=document.getElementById(`app`);e&&(e.innerHTML=this.templateSkeleton(),yield this.fetchProducts(),e.innerHTML=this.template())})}fetchProducts(){return r(this,void 0,void 0,function*(){this.state.loading=!0;try{let e=yield n.get(`/products?limit=50`);this.state.products=e.data}catch(e){console.error(`Failed to load inventory:`,e)}finally{this.state.loading=!1}})}template(){return`
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${e.render(`products`)}

        <main class="flex-1 flex flex-col overflow-hidden">
          ${t.render(`Quản lý kho`)}

          <div class="flex-1 overflow-y-auto p-10">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h1 class="text-2xl font-black text-slate-800">Danh sách sản phẩm</h1>
                <p class="text-slate-500">Xem và cập nhật chi tiết kho sản phẩm của bạn.</p>
              </div>
              <button class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30">
                + Thêm sản phẩm
              </button>
            </div>

            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th class="px-8 py-6">Sản phẩm</th>
                    <th class="px-8 py-6">Danh mục</th>
                    <th class="px-8 py-6">Giá bán</th>
                    <th class="px-8 py-6">Tồn kho</th>
                    <th class="px-8 py-6">Trạng thái</th>
                    <th class="px-8 py-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  ${this.state.products.map(e=>{let t=e.price||(e.variants&&e.variants.length>0?e.variants[0].price:0),n=e.variants?e.variants.reduce((e,t)=>e+(t._id?15:0),15):15,r=n>0;return`
                      <tr class="hover:bg-slate-50 transition-all group">
                        <td class="px-8 py-6">
                          <div class="flex items-center gap-4">
                            <img src="${e.image||`https://images.unsplash.com/photo-1594932224011-042041c62fed?w=100`}" class="w-12 h-12 object-cover rounded-xl shadow-sm" alt="${e.name}">
                            <div>
                              <p class="font-bold text-slate-800 group-hover:text-indigo-600 transition-all">${e.name}</p>
                              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: ${e.id||e._id}</p>
                            </div>
                          </div>
                        </td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">${e.category||`Suits`}</td>
                        <td class="px-8 py-6 font-black text-indigo-600">${t.toLocaleString()}đ</td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">${n}</td>
                        <td class="px-8 py-6">
                          <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${r?`bg-emerald-50 text-emerald-600`:`bg-rose-50 text-rose-600`}">
                            ${r?`Còn hàng`:`Hết hàng`}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <div class="flex gap-2">
                            <button class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all">
                              <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                          </div>
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
        ${e.render(`products`)}
        <main class="flex-1 flex flex-col overflow-hidden animate-pulse">
          ${t.render(`Quản lý kho`)}
          <div class="flex-1 p-10 space-y-6">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </main>
      </div>
    `}};export{i as AdminInventoryModule};