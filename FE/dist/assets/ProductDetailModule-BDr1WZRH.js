import{t as e}from"./ApiClient-BbZ5Bl-G.js";import{n as t,t as n}from"./ClientFooter-DkeFQirM.js";var r=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},i=class{render(t){return r(this,void 0,void 0,function*(){let n=document.getElementById(`app`);if(n){n.innerHTML=this.templateSkeleton();try{let r=yield e.get(`/products/${t}`);n.innerHTML=this.template(r),window.scrollTo(0,0),this.initEvents()}catch(e){console.error(e),n.innerHTML=`<h1>Không tìm thấy sản phẩm</h1>`}}})}initEvents(){}template(e){return`
      <div class="min-h-screen bg-white">
        ${t.render()}

        <main class="pt-32 pb-20 max-w-7xl mx-auto px-6">
          <div class="flex flex-col lg:flex-row gap-20">
            <!-- Left: Image Gallery -->
            <div class="flex-1">
              <div class="sticky top-32">
                <div class="aspect-[3/4] rounded-[40px] overflow-hidden bg-slate-100 shadow-2xl shadow-slate-200">
                  <img src="${e.image}" class="w-full h-full object-cover" alt="${e.name}">
                </div>
              </div>
            </div>

            <!-- Right: Product Info -->
            <div class="flex-1 py-10">
              <span class="inline-block px-4 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                ${e.category||`New Arrival`}
              </span>
              <h1 class="text-5xl font-serif font-black text-slate-900 mb-6 leading-tight">${e.name}</h1>
              <p class="text-3xl font-black text-indigo-600 mb-10">${(e.price||0).toLocaleString()}đ</p>

              <div class="prose prose-slate mb-12">
                <p class="text-slate-500 text-lg leading-relaxed font-medium">
                  ${e.description||`Sản phẩm cao cấp được thiết kế với sự chú trọng tuyệt đối vào chất liệu và phom dáng, mang lại trải nghiệm sang trọng và bền bỉ.`}
                </p>
              </div>

              <!-- Options -->
              <div class="space-y-10 mb-12">
                <div>
                  <h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Chọn kích cỡ</h4>
                  <div class="flex gap-4">
                    ${[`S`,`M`,`L`,`XL`].map(e=>`
                      <button class="w-14 h-14 rounded-2xl border-2 border-slate-100 font-bold text-slate-900 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                        ${e}
                      </button>
                    `).join(``)}
                  </div>
                </div>

                <div>
                  <h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Màu sắc</h4>
                  <div class="flex gap-4">
                    <button class="w-10 h-10 rounded-full bg-slate-900 ring-2 ring-offset-2 ring-slate-900"></button>
                    <button class="w-10 h-10 rounded-full bg-slate-200 ring-2 ring-offset-2 ring-transparent hover:ring-slate-200"></button>
                    <button class="w-10 h-10 rounded-full bg-amber-800 ring-2 ring-offset-2 ring-transparent hover:ring-amber-800"></button>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div class="flex gap-4">
                <button class="flex-1 h-16 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                  Thêm vào giỏ hàng
                </button>
                <button class="w-16 h-16 border-2 border-slate-100 text-slate-900 flex items-center justify-center rounded-2xl hover:bg-slate-50 transition-all">
                  <i class="fa-regular fa-heart text-xl"></i>
                </button>
              </div>

              <div class="mt-12 pt-12 border-t border-slate-100 grid grid-cols-2 gap-8">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                    <i class="fa-solid fa-truck-fast"></i>
                  </div>
                  <div>
                    <h5 class="text-sm font-bold text-slate-900">Giao hàng miễn phí</h5>
                    <p class="text-xs text-slate-400">Cho đơn hàng trên 2tr</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                    <i class="fa-solid fa-arrows-rotate"></i>
                  </div>
                  <div>
                    <h5 class="text-sm font-bold text-slate-900">Đổi trả 30 ngày</h5>
                    <p class="text-xs text-slate-400">Yên tâm mua sắm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        ${n.render()}
      </div>
    `}templateSkeleton(){return`
      <div class="min-h-screen bg-white">
        ${t.render()}
        <div class="pt-32 max-w-7xl mx-auto px-6 animate-pulse">
          <div class="flex gap-20">
            <div class="flex-1 aspect-[3/4] bg-slate-100 rounded-[40px]"></div>
            <div class="flex-1 py-10">
              <div class="h-4 bg-slate-100 rounded w-20 mb-6"></div>
              <div class="h-12 bg-slate-100 rounded w-3/4 mb-6"></div>
              <div class="h-8 bg-slate-100 rounded w-1/4 mb-10"></div>
              <div class="space-y-4 mb-10">
                <div class="h-4 bg-slate-50 rounded w-full"></div>
                <div class="h-4 bg-slate-50 rounded w-5/6"></div>
              </div>
              <div class="h-16 bg-slate-100 rounded-2xl w-full"></div>
            </div>
          </div>
        </div>
        ${n.render()}
      </div>
    `}};export{i as ProductDetailModule};