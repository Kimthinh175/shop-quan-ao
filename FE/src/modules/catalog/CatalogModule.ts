import { ApiClient } from "../../api/ApiClient";
import { ClientHeader } from "../../components/ClientHeader";
import { ClientFooter } from "../../components/ClientFooter";
import { ProductCard } from "../../components/ProductCard";
import { IProduct } from "../../shared/models/IProduct";

export class CatalogModule {
  // State của module
  private state = {
    products: [] as IProduct[],
    categories: [] as any[],
    pagination: {} as any,
    loading: true,
    filters: {
      page: 1,
      limit: 12,
      category_id: null as number | null,
    },
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = this.template();

    // Tải danh mục và sản phẩm đồng thời
    await Promise.all([this.fetchCategories(), this.fetchData()]);

    this.renderSidebar();
    this.updateProductList();
  }

  private async fetchCategories() {
    try {
      this.state.categories = await ApiClient.get<any[]>("/categories");
    } catch (e) {
      console.error(e);
    }
  }

  private async fetchData() {
    this.state.loading = true;
    this.updateProductList(); // Show skeleton
    try {
      const { page, limit, category_id } = this.state.filters;
      let url = `/products?page=${page}&limit=${limit}`;
      if (category_id) url += `&category_id=${category_id}`;

      const res = await ApiClient.get<any>(url);
      this.state.products = res.data;
      this.state.pagination = res.pagination;
    } catch (error) {
      console.error(error);
    } finally {
      this.state.loading = false;
    }
  }

  private renderSidebar() {
    const container = document.getElementById("category-list");
    if (!container) return;

    container.innerHTML = `
      <li>
        <button class="category-btn text-sm font-bold ${!this.state.filters.category_id ? "text-indigo-600" : "text-slate-500"} hover:text-indigo-600 transition-colors" data-id="">
          Tất cả
        </button>
      </li>
      ${this.state.categories
        .map(
          (cat) => `
        <li>
          <button class="category-btn text-sm font-bold ${this.state.filters.category_id === cat.id ? "text-indigo-600" : "text-slate-500"} hover:text-indigo-600 transition-colors" data-id="${cat.id}">
            ${cat.name} <span class="text-slate-300 font-medium ml-1">(${cat.count})</span>
          </button>
        </li>
      `,
        )
        .join("")}
    `;

    // Gắn sự kiện lọc
    container.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        this.state.filters.category_id = id ? parseInt(id) : null;
        this.state.filters.page = 1;
        this.fetchData().then(() => {
          this.renderSidebar();
          this.updateProductList();
        });
      });
    });
  }

  private updateProductList() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    if (this.state.loading) {
      grid.innerHTML = Array(6)
        .fill(0)
        .map(() => ProductCard.renderSkeleton())
        .join("");
    } else {
      grid.innerHTML = this.state.products
        .map((p) => ProductCard.render(p))
        .join("");
      this.renderPagination();
    }
  }

  private renderPagination() {
    const container = document.getElementById("pagination-container");
    if (!container) return;

    const { currentPage, totalPages } = this.state.pagination;
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = `<div class="flex items-center gap-2">`;
    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button class="page-btn w-10 h-10 rounded-xl font-bold text-sm transition-all ${i === currentPage ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}" data-page="${i}">
          ${i}
        </button>
      `;
    }
    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const page = (e.currentTarget as HTMLElement).dataset.page;
        this.state.filters.page = parseInt(page!);
        this.fetchData().then(() => this.updateProductList());
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  private template(): string {
    return `
      <div class="min-h-screen bg-white pt-20">
        ${ClientHeader.render()}
        
        <section class="py-16 bg-slate-50 border-b border-slate-100">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <h1 class="text-4xl font-serif font-black text-slate-900 mb-4">Cửa hàng</h1>
                <p class="text-slate-500 font-medium">Khám phá bộ sưu tập Quiet Luxury mới nhất của chúng tôi</p>
            </div>
        </section>

        <div class="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-12">
            <aside class="w-full md:w-64 shrink-0">
                <div class="sticky top-32">
                  <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Danh mục</h3>
                  <ul id="category-list" class="space-y-5">
                    <!-- Categories loading... -->
                  </ul>
                </div>
            </aside>

            <div class="flex-1">
                <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    ${Array(6)
                      .fill(0)
                      .map(() => ProductCard.renderSkeleton())
                      .join("")}
                </div>
                
                <div id="pagination-container" class="mt-20 flex justify-center">
                  <!-- Pagination loading... -->
                </div>
            </div>
        </div>

        ${ClientFooter.render()}
      </div>
    `;
  }
}
