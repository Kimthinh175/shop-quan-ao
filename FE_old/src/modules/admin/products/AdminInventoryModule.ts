import { ApiClient } from "../../../api/ApiClient";
import { AdminSidebar } from "../../../components/AdminSidebar";
import { AdminHeader } from "../../../components/AdminHeader";
import { IProduct } from "../../../shared/models/IProduct";

export class AdminInventoryModule {
  private state = {
    products: [] as IProduct[],
    loading: true,
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    await this.fetchProducts();
    app.innerHTML = this.template();
  }

  private async fetchProducts() {
    this.state.loading = true;
    try {
      const res = await ApiClient.get<import("../../../shared/interfaces/ITypes").IPaginationResponse<import("../../../shared/models/IProduct").IProduct>>(
        "/products?limit=50",
      );
      this.state.products = res.results;
    } catch (e) {
      console.error("Failed to load inventory:", e);
    } finally {
      this.state.loading = false;
    }
  }

  private template(): string {
    return `
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${AdminSidebar.render("products")}

        <main class="flex-1 flex flex-col overflow-hidden">
          ${AdminHeader.render("Quản lý kho")}

          <div class="flex-1 overflow-y-auto p-10">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h1 class="text-2xl font-black text-slate-800">Danh sách sản phẩm</h1>
                <p class="text-slate-500">Xem và cập nhật chi tiết kho sản phẩm của bạn.</p>
              </div>
              <button class="px-6 py-3 bg-[#2a83e9] text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-[#2a83e9]/30">
                + Thêm sản phẩm
              </button>
            </div>

            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th class="px-8 py-6">Sản phẩm</th>
                    <th class="px-8 py-6">Danh mục</th>
                    <th class="px-8 py-6">Giá bán</th>
                    <th class="px-8 py-6">Tồn kho</th>
                    <th class="px-8 py-6">Trạng thái</th>
                    <th class="px-8 py-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  ${this.state.products
                    .map((p) => {
                      const price =
                        p.price ||
                        (p.variants && p.variants.length > 0
                          ? p.variants[0].price
                          : 0);
                      const totalQty = p.variants
                        ? p.variants.reduce(
                            (acc: number, v: import("../../../shared/interfaces/ITypes").IProductVariant) => acc + (v._id ? 15 : 0),
                            15,
                          )
                        : 15; // fallback
                      const inStock = totalQty > 0;

                      return `
                      <tr class="hover:bg-slate-50 transition-all group">
                        <td class="px-8 py-6">
                          <div class="flex items-center gap-4">
                            <img src="${p.image || "https://images.unsplash.com/photo-1594932224011-042041c62fed?w=100"}" class="w-12 h-12 object-cover rounded-xl shadow-sm" alt="${p.name}">
                            <div>
                              <p class="font-bold text-slate-800 group-hover:text-[#2a83e9] transition-all">${p.name}</p>
                              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: ${p.id || p._id}</p>
                            </div>
                          </div>
                        </td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">${p.category || "Suits"}</td>
                        <td class="px-8 py-6 font-black text-[#2a83e9]">${price.toLocaleString()}đ</td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">${totalQty}</td>
                        <td class="px-8 py-6">
                          <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${inStock ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}">
                            ${inStock ? "Còn hàng" : "Hết hàng"}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <div class="flex gap-2">
                            <button class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#2a83e9] hover:text-white flex items-center justify-center transition-all">
                              <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden w-full">
        ${AdminSidebar.render("products")}
        <main class="flex-1 flex flex-col overflow-hidden animate-pulse">
          ${AdminHeader.render("Quản lý kho")}
          <div class="flex-1 p-10 space-y-6">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </main>
      </div>
    `;
  }
}
