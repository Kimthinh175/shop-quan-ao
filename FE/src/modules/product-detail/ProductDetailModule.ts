import { ApiClient } from "../../api/ApiClient";
import { ClientHeader } from "../../components/ClientHeader";
import { ClientFooter } from "../../components/ClientFooter";
import { IProduct } from "../../shared/models/IProduct";

export class ProductDetailModule {
  public async render(id: string): Promise<void> {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    try {
      const product = await ApiClient.get<any>(`/products/${id}`);
      app.innerHTML = this.template(product);
      window.scrollTo(0, 0);
      this.initEvents();
    } catch (error) {
      console.error(error);
      app.innerHTML = "<h1>Không tìm thấy sản phẩm</h1>";
    }
  }

  private initEvents() {
    // Xử lý chọn size, màu sắc ở đây
  }

  private template(p: IProduct): string {
    const sizes = p.variants
      ? Array.from(new Set(p.variants.map((v: any) => v.size)))
      : [];
    const colors = p.variants
      ? Array.from(new Set(p.variants.map((v: any) => v.color)))
      : [];

    const colorMap: Record<string, string> = {
      "Xanh Navy": "bg-slate-800",
      Trắng: "bg-white",
      "Trắng Kem": "bg-[#f5f5dc]",
      Đen: "bg-black",
      "Be Tự Nhiên": "bg-[#e3dac9]",
    };

    return `
      <div class="min-h-screen bg-[#faf9f6]">
        ${ClientHeader.render()}

        <main class="pt-32 pb-28 max-w-7xl mx-auto px-6">
          <div class="flex flex-col lg:flex-row gap-16 xl:gap-24">
            <!-- Left: Image Gallery (Editorial style) -->
            <div class="flex-1 lg:w-1/2">
              <div class="sticky top-32">
                <div class="relative w-full aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl">
                  <img src="${p.image}" class="w-full h-full object-cover object-center transition-transform duration-[2000ms] hover:scale-105" alt="${p.name}">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  <!-- Category Badge -->
                  <div class="absolute top-8 left-8">
                     <span class="inline-flex items-center justify-center px-4 py-2 bg-white/90 backdrop-blur text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        ${p.category || "Tối giản"}
                     </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Product Info -->
            <div class="flex-1 lg:w-1/2 py-10 flex flex-col justify-center">
              
              <div class="mb-8">
                  <span class="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">${p.brand || "CLOSET Studios"}</span>
                  <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-slate-900 mb-6 leading-tight" style="font-family: 'Playfair Display', serif;">${p.name}</h1>
                  <p class="text-3xl font-black text-slate-900">${(p.price || 0).toLocaleString()}đ</p>
              </div>

              <div class="w-12 h-[1px] bg-slate-300 mb-8"></div>

              <div class="prose prose-slate prose-lg mb-12">
                <p class="text-slate-500 leading-relaxed font-light text-base">
                  ${p.description || "Sản phẩm cao cấp được thiết kế với sự chú trọng tuyệt đối vào chất liệu và phom dáng, mang lại trải nghiệm sang trọng và bền bỉ vượt thời gian."}
                </p>
              </div>

              <!-- Options -->
              <div class="space-y-10 mb-14">
                ${
                  sizes.length > 0
                    ? `
                <div>
                  <div class="flex items-center justify-between mb-4">
                      <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-900">Kích cỡ</h4>
                      <button class="text-[10px] font-bold text-indigo-600 underline underline-offset-4">Bảng size</button>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    ${sizes
                      .map(
                        (size) => `
                      <button class="w-14 h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                        ${size}
                      </button>
                    `,
                      )
                      .join("")}
                  </div>
                </div>
                `
                    : ""
                }

                ${
                  colors.length > 0
                    ? `
                <div>
                  <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Màu sắc</h4>
                  <div class="flex flex-wrap gap-4">
                    ${colors
                      .map((color, index) => {
                        const bgClass = colorMap[color] || "bg-slate-200";
                        return `
                        <button class="group relative w-12 h-12 rounded-full ${bgClass} ring-1 ring-slate-200 ring-offset-4 ring-offset-[#faf9f6] ${index === 0 ? "ring-slate-900" : "hover:ring-slate-400"} transition-all flex items-center justify-center">
                            <span class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">${color}</span>
                        </button>
                        `;
                      })
                      .join("")}
                  </div>
                </div>
                `
                    : ""
                }
              </div>

              <!-- Action -->
              <div class="flex gap-4">
                <button class="flex-1 h-16 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center gap-3">
                  Thêm vào giỏ <i class="fa-solid fa-bag-shopping"></i>
                </button>
                <button class="w-16 h-16 border border-slate-200 text-slate-600 flex items-center justify-center rounded-2xl hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all bg-white">
                  <i class="fa-regular fa-heart text-xl"></i>
                </button>
              </div>

              <!-- Features -->
              <div class="mt-14 pt-10 border-t border-slate-200/60 grid grid-cols-2 gap-8">
                <div class="flex items-start gap-4">
                  <div class="mt-1">
                    <i class="fa-solid fa-truck-fast text-xl text-slate-800"></i>
                  </div>
                  <div>
                    <h5 class="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">Giao hàng miễn phí</h5>
                    <p class="text-[11px] text-slate-500">Mọi đơn hàng từ 2.000.000đ</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="mt-1">
                    <i class="fa-solid fa-arrows-rotate text-xl text-slate-800"></i>
                  </div>
                  <div>
                    <h5 class="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">Đổi trả miễn phí</h5>
                    <p class="text-[11px] text-slate-500">Trong vòng 30 ngày</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        ${ClientFooter.render()}
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div class="min-h-screen bg-[#faf9f6]">
        ${ClientHeader.render()}
        <div class="pt-32 pb-28 max-w-7xl mx-auto px-6 animate-pulse">
          <div class="flex flex-col lg:flex-row gap-16 xl:gap-24">
            <div class="flex-1 lg:w-1/2 aspect-[3/4] bg-slate-200 rounded-[2rem]"></div>
            <div class="flex-1 lg:w-1/2 py-10">
              <div class="h-4 bg-slate-200 rounded w-32 mb-6"></div>
              <div class="h-16 bg-slate-200 rounded w-full mb-6"></div>
              <div class="h-16 bg-slate-200 rounded w-3/4 mb-6"></div>
              <div class="h-10 bg-slate-200 rounded w-1/3 mb-10"></div>
              <div class="space-y-4 mb-14">
                <div class="h-4 bg-slate-200 rounded w-full"></div>
                <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                <div class="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
              <div class="h-16 bg-slate-200 rounded-2xl w-full"></div>
            </div>
          </div>
        </div>
        ${ClientFooter.render()}
      </div>
    `;
  }
}
