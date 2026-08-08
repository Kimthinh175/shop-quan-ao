import { ApiClient } from "../../../api/ApiClient";
import { AdminSidebar } from "../../../components/AdminSidebar";

interface ICategory {
  _id: number;
  id?: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  count?: number;
}

export class AdminInventoryCategoriesModule {
  private state = {
    categories: [] as ICategory[],
    loading: true,
    search: '',
    editingId: null as number | null,
    saving: false
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    await this.fetchCategories();

    this.renderPage();
  }

  private async fetchCategories() {
    this.state.loading = true;
    try {
      const res = await ApiClient.adminGet<any>("/categories");
      this.state.categories = Array.isArray(res) ? res : (res.data || res.results || []);
    } catch (e) {
      console.error("Failed to load categories", e);
      this.state.categories = [];
    }
    this.state.loading = false;
  }

  private renderPage() {
    const app = document.getElementById("app-main");
    if (!app) return;
    app.innerHTML = this.template();
    this.attachEvents();
  }

  private getNestedCategories(): (ICategory & { level: number })[] {
    const buildTree = (parentId: number | null, level: number): (ICategory & { level: number })[] => {
      let result: (ICategory & { level: number })[] = [];
      const children = this.state.categories.filter(c => c.parent_id == parentId);
      for (const child of children) {
        result.push({ ...child, level });
        result = result.concat(buildTree(child._id || child.id!, level + 1));
      }
      return result;
    };
    return buildTree(null, 0);
  }

