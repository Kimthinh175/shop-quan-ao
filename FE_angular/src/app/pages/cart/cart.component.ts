import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { PromotionService } from '../../services/promotion.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  template: `
    <div class="bg-white min-h-screen pb-[200px]">
      <!-- Header -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between sticky top-14 bg-white/90 backdrop-blur z-40">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="text-gray-800 hover:text-blue-600">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h1 class="font-bold text-lg uppercase tracking-wider text-gray-800">Giỏ hàng</h1>
        </div>
        <span class="text-xs font-bold text-gray-500">{{ totalCount }} SP</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="items.length === 0" class="text-center py-20 text-gray-400">
        <i class="fa-solid fa-bag-shopping text-5xl mb-4 text-gray-200"></i>
        <p class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Giỏ hàng trống</p>
        <a routerLink="/catalog" class="inline-block px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors">Mua sắm ngay</a>
      </div>

      <!-- Cart Items -->
      <div *ngIf="items.length > 0" class="p-4 space-y-6">
        <div *ngFor="let item of items" class="flex gap-4 animate-[fadeIn_0.3s_ease-out]">
          <!-- Product Image -->
          <div class="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
            <img [src]="item.image || 'https://via.placeholder.com/150'" class="w-full h-full object-cover">
          </div>
          
          <!-- Product Details -->
          <div class="flex-1 flex flex-col">
            <div class="flex justify-between items-start gap-2">
              <div>
                <h3 class="text-sm font-bold text-gray-900 uppercase leading-snug line-clamp-2">
                  {{ item.name }}
                </h3>
                <p class="text-xs text-gray-500 mt-1 capitalize">
                  {{ item.color || 'Mặc định' }} <span *ngIf="item.size">/ {{ item.size }}</span>
                </p>
              </div>
              <button (click)="removeItem(item.id)" class="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            
            <div class="mt-auto flex justify-between items-end">
              <span class="text-sm font-bold text-blue-600">
                {{ item.price | currency:'VND':'symbol':'1.0-0' }}
              </span>
              
              <!-- Quantity Control -->
              <div class="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                <button (click)="updateQty(item.id, item.quantity - 1)" class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black">
                  <i class="fa-solid fa-minus text-[10px]"></i>
                </button>
                <span class="text-xs font-bold w-4 text-center">{{ item.quantity }}</span>
                <button (click)="updateQty(item.id, item.quantity + 1)" class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black">
                  <i class="fa-solid fa-plus text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary & Checkout (Fixed Bottom) -->
      <div *ngIf="items.length > 0" class="fixed bottom-[65px] w-full md:w-[480px] bg-white border-t border-gray-100 p-4 pb-safe z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div class="flex justify-between items-end mb-4">
          <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Tạm tính</span>
          <div class="text-right">
            <span *ngIf="originalTotalPrice > totalPrice" class="text-xs text-gray-400 line-through block mb-1">
              {{ originalTotalPrice | currency:'VND':'symbol':'1.0-0' }}
            </span>
            <span class="text-lg font-black text-gray-900">{{ totalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
        </div>
        <a routerLink="/checkout" class="w-full flex items-center justify-center h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
          Tiến hành thanh toán
        </a>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private promoService = inject(PromotionService);

  items: CartItem[] = [];
  totalPrice = 0;
  originalTotalPrice = 0;
  totalCount = 0;

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.promoService.loadActivePromotions().subscribe(() => {
        this.items = items.map(item => {
          // Calculate the original base price of the item from cart (assuming item.price is the current cart price)
          // Actually, we need to know the base price. Since item.price might have been discounted when added, 
          // a better way is to keep a base_price in cart item. But we can assume item.price is already the current price.
          // Wait, if item.price in cart is the discounted price, we shouldn't apply promo again. 
          // We need the CartService to store the real base_price or we re-fetch.
          // In product-detail, we save currentPrice which IS the discounted price.
          return item;
        });
        this.calculateTotals();
      });
    });
  }

  calculateTotals() {
    this.totalPrice = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.originalTotalPrice = this.items.reduce((acc, item) => acc + ((item as any).original_price || item.price) * item.quantity, 0);
    this.totalCount = this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  updateQty(id: string, qty: number) {
    if (qty > 0) {
      this.cartService.updateQuantity(id, qty);
    } else {
      this.removeItem(id);
    }
  }

  removeItem(id: string) {
    if (confirm('Bạn muốn xóa sản phẩm này khỏi giỏ?')) {
      this.cartService.removeFromCart(id);
    }
  }

  goBack() {
    window.history.back();
  }
}
