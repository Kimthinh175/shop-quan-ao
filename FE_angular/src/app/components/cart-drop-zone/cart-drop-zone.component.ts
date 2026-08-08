import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { DragDropCartService } from '../../services/drag-drop-cart.service';

@Component({
  selector: 'app-cart-drop-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-[65px] left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-gray-950 border-t border-amber-500/40 z-40 transition-all duration-300 ease-out select-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
         [ngClass]="{
           'translate-y-0 opacity-100 pointer-events-auto': isVisible || isDragOver || isHoveredSelf || lastDroppedItem,
           'translate-y-full opacity-0 pointer-events-none': !isVisible && !isDragOver && !isHoveredSelf && !lastDroppedItem
         }"
         (mouseenter)="onSelfMouseEnter()"
         (mouseleave)="onSelfMouseLeave()"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">

      <div class="px-4 py-3 bg-gradient-to-r from-gray-950 via-black to-slate-950 transition-all duration-300"
           [ngClass]="{
             'bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-emerald-400 scale-[1.01]': isDragOver,
             'animate-[bounce_0.4s_ease-out]': justDropped
           }">

        <div class="flex items-center justify-between gap-3 text-white">
          <!-- Trolley Icon Container -->
          <div class="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0 transition-all"
               [ngClass]="{ 'scale-110 bg-emerald-400/30 border-emerald-400': isDragOver }">
            <i class="fa-solid fa-cart-shopping text-amber-400 text-base" 
               [ngClass]="{ 'text-emerald-300': isDragOver }"></i>
          </div>

          <!-- Drop Instructions -->
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider text-amber-400" 
                    [ngClass]="{ 'text-emerald-300': isDragOver }">
                {{ isDragOver ? 'Thả để mua ngay!' : 'Giỏ hàng Siêu thị' }}
              </span>
              <span class="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase font-bold tracking-widest">
                Kéo - Thả
              </span>
            </div>
            <p class="text-[10px] text-gray-400 leading-tight mt-0.5">
              {{ isDragOver ? 'Buông tay để thêm sản phẩm này vào giỏ' : 'Kéo thả box sản phẩm vào đây để bỏ giỏ nhanh' }}
            </p>
          </div>

          <!-- Arrow / Action indicator -->
          <div class="text-xs text-amber-400/80 animate-pulse shrink-0">
            <i class="fa-solid" [ngClass]="isDragOver ? 'fa-circle-down text-emerald-300 text-lg' : 'fa-hand-holding-hand'"></i>
          </div>
        </div>

        <!-- Toast Notification Alert on Successful Drop -->
        <div *ngIf="lastDroppedItem" 
             class="mt-2 p-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-between animate-[fadeIn_0.2s_ease-out]">
          <div class="flex items-center gap-2 line-clamp-1">
            <i class="fa-solid fa-circle-check text-xs"></i>
            <span>Đã thêm "{{ lastDroppedItem }}" vào giỏ hàng!</span>
          </div>
          <button (click)="lastDroppedItem = null" class="text-white/80 hover:text-white px-1">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

      </div>
    </div>
  `
})
export class CartDropZoneComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private dragDropService = inject(DragDropCartService);

  isVisible = false;
  isDragOver = false;
  isHoveredSelf = false;
  justDropped = false;
  lastDroppedItem: string | null = null;

  private sub!: Subscription;
  private toastTimer: any;

  ngOnInit() {
    this.sub = this.dragDropService.isDropZoneVisible$.subscribe(visible => {
      this.isVisible = visible;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  @HostListener('window:dragstart')
  onWindowDragStart() {
    this.isVisible = true;
  }

  @HostListener('window:dragend')
  onWindowDragEnd() {
    this.isVisible = false;
    this.isDragOver = false;
  }

  onSelfMouseEnter() {
    this.isHoveredSelf = true;
  }

  onSelfMouseLeave() {
    this.isHoveredSelf = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (!event.dataTransfer) return;

    try {
      const dataStr = event.dataTransfer.getData('application/json');
      if (!dataStr) return;

      const product = JSON.parse(dataStr);
      if (product) {
        this.cartService.addToCart({
          id: product._id || product.id,
          product_id: product._id || product.id,
          name: product.name,
          price: product.default_price || product.price || 0,
          quantity: 1,
          image: product.main_img || 'https://via.placeholder.com/150'
        });

        this.justDropped = true;
        this.lastDroppedItem = product.name;

        setTimeout(() => {
          this.justDropped = false;
        }, 400);

        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
          this.lastDroppedItem = null;
        }, 3500);
      }
    } catch (err) {
      console.error('Error parsing dropped product:', err);
    }
  }
}
