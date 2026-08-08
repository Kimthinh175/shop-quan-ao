import { ApiClient } from "../../../api/ApiClient";
import { UploadService } from "../../../api/UploadService";

export class AdminEditProductModule {
  private state = {
    productId: '',
    product: null as any,
    variants: [] as any[],
    options: null as any,
    loading: true,
    saving: false
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    // Extract ID from /admin/inventory/products/:id/edit
    const pathParts = window.location.pathname.split('/');
    this.state.productId = pathParts[pathParts.length - 2];

    await Promise.all([
      this.fetchProduct(),
      this.fetchOptions()
    ]);

    app.innerHTML = this.template();
    this.initEvents();
  }

  private async fetchProduct() {
    try {
      const res = await ApiClient.get<any>(`/products/${this.state.productId}`);
      this.state.product = res;
      this.state.variants = res.variants || [];
    } catch (error) {
      console.error("Failed to fetch product", error);
      alert("Không tìm thấy sản phẩm!");
    }
  }

  private async fetchOptions() {
    try {
      const res = await ApiClient.get<any>("/products/filter-options");
      this.state.options = res;
    } catch (error) {
      console.error("Failed to fetch filter options", error);
    }
  }

  private initEvents() {
    // Navigate Back
    document.getElementById("btn-back")?.addEventListener("click", () => {
      window.location.href = "/admin/inventory/products";
    });

    // Add Color Variant
    document.getElementById("btn-add-color-variant")?.addEventListener("click", () => {
      const presetColors = [
        { name: "Đen", hex: "#111111" },
        { name: "Trắng", hex: "#ffffff" },
        { name: "Xám", hex: "#9ca3af" },
        { name: "Đỏ", hex: "#ef4444" },
        { name: "Xanh Dương", hex: "#3b82f6" },
        { name: "Xanh Navy", hex: "#1e3a5f" },
        { name: "Xanh Lá", hex: "#22c55e" },
        { name: "Nâu", hex: "#92400e" },
        { name: "Be", hex: "#e8d5b0" },
        { name: "Camel", hex: "#c4903a" },
        { name: "Hồng", hex: "#ec4899" },
        { name: "Cam", hex: "#f97316" },
        { name: "Vàng", hex: "#eab308" },
        { name: "Tím", hex: "#a855f7" }
      ];

      const modalHtml = `
        <div id="color-modal-overlay" style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px);">
          <div style="background: white; width: 100%; max-width: 400px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden;">
            <div style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
              <h3 style="font-weight: 700; color: #0f172a; margin: 0; font-size: 15px;"><i class="fa-solid fa-palette" style="color: #3b82f6; margin-right: 8px;"></i>Thêm Màu Sắc</h3>
              <button id="btn-close-color-modal" style="border: none; background: transparent; cursor: pointer; color: #94a3b8; font-size: 16px;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <div style="padding: 24px;">
              <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 12px 0;">Chọn màu có sẵn</p>
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px;">
                ${presetColors.map(c => `
                  <button type="button" class="preset-color-btn" data-color="${c.name}" data-hex="${c.hex}" title="${c.name}" style="height: 36px; border-radius: 50%; border: 2px solid #e2e8f0; background: ${c.hex}; cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></button>
                `).join('')}
              </div>

              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
                <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; padding: 0 12px;">Hoặc tự định nghĩa</span>
                <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
              </div>

              <div style="display: flex; gap: 12px;">
                <div style="flex: 1;">
                  <label style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Tên màu</label>
                  <input type="text" id="custom-color-input" placeholder="VD: Xanh ngọc" style="width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-weight: 600; outline: none; box-sizing: border-box;">
                </div>
                <div style="width: 60px;">
                  <label style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Mã HEX</label>
                  <div style="position: relative; width: 100%; height: 38px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <input type="color" id="custom-color-hex" value="#000000" style="position: absolute; top: -10px; left: -10px; width: 100px; height: 100px; cursor: pointer; border: none; padding: 0;">
                  </div>
                </div>
              </div>
            </div>

            <div style="padding: 16px 24px; border-top: 1px solid #f1f5f9; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px;">
              <button id="btn-cancel-color-modal" style="padding: 8px 16px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer;">Hủy</button>
              <button id="btn-confirm-color-modal" style="padding: 8px 16px; border: none; background: #2a83e9; border-radius: 8px; font-size: 13px; font-weight: 700; color: white; cursor: pointer;">Thêm Màu Này</button>
            </div>
          </div>
        </div>
      `;

      const div = document.createElement('div');
      div.innerHTML = modalHtml;
      document.body.appendChild(div);

      const close = () => { div.remove(); };
      document.getElementById('btn-close-color-modal')?.addEventListener('click', close);
      document.getElementById('btn-cancel-color-modal')?.addEventListener('click', close);

      const addVariantsWithColor = (colorName: string, hex: string = '#d1d5db') => {
        if (!colorName) return;
        const defaultPrice = parseInt((document.getElementById("prod-default-price") as HTMLInputElement)?.value) || 0;
        const uniqueSizes = [...new Set(this.state.variants.map(v => v.size).filter(s => s))];
        
        if (uniqueSizes.length === 0) {
          const exists = this.state.variants.some(v => v.color === colorName && (v.size === '' || v.size === 'M'));
          if (!exists) {
            this.state.variants.push({ _id: null, sku: `VAR-${Date.now()}`, color: colorName, color_hex: hex, size: 'M', price: defaultPrice, quantity: 0 });
          }
        } else {
          uniqueSizes.forEach((size, index) => {
            const exists = this.state.variants.some(v => v.color === colorName && v.size === size);
            if (!exists) {
              this.state.variants.push({ _id: null, sku: `VAR-${Date.now() + index}`, color: colorName, color_hex: hex, size: size as string, price: defaultPrice, quantity: 0 });
            }
          });
        }
        this.renderVariantsTable();
        close();
      };

      document.querySelectorAll('.preset-color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const colorName = target.dataset.color;
          const hex = target.dataset.hex;
          if (colorName) addVariantsWithColor(colorName, hex);
        });
      });

