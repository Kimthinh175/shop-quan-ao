import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Header / Title -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between sticky top-14 bg-white/90 backdrop-blur z-40">
        <h1 class="font-bold text-lg uppercase tracking-wider text-gray-800">
          {{ currentCategoryName || 'Tất cả sản phẩm' }}
        </h1>
        <button (click)="isFilterOpen = true" class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-blue-600 transition-colors">
          <i class="fa-solid fa-sliders"></i>
          <span>Lọc</span>
        </button>
      </div>

      <!-- Product Grid -->
      <div class="p-4">
        <div *ngIf="loading" class="flex justify-center py-12">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
        </div>
        
        <div *ngIf="!loading && products.length === 0" class="text-center py-16 text-gray-400">
          <i class="fa-solid fa-box-open text-4xl mb-3"></i>
          <p class="text-sm">Không tìm thấy sản phẩm nào.</p>
        </div>

        <div *ngIf="!loading && products.length > 0" class="grid grid-cols-2 gap-3 gap-y-6">
          <app-product-card *ngFor="let p of products" [product]="p"></app-product-card>
        </div>
        
        <!-- Load More (Mockup) -->
        <div *ngIf="!loading && products.length > 0" class="text-center mt-8 mb-4">
          <button class="px-6 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Tải thêm
          </button>
        </div>
      </div>
      
      <!-- Slide-up Filter Modal -->
      <div *ngIf="isFilterOpen" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="isFilterOpen = false"></div>
        <div class="relative bg-white w-full md:w-[480px] md:mx-auto h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]">
          <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 rounded-t-3xl z-10">
            <span class="font-bold uppercase tracking-widest text-sm">Bộ lọc</span>
            <button (click)="isFilterOpen = false" class="text-gray-400 text-xl"><i class="fa-solid fa-xmark"></i></button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <!-- Sắp xếp -->
            <div>
              <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Sắp xếp</h4>
              <div class="flex flex-wrap gap-2">
                <button (click)="selectedFilters.sort = '-_id'" [ngClass]="selectedFilters.sort === '-_id' ? 'border-black text-black' : 'border-gray-200 text-gray-500'" class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">Mới nhất</button>
                <button (click)="selectedFilters.sort = 'price'" [ngClass]="selectedFilters.sort === 'price' ? 'border-black text-black' : 'border-gray-200 text-gray-500'" class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">Giá tăng dần</button>
                <button (click)="selectedFilters.sort = '-price'" [ngClass]="selectedFilters.sort === '-price' ? 'border-black text-black' : 'border-gray-200 text-gray-500'" class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">Giá giảm dần</button>
              </div>
            </div>

            <hr class="border-gray-100">

            <!-- Giới tính -->
            <div *ngIf="filterOptions?.genders?.length">
              <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Giới tính</h4>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let item of filterOptions.genders" 
                        (click)="toggleFilter('gender_id', item._id)"
                        [ngClass]="selectedFilters.gender_id === item._id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'" 
                        class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">
                  {{ item.name }}
                </button>
              </div>
            </div>

            <!-- Mùa -->
            <div *ngIf="filterOptions?.seasons?.length">
              <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Mùa</h4>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let item of filterOptions.seasons" 
                        (click)="toggleFilter('season_id', item._id)"
                        [ngClass]="selectedFilters.season_id === item._id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'" 
                        class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">
                  {{ item.name }}
                </button>
              </div>
            </div>

            <!-- Form -->
            <div *ngIf="filterOptions?.forms?.length">
              <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Form áo</h4>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let item of filterOptions.forms" 
                        (click)="toggleFilter('form_id', item._id)"
                        [ngClass]="selectedFilters.form_id === item._id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'" 
                        class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">
                  {{ item.name }}
                </button>
              </div>
            </div>

            <!-- Brand -->
            <div *ngIf="filterOptions?.brands?.length">
              <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Thương hiệu</h4>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let item of filterOptions.brands" 
                        (click)="toggleFilter('brand_id', item._id)"
                        [ngClass]="selectedFilters.brand_id === item._id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'" 
                        class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">
                  {{ item.name }}
                </button>
              </div>
            </div>

            <!-- Material -->
            <div *ngIf="filterOptions?.materials?.length">
              <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Chất liệu</h4>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let item of filterOptions.materials" 
                        (click)="toggleFilter('material_id', item._id)"
                        [ngClass]="selectedFilters.material_id === item._id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'" 
                        class="px-4 py-2 border text-xs font-bold rounded-full transition-colors">
                  {{ item.name }}
                </button>
              </div>
            </div>
            
            <div class="h-10"></div> <!-- Spacer -->
          </div>

          <!-- Actions -->
          <div class="p-4 border-t border-gray-100 flex gap-3 pb-safe bg-white sticky bottom-0">
            <button (click)="clearFilters()" class="flex-1 py-3 border border-black text-black font-bold uppercase tracking-widest text-xs">Xóa lọc</button>
            <button (click)="applyFilters()" class="flex-1 py-3 bg-black text-white font-bold uppercase tracking-widest text-xs">Áp dụng</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CatalogComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  products: any[] = [];
  loading = true;
  isFilterOpen = false;
  currentCategoryName = '';
  categoryId: string | null = null;
  keyword: string | null = null;
  
  filterOptions: any = null;
  selectedFilters: any = {
    sort: '-_id',
    gender_id: null,
    season_id: null,
    form_id: null,
    material_id: null,
    brand_id: null
  };

  ngOnInit() {
    this.fetchFilterOptions();
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['category'];
      this.keyword = params['keyword'];
      this.fetchProducts();
      
      if (this.keyword) {
        this.currentCategoryName = `Kết quả: "${this.keyword}"`;
      } else if (this.categoryId) {
        this.fetchCategoryName(this.categoryId);
      } else {
        this.currentCategoryName = 'Tất cả sản phẩm';
      }
    });
  }

  fetchFilterOptions() {
    this.api.getFilterOptions().subscribe({
      next: (res) => {
        this.filterOptions = res;
      }
    });
  }

  fetchProducts() {
    this.loading = true;
    const params: any = { limit: 20, sort: this.selectedFilters.sort };
    if (this.categoryId) params.category_id = this.categoryId;
    if (this.keyword) params.keyword = this.keyword;
    if (this.selectedFilters.gender_id) params.gender_id = this.selectedFilters.gender_id;
    if (this.selectedFilters.season_id) params.season_id = this.selectedFilters.season_id;
    if (this.selectedFilters.form_id) params.form_id = this.selectedFilters.form_id;
    if (this.selectedFilters.material_id) params.material_id = this.selectedFilters.material_id;
    if (this.selectedFilters.brand_id) params.brand_id = this.selectedFilters.brand_id;
    
    this.api.getProducts(params).subscribe({
      next: (res: any) => {
        this.products = res.results || res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải sản phẩm:', err);
        this.loading = false;
      }
    });
  }

  toggleFilter(key: string, val: any) {
    if (this.selectedFilters[key] === val) {
      this.selectedFilters[key] = null; // deselect
    } else {
      this.selectedFilters[key] = val; // select
    }
  }

  applyFilters() {
    this.isFilterOpen = false;
    this.fetchProducts();
  }

  clearFilters() {
    this.selectedFilters = {
      sort: '-_id',
      gender_id: null,
      season_id: null,
      form_id: null,
      material_id: null,
      brand_id: null
    };
    this.fetchProducts();
    this.isFilterOpen = false;
  }

  fetchCategoryName(id: string) {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        const cats = Array.isArray(res) ? res : (res.data || []);
        const found = cats.find((c: any) => c._id == id || c.slug == id);
        if (found) {
          this.currentCategoryName = found.name;
        }
      }
    });
  }
}
