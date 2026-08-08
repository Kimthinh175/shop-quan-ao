import { ApiClient } from "../../../api/ApiClient";

interface IProductRow {
  _id: number;
  name: string;
  main_img?: string;
  category?: { name: string };
  variants?: Array<{ price: number; quantity: number; sku: string; size?: string; color?: string }>;
  status?: string;
}

export class AdminInventoryProductsModule {
  private state = {
    products: [] as IProductRow[],
    loading: true,
    search: '',
    page: 1,
    limit: 15,
    cursor: null as string | null,
    hasMore: true,
    totalShown: 0,
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    await this.fetchProducts(true);
    this.renderPage();
  }

  private async fetchProducts(reset = false) {
    if (reset) {
      this.state.products = [];
      this.state.cursor = null;
      this.state.hasMore = true;
    }

    this.state.loading = true;
    try {
      let url = `/products/admin?limit=${this.state.limit}`;
      if (this.state.cursor) url += `&cursor=${this.state.cursor}`;
      if (this.state.search) url += `&keyword=${encodeURIComponent(this.state.search)}`;

      const res = await ApiClient.adminGet<any>(url);
      const items: IProductRow[] = res.results || res.data || [];

      this.state.products = reset ? items : [...this.state.products, ...items];
      this.state.cursor = res.nextCursor || null;
      this.state.hasMore = !!res.nextCursor;
    } catch (e) {
      console.error("Failed to load products", e);
    }
    this.state.loading = false;
  }

  private renderPage() {
    const app = document.getElementById("app-main");
    if (!app) return;
    app.innerHTML = this.template();
    this.attachEvents();
  }

  private getPrice(product: IProductRow): number {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.min(...product.variants.map(v => v.price || 0));
  }

  private getTotalStock(product: IProductRow): number {
    if (!product.variants) return 0;
    return product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
  }