      document.getElementById('btn-confirm-color-modal')?.addEventListener('click', () => {
        const input = document.getElementById('custom-color-input') as HTMLInputElement;
        const hexInput = document.getElementById('custom-color-hex') as HTMLInputElement;
        const name = input.value.trim();
        if (name) {
          addVariantsWithColor(name, hexInput.value);
        } else {
          alert('Vui lòng nhập tên màu!');
          input.focus();
        }
      });
    });

    // Add Size Variant
    document.getElementById("btn-add-size-variant")?.addEventListener("click", () => {
      const size = prompt("Nhập kích cỡ muốn thêm (VD: S, M, L, XL):");
      if (!size) return;
      
      const defaultPrice = parseInt((document.getElementById("prod-default-price") as HTMLInputElement)?.value) || 0;
      
      const uniqueColorMap = new Map<string, string>();
      this.state.variants.forEach(v => {
        if (v.color && !uniqueColorMap.has(v.color)) {
          uniqueColorMap.set(v.color, v.color_hex || '#d1d5db');
        }
      });
      
      if (uniqueColorMap.size === 0) {
        const exists = this.state.variants.some(v => (v.color === '' || v.color === 'Xám') && v.size === size);
        if (!exists) {
          this.state.variants.push({ _id: null, sku: `VAR-${Date.now()}`, color: 'Xám', color_hex: '#9ca3af', size: size, price: defaultPrice, quantity: 0 });
        }
      } else {
        let index = 0;
        uniqueColorMap.forEach((hex, colorName) => {
          const exists = this.state.variants.some(v => v.color === colorName && v.size === size);
          if (!exists) {
            this.state.variants.push({ _id: null, sku: `VAR-${Date.now() + index}`, color: colorName, color_hex: hex, size: size, price: defaultPrice, quantity: 0 });
            index++;
          }
        });
      }
      this.renderVariantsTable();
    });

    this.renderVariantsTable();

    // Checkbox styling toggle
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const span = target.nextElementSibling as HTMLElement;
        if (target.checked) {
          span.classList.add('font-bold', 'text-[#2a83e9]');
          span.classList.remove('text-slate-600');
        } else {
          span.classList.remove('font-bold', 'text-[#2a83e9]');
          span.classList.add('text-slate-600');
        }
      });
    });

    // Hierarchical Category Logic
    document.querySelectorAll('.cat-checkbox').forEach(el => {
      el.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const isChecked = target.checked;
        const val = target.value;
        const parentId = target.dataset.parent;

        if (isChecked) {
          // Uncheck siblings
          document.querySelectorAll('.cat-checkbox').forEach((sibling: any) => {
            if (sibling !== target && sibling.dataset.parent === parentId && sibling.checked) {
              sibling.checked = false;
              sibling.dispatchEvent(new Event('change')); // Trigger style updates & child unchecking
            }
          });

          // Check parent recursively
          let currentParentId = parentId;
          while (currentParentId) {
            const parentEl = document.querySelector(`.cat-checkbox[value="${currentParentId}"]`) as HTMLInputElement;
            if (parentEl && !parentEl.checked) {
              parentEl.checked = true;
              // To avoid infinite loops or overwriting siblings of parent again unnecessarily, 
              // we don't dispatchEvent here, we just style it. 
              // Wait, if parent is checked, we don't need to uncheck parent's siblings? 
              // Yes we do! So we must dispatchEvent.
              parentEl.dispatchEvent(new Event('change'));
            }
            currentParentId = parentEl?.dataset.parent || '';
          }
        } else {
          // Uncheck all children
          const uncheckChildren = (pId: string) => {
            document.querySelectorAll(`.cat-checkbox[data-parent="${pId}"]`).forEach((child: any) => {
              if (child.checked) {
                child.checked = false;
                child.dispatchEvent(new Event('change'));
                uncheckChildren(child.value);
              }
            });
          };
          uncheckChildren(val);
        }
      });
    });

    // Gallery Upload & Drag-and-drop
    const galleryDropzone = document.getElementById("prod-gallery-dropzone");
    const galleryInput = document.getElementById("prod-gallery-input") as HTMLInputElement;
    const galleryGrid = document.getElementById("prod-gallery-grid");

    const renderGalleryItem = (url: string) => {
      const div = document.createElement('div');
      div.className = 'gallery-img-item relative rounded-lg border border-slate-200 overflow-hidden group bg-slate-50 aspect-square';
      div.draggable = true;
      div.dataset.url = url;
      div.innerHTML = `
        <img src="${this.escapeAttribute(url)}" class="w-full h-full object-cover pointer-events-none">
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <i class="fa-solid fa-arrows-up-down-left-right text-white text-xl"></i>
        </div>
        <button type="button" class="btn-remove-gallery-img absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md text-xs z-10 hover:bg-red-600 hover:scale-110">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      galleryGrid?.appendChild(div);
      attachGalleryItemEvents(div);
    };

    const attachGalleryItemEvents = (item: HTMLElement) => {
      item.addEventListener('dragstart', (e) => {
        item.classList.add('opacity-50');
        e.dataTransfer?.setData('text/plain', item.dataset.url || '');
        // Store reference to dragged element
        (window as any).draggedGalleryItem = item;
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('opacity-50');
        (window as any).draggedGalleryItem = null;
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedItem = (window as any).draggedGalleryItem;
        if (draggedItem && draggedItem !== item) {
          // Reorder logic: insert dragged item before or after the dropped item based on mouse position
          const rect = item.getBoundingClientRect();
          const next = (e.clientX - rect.left) / (rect.right - rect.left) > 0.5;
          galleryGrid?.insertBefore(draggedItem, next ? item.nextSibling : item);
        }
      });

      const removeBtn = item.querySelector('.btn-remove-gallery-img');
      removeBtn?.addEventListener('click', async () => {
        if (!confirm('Bạn có chắc muốn xoá ảnh này?')) return;
        const url = item.dataset.url;
        if (url) {
          try {
            await UploadService.deleteImage(url);
          } catch (e) {
            console.error('Failed to delete from Cloudinary', e);
          }
        }
        item.remove();
      });
    };

    // Attach events to existing items
    document.querySelectorAll('.gallery-img-item').forEach((el: any) => attachGalleryItemEvents(el));

    const handleGalleryUpload = async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const originalHtml = galleryDropzone!.innerHTML;
      galleryDropzone!.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-4xl text-blue-500 mb-3"></i><p class="text-sm font-bold text-slate-600">Đang tải lên...</p>';
      
      try {
        const uploadPromises = Array.from(files).map(file => UploadService.uploadImage(file));
        const urls = await Promise.all(uploadPromises);
        urls.forEach((url: string) => {
           if (url) renderGalleryItem(url);
        });
      } catch (err: any) {
        alert("Lỗi upload ảnh: " + err.message);
      } finally {
        galleryDropzone!.innerHTML = originalHtml;
      }
    };

    galleryDropzone?.addEventListener("click", () => galleryInput?.click());
    galleryDropzone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      galleryDropzone.classList.add("border-blue-400", "bg-blue-50");
    });
    galleryDropzone?.addEventListener("dragleave", () => {
      galleryDropzone.classList.remove("border-blue-400", "bg-blue-50");
    });
    galleryDropzone?.addEventListener("drop", (e) => {
      e.preventDefault();
      galleryDropzone.classList.remove("border-blue-400", "bg-blue-50");
      handleGalleryUpload(e.dataTransfer?.files || null);
    });
    galleryInput?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      handleGalleryUpload(target.files);
      target.value = ''; // Reset input
    });

    // Submit form
    document.getElementById("form-edit-product")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.state.product) return;

      const btn = document.getElementById("btn-save") as HTMLButtonElement;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
      btn.disabled = true;

      try {
        const getCheckedValues = (name: string) => 
          Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el: any) => el.value);

        const p = this.state.product;
        const mainImg = (document.getElementById("prod-main-img") as HTMLInputElement)?.value;
        const status = (document.getElementById("prod-status") as HTMLSelectElement)?.value || 'DRAFT';
        
        // Lấy danh sách ảnh từ giao diện drag & drop
        const imageElements = document.querySelectorAll('.gallery-img-item');
        const images = Array.from(imageElements).map((el: any) => el.dataset.url).filter(url => url);

        const payload = {
          name: (document.getElementById("prod-name") as HTMLInputElement).value,
          default_price: Number((document.getElementById("prod-default-price") as HTMLInputElement).value),
          description: (document.getElementById("prod-desc") as HTMLTextAreaElement).value,
          brand_id: (document.getElementById("prod-brand") as HTMLSelectElement).value,
          main_img: mainImg || p.main_img,
          images: images,
          status: status,
          category_id: getCheckedValues("prod-cat"),
          season_id: getCheckedValues("prod-season"),
          gender_id: getCheckedValues("prod-gender"),
          sport_id: getCheckedValues("prod-sport"),
          material_id: getCheckedValues("prod-material"),
          form_id: getCheckedValues("prod-form"),
          variants: this.state.variants
        };

        const response: any = await ApiClient.adminPut(`/products/${this.state.productId}`, payload);
        alert("Cập nhật sản phẩm thành công!");
        
        // Cập nhật lại state variants từ server để có _id mới nhất
        if (response && response.variants) {
          this.state.variants = response.variants;
          this.renderVariantsTable();
        }
        
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      } catch (error: any) {
        alert("Cập nhật thất bại: " + (error.message || "Unknown Error"));
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    });

    // Image Upload
    const btnUploadImg = document.getElementById("btn-upload-prod-img");
    const fileUploadImg = document.getElementById("prod-img-file") as HTMLInputElement | null;
    btnUploadImg?.addEventListener("click", () => fileUploadImg?.click());

    fileUploadImg?.addEventListener("change", async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const preview = document.getElementById("prod-main-img-preview") as HTMLElement;
      preview.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-blue-500"></i>';
      try {
        const url = await UploadService.uploadImage(file);
        (document.getElementById("prod-main-img") as HTMLInputElement).value = url;
        preview.innerHTML = `
          <img src="${this.escapeAttribute(url)}" class="w-full h-full object-cover">
          <button type="button" id="btn-remove-prod-img" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors text-xs"><i class="fa-solid fa-xmark"></i></button>
        `;
      } catch (err) {
        alert("Upload ảnh thất bại");
        preview.innerHTML = '<i class="fa-solid fa-image text-slate-300 text-2xl"></i>';
      } finally {
        fileUploadImg.value = '';
      }
    });

    document.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      const removeBtn = target.closest('#btn-remove-prod-img');
      if (removeBtn) {
        const imgInput = document.getElementById("prod-main-img") as HTMLInputElement | null;
        const url = imgInput?.value;
        if (url) {
          removeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
          await UploadService.deleteImage(url);
          if (imgInput) imgInput.value = "";
          const preview = document.getElementById("prod-main-img-preview");
          if (preview) preview.innerHTML = '<i class="fa-solid fa-image text-slate-300 text-2xl"></i>';
        }
      }
    });
  }

  private getColorHex(color: string): string {
    if (!color) return "#d1d5db";
    const trimmed = color.trim();
    // Nếu đã là mã hex thì trả về thẳng (vd: #ff3399)
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return trimmed;
    const normalized = trimmed.toLowerCase();
    const map: Record<string, string> = {
      black: "#111111",
      "đen": "#111111",
      white: "#ffffff",
      "trắng": "#ffffff",
      navy: "#1e3a5f",
      "xanh navy": "#1e3a5f",
      grey: "#9ca3af",
      "xám": "#9ca3af",
      red: "#ef4444",
      "đỏ": "#ef4444",
      blue: "#3b82f6",
      "xanh dương": "#3b82f6",
      green: "#22c55e",
      "xanh lá": "#22c55e",
      brown: "#92400e",
      "nâu": "#92400e",
      camel: "#c4903a",
      be: "#e8d5b0",
      pink: "#ec4899",
      "hồng": "#ec4899",
      "màu hồng": "#ec4899",
      orange: "#f97316",
      "cam": "#f97316",
      "màu cam": "#f97316",
      yellow: "#eab308",
      "vàng": "#eab308",
      "màu vàng": "#eab308",
      purple: "#a855f7",
      "tím": "#a855f7",
      "màu tím": "#a855f7",
    };
    return map[normalized] || "#d1d5db";
  }

  private renderVariantsTable() {
    const tbody = document.getElementById("variants-tbody");
    if (!tbody) return;

    if (this.state.variants.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400">Chưa có biến thể nào</td></tr>`;
      return;
    }

    const presetColors = [
      { name: "Đen", hex: "#111111" },
      { name: "Trắng", hex: "#ffffff" },
      { name: "Xám", hex: "#9ca3af" },
      { name: "Đỏ", hex: "#ef4444" },
      { name: "Xanh Dương", hex: "#3b82f6" },
      { name: "Xanh Navy", hex: "#1e3a5f" },
      { name: "Xanh Lá", hex: "#22c55e" },
      { name: "Nâu", hex: "#92400e" },
      { name: "Be", hex: "#e8d5b0" },
      { name: "Camel", hex: "#c4903a" },
      { name: "Hồng", hex: "#ec4899" },
      { name: "Cam", hex: "#f97316" },
      { name: "Vàng", hex: "#eab308" },
      { name: "Tím", hex: "#a855f7" },
    ];

    tbody.innerHTML = this.state.variants.map((v, index) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 w-[220px]">
          <input type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm var-sku" data-index="${index}" value="${v.sku || ''}">
        </td>
        <td class="p-3 w-10 text-center">
          <!-- Swatch only, popover anchored to body -->
          <div class="relative color-picker-container flex justify-center">
            <button type="button"
              class="w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-300 shrink-0 var-color-preview shadow cursor-pointer hover:scale-110 transition-transform"
              data-index="${index}"
              style="background-color: ${v.color_hex || '#d1d5db'};"
              title="${v.color || 'Chọn màu'}"
            ></button>
          </div>
        </td>
        <td class="p-3 w-[160px]">
          <input type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm var-color" data-index="${index}" value="${v.color || ''}" placeholder="Tên màu..." autocomplete="off">
        </td>
        <td class="p-3 w-[90px]">
          <input list="size-suggestions" type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm var-size" data-index="${index}" value="${v.size || ''}" placeholder="M, L...">
        </td>
        <td class="p-3">
          <input type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm var-price" data-index="${index}" value="${v.price || 0}">
        </td>
        <td class="p-3">
          <input type="number" class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 var-qty" data-index="${index}" value="${v.quantity || 0}" readonly title="Sử dụng chức năng Phiếu Nhập Kho để thay đổi tồn kho">
        </td>
        <td class="p-3 text-center">
          <button type="button" class="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 btn-del-variant" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Attach row events
    document.querySelectorAll('.var-sku').forEach(el => el.addEventListener('input', (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.index!);
      this.state.variants[idx].sku = (e.target as HTMLInputElement).value;
    }));

    // ---- Global fixed popover for color picker ----
    // Create/get a single shared popover element appended to body
    let globalPopover = document.getElementById('variant-color-popover') as HTMLElement | null;
    if (!globalPopover) {
      globalPopover = document.createElement('div');
      globalPopover.id = 'variant-color-popover';
      globalPopover.style.cssText = `
        position: fixed; z-index: 9999; display: none;
        background: white; border: 1px solid #e2e8f0; border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15); padding: 10px;
        display: none; gap: 6px; flex-wrap: wrap; width: 196px;
      `;
      globalPopover.innerHTML = presetColors.map(c => `
        <button type="button"
          class="btn-preset-color w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-300 hover:scale-125 transition-transform shadow-sm"
          data-color-name="${c.name}" style="background-color: ${c.hex};" title="${c.name}">
        </button>
      `).join('') + `
        <label class="w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-200 hover:scale-125 transition-transform flex items-center justify-center cursor-pointer bg-slate-50 shadow-sm" title="Tự chọn màu">
          <i class="fa-solid fa-palette text-[11px] text-slate-500"></i>
          <input type="color" id="global-color-input" style="display:none">
        </label>
      `;
      document.body.appendChild(globalPopover);
    }

    let activeSwatchIndex = -1;

    // Show popover on swatch click
    document.querySelectorAll('.var-color-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const b = btn as HTMLElement;
        const idx = parseInt(b.dataset.index!);
        activeSwatchIndex = idx;

        const rect = b.getBoundingClientRect();
        const pop = globalPopover!;
        pop.style.display = 'flex';
        // Position below the swatch, aligned left
        const left = Math.min(rect.left, window.innerWidth - 210);
        const top = rect.bottom + 6;
        pop.style.left = `${left}px`;
        pop.style.top = `${top}px`;
      });
    });

    // Preset color pick
    globalPopover.querySelectorAll('.btn-preset-color').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colorName = (btn as HTMLElement).dataset.colorName || "";
        const hex = (btn as HTMLElement).style.backgroundColor; // the button's inline style
        if (activeSwatchIndex >= 0) {
          this.state.variants[activeSwatchIndex].color = colorName;
          this.state.variants[activeSwatchIndex].color_hex = hex;
          
          const swatch = document.querySelector(`.var-color-preview[data-index="${activeSwatchIndex}"]`) as HTMLElement;
          const input = document.querySelector(`.var-color[data-index="${activeSwatchIndex}"]`) as HTMLInputElement;
          
          if (swatch) { swatch.style.backgroundColor = hex; swatch.title = colorName; }
          if (input) { input.value = colorName; }
        }
        globalPopover!.style.display = 'none';
      });
    });

    // Custom color picker
    const globalColorInput = document.getElementById('global-color-input') as HTMLInputElement | null;
    if (globalColorInput) {
      globalColorInput.addEventListener('input', (e) => {
        const hex = (e.target as HTMLInputElement).value;
        if (activeSwatchIndex >= 0) {
          this.state.variants[activeSwatchIndex].color_hex = hex;
          const swatch = document.querySelector(`.var-color-preview[data-index="${activeSwatchIndex}"]`) as HTMLElement;
          if (swatch) { swatch.style.backgroundColor = hex; }
        }
      });
      globalColorInput.addEventListener('change', () => {
        globalPopover!.style.display = 'none';
      });
    }

    // Dismiss on outside click
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('#variant-color-popover') &&
          !(e.target as HTMLElement).closest('.var-color-preview')) {
        if (globalPopover) globalPopover.style.display = 'none';
      }
    });

    document.querySelectorAll('.var-color').forEach(el => {
      el.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const idx = parseInt(target.dataset.index!);
        const val = target.value;
        
        // Chỉ lưu text, không làm đổi màu vòng tròn!
        this.state.variants[idx].color = val;
      });
    });

    document.querySelectorAll('.var-size').forEach(el => el.addEventListener('input', (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.index!);
      this.state.variants[idx].size = (e.target as HTMLInputElement).value;
    }));

    document.querySelectorAll('.var-price').forEach(el => el.addEventListener('input', (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.index!);
      this.state.variants[idx].price = parseInt((e.target as HTMLInputElement).value) || 0;
    }));
    
    document.querySelectorAll('.btn-del-variant').forEach(el => el.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).dataset.index!);
      if (globalPopover) globalPopover.style.display = 'none';
      if (confirm("Bạn có chắc muốn xóa biến thể này?")) {
        this.state.variants.splice(idx, 1);
        this.renderVariantsTable();
      }
    }));
  }

  private templateSkeleton(): string {
    return `
      <div class="flex flex-col h-full animate-pulse p-6">
        <div class="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div class="h-64 bg-slate-200 rounded-xl mb-6"></div>
        <div class="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    `;
  }

  private escapeHtml(value: string): string {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value).replace(/`/g, "&#096;");
  }

  private template(): string {
    const p = this.state.product || {};
    const opt = this.state.options || {};
    
    // Check if main_img is null or undefined to prevent rendering 'undefined'
    const productMainImg = p.main_img ? this.escapeAttribute(p.main_img) : "";
    const hasImage = !!p.main_img;
    
    const cats = opt.categories || [];
    const brands = opt.brands || [];
    const seasons = opt.seasons || [];
    const genders = opt.genders || [];
    const sports = opt.sports || [];
    const materials = opt.materials || [];
    const forms = opt.forms || [];

    const currentBrandId = p.brand_id?._id || p.brand_id?.id || p.brand_id || '';
    
    // Normalize array ids
    const getIds = (val: any) => {
      if (!val) return [];
      if (!Array.isArray(val)) return [val._id || val.id || val].map(String);
      return val.map((v: any) => String(v._id || v.id || v));
    };

    const curCats = getIds(p.category_id);
    const curSeasons = getIds(p.season_id);
    const curGenders = getIds(p.gender_id);
    const curSports = getIds(p.sport_id);
    const curMaterials = getIds(p.material_id);
    const curForms = getIds(p.form_id);

    const renderCheckboxes = (items: any[], currentIds: string[], name: string) => {
      if (items.length === 0) return `<span class="text-xs text-slate-400">Không có dữ liệu</span>`;
      return items.map(item => {
        const id = String(item.id || item._id);
        const isChecked = currentIds.includes(id);
        return `
          <label class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-all">
            <input type="checkbox" name="${name}" value="${id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 text-[#2a83e9] rounded border-slate-300 focus:ring-[#2a83e9]">
            <span class="${isChecked ? 'font-bold text-[#2a83e9]' : 'text-slate-600'}">${item.name}</span>
          </label>
        `;
      }).join('');
    };

    const renderCategoryTree = (items: any[], currentIds: string[], parentId: any = null, depth = 0) => {
      const children = items.filter(item => item.parent_id == parentId);
      if (children.length === 0) return '';
      
      let html = `<div class="${depth > 0 ? 'ml-6 mt-2 border-l border-slate-200 pl-3' : ''} flex flex-col gap-2">`;
      for (const item of children) {
        const id = String(item.id || item._id);
        const isChecked = currentIds.includes(id);
        html += `
          <div>
            <label class="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all w-max">
              <input type="checkbox" name="prod-cat" value="${id}" data-parent="${item.parent_id || ''}" ${isChecked ? 'checked' : ''} class="w-4 h-4 text-[#2a83e9] rounded border-slate-300 focus:ring-[#2a83e9] cat-checkbox">
              <span class="${isChecked ? 'font-bold text-[#2a83e9]' : 'text-slate-600'}">${item.name}</span>
            </label>
            ${renderCategoryTree(items, currentIds, id, depth + 1)}
          </div>
        `;
      }
      html += `</div>`;
      return html;
    };

    return `
      <div class="flex flex-col h-full overflow-y-auto">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10 sticky top-0 rounded-t-2xl">
          <div class="flex items-center gap-4">
            <button id="btn-back" class="text-slate-400 hover:text-[#2a83e9] transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h1 class="text-2xl font-black text-slate-800">Chỉnh sửa sản phẩm</h1>
            <p class="text-slate-500">Cập nhật thông tin chi tiết của sản phẩm.</p>
          </div>
          <div>
            <button form="form-edit-product" type="submit" id="btn-save" class="px-5 py-2.5 bg-[#2a83e9] hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
              <i class="fa-solid fa-save"></i> Cập Nhật Sản Phẩm
            </button>
          </div>
        </header>

        <!-- Content -->
        <div class="flex-1 p-6 space-y-6">
          <form id="form-edit-product" class="space-y-6">
            
            <!-- Basic Info Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 class="font-bold text-slate-800"><i class="fa-solid fa-circle-info text-blue-500 mr-2"></i> Thông tin cơ bản</h3>
              </div>
              <div class="p-6 grid grid-cols-2 gap-6">
                <!-- Row 1 -->
                <div>
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Tên sản phẩm <span class="text-red-500">*</span></label>
                  <input type="text" id="prod-name" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all font-bold text-slate-800" value="${this.escapeAttribute(p.name || '')}" required>
                </div>
                
                <div>
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Giá mặc định (VNĐ) <span class="text-red-500">*</span></label>
                  <input type="number" id="prod-default-price" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all font-bold text-slate-800" value="${p.default_price || 0}" min="0" required>
                </div>

                <!-- Row 2: Image and Brand -->
                <div>
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Hình ảnh đại diện (Main Image)</label>
                  <div class="flex gap-4 items-center">
                    <div id="prod-main-img-preview" class="relative w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      ${hasImage ? `
                        <img src="${productMainImg}" class="w-full h-full object-cover">
                        <button type="button" id="btn-remove-prod-img" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors text-xs"><i class="fa-solid fa-xmark"></i></button>
                      ` : '<i class="fa-solid fa-image text-slate-300 text-2xl"></i>'}
                    </div>
                    <div class="flex-1 space-y-2">
                      <input type="hidden" id="prod-main-img" value="${productMainImg}">
                      <button type="button" id="btn-upload-prod-img" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
                        <i class="fa-solid fa-cloud-arrow-up text-blue-500"></i> Tải ảnh lên
                      </button>
                      <input type="file" id="prod-img-file" accept="image/*" class="hidden">
                    </div>
                  </div>
                </div>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Nhãn hiệu (Brand)</label>
                    <select id="prod-brand" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all">
                      <option value="">-- Chọn nhãn hiệu --</option>
                      ${brands.map((b: any) => `
                        <option value="${b.id || b._id}" ${b.id == currentBrandId || b._id == currentBrandId ? 'selected' : ''}>${b.name}</option>
                      `).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Trạng thái</label>
                    <select id="prod-status" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all font-bold ${p.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-500'}">
                      <option value="ACTIVE" ${p.status === 'ACTIVE' ? 'selected' : ''}>Đang bán (Active)</option>
                      <option value="DRAFT" ${p.status === 'DRAFT' || !p.status ? 'selected' : ''}>Bản nháp (Draft)</option>
                      <option value="INACTIVE" ${p.status === 'INACTIVE' ? 'selected' : ''}>Ngừng bán (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div class="col-span-2">
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Mô tả chi tiết</label>
                  <textarea id="prod-desc" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all min-h-[120px] leading-relaxed">${p.description || ''}</textarea>
              </div>
            </div>

            <!-- Gallery Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 class="font-bold text-slate-800"><i class="fa-solid fa-images text-purple-500 mr-2"></i> Thư viện ảnh</h3>
              </div>
              <div class="p-6">
                <div id="prod-gallery-dropzone" class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer mb-6 flex flex-col items-center justify-center min-h-[140px]">
                  <i class="fa-solid fa-cloud-arrow-up text-4xl text-slate-300 mb-3"></i>
                  <p class="text-sm font-bold text-slate-600">Kéo thả nhiều ảnh vào đây hoặc click để tải lên</p>
                  <p class="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP</p>
                  <input type="file" id="prod-gallery-input" multiple accept="image/*" class="hidden">
                </div>
                
                <div id="prod-gallery-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <!-- Images will be rendered here -->
                  ${(p.images || []).map((url: string) => `
                    <div class="gallery-img-item relative rounded-lg border border-slate-200 overflow-hidden group bg-slate-50 aspect-square" draggable="true" data-url="${this.escapeAttribute(url)}">
                      <img src="${this.escapeAttribute(url)}" class="w-full h-full object-cover pointer-events-none">
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i class="fa-solid fa-arrows-up-down-left-right text-white text-xl"></i>
                      </div>
                      <button type="button" class="btn-remove-gallery-img absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md text-xs z-10 hover:bg-red-600 hover:scale-110">
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Filters Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 class="font-bold text-slate-800"><i class="fa-solid fa-tags text-orange-500 mr-2"></i> Tiêu chí phân loại (Chọn nhiều)</h3>
              </div>
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Danh mục -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 row-span-2">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">Danh mục (Chọn 1 nhánh)</label>
                  <div class="max-h-[350px] overflow-y-auto pr-2">
                    ${cats.length > 0 ? renderCategoryTree(cats, curCats, null, 0) : '<span class="text-xs text-slate-400">Không có dữ liệu</span>'}
                  </div>
                </div>
                <!-- Giới tính -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">Giới tính</label>
                  <div class="grid grid-cols-2 gap-1 max-h-[150px] overflow-y-auto">
                    ${renderCheckboxes(genders, curGenders, 'prod-gender')}
                  </div>
                </div>
                <!-- Mùa -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">Mùa</label>
                  <div class="grid grid-cols-2 gap-1 max-h-[150px] overflow-y-auto">
                    ${renderCheckboxes(seasons, curSeasons, 'prod-season')}
                  </div>
                </div>
                <!-- Form / Kiểu dáng -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">Kiểu dáng (Form)</label>
                  <div class="grid grid-cols-2 gap-1 max-h-[150px] overflow-y-auto">
                    ${renderCheckboxes(forms, curForms, 'prod-form')}
                  </div>
                </div>
                <!-- Chất liệu -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">Chất liệu</label>
                  <div class="grid grid-cols-2 gap-1 max-h-[150px] overflow-y-auto">
                    ${renderCheckboxes(materials, curMaterials, 'prod-material')}
                  </div>
                </div>
                <!-- Thể thao -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">Môn thể thao</label>
                  <div class="grid grid-cols-2 gap-1 max-h-[150px] overflow-y-auto">
                    ${renderCheckboxes(sports, curSports, 'prod-sport')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Variants Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 class="font-bold text-slate-800"><i class="fa-solid fa-layer-group text-purple-500 mr-2"></i> Các biến thể (Variants)</h3>
                <div class="flex gap-2">
                  <button type="button" id="btn-add-color-variant" class="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-palette text-blue-500"></i> Thêm màu
                  </button>
                  <button type="button" id="btn-add-size-variant" class="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-ruler text-orange-500"></i> Thêm size
                  </button>
                </div>
              </div>
              <div class="overflow-x-auto p-4 pb-32">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="text-slate-500 text-xs uppercase tracking-wider bg-slate-50">
                      <th class="p-3 font-bold w-[220px]">Mã SKU</th>
                      <th class="p-3 font-bold w-10 text-center">🎨</th>
                      <th class="p-3 font-bold w-[160px]">Màu Sắc</th>
                      <th class="p-3 font-bold w-[90px]">Size</th>
                      <th class="p-3 font-bold">Giá Bán</th>
                      <th class="p-3 font-bold w-[90px]">Tồn Kho <i class="fa-solid fa-lock text-slate-300 ml-1"></i></th>
                      <th class="p-3 font-bold w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody id="variants-tbody" class="text-sm">
                    <!-- Rendered by JS -->
                  </tbody>
                </table>
              </div>
            </div>

          </form>
        </div>

        <datalist id="color-suggestions">
          <option value="Đen"></option>
          <option value="Trắng"></option>
          <option value="Xám"></option>
          <option value="Đỏ"></option>
          <option value="Xanh Dương"></option>
          <option value="Xanh Navy"></option>
          <option value="Xanh Lá"></option>
          <option value="Nâu"></option>
          <option value="Be"></option>
          <option value="Camel"></option>
          <option value="Hồng"></option>
          <option value="Cam"></option>
          <option value="Vàng"></option>
          <option value="Tím"></option>
        </datalist>

        <datalist id="size-suggestions">
          <option value="S"></option>
          <option value="M"></option>
          <option value="L"></option>
          <option value="XL"></option>
          <option value="XXL"></option>
          <option value="3XL"></option>
          <option value="28"></option>
          <option value="29"></option>
          <option value="30"></option>
          <option value="31"></option>
          <option value="32"></option>
          <option value="33"></option>
          <option value="34"></option>
        </datalist>
      </div>
    `;
  }
}
