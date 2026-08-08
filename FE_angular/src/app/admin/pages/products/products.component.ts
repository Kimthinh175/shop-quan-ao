import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-black text-gray-900 uppercase tracking-widest">Sản phẩm</h2>
        <button class="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
          <i class="fa-solid fa-plus mr-1"></i> Thêm
        </button>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="search" placeholder="Tìm kiếm sản phẩm..." 
               class="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-black transition-colors">
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
      </div>

      <!-- List -->
      <div *ngIf="!loading" class="space-y-4">
        <div *ngFor="let product of filteredProducts" class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
          <!-- Thumbnail -->
          <div class="w-20 h-24 rounded-xl bg-gray-50 overflow-hidden shrink-0">
            <img [src]="product.main_img" class="w-full h-full object-cover">
          </div>
          
          <!-- Info -->
          <div class="flex-1 flex flex-col justify-between py-1">
            <div>
              <div class="flex justify-between items-start">
                <div class="text-sm font-black text-gray-900 line-clamp-2 leading-tight pr-4">{{ product.name }}</div>
                <div class="flex flex-col gap-2 shrink-0">
                  <button class="w-6 h-6 flex items-center justify-center rounded-full text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors" title="Sửa">
                    <i class="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button (click)="deleteProduct(product._id)" class="w-6 h-6 flex items-center justify-center rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition-colors" title="Xóa">
                    <i class="fa-solid fa-trash text-[10px]"></i>
                  </button>
                </div>
              </div>
              <div class="text-[10px] text-gray-400 mt-1">SKU: {{ product.sku || getShortId(product._id) }}</div>
            </div>
            
            <div class="flex items-center justify-between mt-2">
              <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-wider line-clamp-1 max-w-[100px]">
                {{ product.category_id?.name || 'Uncategorized' }}
              </span>
              <span class="text-sm font-black text-blue-600">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="filteredProducts.length === 0" class="bg-white p-8 rounded-2xl text-center text-gray-500 text-sm shadow-sm border border-gray-100">
          Không tìm thấy sản phẩm nào.
        </div>
      </div>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
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
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = true;
    this.http.get('/api/products').subscribe({
      next: (res: any) => {
        this.products = res.data || res.products || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    
    // Optimistic UI update
    this.products = this.products.filter(p => p._id !== id);

    this.http.delete(`/api/products/${id}`).subscribe({
      error: (err) => {
        alert('Xóa thất bại');
        this.fetchProducts(); // rollback
      }
    });
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.toString().slice(-6).toUpperCase();
  }
}
