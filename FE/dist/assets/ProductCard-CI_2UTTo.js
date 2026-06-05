var e=class{static render(e){return`
      <a href="/products/${e.id}" class="group block">
          <div class="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 mb-6">
              <img src="${e.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${e.name}">
              ${e.isNew?`<span class="absolute top-6 left-6 px-3 py-1 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">New</span>`:``}
              <div class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="w-12 h-12 bg-white rounded-2xl shadow-xl text-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                      <i class="fa-solid fa-plus"></i>
                  </button>
              </div>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">${e.name}</h3>
          <p class="text-slate-500 text-sm mb-3">${e.category||`Casual`}</p>
          <p class="text-indigo-600 font-black text-lg">${(e.price||0).toLocaleString()}đ</p>
      </a>
    `}static renderSkeleton(){return`
      <div class="animate-pulse">
          <div class="aspect-[3/4] bg-slate-100 rounded-3xl mb-6"></div>
          <div class="h-5 bg-slate-100 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-slate-50 rounded w-1/2 mb-4"></div>
          <div class="h-5 bg-slate-100 rounded w-1/3"></div>
      </div>
    `}};export{e as t};