  private template(): string {
    const products = this.state.products;

    return `
      <div>
        <!-- Page Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">Quản lý Sản phẩm</h1>
            <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 0 0;">${products.length} sản phẩm đang hiển thị</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="btn-add-product" style="
              display: flex; align-items: center; gap: 8px;
              padding: 10px 18px; background: #2a83e9; color: white;
              border: none; border-radius: 10px; font-size: 13px; font-weight: 700;
              cursor: pointer; transition: background 0.15s;
            "
            onmouseover="this.style.background='#1a6fd6'" onmouseout="this.style.background='#2a83e9'">
              <i class="fa-solid fa-plus"></i> Thêm sản phẩm
            </button>
          </div>
        </div>

        <!-- Filters + Search -->
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; gap: 12px; align-items: center;">
          <div style="position: relative; flex: 1; max-width: 400px;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 13px;"></i>
            <input id="prod-search" type="text" placeholder="Tìm theo tên sản phẩm..." value="${this.state.search}" style="
              width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #e2e8f0;
              border-radius: 9px; font-size: 13px; color: #0f172a; outline: none;
              transition: border-color 0.15s; box-sizing: border-box;
            "
            onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#e2e8f0'">
          </div>
          <button id="btn-search" style="
            padding: 9px 16px; background: #f1f5f9; border: 1px solid #e2e8f0;
            border-radius: 9px; font-size: 13px; font-weight: 600; color: #475569;
            cursor: pointer; display: flex; align-items: center; gap: 6px;
          ">
            <i class="fa-solid fa-rotate-right"></i> Làm mới
          </button>
        </div>

        <!-- Table -->
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">Sản phẩm</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Danh mục</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Giá</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Tồn kho</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Trạng thái</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${products.length === 0 ? `
                <tr><td colspan="6" style="padding: 64px; text-align: center; color: #94a3b8;">
                  <i class="fa-solid fa-box-open" style="font-size: 40px; display: block; margin-bottom: 12px; opacity: 0.3;"></i>
                  <p style="font-size: 14px; margin: 0;">Không có sản phẩm nào</p>
                </td></tr>
              ` : products.map(p => {
                const price = this.getPrice(p);
                const stock = this.getTotalStock(p);
                const isActive = (p.status || 'ACTIVE') === 'ACTIVE';
                const stockColor = stock === 0 ? '#ef4444' : stock < 5 ? '#f59e0b' : '#22c55e';
                const stockBg = stock === 0 ? '#fef2f2' : stock < 5 ? '#fffbeb' : '#f0fdf4';

                return `
                  <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.1s;"
                    onmouseover="this.style.background='#fafbff'" onmouseout="this.style.background='white'">
                    <td style="padding: 14px 20px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${p.main_img || ''}" alt="${p.name}" style="
                          width: 42px; height: 42px; border-radius: 10px; object-fit: cover;
                          background: #f1f5f9; flex-shrink: 0; border: 1px solid #e2e8f0;
                        " onerror="this.src=''; this.style.background='#e2e8f0';">
                        <div>
                          <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</p>
                          <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0;">${p.variants?.length || 0} biến thể</p>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; white-space: nowrap;">
                        ${(Array.isArray(p.category) && p.category.length > 0) ? p.category.map((c:any) => c.name).join(', ') : (p.category?.name || '—')}
                      </span>
                    </td>
                    <td style="padding: 14px 16px; text-align: right;">
                      <span style="font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap;">
                        ${price > 0 ? price.toLocaleString('vi-VN') + 'đ' : '—'}
                      </span>
                    </td>
                    <td style="padding: 14px 16px; text-align: center;">
                      <span style="font-size: 12px; font-weight: 700; color: ${stockColor}; background: ${stockBg}; padding: 4px 10px; border-radius: 20px;">
                        ${stock}
                      </span>
                    </td>
                    <td style="padding: 14px 16px; text-align: center;">
                      <span style="
                        font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;
                        color: ${isActive ? '#16a34a' : '#dc2626'};
                        background: ${isActive ? '#f0fdf4' : '#fef2f2'};
                      ">
                        ${isActive ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td style="padding: 14px 16px; text-align: center;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <button data-view-id="${p._id}" title="Chi tiết" style="
                          padding: 6px 10px; border-radius: 7px; border: 1px solid #e2e8f0;
                          background: white; color: #475569; font-size: 12px; cursor: pointer; transition: all 0.15s;
                        "
                        onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                          <i class="fa-solid fa-eye"></i>
                        </button>
                        <button data-edit-id="${p._id}" title="Sửa" style="
                          padding: 6px 10px; border-radius: 7px; border: 1px solid #e2e8f0;
                          background: white; color: #2a83e9; font-size: 12px; cursor: pointer; transition: all 0.15s;
                        "
                        onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='white'">
                          <i class="fa-solid fa-pen"></i>
                        </button>
                        <button data-del-id="${p._id}" title="Xóa" style="
                          padding: 6px 10px; border-radius: 7px; border: 1px solid #e2e8f0;
                          background: white; color: #ef4444; font-size: 12px; cursor: pointer; transition: all 0.15s;
                        "
                        onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Load more / Pagination -->
          ${this.state.hasMore ? `
            <div style="padding: 16px; text-align: center; border-top: 1px solid #f1f5f9;">
              <button id="btn-load-more" style="
                padding: 10px 28px; background: white; border: 1px solid #e2e8f0;
                border-radius: 9px; font-size: 13px; font-weight: 600; color: #475569;
                cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px;
              "
              onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <i class="fa-solid fa-chevron-down" style="font-size: 11px;"></i>
                Tải thêm sản phẩm
              </button>
            </div>
          ` : `
            <div style="padding: 14px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">Đã hiển thị tất cả ${products.length} sản phẩm</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="animate-pulse">
          <div style="width: 220px; height: 28px; background: #e2e8f0; border-radius: 8px;"></div>
          <div style="width: 140px; height: 40px; background: #e2e8f0; border-radius: 10px;"></div>
        </div>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
          <div style="padding: 14px 20px; border-bottom: 2px solid #e2e8f0; background: #f8fafc;"></div>
          ${Array(8).fill(0).map(() => `
            <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f1f5f9;" class="animate-pulse">
              <div style="width: 42px; height: 42px; background: #e2e8f0; border-radius: 10px; flex-shrink: 0;"></div>
              <div style="flex: 1; height: 18px; background: #e2e8f0; border-radius: 6px;"></div>
              <div style="width: 80px; height: 18px; background: #e2e8f0; border-radius: 6px;"></div>
              <div style="width: 80px; height: 18px; background: #e2e8f0; border-radius: 6px;"></div>
              <div style="width: 60px; height: 22px; background: #e2e8f0; border-radius: 20px;"></div>
              <div style="width: 80px; height: 22px; background: #e2e8f0; border-radius: 20px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private attachEvents() {
    // Search
    document.getElementById('prod-search')?.addEventListener('keydown', async (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        this.state.search = (document.getElementById('prod-search') as HTMLInputElement).value;
        await this.fetchProducts(true);
        this.renderPage();
      }
    });

    // Refresh
    document.getElementById('btn-search')?.addEventListener('click', async () => {
      this.state.search = (document.getElementById('prod-search') as HTMLInputElement)?.value || '';
      await this.fetchProducts(true);
      this.renderPage();
    });

    // Load more
    document.getElementById('btn-load-more')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-load-more') as HTMLButtonElement;
      if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...'; btn.disabled = true; }
      await this.fetchProducts(false);
      this.renderPage();
    });

    // Add product
    document.getElementById("btn-add-product")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLElement;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo...';
      btn.style.pointerEvents = 'none';

      try {
        const payload = { name: "Bản nháp", status: "DRAFT" };
        const res: any = await ApiClient.adminPost('/products', payload);
        if (res && (res.id || res._id)) {
          window.location.href = `/admin/inventory/products/${res.id || res._id}/edit`;
        }
      } catch (err: any) {
        alert('Lỗi tạo bản nháp: ' + err.message);
        btn.innerHTML = originalHtml;
        btn.style.pointerEvents = 'auto';
      }
    });

    // View/Edit/Delete
    document.querySelectorAll('[data-view-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.viewId;
        window.location.href = `/products/${id}`;
      });
    });
    document.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.editId;
        window.history.pushState({}, '', `/admin/inventory/products/${id}/edit`);
        // We need to tell the router to handle it, or just use window.location.href.
        // For simplicity:
        window.location.href = `/admin/inventory/products/${id}/edit`;
      });
    });
    document.querySelectorAll('[data-del-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm(`Xóa sản phẩm #${(btn as HTMLElement).dataset.delId}?`)) {
          alert('Tính năng xóa - Coming soon!');
        }
      });
    });
  }
}
