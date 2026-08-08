import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-black text-gray-900 uppercase tracking-widest">Tồn kho</h2>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="search" placeholder="Tìm tên sản phẩm..." 
               class="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-black transition-colors">
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
      </div>

      <!-- List -->
      <div *ngIf="!loading" class="space-y-4">
        <ng-container *ngFor="let p of filteredProducts">
          <div *ngFor="let variant of p.variants" class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <!-- Product Header -->
            <div class="flex items-center gap-3 mb-4 pb-3 border-b border-gray-50">
              <div class="w-10 h-10 rounded bg-gray-50 overflow-hidden shrink-0">
                 <img [src]="p.main_img" class="w-full h-full object-cover">
              </div>
              <div class="flex-1">
                <div class="text-xs font-black text-gray-900 line-clamp-1">{{ p.name }}</div>
                <div class="text-[10px] text-gray-400 mt-0.5">Phân loại hàng hóa</div>
              </div>
            </div>
            
            <!-- Variant Details -->
            <div class="flex items-center justify-between">
              <div class="flex gap-2">
                <span class="inline-flex px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                  Màu: {{ variant.color }}
                </span>
                <span class="inline-flex px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                  Size: {{ variant.size }}
                </span>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="text-right flex flex-col items-end">
                  <span class="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Tồn kho</span>
                  <div class="flex items-center gap-1.5">
                    <span *ngIf="variant.stock_quantity < 5" class="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-black uppercase">
                      Sắp hết
                    </span>
                    <span class="text-lg font-black" [ngClass]="{'text-red-600': variant.stock_quantity < 5, 'text-gray-900': variant.stock_quantity >= 5}">
                      {{ variant.stock_quantity }}
                    </span>
                  </div>
                </div>
                
                <button class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg" title="Nhập kho">
                  <i class="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </ng-container>

        <div *ngIf="filteredProducts.length === 0" class="bg-white p-8 rounded-2xl text-center text-gray-500 text-sm shadow-sm border border-gray-100">
          Không tìm thấy thông tin tồn kho.
        </div>
      </div>
    </div>
  `
})
export class AdminInventoryComponent implements OnInit {
  private http = inject(HttpClient);
  
  products: any[] = [];
  search: string = '';
  loading = true;

  get filteredProducts() {
    if (!this.search) return this.products;
    const s = this.search.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(s));
  }

  ngOnInit() {
    this.fetchInventory();
  }

  fetchInventory() {
    this.loading = true;
    this.http.get('/api/products').subscribe({
      next: (res: any) => {
        const list = res.data || res.products || res;
        // Filter out products that have no variants to display cleanly
        this.products = list.filter((p: any) => p.variants && p.variants.length > 0);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
