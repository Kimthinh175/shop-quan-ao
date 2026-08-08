import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-pos',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <h2 class="text-base font-black text-gray-900 mb-4 uppercase tracking-widest">POS — Bán hàng</h2>

      <div class="flex gap-2 mb-4">
        <input type="text" [(ngModel)]="search" placeholder="Tìm sản phẩm..." 
               class="flex-1 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-black transition-colors">
      </div>

      <!-- Product Grid -->
      <div *ngIf="loadingProducts" class="flex justify-center py-10">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-300"></i>
      </div>
      <div *ngIf="!loadingProducts" class="grid grid-cols-2 gap-3 mb-4">
        <div *ngFor="let p of filteredProducts" 
             (click)="addToCart(p)"
             class="bg-white border border-gray-100 rounded-2xl p-3 cursor-pointer hover:border-black hover:shadow-md transition-all active:scale-95">
          <div class="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
            <img [src]="p.main_img" class="w-full h-full object-cover" [alt]="p.name">
          </div>
          <div class="text-xs font-black text-gray-900 line-clamp-2 leading-tight mb-1">{{ p.name }}</div>
          <div class="text-xs font-black text-blue-600">{{ p.price | currency:'VND':'symbol':'1.0-0' }}</div>
        </div>
        <div *ngIf="filteredProducts.length === 0" class="col-span-2 text-center text-gray-400 text-sm py-8">
          Không tìm thấy sản phẩm.
        </div>
      </div>

      <!-- Cart Section -->
      <div class="bg-white border border-gray-100 rounded-2xl p-4">
        <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Giỏ hàng</h3>
        <div *ngIf="cart.length === 0" class="text-center text-gray-300 text-sm py-4">
          <i class="fa-solid fa-cart-shopping text-2xl mb-2"></i>
          <div>Chưa có sản phẩm</div>
        </div>
        <div class="space-y-2 mb-4">
          <div *ngFor="let item of cart" class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-xs font-bold text-gray-900 line-clamp-1">{{ item.name }}</div>
              <div class="text-[10px] text-blue-600 font-bold">{{ item.price | currency:'VND':'symbol':'1.0-0' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="changeQty(item, -1)" class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black hover:bg-gray-200">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="w-6 text-center text-sm font-black">{{ item.qty }}</span>
              <button (click)="changeQty(item, 1)" class="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black hover:bg-gray-800">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="cart.length > 0">
          <div class="flex justify-between items-center border-t border-gray-100 pt-3 mb-3">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Tổng</span>
            <span class="text-base font-black text-gray-900">{{ total | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
          <button class="w-full bg-black text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
            <i class="fa-solid fa-cash-register mr-2"></i> Thanh toán
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminPosComponent implements OnInit {
  private http = inject(HttpClient);
  products: any[] = [];
  cart: any[] = [];
  search = '';
  loadingProducts = true;

  get filteredProducts() {
    if (!this.search) return this.products;
    return this.products.filter(p => p.name.toLowerCase().includes(this.search.toLowerCase()));
  }

  get total() {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  ngOnInit() {
    this.http.get('/api/products').subscribe({
      next: (res: any) => {
        this.products = res.data || res.products || res;
        this.loadingProducts = false;
      },
      error: () => { this.loadingProducts = false; }
    });
  }

  addToCart(product: any) {
    const existing = this.cart.find(i => i._id === product._id);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...product, qty: 1 });
    }
  }

  changeQty(item: any, delta: number) {
    item.qty += delta;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(i => i._id !== item._id);
    }
  }
}
