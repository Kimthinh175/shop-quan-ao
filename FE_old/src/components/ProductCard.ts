import { IProduct } from "../shared/models/IProduct";

export class ProductCard {
  public static render(p: IProduct): string {
    const mainImg = p.image || (p as import("../shared/models/IProduct").IProduct & { main_img?: string }).main_img;
    const hasDetailImg = p.images && p.images.length > 0;
    
    // Tìm giá của product (từ variants nếu có)
    let displayPrice = p.price || 0;
    if (!displayPrice && p.variants && p.variants.length > 0) {
        displayPrice = p.variants[0].price || 0;
    }
    
    // Giả lập badge giảm giá (tạm thời)
    const isSale = Math.random() > 0.7;
    const originalPrice = isSale ? displayPrice * 1.5 : displayPrice;

    return `
      <div class="group flex flex-col bg-white rounded-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
        ${isSale ? `<div class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-30">-33%</div>` : ''}
        
        <a href="/products/${p.id || p._id}" class="block aspect-[3/4] overflow-hidden relative bg-slate-100">
            <!-- Ảnh thứ 2 (Detail) nằm dưới -->
            ${hasDetailImg ? `<img src="${p.images![0]}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 z-0" alt="Detail ${p.name}">` : ''}
            
            <!-- Ảnh chính (Main) nằm trên -->
            <img src="${mainImg}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hasDetailImg ? 'group-hover:opacity-0' : 'group-hover:scale-105'} z-10" alt="${p.name}">
            
            <!-- View details overlay for Desktop -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex z-20 bg-black/10">
               <span class="w-12 h-12 bg-white text-slate-900 rounded-full shadow-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                  <i class="fa-regular fa-eye text-lg"></i>
               </span>
            </div>
        </a>
        
        <div class="p-3 flex flex-col flex-1">
            <div class="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <i class="fa-solid fa-star text-yellow-400 text-[10px]"></i>
              <span class="font-bold">4.9</span> (1.2k)
            </div>
            <a href="/products/${p.id || p._id}" class="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-[#2a83e9] mb-2 leading-tight">
              ${p.name}
            </a>
            <div class="mt-auto flex items-end gap-2">
              <span class="text-base font-bold text-red-600">${displayPrice.toLocaleString()}đ</span>
              ${isSale ? `<span class="text-xs text-slate-400 line-through mb-[2px]">${originalPrice.toLocaleString()}đ</span>` : ''}
            </div>
            <!-- Mobile view link handled by the main anchor tag -->
        </div>
      </div>
    `;
  }

  public static renderSkeleton(): string {
    return `
      <div class="animate-pulse bg-white rounded-lg border border-slate-100 p-2">
          <div class="aspect-[3/4] bg-slate-200 rounded mb-3"></div>
          <div class="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div class="h-4 bg-slate-200 rounded w-full mb-1"></div>
          <div class="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
          <div class="h-5 bg-slate-200 rounded w-1/3"></div>
      </div>
    `;
  }
}
