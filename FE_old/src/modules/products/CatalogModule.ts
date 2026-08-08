import { ApiClient } from "../../api/ApiClient";
import { ProductCard } from "../../components/ProductCard";
import { IProduct } from "../../shared/models/IProduct";

export class CatalogModule {
  private state = {
    products: [] as IProduct[],
    categories: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    seasons: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    genders: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    brands: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    materials: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    forms: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    sports: [] as import("../../shared/interfaces/ITypes").IFilterOption[],
    loading: true,
    hasMore: true,
    nextCursor: null as string | null,
    filters: {
      limit: 12,
      category_id: null as number | null,
      season_id: null as number | null,
      gender_id: null as number | null,
      brand_id: null as number | null,
      material_id: null as number | null,
      form_id: null as number | null,
      sport_id: null as number | null,
      sort: '-_id',
    },
  };

  private observer: IntersectionObserver | null = null;

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Global function to allow ClientHeader to trigger a filter reload without page refresh
    (window as any).catalogReloadFilters = async () => {
      // Reset state filters to default first
      this.state.filters = {
        limit: 12, category_id: null, season_id: null, gender_id: null, brand_id: null, material_id: null, form_id: null, sport_id: null, sort: '-_id'
      };
      const storedFilters = sessionStorage.getItem('productFilters');
      if (storedFilters) {
        try {
          const parsed = JSON.parse(storedFilters);
          this.state.filters = { ...this.state.filters, ...parsed };
        } catch (e) {
          console.error('Lỗi parse filters', e);
        }
      }
      this.state.nextCursor = null;
      this.state.hasMore = true;
      this.updateProductList();
      await this.fetchProducts(true);
      this.updateProductList();
      this.renderSidebar();
      this.setupInfiniteScroll();
    };

    // Load filters initially
    const storedFilters = sessionStorage.getItem('productFilters');
    if (storedFilters) {
      try {
        const parsed = JSON.parse(storedFilters);
        this.state.filters = { ...this.state.filters, ...parsed };
      } catch (e) {
        console.error('Lỗi parse filters', e);
      }
    }

    app.innerHTML = this.template();

    await Promise.all([
      this.fetchFilterOptions(),
      this.fetchProducts(true),
    ]);

    this.renderSidebar();
    this.renderSortBar();
    this.updateProductList();
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll() {
    const observerTarget = document.getElementById("infinite-scroll-trigger");
    if (!observerTarget) return;

    if (this.observer) this.observer.disconnect();

    this.observer = new IntersectionObserver(async (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !this.state.loading && this.state.hasMore) {
        this.state.loading = true;
        this.updateProductList(); // Show loading indicator
        await this.fetchProducts(false);
        this.updateProductList(); // Re-render with new products
      }
    }, { rootMargin: '100px' });

