import{t as e}from"./ApiClient-BbZ5Bl-G.js";var t=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},n=class{constructor(){this.state={products:[],cart:[],loading:!0}}render(){return t(this,void 0,void 0,function*(){let e=document.getElementById(`app`);e&&(e.innerHTML=this.templateSkeleton(),yield this.fetchProducts(),e.innerHTML=this.template(),this.initEvents())})}fetchProducts(){return t(this,void 0,void 0,function*(){this.state.loading=!0;try{let t=yield e.get(`/products?limit=50`);this.state.products=t.data}catch(e){console.error(e)}finally{this.state.loading=!1}})}initEvents(){let e=document.getElementById(`pos-product-grid`);e&&e.querySelectorAll(`.pos-product-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.id,n=this.state.products.find(e=>String(e.id||e._id)===t);n&&this.addToCart(n)})});let t=document.getElementById(`pos-pay-btn`);t&&t.addEventListener(`click`,()=>{if(this.state.cart.length===0){alert(`Giỏ hàng đang trống!`);return}alert(`Thanh toán thành công!`),this.state.cart=[],this.updateCartUI()})}addToCart(e){let t=this.state.cart.find(t=>(t.product.id||t.product._id)===(e.id||e._id));t?t.quantity++:this.state.cart.push({product:e,quantity:1}),this.updateCartUI()}updateCartUI(){let e=document.getElementById(`pos-cart-items`);if(e){if(this.state.cart.length===0){e.innerHTML=`<p class="text-slate-400 text-sm text-center py-10">Giỏ hàng trống</p>`,this.updateTotals();return}e.innerHTML=this.state.cart.map(e=>{let t=e.product.price||(e.product.variants&&e.product.variants.length>0?e.product.variants[0].price:0);return`
        <div class="flex gap-4 items-center">
          <img src="${e.product.image||`https://images.unsplash.com/photo-1594932224011-042041c62fed?w=100`}" class="w-12 h-12 object-cover rounded-xl" alt="">
          <div class="flex-1">
            <h4 class="text-sm font-bold text-slate-800">${e.product.name}</h4>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-slate-400">SL: ${e.quantity}</span>
              <span class="font-bold text-indigo-600">${(t*e.quantity).toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      `}).join(``),this.updateTotals()}}updateTotals(){let e=document.getElementById(`pos-subtotal`),t=document.getElementById(`pos-total`),n=0;this.state.cart.forEach(e=>{let t=e.product.price||(e.product.variants&&e.product.variants.length>0?e.product.variants[0].price:0);n+=t*e.quantity}),e&&(e.textContent=`${n.toLocaleString()}đ`),t&&(t.textContent=`${n.toLocaleString()}đ`)}template(){return`
      <div class="bg-slate-50 h-screen overflow-hidden flex w-full">
        <!-- Sidebar (Mini) -->
        <aside class="w-20 bg-slate-900 h-full flex flex-col items-center py-6 gap-8">
          <div class="text-white text-2xl font-bold">C.</div>
          <nav class="flex flex-col gap-4">
            <a href="/admin" class="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 transition-all"><i class="fa-solid fa-chart-pie text-xl"></i></a>
            <a href="/admin/pos" class="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"><i class="fa-solid fa-cash-register text-xl"></i></a>
            <a href="/admin/products" class="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 transition-all"><i class="fa-solid fa-box text-xl"></i></a>
            <a href="/admin/orders" class="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 transition-all"><i class="fa-solid fa-receipt text-xl"></i></a>
          </nav>
          <div class="mt-auto">
            <a href="/" class="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 transition-all"><i class="fa-solid fa-right-from-bracket text-xl"></i></a>
          </div>
        </aside>

        <!-- Main POS Area -->
        <main class="flex-1 flex overflow-hidden">
          <!-- Left Side: Product Selection -->
          <section class="flex-1 flex flex-col p-6 overflow-hidden">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h1 class="text-2xl font-extrabold text-slate-800">Bán hàng tại quầy</h1>
                <p class="text-slate-500 text-sm">Nhân viên: Thịnh Admin | Ca sáng</p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div id="pos-product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${this.state.products.map(e=>{let t=e.price||(e.variants&&e.variants.length>0?e.variants[0].price:0);return`
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-indigo-500 transition-all cursor-pointer group pos-product-card" data-id="${e.id||e._id}">
                      <div class="relative mb-4 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        <img src="${e.image||`https://images.unsplash.com/photo-1594932224011-042041c62fed?w=400`}" class="w-full h-full object-cover" alt="${e.name}">
                      </div>
                      <h3 class="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-all line-clamp-1">${e.name}</h3>
                      <p class="text-indigo-600 font-extrabold">${t.toLocaleString()}đ</p>
                    </div>
                  `}).join(``)}
              </div>
            </div>
          </section>

          <!-- Right Side: Cart & Payment -->
          <section class="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-2xl shrink-0">
            <!-- Customer Selector -->
            <div class="p-6 border-bottom border-slate-100 bg-slate-50/50">
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-slate-800">Khách lẻ tại quầy</h2>
              </div>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-6 custom-scrollbar" id="pos-cart-items">
              <p class="text-slate-400 text-sm text-center py-10">Giỏ hàng trống</p>
            </div>

            <!-- Summary & Checkout -->
            <div class="p-6 bg-slate-50 border-t border-slate-200">
              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính</span>
                  <span class="font-bold text-slate-800" id="pos-subtotal">0đ</span>
                </div>
                <div class="flex justify-between text-xl font-extrabold text-slate-800 pt-3 border-t border-slate-200">
                  <span>Tổng cộng</span>
                  <span class="text-indigo-600" id="pos-total">0đ</span>
                </div>
              </div>

              <button class="w-full py-4 bg-slate-900 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all" id="pos-pay-btn">
                THANH TOÁN (F12)
              </button>
            </div>
          </section>
        </main>
      </div>
    `}templateSkeleton(){return`
      <div class="bg-slate-50 h-screen overflow-hidden flex w-full animate-pulse">
        <aside class="w-20 bg-slate-900 h-full"></aside>
        <main class="flex-1 flex overflow-hidden">
          <div class="flex-1 p-6 space-y-6">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="grid grid-cols-4 gap-4">
              ${[,,,,].fill(0).map(()=>`<div class="h-48 bg-slate-200 rounded-2xl"></div>`).join(``)}
            </div>
          </div>
        </main>
      </div>
    `}};export{n as AdminPOSModule};