  private template(): string {
    const nestedCats = this.getNestedCategories();
    const filtered = nestedCats.filter(c =>
      c.name.toLowerCase().includes(this.state.search.toLowerCase())
    );

    const isEdit = this.state.editingId !== null;
    const editingCat = isEdit ? this.state.categories.find(c => (c.id || c._id) === this.state.editingId) : null;
    
    // Filter out the category itself and its descendants from the parent dropdown
    const possibleParents = this.state.categories.filter(c => {
      if (!isEdit) return true;
      const cid = c.id || c._id;
      if (cid === this.state.editingId) return false;
      // Also shouldn't be a descendant, but for simplicity we just block itself.
      // (A robust system would block descendants to prevent circular loops).
      return true;
    });

    return `
      <style>
        .wp-cat-row-actions { visibility: hidden; opacity: 0; transition: all 0.1s; font-size: 12px; margin-top: 4px; display: flex; gap: 8px; }
        .wp-cat-row:hover .wp-cat-row-actions { visibility: visible; opacity: 1; }
        .wp-cat-action { background: none; border: none; padding: 0; cursor: pointer; }
        .wp-cat-action.edit { color: #2a83e9; font-weight: 600; }
        .wp-cat-action.edit:hover { text-decoration: underline; }
        .wp-cat-action.del { color: #ef4444; font-weight: 600; }
        .wp-cat-action.del:hover { text-decoration: underline; }
        .wp-separator { color: #cbd5e1; font-size: 10px; }
      </style>

      <div style="max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
        <!-- Page Header -->
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0;">Danh mục</h1>
        </div>

        <div style="display: flex; gap: 30px; align-items: flex-start; flex-wrap: wrap;">
          
          <!-- Left Column: Form -->
          <div style="width: 100%; max-width: 320px; flex-shrink: 0;">
            <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
              ${isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            
            <form id="cat-form">
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px;">Tên</label>
                <input type="text" id="cat-name" required value="${editingCat?.name || ''}" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.15s;" onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#cbd5e1'">
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Tên sẽ hiển thị trên trang web của bạn.</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px;">Danh mục cha</label>
                <select id="cat-parent" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.15s; background: white;" onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#cbd5e1'">
                  <option value="">Trống</option>
                  ${possibleParents.map(p => `
                    <option value="${p.id || p._id}" ${editingCat?.parent_id == (p.id || p._id) ? 'selected' : ''}>${p.name}</option>
                  `).join('')}
                </select>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Danh mục khác với từ khóa (tags), bạn có thể sử dụng hệ thống phân cấp cho danh mục. Giống như tạo thư mục.</p>
              </div>

              <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px;">Mô tả</label>
                <textarea id="cat-desc" rows="4" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.15s; resize: vertical;" onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#cbd5e1'">${editingCat?.description || ''}</textarea>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Mô tả này thường không hiển thị, tuy nhiên một vài giao diện có thể sẽ hiển thị thông tin này.</p>
              </div>

              <div style="display: flex; gap: 10px; align-items: center;">
                <button type="submit" id="btn-save" style="padding: 6px 14px; border: 1px solid #2a83e9; background: #2a83e9; color: white; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#1a6fd6'" onmouseout="this.style.background='#2a83e9'">
                  ${this.state.saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm danh mục mới')}
                </button>
                ${isEdit ? `<button type="button" id="btn-cancel-edit" style="padding: 6px 14px; border: none; background: transparent; color: #2a83e9; text-decoration: underline; font-size: 13px; cursor: pointer;">Hủy bỏ</button>` : ''}
              </div>
            </form>
          </div>

          <!-- Right Column: Table -->
          <div style="flex: 1; min-width: 0;">
            <!-- Search & Filter Bar -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
              <div style="position: relative; width: 220px;">
                <input id="cat-search" type="text" placeholder="Tìm kiếm danh mục" value="${this.state.search}" style="width: 100%; padding: 4px 10px 4px 28px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; box-sizing: border-box; outline: none;">
                <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 12px;"></i>
              </div>
            </div>

            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #cbd5e1; background: #f8fafc;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; color: #334155; width: 40%;">Tên</th>
                    <th style="padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; color: #334155;">Mô tả</th>
                    <th style="padding: 10px 14px; text-align: center; font-size: 13px; font-weight: 600; color: #334155; width: 10%;">Sản phẩm</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length === 0 ? `
                    <tr><td colspan="3" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
                      Không tìm thấy danh mục.
                    </td></tr>
                  ` : filtered.map((c, i) => {
                    const prefix = c.level > 0 ? '— '.repeat(c.level) : '';
                    return `
                      <tr class="wp-cat-row" style="border-bottom: 1px solid #f1f5f9; transition: background 0.1s; background: ${i % 2 === 0 ? 'white' : '#f8fafc'};">
                        
                        <td style="padding: 10px 14px; vertical-align: top;">
                          <div style="font-size: 14px; font-weight: ${c.level === 0 ? '700' : '600'}; color: #2a83e9; margin-bottom: 2px;">
                            <span style="color: #94a3b8; font-weight: 400;">${prefix}</span>${c.name}
                          </div>
                          
                          <div class="wp-cat-row-actions">
                            <button class="wp-cat-action edit" data-edit-id="${c.id || c._id}">Chỉnh sửa</button>
                            <span class="wp-separator">|</span>
                            <button class="wp-cat-action del" data-del-id="${c.id || c._id}">Xóa</button>
                            <span class="wp-separator">|</span>
                            <a href="/products?category_id=${c.id || c._id}" target="_blank" style="color: #475569; text-decoration: none;" onmouseover="this.style.color='#2a83e9'" onmouseout="this.style.color='#475569'">Xem</a>
                          </div>
                        </td>
                        
                        <td style="padding: 10px 14px; vertical-align: top; font-size: 13px; color: #64748b;">
                          ${c.description || '—'}
                        </td>
                        
                        <td style="padding: 10px 14px; vertical-align: top; text-align: center;">
                          <a href="#" style="font-size: 13px; font-weight: 600; color: #2a83e9; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${c.count || 0}</a>
                        </td>
                        
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr style="border-top: 1px solid #cbd5e1; background: #f8fafc;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; color: #334155;">Tên</th>
                    <th style="padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; color: #334155;">Mô tả</th>
                    <th style="padding: 10px 14px; text-align: center; font-size: 13px; font-weight: 600; color: #334155;">Sản phẩm</th>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="height: 28px; width: 120px; background: #e2e8f0; border-radius: 4px; margin-bottom: 24px;" class="animate-pulse"></div>
        <div style="display: flex; gap: 30px;">
          <div style="width: 320px; height: 300px; background: #e2e8f0; border-radius: 4px;" class="animate-pulse"></div>
          <div style="flex: 1; height: 500px; background: #e2e8f0; border-radius: 4px;" class="animate-pulse"></div>
        </div>
      </div>
    `;
  }

  private attachEvents() {
    // Search
    const searchInput = document.getElementById('cat-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.search = (e.target as HTMLInputElement).value;
        this.renderPage();
      });
      // Restore focus to end of input
      const len = searchInput.value.length;
      searchInput.setSelectionRange(len, len);
      searchInput.focus();
    }

    // Edit Actions
    document.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.editingId = parseInt((btn as HTMLElement).dataset.editId!);
        this.renderPage();
        
        // Scroll to top on mobile
        if (window.innerWidth < 1024) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Cancel Edit
    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
      this.state.editingId = null;
      this.renderPage();
    });

    // Delete Actions
    document.querySelectorAll('[data-del-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.delId;
        if (confirm(`Bạn sắp xóa vĩnh viễn danh mục này. \n'Hủy' để dừng lại, 'OK' để xóa.`)) {
          try {
            await ApiClient.delete(`/categories/${id}`);
            // alert("Đã xóa danh mục thành công!"); // WP usually just deletes and reloads without alert
            await this.fetchCategories();
            this.renderPage();
          } catch (e: any) {
            alert("Lỗi khi xóa: " + (e.message || "Unknown error"));
          }
        }
      });
    });

    // Form Submit
    document.getElementById('cat-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = (document.getElementById('cat-name') as HTMLInputElement).value;
      const desc = (document.getElementById('cat-desc') as HTMLTextAreaElement).value;
      const parent_id = (document.getElementById('cat-parent') as HTMLSelectElement).value;

      const payload = {
        name,
        description: desc,
        parent_id: parent_id ? parseInt(parent_id) : null
      };

      this.state.saving = true;
      this.renderPage(); // Update UI to show 'Đang lưu...'

      try {
        if (this.state.editingId) {
          await ApiClient.put(`/categories/${this.state.editingId}`, payload);
        } else {
          await ApiClient.post(`/categories`, payload);
        }
        
        this.state.editingId = null;
        await this.fetchCategories();
      } catch (error: any) {
        alert("Lỗi lưu danh mục: " + (error.message || "Unknown Error"));
      }

      this.state.saving = false;
      this.renderPage();
    });
  }
}