    this.observer.observe(observerTarget);
  }

  private async fetchFilterOptions() {
    try {
      const res = await ApiClient.get<import("../../shared/interfaces/ITypes").IFilterOptionsResponse>("/products/filter-options");
      this.state.categories = res.categories || [];
      this.state.brands = res.brands || [];
      this.state.seasons = res.seasons || [];
      this.state.genders = res.genders || [];
      this.state.materials = res.materials || [];
      this.state.forms = res.forms || [];
      this.state.sports = res.sports || [];
    } catch (e) {
      console.warn("Lỗi API filter-options, dùng Mock Data", e);
      // Mock data fallback
      this.state.categories = [{ id: 1, name: "Áo Thun" }, { id: 2, name: "Quần Short" }, { id: 3, name: "Áo Polo" }];
      this.state.brands = [{ id: 1, name: "Coolmate" }, { id: 2, name: "84RISING" }, { id: 3, name: "CM24" }];
      this.state.seasons = [{ id: 1, name: "Xuân Hè" }, { id: 2, name: "Thu Đông" }];
      this.state.genders = [{ id: 1, name: "Nam" }, { id: 2, name: "Nữ" }, { id: 3, name: "Unisex" }];
      this.state.materials = [{ id: 1, name: "Cotton Compact" }, { id: 2, name: "Polyester" }];
      this.state.forms = [{ id: 1, name: "Regular Fit" }, { id: 2, name: "Slim Fit" }];
      this.state.sports = [{ id: 1, name: "Chạy Bộ" }, { id: 2, name: "Gym" }];
    }
  }

  private async fetchProducts(isInitial: boolean = false) {
    this.state.loading = true;
    
    try {
      const { limit, category_id, season_id, gender_id, brand_id, material_id, form_id, sport_id, sort } = this.state.filters;
      let url = `/products?limit=${limit}&sort=${sort}`;
      if (!isInitial && this.state.nextCursor) url += `&cursor=${this.state.nextCursor}`;
      if (category_id) url += `&category_id=${category_id}`;
      if (season_id) url += `&season_id=${season_id}`;
      if (gender_id) url += `&gender_id=${gender_id}`;
      if (brand_id) url += `&brand_id=${brand_id}`;
      if (material_id) url += `&material_id=${material_id}`;
      if (form_id) url += `&form_id=${form_id}`;
      if (sport_id) url += `&sport_id=${sport_id}`;

      const res = await ApiClient.get<import("../../shared/interfaces/ITypes").IPaginationResponse<IProduct>>(url);
      if (res && res.results) {
        if (isInitial) {
          this.state.products = res.results;
        } else {
          this.state.products = [...this.state.products, ...res.results];
        }
        
        // Cập nhật trạng thái phân trang (Giả định res.nextCursor hoặc res.hasNextPage)
        const total = res.totalResults || 0;
        const fetchedCount = this.state.products.length;
        
        // Handle cursor based on backend response structure (using nextCursor or fallback to hasNextPage)
        if ((res as any).nextCursor) {
          this.state.nextCursor = (res as any).nextCursor;
          this.state.hasMore = true;
        } else if ((res as any).hasNextPage !== undefined) {
          this.state.hasMore = (res as any).hasNextPage;
          if (this.state.hasMore && res.results.length > 0) {
            this.state.nextCursor = String(res.results[res.results.length - 1].id || res.results[res.results.length - 1]._id);
          } else {
            this.state.nextCursor = null;
          }
        } else {
           // Giả định backend trả về totalResults, ta kiểm tra số lượng đã lấy so với tổng
           this.state.hasMore = fetchedCount < total;
           if (this.state.hasMore && res.results.length > 0) {
               this.state.nextCursor = String(res.results[res.results.length - 1].id || res.results[res.results.length - 1]._id);
           } else {
               this.state.nextCursor = null;
           }
        }
      } else {
        this.state.hasMore = false;
      }
    } catch (error) {
      console.warn("Lỗi API, dùng Mock Data", error);
      const mockItems = [
        {
          id: 1, name: "Áo Thun Cotton Basic Nam", price: 159000, 
          image: "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=600",
          images: ["https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=600", "https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&w=600"],
          category: "Áo Thun"
        },
        {
          id: 2, name: "Quần Short Thể Thao Siêu Nhẹ", price: 249000, 
          image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=600",
          images: ["https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=600"],
          category: "Quần Short"
        },
        {
          id: 3, name: "Áo Polo Pique Khử Mùi", price: 350000, 
          image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=600",
          images: ["https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=600", "https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&w=600"],
          category: "Áo Polo"
        },
        {
          id: 4, name: "Quần Dài Khaki Nam Chống Nhăn", price: 499000, 
          image: "https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&w=600",
          images: [],
          category: "Quần Dài"
        }
      ] as any[];
      if (isInitial) {
        this.state.products = mockItems;
      } else {
        this.state.products = [...this.state.products, ...mockItems];
      }
      this.state.hasMore = false;
    } finally {
      this.state.loading = false;
    }
  }

  private async applyFilters() {
    // Lưu các filters đang chọn vào sessionStorage
    sessionStorage.setItem('productFilters', JSON.stringify(this.state.filters));
    
    // Reset lại trạng thái phân trang
    this.state.nextCursor = null;
    this.state.hasMore = true;
    
    // Lấy lại danh sách sản phẩm từ đầu
    this.updateProductList(); // Render loading skeleton
    await this.fetchProducts(true);
    this.updateProductList();
    this.setupInfiniteScroll();
  }

  private renderSidebar() {
    const renderFilterGroup = (title: string, items: import("../../shared/interfaces/ITypes").IFilterOption[], activeId: number | string | null, type: string) => {
      if (!items || items.length === 0) return '';
      return `
        <div class="mb-5">
          <h3 class="font-bold text-xs text-slate-900 mb-3 uppercase tracking-wider">${title}</h3>
          <ul class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <label class="flex items-center gap-2 cursor-pointer text-sm ${!activeId ? 'font-bold text-[#2a83e9]' : 'text-slate-600 hover:text-[#2a83e9]'}">
                <input type="radio" name="${type}" value="" ${!activeId ? 'checked' : ''} class="filter-radio hidden">
                <div class="w-3.5 h-3.5 border rounded flex items-center justify-center ${!activeId ? 'border-[#2a83e9] bg-[#2a83e9]' : 'border-slate-300'}">
                    ${!activeId ? '<i class="fa-solid fa-check text-white text-[8px]"></i>' : ''}
                </div>
                Tất cả
              </label>
            </li>
            ${items.map(item => {
              const itemId = item.id || item._id;
              const isMatch = activeId !== null && String(activeId) === String(itemId);
              return `
              <li>
                <label class="flex items-center gap-2 cursor-pointer text-sm ${isMatch ? 'font-bold text-[#2a83e9]' : 'text-slate-600 hover:text-[#2a83e9]'}">
                  <input type="radio" name="${type}" value="${itemId}" ${isMatch ? 'checked' : ''} class="filter-radio hidden">
                  <div class="w-3.5 h-3.5 border rounded flex items-center justify-center ${isMatch ? 'border-[#2a83e9] bg-[#2a83e9]' : 'border-slate-300'}">
                      ${isMatch ? '<i class="fa-solid fa-check text-white text-[8px]"></i>' : ''}
                  </div>
                  ${item.name}
                </label>
              </li>
            `}).join('')}
          </ul>
        </div>
      `;
    };

    const container = document.getElementById("filter-sidebar");
    if (!container) return;

    container.innerHTML = `
      ${renderFilterGroup('Danh Mục', this.state.categories, this.state.filters.category_id, 'category_id')}
      <div class="border-t border-slate-100 my-4"></div>
      ${renderFilterGroup('Thương Hiệu', this.state.brands, this.state.filters.brand_id, 'brand_id')}
      <div class="border-t border-slate-100 my-4"></div>
      ${renderFilterGroup('Giới Tính', this.state.genders, this.state.filters.gender_id, 'gender_id')}
      <div class="border-t border-slate-100 my-4"></div>
      ${renderFilterGroup('Mùa Vụ', this.state.seasons, this.state.filters.season_id, 'season_id')}
      <div class="border-t border-slate-100 my-4"></div>
      ${renderFilterGroup('Chất Liệu', this.state.materials, this.state.filters.material_id, 'material_id')}
      <div class="border-t border-slate-100 my-4"></div>
      ${renderFilterGroup('Form Dáng', this.state.forms, this.state.filters.form_id, 'form_id')}
      <div class="border-t border-slate-100 my-4"></div>
      ${renderFilterGroup('Thể Thao', this.state.sports, this.state.filters.sport_id, 'sport_id')}
    `;

    // Cài đặt CSS cuộn thanh mảnh (Custom Scrollbar)
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `;
    document.head.appendChild(style);

    container.querySelectorAll(".filter-radio").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const type = target.name as keyof typeof this.state.filters;
        (this.state.filters as Record<string, unknown>)[type] = target.value ? parseInt(target.value) : null;
        // this.state.filters.page = 1; // Removed as page is not on filters
        this.fetchProducts().then(() => {
          this.renderSidebar();
          this.updateProductList();
        });
      });
    });
  }

  private renderSortBar() {
    const container = document.getElementById("sort-bar");
    if (!container) return;
    
    const sorts = [
      { value: '-sold', label: 'Bán chạy nhất' },
      { value: 'popular', label: 'Phổ biến' },
      { value: 'price', label: 'Giá: Thấp đến Cao' },
      { value: '-price', label: 'Giá: Cao đến Thấp' },
    ];

    container.innerHTML = `
      <div class="flex items-center gap-4 text-sm overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
        <span class="font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Sắp xếp theo:</span>
        ${sorts.map(s => `
          <button class="sort-btn px-4 py-1.5 rounded border whitespace-nowrap transition-colors ${this.state.filters.sort === s.value ? 'bg-[#2a83e9] text-white border-[#2a83e9] font-bold shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-[#2a83e9] hover:text-[#2a83e9]'}" data-sort="${s.value}">
            ${s.label}
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll(".sort-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const sort = (e.currentTarget as HTMLElement).dataset.sort;
        this.state.filters.sort = sort!;
        // this.state.filters.page = 1; // Removed
        this.renderSortBar();
        this.fetchProducts().then(() => this.updateProductList());
      });
    });
  }

  private updateProductList() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    if (this.state.loading && this.state.products.length === 0) {
      grid.innerHTML = Array(8)
        .fill(0)
        .map(() => ProductCard.renderSkeleton())
        .join("");
    } else {
      if (this.state.products.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-20 text-center text-slate-500 font-bold">Không tìm thấy sản phẩm nào phù hợp.</div>`;
      } else {
        grid.innerHTML = this.state.products
          .map((p) => ProductCard.render(p))
          .join("");
      }
      
      const loader = document.getElementById("infinite-scroll-loader");
      if (loader) {
        if (this.state.loading) {
          loader.innerHTML = `<div class="col-span-full py-4 text-center text-slate-500 font-bold"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải thêm...</div>`;
        } else if (!this.state.hasMore && this.state.products.length > 0) {
          loader.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 text-sm">Bạn đã xem hết sản phẩm.</div>`;
        } else {
          loader.innerHTML = "";
        }
      }
    }
  }

  private template(): string {
    return `
      
        
        <div class="container mx-auto px-4 lg:px-8 py-6 min-h-[80vh]">
            <!-- Breadcrumb -->
            <div class="text-xs text-slate-500 mb-6 flex items-center gap-2">
                <a href="/" class="hover:text-[#2a83e9]">Trang chủ</a>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="font-bold text-slate-800">Sản phẩm</span>
            </div>
            
            <div class="flex flex-col lg:flex-row gap-8 items-start">
                <!-- Sidebar Filters -->
                <aside class="w-full lg:w-64 shrink-0 bg-white p-5 rounded-lg border border-slate-200 lg:sticky lg:top-32 h-auto lg:max-h-[calc(100vh-140px)] flex flex-col">
                    <div class="flex items-center justify-between mb-4 shrink-0">
                        <h2 class="text-base font-black uppercase tracking-wider">Bộ Lọc</h2>
                        <i class="fa-solid fa-filter text-slate-400"></i>
                    </div>
                    <div id="filter-sidebar" class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <!-- Filters will be injected here -->
                    </div>
                </aside>

                <!-- Main Content -->
                <div class="flex-1 w-full">
                    <!-- Sort Bar -->
                    <div id="sort-bar" class="mb-6 bg-white p-3 rounded-lg border border-slate-200">
                        <!-- Sort buttons will be injected here -->
                    </div>

                    <!-- Products Grid -->
                    <div id="product-grid" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                        <!-- Products will be injected here -->
                    </div>
                    
                    <!-- Infinite Scroll Trigger -->
                    <div id="infinite-scroll-trigger" class="h-10 w-full mt-4"></div>
                    <div id="infinite-scroll-loader" class="w-full"></div>
                </div>
            </div>
        </div>

        
    `;
  }
}
