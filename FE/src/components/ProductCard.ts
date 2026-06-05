import { IProduct } from "../shared/models/IProduct";

export class ProductCard {
  public static render(p: IProduct): string {
    return `
      <div class="group relative">
          <a href="/products/${p.id}" class="block">
              <div class="relative overflow-hidden aspect-[3/4] bg-[#f3f2f0] mb-6 rounded-xl">
                  <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="${p.name}">
                  ${p.isNew ? '<span class="absolute top-6 left-6 text-[8px] font-black uppercase tracking-[0.3em] bg-[#c19a6b] text-white px-3 py-1.5 shadow-sm rounded">Mới Nhất</span>' : ""}
                  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 w-[80%]">
                      <span class="bg-black/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest py-3 block text-center rounded-xl">Xem Chi Tiết</span>
                  </div>
              </div>
              <div class="flex justify-between items-start">
                  <div>
                      <h3 class="text-xs font-black uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-all">${p.name}</h3>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${p.category || "Casual"}</p>
                  </div>
                  <p class="text-xs font-black text-slate-900">${(p.price || 0).toLocaleString()}đ</p>
              </div>
          </a>
      </div>
    `;
  }

  public static renderSkeleton(): string {
    return `
      <div class="animate-pulse">
          <div class="aspect-[3/4] bg-slate-100 rounded-3xl mb-6"></div>
          <div class="h-5 bg-slate-100 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-slate-50 rounded w-1/2 mb-4"></div>
          <div class="h-5 bg-slate-100 rounded w-1/3"></div>
      </div>
    `;
  }
}
