import{t as e}from"./ApiClient-BbZ5Bl-G.js";import{n as t,t as n}from"./ClientFooter-DkeFQirM.js";import{t as r}from"./ProductCard-CI_2UTTo.js";var i=function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})},a=class{render(){return i(this,void 0,void 0,function*(){let t=document.getElementById(`app`);if(t){t.innerHTML=this.template([],[]);try{let[n,r]=yield Promise.all([e.get(`/products?limit=4`),e.get(`/posts`)]);t.innerHTML=this.template(n.data,r.data||[])}catch(e){console.error(`HomeModule Error:`,e)}}})}template(e,i){return`
      <div class="min-h-screen bg-white">
        ${t.render()}
        
        <!-- Hero Section -->
        <section class="relative h-screen flex items-center pt-20 overflow-hidden">
            <div class="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070" class="w-full h-full object-cover opacity-90" alt="Hero">
                <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
            </div>
            <div class="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div class="max-w-2xl">
                    <span class="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-6">New Collection 2026</span>
                    <h1 class="text-7xl font-serif font-black text-slate-900 leading-[1.1] mb-8">
                        Khám phá sự tinh tế của <br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Quiet Luxury.</span>
                    </h1>
                    <div class="flex items-center gap-6">
                        <a href="/products" class="px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">Mua ngay</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Products -->
        <section class="py-32 max-w-7xl mx-auto px-6">
            <div class="flex justify-between items-end mb-16">
                <h2 class="text-4xl font-serif font-black text-slate-900">Sản phẩm nổi bật</h2>
                <a href="/products" class="text-indigo-600 font-bold hover:underline">Xem tất cả →</a>
            </div>
            <div class="grid grid-cols-4 gap-8">
                ${e.length>0?e.map(e=>r.render(e)).join(``):[,,,,].fill(0).map(()=>r.renderSkeleton()).join(``)}
            </div>
        </section>

        ${n.render()}
      </div>
    `}};export{a as HomeModule};