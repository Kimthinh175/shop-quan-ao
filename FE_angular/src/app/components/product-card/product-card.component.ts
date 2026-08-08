import { Component, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DragDropCartService } from '../../services/drag-drop-cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  template: `
    <div [draggable]="true"
         (dragstart)="onDragStart($event)"
         (dragend)="onDragEnd($event)"
         (mouseenter)="onMouseEnter()"
         (mouseleave)="onMouseLeave()"
         class="group block relative cursor-grab active:cursor-grabbing outline-none select-none bg-white rounded-2xl p-2 border border-gray-100 hover:border-amber-400/40 hover:shadow-lg transition-all duration-300">
      
      <!-- Image Container with Hover Overlay -->
      <div class="relative bg-gray-50 overflow-hidden rounded-xl aspect-[3/4] mb-2.5">
        
        <!-- Main Image -->
        <img *ngIf="product?.main_img" 
             [src]="product.main_img" 
             [alt]="product.name" 
             class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105">
        
        <!-- Hover Secondary Image -->
        <img *ngIf="product?.images?.length && product?.images?.[0] !== product?.main_img" 
             [src]="product.images[0]" 
             [alt]="product.name + ' hover'" 
             class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-hover:scale-105">

        <!-- Fallback Placeholder -->
        <div *ngIf="!product?.main_img && !product?.images?.length" class="w-full h-full flex flex-col items-center justify-center text-gray-300">
          <i class="fa-solid fa-shirt text-3xl mb-2"></i>
          <span class="text-[10px] font-bold uppercase tracking-widest">No Image</span>
        </div>

        <!-- Top Badges (CLOSET Brand Tag & Discount Badge) -->
        <div class="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          <span class="px-2 py-0.5 bg-black/80 backdrop-blur-md text-amber-400 text-[8px] font-serif-brand font-black uppercase tracking-[0.2em] rounded-md shadow-sm border border-amber-400/30">
            CLOSET
          </span>
          <!-- Flash Sale badge -->
          <span *ngIf="product?.is_flash_sale"
                class="px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-wider rounded-md shadow-md flex items-center gap-0.5"
                style="background: linear-gradient(135deg, #dc2626, #ea580c)">
            <i class="fa-solid fa-fire text-[7px]"></i> Sale
          </span>
          <span *ngIf="product?.discount_percent > 0" 
                class="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-md">
            -{{ product.discount_percent }}%
          </span>
        </div>

        <!-- Glassmorphism Hover Overlay Actions -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-3 z-20">
          
          <!-- Xem chi tiết -->
          <button (click)="viewDetail($event)" 
                  class="w-full py-2 bg-white/90 hover:bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5">
            <i class="fa-regular fa-eye"></i> Xem chi tiết
          </button>

          <!-- Mua ngay -->
          <button (click)="quickBuy($event)" 
                  class="w-full py-2 bg-brand-black hover:bg-black text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 border border-brand-gold/60">
            <i class="fa-solid fa-bag-shopping"></i> Mua ngay
          </button>

          <!-- Drag Badge Tip -->
          <span class="text-[8px] font-extrabold uppercase tracking-widest text-amber-300 mt-1 flex items-center gap-1">
            <i class="fa-solid fa-hand-pointer animate-bounce"></i> Kéo thả giỏ hàng
          </span>
        </div>
      </div>
      
      <!-- Details -->
      <div class="px-1 text-center" (click)="viewDetail($event)">
        <!-- Category / Brand Line -->
        <span class="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-600 mb-0.5 line-clamp-1">
          {{ product?.category_id?.name || product?.brand_id?.name || 'LUXURY SELECTION' }}
        </span>

        <!-- Product Name -->
        <h3 class="text-[12px] font-extrabold text-gray-900 uppercase tracking-wide leading-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
          {{ product?.name }}
        </h3>

        <!-- Price & Discount -->
        <div class="flex items-center justify-center gap-1.5 mt-1.5">
          <span class="text-xs font-black text-gray-900">
            {{ (product?.sale_price || product?.price || product?.default_price || (product?.variants?.[0]?.price) || 350000) | currency:'VND':'symbol':'1.0-0' }}
          </span>
          <span *ngIf="product?.original_price && product?.original_price > (product?.sale_price || product?.price || product?.default_price || 0)" 
                class="text-[9px] text-gray-400 line-through">
            {{ product.original_price | currency:'VND':'symbol':'1.0-0' }}
          </span>
        </div>

        <!-- NEW mode: N ngày trước badge -->
        <div *ngIf="mode === 'new'" class="mt-1.5 flex justify-center">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black"
                [ngClass]="product?.days_ago === 0 ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'">
            <i class="fa-regular fa-clock text-[7px]"></i>
            {{ product?.days_ago === 0 ? 'Hôm nay' : (product?.days_ago === 1 ? '1 ngày trước' : (product?.days_ago + ' ngày trước')) }}
          </span>
        </div>

        <!-- POPULAR mode: Đã bán X badge -->
        <div *ngIf="mode === 'popular'" class="mt-1.5 flex justify-center">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black bg-red-50 text-red-600 border border-red-200">
            <i class="fa-solid fa-fire text-[7px]"></i>
            Đã bán {{ product?.sold_count || 0 }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product: any;
  @Input() mode: 'default' | 'new' | 'popular' = 'default';

  private cartService = inject(CartService);
  private dragDropService = inject(DragDropCartService);
  private router = inject(Router);

  onMouseEnter() {
    this.dragDropService.showDropZone();
  }

  onMouseLeave() {
    this.dragDropService.hideDropZone();
  }

  onDragStart(event: DragEvent) {
    this.dragDropService.showDropZone();
    if (event.dataTransfer && this.product) {
      event.dataTransfer.setData('text/plain', JSON.stringify(this.product));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragEnd(event: DragEvent) {
    this.dragDropService.hideDropZone();
  }

  viewDetail(event: Event) {
    event.stopPropagation();
    this.dragDropService.hideDropZone();
    const id = this.product?.slug || this.product?._id || this.product?.id;
    if (id) {
      this.router.navigate(['/product', id]);
    }
  }

  quickBuy(event: Event) {
    event.stopPropagation();
    this.dragDropService.hideDropZone();
    if (!this.product) return;
    
    const buyItem = {
      id: `${this.product._id || this.product.id}`,
      product_id: this.product._id || this.product.id,
      variant_id: this.product.variants?.[0]?._id || this.product._id || this.product.id,
      name: this.product.name,
      price: this.product.sale_price || this.product.price || this.product.default_price || (this.product.variants?.[0]?.price) || 350000,
      original_price: this.product.original_price || this.product.default_price || (this.product.variants?.[0]?.price) || 350000,
      quantity: 1,
      image: this.product.main_img || 'https://via.placeholder.com/150'
    };

    this.cartService.setBuyNowItem(buyItem);
    this.router.navigate(['/checkout']);
  }
}
