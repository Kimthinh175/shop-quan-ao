import { ApiClient } from "../../../api/ApiClient";
import { AdminSidebar } from "../../../components/AdminSidebar";

export class AdminSuppliersModule {
  private state = {
    suppliers: [] as any[],
    loading: true,
    showModal: false
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    await this.fetchSuppliers();
    app.innerHTML = this.template();
    this.initEvents();
  }

  private async fetchSuppliers() {
    this.state.loading = true;
    try {
      const res = await ApiClient.adminGet<any>("/suppliers");
      this.state.suppliers = res.results || res || [];
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      this.state.loading = false;
    }
  }

  private initEvents() {
    const createBtn = document.getElementById("btn-add-supplier");
    const closeBtn = document.getElementById("btn-close-modal");
    const modal = document.getElementById("supplier-modal");
    const form = document.getElementById("supplier-form") as HTMLFormElement;

    if (createBtn) {
      createBtn.addEventListener("click", () => {
        if (modal) modal.classList.remove("hidden");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (modal) modal.classList.add("hidden");
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("sup-name") as HTMLInputElement;
        const phoneInput = document.getElementById("sup-phone") as HTMLInputElement;
        const addressInput = document.getElementById("sup-address") as HTMLInputElement;

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();

        if (!name) {
          alert("Vui lòng nhập tên nhà cung cấp");
          return;
        }

        const submitBtn = document.getElementById("btn-submit-modal") as HTMLButtonElement;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
        submitBtn.disabled = true;

        try {
          await ApiClient.adminPost("/suppliers", { name, phone, address });
          if (modal) modal.classList.add("hidden");
          form.reset();
          await this.render(); // Reload page
        } catch (error: any) {
          alert("Lỗi: " + (error.message || "Không thể tạo nhà cung cấp"));
        } finally {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      });
    }
  }

  private templateSkeleton(): string {
    return `
      <div class="animate-pulse">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 shadow-sm z-10"></header>
        <div class="p-6">
          <div class="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div class="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    `;
  }

  private template(): string {
    return `
      <div class="flex flex-col h-full">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10 rounded-t-2xl">
          <div class="flex items-center gap-4">
            <h2 class="text-lg font-bold text-slate-800">Nhà cung cấp</h2>
          </div>
          <div>
            <button id="btn-add-supplier" class="px-4 py-2 bg-[#2a83e9] hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Thêm NCC mới
            </button>
          </div>
        </header>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-6 bg-white rounded-b-2xl shadow-sm border border-t-0 border-slate-200">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th class="p-4 font-bold">Mã NCC</th>
                <th class="p-4 font-bold">Tên nhà cung cấp</th>
                <th class="p-4 font-bold">Số điện thoại</th>
                <th class="p-4 font-bold">Địa chỉ</th>
                <th class="p-4 font-bold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              ${this.state.suppliers.length === 0 ? `
                <tr><td colspan="5" class="p-8 text-center text-slate-400">Chưa có nhà cung cấp nào</td></tr>
              ` : this.state.suppliers.map(sup => `
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-4 text-slate-500 font-mono">#${sup.id || sup._id}</td>
                  <td class="p-4 font-bold text-slate-800">${sup.name}</td>
                  <td class="p-4 text-slate-600">${sup.phone || '-'}</td>
                  <td class="p-4 text-slate-600">${sup.address || '-'}</td>
                  <td class="p-4 text-slate-500">${new Date(sup.createdAt || sup.create_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Add Supplier -->
      <div id="supplier-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeSlideDown_0.2s_ease-out]">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-800 text-lg">Thêm nhà cung cấp</h3>
            <button id="btn-close-modal" class="text-slate-400 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="supplier-form" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Tên Nhà Cung Cấp <span class="text-red-500">*</span></label>
              <input type="text" id="sup-name" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all" required>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Số Điện Thoại</label>
              <input type="text" id="sup-phone" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Địa Chỉ</label>
              <textarea id="sup-address" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-all min-h-[100px]"></textarea>
            </div>
            <div class="pt-4 flex justify-end">
              <button type="submit" id="btn-submit-modal" class="px-6 py-2.5 bg-[#2a83e9] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                <i class="fa-solid fa-check"></i> Lưu nhà cung cấp
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
