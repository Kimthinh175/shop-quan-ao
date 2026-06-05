import{t as e}from"./ApiClient-BbZ5Bl-G.js";import{n as t,t as n}from"./ClientFooter-DkeFQirM.js";import{t as r}from"./ProductCard-CI_2UTTo.js";var i=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},a=class{constructor(){this.state={products:[],categories:[],pagination:{},loading:!0,filters:{page:1,limit:12,category_id:null}}}render(){return i(this,void 0,void 0,function*(){let e=document.getElementById(`app`);e&&(e.innerHTML=this.template(),yield Promise.all([this.fetchCategories(),this.fetchData()]),this.renderSidebar(),this.updateProductList())})}fetchCategories(){return i(this,void 0,void 0,function*(){try{this.state.categories=yield e.get(`/categories`)}catch(e){console.error(e)}})}fetchData(){return i(this,void 0,void 0,function*(){this.state.loading=!0,this.updateProductList();try{let{page:t,limit:n,category_id:r}=this.state.filters,i=`/products?page=${t}&limit=${n}`;r&&(i+=`&category_id=${r}`);let a=yield e.get(i);this.state.products=a.data,this.state.pagination=a.pagination}catch(e){console.error(e)}finally{this.state.loading=!1}})}renderSidebar(){let e=document.getElementById(`category-list`);e&&(e.innerHTML=`
      <li>
        <button class="category-btn text-sm font-bold ${this.state.filters.category_id?`text-slate-500`:`text-indigo-600`} hover:text-indigo-600 transition-colors" data-id="">
          Tất cả
        </button>
      </li>
      ${this.state.categories.map(e=>`
        <li>
          <button class="category-btn text-sm font-bold ${this.state.filters.category_id===e.id?`text-indigo-600`:`text-slate-500`} hover:text-indigo-600 transition-colors" data-id="${e.id}">
            ${e.name} <span class="text-slate-300 font-medium ml-1">(${e.count})</span>
          </button>
        </li>
      `).join(``)}
    `,e.querySelectorAll(`.category-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.id;this.state.filters.category_id=t?parseInt(t):null,this.state.filters.page=1,this.fetchData().then(()=>{this.renderSidebar(),this.updateProductList()})})}))}updateProductList(){let e=document.getElementById(`product-grid`);e&&(this.state.loading?e.innerHTML=[,,,,,,].fill(0).map(()=>r.renderSkeleton()).join(``):(e.innerHTML=this.state.products.map(e=>r.render(e)).join(``),this.renderPagination()))}renderPagination(){let e=document.getElementById(`pagination-container`);if(!e)return;let{currentPage:t,totalPages:n}=this.state.pagination;if(n<=1){e.innerHTML=``;return}let r=`<div class="flex items-center gap-2">`;for(let e=1;e<=n;e++)r+=`
        <button class="page-btn w-10 h-10 rounded-xl font-bold text-sm transition-all ${e===t?`bg-slate-900 text-white shadow-lg`:`bg-white text-slate-500 hover:bg-slate-50 border border-slate-100`}" data-page="${e}">
          ${e}
        </button>
      `;r+=`</div>`,e.innerHTML=r,e.querySelectorAll(`.page-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.page;this.state.filters.page=parseInt(t),this.fetchData().then(()=>this.updateProductList()),window.scrollTo({top:0,behavior:`smooth`})})})}template(){return`
      <div class="min-h-screen bg-white pt-20">
        ${t.render()}
        
        <section class="py-16 bg-slate-50 border-b border-slate-100">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <h1 class="text-4xl font-serif font-black text-slate-900 mb-4">Cửa hàng</h1>
                <p class="text-slate-500 font-medium">Khám phá bộ sưu tập Quiet Luxury mới nhất của chúng tôi</p>
            </div>
        </section>

        <div class="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-12">
            <aside class="w-full md:w-64 shrink-0">
                <div class="sticky top-32">
                  <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Danh mục</h3>
                  <ul id="category-list" class="space-y-5">
                    <!-- Categories loading... -->
                  </ul>
                </div>
            </aside>

            <div class="flex-1">
                <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    ${[,,,,,,].fill(0).map(()=>r.renderSkeleton()).join(``)}
                </div>
                
                <div id="pagination-container" class="mt-20 flex justify-center">
                  <!-- Pagination loading... -->
                </div>
            </div>
        </div>

        ${n.render()}
      </div>
    `}};export{a as CatalogModule};