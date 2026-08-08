import { ApiClient } from "../../api/ApiClient";
import { IProduct } from "../../shared/models/IProduct";
import { IProductVariant, IPaginationResponse } from "../../shared/interfaces/ITypes";
import { CartService } from "../../core/CartService";

export class ProductDetailModule {
  private selectedSize: string = "";
  private selectedColor: string = "";
  private selectedVariant: IProductVariant | null = null;
  private allVariants: IProductVariant[] = [];
  private currentImageIndex: number = 0;
  private allImages: string[] = [];

  public async render(id: string): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    try {
      const product = await ApiClient.get<IProduct>(`/products/${id}`);
      if (!product) {
        app.innerHTML = this.templateNotFound();
        return;
      }

      // Normalize image fields (BE returns main_img not image)
      const p = product as IProduct & { main_img?: string };
      if (!p.image && p.main_img) p.image = p.main_img;

      this.allVariants = (p.variants || []) as IProductVariant[];
      this.allImages = this.buildImageList(p);

      // Pre-select first available size & color
      if (this.allVariants.length > 0) {
        this.selectedSize = this.allVariants[0].size;
        this.selectedColor = this.allVariants[0].color;
        this.selectedVariant = this.allVariants[0];
      }

      const rawCatArray = (p as any).category_id;
      const rawCat = Array.isArray(rawCatArray) ? rawCatArray[0] : rawCatArray;
      const catId = Number(rawCat && typeof rawCat === 'object' ? (rawCat._id || rawCat.id) : rawCat) || 1;
      // Cross-sell: opposite category (áo↔quần)
      const crossCatId = catId <= 2 ? 3 : 1;

      // Load related & cross-sell in parallel
      const [relatedRes, crossRes] = await Promise.all([
        ApiClient.get<IPaginationResponse<IProduct>>(`/products?limit=4&category_id=${catId}`),
        ApiClient.get<IPaginationResponse<IProduct>>(`/products?limit=4&category_id=${crossCatId}`),
      ]);

      app.innerHTML = this.template(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.initEvents(p);

      // Inject sections
      const related = (relatedRes.results || []).filter((r: IProduct) => r._id !== p._id && r.id !== p.id).slice(0, 4);
      this.renderRelated(related);

      const cross = (crossRes.results || []).slice(0, 4);
      this.renderCrossSell(cross, crossCatId);

      this.renderSeoArticle(p);
      this.renderReviews(p);
    } catch (error) {
      console.error(error);
      app.innerHTML = this.templateNotFound();
    }
  }

  private buildImageList(p: IProduct & { main_img?: string }): string[] {
    const imgs: string[] = [];
    const main = p.image || p.main_img || "";
    if (main) imgs.push(main);
    if (p.images && p.images.length > 0) {
      p.images.forEach((img) => { if (img && img !== main) imgs.push(img); });
    }
    // Fallback: duplicate main up to 3 times so gallery always has items
    while (imgs.length < 3 && imgs.length > 0) imgs.push(imgs[0]);
    return imgs;
  }

  private getCurrentPrice(): number {
    if (this.selectedVariant) return this.selectedVariant.price;
    if (this.allVariants.length > 0) return this.allVariants[0].price;
    return 0;
  }

  private updateVariantSelection(): void {
    const match = this.allVariants.find(
      (v) => v.size === this.selectedSize && v.color === this.selectedColor
    );
    this.selectedVariant = match || null;

    // Update price display
    const priceEl = document.getElementById("pd-price");
    if (priceEl) {
      const price = this.getCurrentPrice();
      priceEl.textContent = price.toLocaleString("vi-VN") + "đ";
    }

    // Update CTA button state
    const addBtn = document.getElementById("pd-add-btn") as HTMLButtonElement | null;
    if (addBtn) {
      if (this.selectedVariant) {
        addBtn.disabled = false;
        addBtn.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        addBtn.disabled = true;
        addBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }

  private initEvents(p: IProduct): void {
    // Size buttons
    document.querySelectorAll("[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = (btn as HTMLElement).dataset["size"] || "";
        this.selectedSize = size;
        document.querySelectorAll("[data-size]").forEach((b) => {
          b.classList.remove("bg-slate-900", "text-white", "border-slate-900", "scale-105");
          b.classList.add("border-slate-200", "text-slate-600");
        });
        btn.classList.add("bg-slate-900", "text-white", "border-slate-900", "scale-105");
        btn.classList.remove("border-slate-200", "text-slate-600");
        this.updateVariantSelection();
      });
    });

    // Color buttons
    document.querySelectorAll("[data-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const color = (btn as HTMLElement).dataset["color"] || "";
        this.selectedColor = color;
        document.querySelectorAll("[data-color]").forEach((b) => {
          b.classList.remove("ring-2", "ring-slate-900", "ring-offset-2", "scale-110");
        });
        btn.classList.add("ring-2", "ring-slate-900", "ring-offset-2", "scale-110");
        const label = document.getElementById("pd-color-label");
        if (label) label.textContent = color;
        this.updateVariantSelection();
      });
    });

    // Gallery thumbnails
    document.querySelectorAll("[data-thumb]").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const index = parseInt((thumb as HTMLElement).dataset["thumb"] || "0");
        this.switchMainImage(index);
      });
    });

    // Quantity buttons
    const qtyMinus = document.getElementById("pd-qty-minus");
    const qtyPlus = document.getElementById("pd-qty-plus");
    const qtyInput = document.getElementById("pd-qty") as HTMLInputElement | null;

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener("click", () => {
        const val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = (val - 1).toString();
      });
      qtyPlus.addEventListener("click", () => {
        const val = parseInt(qtyInput.value);
        if (val < 99) qtyInput.value = (val + 1).toString();
      });
    }

    // Add to cart
    const addBtn = document.getElementById("pd-add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (!this.selectedVariant) {
          this.showToast("Vui lòng chọn kích cỡ và màu sắc!", "error");
          return;
        }
        const qty = parseInt((document.getElementById("pd-qty") as HTMLInputElement)?.value || "1");
        
        CartService.addToCart({
          id: p.id || p._id || 0,
          variant_id: (this.selectedVariant as any).id || (this.selectedVariant as any)._id || Date.now(),
          name: p.name,
          image: p.image || p.main_img || "",
          price: (this.selectedVariant as any).price || p.price || 0,
          size: this.selectedVariant.size,
          color: this.selectedVariant.color,
          quantity: qty
        });

        this.showToast(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`, "success");
      });
    }

    // Wishlist toggle
    const wishBtn = document.getElementById("pd-wish-btn");
    if (wishBtn) {
      wishBtn.addEventListener("click", () => {
        const icon = wishBtn.querySelector("i");
        if (!icon) return;
        if (icon.classList.contains("fa-regular")) {
          icon.classList.replace("fa-regular", "fa-solid");
          wishBtn.classList.add("text-red-500", "border-red-300", "bg-red-50");
          this.showToast("Đã thêm vào danh sách yêu thích ❤️", "success");
        } else {
          icon.classList.replace("fa-solid", "fa-regular");
          wishBtn.classList.remove("text-red-500", "border-red-300", "bg-red-50");
        }
      });
    }

    // Accordion
    document.querySelectorAll("[data-accordion]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetId = (trigger as HTMLElement).dataset["accordion"] || "";
        const panel = document.getElementById(targetId);
        const icon = trigger.querySelector("[data-acc-icon]");
        if (!panel) return;
        if (panel.style.maxHeight && panel.style.maxHeight !== "0px") {
          panel.style.maxHeight = "0px";
          panel.style.opacity = "0";
          if (icon) icon.classList.remove("rotate-45");
        } else {
          // Close all first
          document.querySelectorAll(".acc-panel").forEach((p) => {
            (p as HTMLElement).style.maxHeight = "0px";
            (p as HTMLElement).style.opacity = "0";
          });
          document.querySelectorAll("[data-acc-icon]").forEach((i) => i.classList.remove("rotate-45"));
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.opacity = "1";
          if (icon) icon.classList.add("rotate-45");
        }
      });
    });

    // Zoom image on hover
    const mainImg = document.getElementById("pd-main-img") as HTMLImageElement | null;
    const zoomContainer = document.getElementById("pd-main-img-wrap");
    if (mainImg && zoomContainer) {
      zoomContainer.addEventListener("mousemove", (e: Event) => {
        const me = e as MouseEvent;
        const rect = zoomContainer.getBoundingClientRect();
        const x = ((me.clientX - rect.left) / rect.width) * 100;
        const y = ((me.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
        mainImg.style.transform = "scale(1.5)";
      });
      zoomContainer.addEventListener("mouseleave", () => {
        mainImg.style.transform = "scale(1)";
        mainImg.style.transformOrigin = "center center";
      });
    }
  }

  private switchMainImage(index: number): void {
    this.currentImageIndex = index;
    const mainImg = document.getElementById("pd-main-img") as HTMLImageElement | null;
    if (mainImg && this.allImages[index]) {
      mainImg.style.opacity = "0";
      mainImg.style.transform = "scale(0.97)";
      setTimeout(() => {
        mainImg.src = this.allImages[index];
        mainImg.style.opacity = "1";
        mainImg.style.transform = "scale(1)";
      }, 200);
    }
    document.querySelectorAll("[data-thumb]").forEach((thumb) => {
      const i = parseInt((thumb as HTMLElement).dataset["thumb"] || "0");
      if (i === index) {
        thumb.classList.add("ring-2", "ring-slate-900", "opacity-100");
        thumb.classList.remove("opacity-50");
      } else {
        thumb.classList.remove("ring-2", "ring-slate-900", "opacity-100");
        thumb.classList.add("opacity-50");
      }
    });
  }

  private showToast(message: string, type: "success" | "error"): void {
    const existing = document.getElementById("pd-toast-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "pd-toast-modal";
    modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 animate-[fadeIn_0.2s_ease-out]";
    
    const isSuccess = type === "success";
    const icon = isSuccess ? '<i class="fa-solid fa-circle-check text-emerald-500 text-5xl mb-4"></i>' : '<i class="fa-solid fa-circle-exclamation text-red-500 text-5xl mb-4"></i>';
    const title = isSuccess ? 'Thành công' : 'Lỗi';

    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-[scaleIn_0.3s_ease-out]">
        ${icon}
        <h3 class="text-2xl font-black text-slate-900 font-serif mb-2">${title}</h3>
        <p class="text-slate-500 mb-8 text-sm leading-relaxed">${message}</p>
        <button id="close-toast-btn" class="w-full bg-[#2a83e9] text-white py-4 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
          Xác Nhận
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById("close-toast-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("opacity-0", "transition-opacity", "duration-200");
        setTimeout(() => modal.remove(), 200);
      });
    }
  }

  private productCardHtml(p: IProduct): string {
    const pp = p as IProduct & { main_img?: string };
    const img = pp.image || pp.main_img || "";
    const price = p.price || (p.variants && p.variants.length > 0 ? (p.variants[0] as IProductVariant).price : 0);
    const pid = p.id || p._id;
    return `
      <a href="/products/${pid}" class="group block">
        <div class="aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 mb-3 relative">
          <img src="${img}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
          <div class="absolute bottom-0 w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div class="bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider text-center py-2 rounded-xl">
              Xem Ngay
            </div>
          </div>
        </div>
        <h4 class="text-sm font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-[#2a83e9] transition-colors leading-tight">${p.name}</h4>
        <p class="text-sm font-black text-slate-800">${price.toLocaleString("vi-VN")}đ</p>
      </a>
    `;
  }

  private renderRelated(products: IProduct[]): void {
    const container = document.getElementById("pd-related-grid");
    if (!container || products.length === 0) return;
    container.innerHTML = products.map((p) => this.productCardHtml(p)).join("");
    document.getElementById("pd-related")?.classList.remove("hidden");
  }

  private renderCrossSell(products: IProduct[], crossCatId: number): void {
    const container = document.getElementById("pd-crosssell-grid");
    if (!container || products.length === 0) return;
    const catNames: Record<number, string> = { 1: "Áo", 2: "Áo Khoác", 3: "Quần", 4: "Quần Dài", 5: "Đồ Lót" };
    const label = catNames[crossCatId] || "Sản Phẩm";
    const subtitle = document.getElementById("pd-crosssell-subtitle");
    if (subtitle) subtitle.textContent = `Kết hợp cùng ${label} để hoàn thiện outfit`;
    container.innerHTML = products.map((p) => this.productCardHtml(p)).join("");
    document.getElementById("pd-crosssell")?.classList.remove("hidden");
  }

  private renderSeoArticle(p: IProduct & { main_img?: string }): void {
    const el = document.getElementById("pd-seo-article");
    if (!el) return;

    const catNames: Record<number, string[]> = {
      1: ["áo thun", "cotton", "phong cách casual"],
      2: ["áo khoác", "phong cách layering", "thời tiết se lạnh"],
      3: ["quần short", "năng động", "mùa hè"],
      4: ["quần dài", "lịch sự", "đa năng"],
      5: ["đồ lót", "kháng khuẩn", "thoáng khí"],
    };
    const rawCatArray = (p as any).category_id;
    const rawCat = Array.isArray(rawCatArray) ? rawCatArray[0] : rawCatArray;
    const catId = Number(rawCat && typeof rawCat === 'object' ? (rawCat._id || rawCat.id) : rawCat) || 1;
    const tags = catNames[catId] || ["thời trang", "phong cách", "chất lượng"];
    const mainImg = p.image || p.main_img || "";

    el.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-10">
          <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-3">Bài Viết Chuyên Sâu</p>
          <h2 class="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight">
            ${p.name}: Tất Cả Những Gì Bạn Cần Biết Trước Khi Mua
          </h2>
          <div class="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span class="flex items-center gap-1"><i class="fa-regular fa-clock"></i> 5 phút đọc</span>
            <span class="flex items-center gap-1"><i class="fa-solid fa-pen-nib"></i> Coolmate Editor</span>
            <span class="flex items-center gap-1"><i class="fa-regular fa-calendar"></i> ${new Date().toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        <!-- Feature image -->
        <div class="w-full aspect-[16/7] overflow-hidden rounded-3xl mb-8 bg-slate-100">
          <img src="${mainImg}" alt="${p.name}" class="w-full h-full object-cover" loading="lazy">
        </div>

        <!-- Article Body -->
        <div class="prose prose-slate max-w-none text-slate-600">
          <h3 class="text-lg font-black text-slate-900 mb-3">1. Tại Sao Nên Chọn ${p.name}?</h3>
          <p class="leading-relaxed mb-5">
            Trong thế giới thời trang ngày càng đa dạng, việc tìm được một sản phẩm <strong>${tags[0]}</strong> đáp ứng
            cả ba tiêu chí: <em>chất liệu tốt, kiểu dáng đẹp, giá hợp lý</em> không hề dễ dàng.
            <strong>${p.name}</strong> được ra đời với sứ mệnh giải quyết đúng bài toán đó — mang đến
            trải nghiệm mặc thoải mái cả ngày mà không đánh đổi phong cách.
          </p>

          <h3 class="text-lg font-black text-slate-900 mb-3">2. Chất Liệu Có Thực Sự Khác Biệt?</h3>
          <p class="leading-relaxed mb-5">
            Điểm mấu chốt tạo nên sự khác biệt của sản phẩm nằm ở công nghệ xử lý vải.
            Thay vì dùng cotton thông thường, Coolmate ứng dụng quy trình <em>compact spinning</em>
            giúp sợi vải dày dặn hơn, mịn hơn và đặc biệt <strong>không bị xù lông</strong> sau nhiều lần giặt.
            Kết quả là chiếc ${tags[0]} giữ được form dáng và màu sắc như mới sau ít nhất 50 lần giặt máy.
          </p>

          <!-- Pull Quote -->
          <blockquote class="border-l-4 border-[#2a83e9] bg-[#2a83e9]/5 rounded-r-2xl px-6 py-5 my-6">
            <p class="text-slate-700 font-bold italic leading-relaxed mb-0">
              "Chất liệu quyết định 70% chất lượng của một sản phẩm ${tags[0]}.
              Còn lại 30% là thiết kế và sự tỉ mỉ trong từng đường may."
            </p>
            <cite class="text-[11px] text-slate-500 font-bold not-italic block mt-3">— Đội ngũ thiết kế Coolmate</cite>
          </blockquote>

          <h3 class="text-lg font-black text-slate-900 mb-3">3. Phù Hợp Với Phong Cách Nào?</h3>
          <p class="leading-relaxed mb-4">
            Điểm mạnh của <strong>${p.name}</strong> chính là tính <strong>${tags[1]}</strong> —
            có thể mặc đi làm, đi chơi, hay tập luyện thể thao nhẹ. Dưới đây là các cách phối đồ được
            cộng đồng Coolmate ưa chuộng nhất:
          </p>
          <ul class="space-y-2 mb-5 text-sm">
            <li class="flex items-start gap-2"><i class="fa-solid fa-circle-check text-[#2a83e9] mt-0.5 text-[13px] shrink-0"></i> <span><strong>Casual daily:</strong> Phối cùng quần jean slim fit + sneakers trắng</span></li>
            <li class="flex items-start gap-2"><i class="fa-solid fa-circle-check text-[#2a83e9] mt-0.5 text-[13px] shrink-0"></i> <span><strong>Smart casual:</strong> Kết hợp với quần kaki + giày loafer</span></li>
            <li class="flex items-start gap-2"><i class="fa-solid fa-circle-check text-[#2a83e9] mt-0.5 text-[13px] shrink-0"></i> <span><strong>Active:</strong> Mặc cùng quần jogger ${tags[2]} để vận động thoải mái</span></li>
          </ul>

          <h3 class="text-lg font-black text-slate-900 mb-3">4. Hướng Dẫn Chọn Size Chuẩn</h3>
          <p class="leading-relaxed mb-4">Coolmate khuyến nghị đo số đo cơ thể và tra bảng size trước khi đặt hàng. Đối với ${tags[0]}, phom <em>regular fit</em> thường vừa với người có số đo tiêu chuẩn; nếu bạn thích phong cách rộng thoải mái hơn, hãy tăng một size.</p>

          <!-- Tag chips -->
          <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
            ${[p.name, ...tags, "Coolmate", "thời trang Việt", "chất lượng cao"].map((tag) =>
              `<span class="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-[#2a83e9]/10 text-slate-600 text-[11px] font-bold rounded-full cursor-pointer transition-colors">#${tag.toLowerCase().replace(/ /g, "_")}</span>`
            ).join("")}
          </div>
        </div>
      </div>
    `;
    el.classList.remove("hidden");
  }

  private renderReviews(p: IProduct): void {
    const el = document.getElementById("pd-reviews");
    if (!el) return;

    const reviewsData = [
      { name: "Nguyễn Minh Tuấn", avatar: "MT", rating: 5, date: "10/06/2026", verified: true,
        title: "Chất vải mềm, mặc rất thoải mái",
        content: "Mình đã đặt size M theo bảng hướng dẫn, vừa chuẩn luôn. Vải mềm mịn hơn mình nghĩ, mặc đi làm cả ngày không thấy bí hay khó chịu gì. Màu trên thực tế cũng chuẩn như ảnh. Sẽ mua thêm màu khác!",
        color: "bg-blue-500", size: "M", color_picked: "Navy", helpful: 24 },
      { name: "Trần Thị Lan", avatar: "TL", rating: 5, date: "05/06/2026", verified: true,
        title: "Giao hàng nhanh, đóng gói đẹp",
        content: "Order tối hôm trước, sáng hôm sau đã nhận được hàng. Sản phẩm được đóng gói rất cẩn thận trong túi zip kín. Chất lượng xứng đáng với giá tiền, mình rất hài lòng. Đặc biệt yêu thích cái mùi vải mới tinh!",
        color: "bg-pink-500", size: "S", color_picked: "White", helpful: 18 },
      { name: "Lê Hoàng Anh", avatar: "LA", rating: 4, date: "28/05/2026", verified: true,
        title: "Tốt nhưng màu hơi nhạt hơn ảnh",
        content: "Nhìn chung sản phẩm khá ổn, chất vải dày dặn và mặc mát. Chỉ có điều màu Navy ngoài thực tế hơi nhạt hơn so với ảnh trên web một chút. Tuy nhiên vẫn đẹp và phù hợp mặc hàng ngày. Sẽ cân nhắc ủng hộ thêm.",
        color: "bg-emerald-500", size: "L", color_picked: "Navy", helpful: 11 },
      { name: "Phạm Bảo Châu", avatar: "BC", rating: 5, date: "20/05/2026", verified: false,
        title: "Mua lần 3 rồi, quá ổn!",
        content: "Đây là lần thứ 3 mình mua sản phẩm này rồi. Mỗi lần mua về dùng đều thấy chất lượng ổn định, không bị phai màu hay giãn form. Đây đã trở thành item staple trong tủ đồ của mình. Recommend cho mọi người!",
        color: "bg-violet-500", size: "XL", color_picked: "Black", helpful: 37 },
      { name: "Võ Tú Quỳnh", avatar: "VQ", rating: 4, date: "14/05/2026", verified: true,
        title: "Phù hợp để mặc đi làm",
        content: "Mình mua để mặc đi làm văn phòng. Dáng áo chuẩn, không nhàu, thoáng khí nên ngồi điều hòa cả ngày cũng không lạnh. Chỉ tiếc là không có thêm màu beige để đa dạng outfit hơn. Hy vọng shop sẽ ra thêm màu mới!",
        color: "bg-amber-500", size: "M", color_picked: "Grey", helpful: 9 },
    ];

    const avgRating = (reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length).toFixed(1);
    const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((r) => { if (ratingDist[r.rating] !== undefined) ratingDist[r.rating]++; });

    el.innerHTML = `
      <!-- Section header -->
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">Đánh Giá Thực Tế</p>
          <h2 class="text-2xl md:text-3xl font-black text-slate-900">Khách Hàng Nói Gì?</h2>
        </div>
        <button class="hidden md:flex items-center gap-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#2a83e9] transition-colors">
          <i class="fa-solid fa-pen-to-square"></i> Viết Đánh Giá
        </button>
      </div>

      <!-- Summary row -->
      <div class="flex flex-col md:flex-row gap-8 mb-10 p-7 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <!-- Big score -->
        <div class="flex flex-col items-center justify-center shrink-0 md:w-48 text-center">
          <span class="text-7xl font-black text-slate-900 leading-none tabular-nums">${avgRating}</span>
          <div class="flex gap-1 my-3">
            ${[1,2,3,4,5].map((s) => `<i class="fa-solid fa-star text-amber-400 text-lg"></i>`).join("")}
          </div>
          <p class="text-sm text-slate-500 font-bold">${reviewsData.length} đánh giá</p>
        </div>

        <!-- Rating bars -->
        <div class="flex-1 flex flex-col justify-center gap-2.5">
          ${[5,4,3,2,1].map((star) => {
            const count = ratingDist[star] || 0;
            const pct = Math.round((count / reviewsData.length) * 100);
            return `
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-slate-600 w-5 shrink-0">${star}</span>
                <i class="fa-solid fa-star text-amber-400 text-[11px] shrink-0"></i>
                <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-400 rounded-full transition-all duration-700" style="width: ${pct}%"></div>
                </div>
                <span class="text-xs text-slate-500 w-8 text-right shrink-0">${count}</span>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Highlights -->
        <div class="flex flex-col justify-center gap-3 md:w-52 shrink-0">
          ${[
            { label: "Đúng mô tả", pct: 96 },
            { label: "Chất lượng tốt", pct: 94 },
            { label: "Giao hàng nhanh", pct: 98 },
          ].map(({ label, pct }) => `
            <div>
              <div class="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                <span>${label}</span><span class="text-emerald-600">${pct}%</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-400 rounded-full" style="width:${pct}%"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Review cards -->
      <div class="space-y-5">
        ${reviewsData.map((rv) => `
          <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex items-center gap-3">
                <!-- Avatar -->
                <div class="w-11 h-11 rounded-full ${rv.color} flex items-center justify-center text-white font-black text-sm shrink-0">
                  ${rv.avatar}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-black text-slate-900">${rv.name}</p>
                    ${rv.verified ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><i class="fa-solid fa-circle-check text-[9px]"></i> Đã mua hàng</span>` : ""}
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <div class="flex gap-0.5">
                      ${[1,2,3,4,5].map((s) => `<i class="fa-solid fa-star text-[11px] ${s <= rv.rating ? "text-amber-400" : "text-slate-200"}"></i>`).join("")}
                    </div>
                    <span class="text-[11px] text-slate-400">${rv.date}</span>
                  </div>
                </div>
              </div>
              <!-- Variant tags -->
              <div class="hidden sm:flex items-center gap-2 shrink-0">
                <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Size: ${rv.size}</span>
                <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Màu: ${rv.color_picked}</span>
              </div>
            </div>
            <h4 class="text-sm font-black text-slate-900 mb-2">${rv.title}</h4>
            <p class="text-sm text-slate-600 leading-relaxed">${rv.content}</p>
            <div class="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
              <span class="text-[11px] text-slate-400">Hữu ích không?</span>
              <button class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <i class="fa-regular fa-thumbs-up"></i> <span>${rv.helpful}</span>
              </button>
              <button class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors">
                <i class="fa-regular fa-thumbs-down"></i>
              </button>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Load more -->
      <div class="text-center mt-8">
        <button class="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 text-[12px] font-black uppercase tracking-wider px-8 py-3.5 rounded-xl hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-200">
          <i class="fa-solid fa-rotate-right text-[11px]"></i> Xem Thêm Đánh Giá
        </button>
      </div>

      <!-- Mobile write review -->
      <div class="md:hidden mt-6">
        <button class="w-full bg-slate-900 text-white text-[12px] font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2a83e9] transition-colors">
          <i class="fa-solid fa-pen-to-square"></i> Viết Đánh Giá Của Bạn
        </button>
      </div>
    `;
    el.classList.remove("hidden");
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

  private template(p: IProduct & { main_img?: string }): string {
    const sizes = Array.from(new Set(this.allVariants.map((v) => v.size)));
    const colors = Array.from(new Set(this.allVariants.map((v) => v.color)));
    const price = this.getCurrentPrice();
    const mainImg = this.allImages[0] || "";
    const pid = p.id || p._id;

    const categorySlugs: Record<number, string> = { 1: "Áo Thun", 2: "Áo Khoác", 3: "Quần Short", 4: "Quần Dài", 5: "Đồ Lót" };
    const rawCatArray2 = (p as any).category_id;
    const rawCat2 = Array.isArray(rawCatArray2) ? rawCatArray2[0] : rawCatArray2;
    const catIdObj = Number(rawCat2 && typeof rawCat2 === 'object' ? (rawCat2._id || rawCat2.id) : rawCat2) || 0;
    const categoryName = categorySlugs[catIdObj] || "Thời Trang";

    return `
      <style>
        .acc-panel { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease; }
        #pd-main-img { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; }
        .pd-size-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .pd-color-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .pd-thumb { transition: all 0.2s ease; cursor: pointer; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .pd-info-block { animation: slideUp 0.5s ease both; }
        .pd-info-block:nth-child(2) { animation-delay: 0.08s; }
        .pd-info-block:nth-child(3) { animation-delay: 0.16s; }
        .pd-info-block:nth-child(4) { animation-delay: 0.24s; }
        .pd-info-block:nth-child(5) { animation-delay: 0.32s; }
        .pd-info-block:nth-child(6) { animation-delay: 0.40s; }
        .pd-info-block:nth-child(7) { animation-delay: 0.48s; }
        #pd-main-img-wrap { overflow: hidden; }
      </style>

      

        <!-- Breadcrumb -->
        <div class="pt-6 pb-0">
          <div class="max-w-7xl mx-auto px-5 lg:px-10">
            <nav class="flex items-center gap-2 text-[11px] text-slate-400 font-medium tracking-wide">
              <a href="/" class="hover:text-slate-700 transition-colors">Trang Chủ</a>
              <i class="fa-solid fa-chevron-right text-[8px]"></i>
              <a href="/products" class="hover:text-slate-700 transition-colors">Sản Phẩm</a>
              <i class="fa-solid fa-chevron-right text-[8px]"></i>
              <span class="text-slate-700 font-bold">${p.name}</span>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-5 lg:px-10 pt-6 pb-10">
          <div class="flex flex-col lg:flex-row gap-10 xl:gap-16">

            <!-- ========== LEFT: Gallery ========== -->
            <div class="w-full lg:w-[52%] lg:sticky lg:top-28 lg:self-start">
              <div class="flex gap-3">
                <!-- Thumbnails Column -->
                <div class="hidden md:flex flex-col gap-3 w-[80px] shrink-0">
                  ${this.allImages.map((img, i) => `
                    <div
                      data-thumb="${i}"
                      class="pd-thumb w-full aspect-square rounded-xl overflow-hidden bg-slate-100 ${i === 0 ? "ring-2 ring-slate-900 opacity-100" : "opacity-50"}"
                    >
                      <img src="${img}" alt="View ${i + 1}" class="w-full h-full object-cover">
                    </div>
                  `).join("")}
                </div>

                <!-- Main Image -->
                <div class="flex-1">
                  <div id="pd-main-img-wrap" class="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 shadow-xl cursor-crosshair">
                    <img
                      id="pd-main-img"
                      src="${mainImg}"
                      alt="${p.name}"
                      class="w-full h-full object-cover"
                    >
                    <!-- Badges -->
                    <div class="absolute top-5 left-5 flex flex-col gap-2">
                      <span class="inline-flex items-center px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-md">
                        ${categoryName}
                      </span>
                      ${this.allVariants.length > 0 ? `
                      <span class="inline-flex items-center px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-md">
                        <i class="fa-solid fa-circle text-[6px] mr-1.5 animate-pulse"></i> Còn hàng
                      </span>
                      ` : ""}
                    </div>
                    <!-- Zoom hint -->
                    <div class="absolute bottom-5 right-5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" id="pd-zoom-hint">
                      <i class="fa-solid fa-magnifying-glass-plus text-[10px]"></i> Hover để phóng to
                    </div>
                  </div>

                  <!-- Mobile thumbnails row -->
                  <div class="md:hidden flex gap-2 mt-3 overflow-x-auto pb-1">
                    ${this.allImages.map((img, i) => `
                      <div
                        data-thumb="${i}"
                        class="pd-thumb shrink-0 w-16 aspect-square rounded-xl overflow-hidden bg-slate-100 ${i === 0 ? "ring-2 ring-slate-900 opacity-100" : "opacity-50"}"
                      >
                        <img src="${img}" alt="View ${i + 1}" class="w-full h-full object-cover">
                      </div>
                    `).join("")}
                  </div>
                </div>
              </div>
            </div>

            <!-- ========== RIGHT: Info ========== -->
            <div class="w-full lg:w-[48%] py-2">

              <!-- Brand & Rating -->
              <div class="pd-info-block flex items-center justify-between mb-4">
                <span class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9]">Coolmate Studio</span>
                <div class="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  <div class="flex gap-0.5">
                    ${[1,2,3,4,5].map((s) => `<i class="fa-solid fa-star text-amber-400 text-[10px]"></i>`).join("")}
                  </div>
                  <span class="text-[11px] font-black text-amber-700">4.9</span>
                  <span class="text-[11px] text-amber-600">(1.2k)</span>
                </div>
              </div>

              <!-- Product Name -->
              <div class="pd-info-block mb-5">
                <h1 class="text-3xl md:text-4xl xl:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  ${p.name}
                </h1>
              </div>

              <!-- Price -->
              <div class="pd-info-block flex items-end gap-4 mb-6">
                <span id="pd-price" class="text-4xl font-black text-slate-900 tabular-nums">${price.toLocaleString("vi-VN")}đ</span>
                <span class="text-lg text-slate-400 line-through tabular-nums mb-0.5">${Math.floor(price * 1.3).toLocaleString("vi-VN")}đ</span>
                <span class="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-600 text-[11px] font-black rounded-lg mb-0.5">-23%</span>
              </div>

              <!-- Divider -->
              <div class="pd-info-block w-full h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent mb-7"></div>

              <!-- Color Picker -->
              ${colors.length > 0 ? `
              <div class="pd-info-block mb-7">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Màu Sắc:</span>
                  <span id="pd-color-label" class="text-[11px] font-bold text-slate-500">${this.selectedColor}</span>
                </div>
                <div class="flex flex-wrap gap-3">
                  ${colors.map((color, i) => {
                    const hex = this.getColorHex(color);
                    const isLight = color.toLowerCase().includes("white") || color.toLowerCase().includes("trắng") || color.toLowerCase().includes("be");
                    return `
                      <button
                        data-color="${color}"
                        class="pd-color-btn relative w-10 h-10 rounded-full shadow-sm border-2 ${isLight ? "border-slate-300" : "border-transparent"} ${i === 0 ? "ring-2 ring-slate-900 ring-offset-2 scale-110" : ""}"
                        style="background-color: ${hex};"
                        title="${color}"
                      >
                        ${isLight && i === 0 ? `<i class="fa-solid fa-check text-slate-600 text-[10px]"></i>` : i === 0 ? `<i class="fa-solid fa-check text-white text-[10px]"></i>` : ""}
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>
              ` : ""}

              <!-- Size Picker -->
              ${sizes.length > 0 ? `
              <div class="pd-info-block mb-7">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Kích Cỡ:</span>
                  <button class="text-[11px] font-bold text-[#2a83e9] flex items-center gap-1 hover:underline">
                    <i class="fa-solid fa-ruler text-[10px]"></i> Hướng dẫn chọn size
                  </button>
                </div>
                <div class="flex flex-wrap gap-2.5">
                  ${sizes.map((size, i) => `
                    <button
                      data-size="${size}"
                      class="pd-size-btn min-w-[56px] h-12 px-4 rounded-xl border-2 text-sm font-black ${i === 0 ? "bg-slate-900 text-white border-slate-900 scale-105" : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"}"
                    >
                      ${size}
                    </button>
                  `).join("")}
                </div>
                ${!this.selectedVariant && sizes.length > 0 && colors.length > 0 ? `
                <p class="mt-2 text-[11px] text-orange-500 font-bold flex items-center gap-1">
                  <i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
                  Không có biến thể cho lựa chọn này
                </p>
                ` : ""}
              </div>
              ` : ""}

              <!-- Quantity + Add to Cart -->
              <div class="pd-info-block flex items-center gap-3 mb-5">
                <!-- Quantity -->
                <div class="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button id="pd-qty-minus" class="w-12 h-14 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-black text-lg transition-colors">
                    <i class="fa-solid fa-minus text-sm"></i>
                  </button>
                  <input
                    id="pd-qty"
                    type="number"
                    value="1"
                    min="1"
                    max="99"
                    class="w-14 h-14 text-center text-base font-black text-slate-900 border-x-2 border-slate-200 bg-white focus:outline-none tabular-nums"
                  >
                  <button id="pd-qty-plus" class="w-12 h-14 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-black text-lg transition-colors">
                    <i class="fa-solid fa-plus text-sm"></i>
                  </button>
                </div>

                <!-- Add to Cart -->
                <button
                  id="pd-add-btn"
                  class="flex-1 h-14 bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#2a83e9] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20"
                >
                  <i class="fa-solid fa-bag-shopping"></i>
                  Thêm Vào Giỏ
                </button>

                <!-- Wishlist -->
                <button
                  id="pd-wish-btn"
                  class="w-14 h-14 border-2 border-slate-200 text-slate-500 flex items-center justify-center rounded-xl hover:border-red-300 hover:text-red-500 transition-all bg-white"
                >
                  <i class="fa-regular fa-heart text-xl"></i>
                </button>
              </div>

              <!-- Buy Now -->
              <div class="pd-info-block mb-7">
                <button class="w-full h-14 border-2 border-slate-900 text-slate-900 text-[12px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-900 hover:text-white active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3">
                  <i class="fa-solid fa-bolt text-amber-400"></i>
                  Mua Ngay — Giao Hôm Nay
                </button>
              </div>

              <!-- Trust Badges -->
              <div class="pd-info-block grid grid-cols-3 gap-3 mb-7 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="text-center">
                  <div class="w-9 h-9 rounded-full bg-[#2a83e9]/10 flex items-center justify-center mx-auto mb-2">
                    <i class="fa-solid fa-truck-fast text-[#2a83e9] text-sm"></i>
                  </div>
                  <p class="text-[10px] font-black text-slate-800 leading-tight">Freeship</p>
                  <p class="text-[10px] text-slate-500 leading-tight">từ 200k</p>
                </div>
                <div class="text-center">
                  <div class="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                    <i class="fa-solid fa-rotate-left text-emerald-600 text-sm"></i>
                  </div>
                  <p class="text-[10px] font-black text-slate-800 leading-tight">Đổi trả</p>
                  <p class="text-[10px] text-slate-500 leading-tight">60 ngày</p>
                </div>
                <div class="text-center">
                  <div class="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-2">
                    <i class="fa-solid fa-shield-halved text-amber-600 text-sm"></i>
                  </div>
                  <p class="text-[10px] font-black text-slate-800 leading-tight">Chính hãng</p>
                  <p class="text-[10px] text-slate-500 leading-tight">100%</p>
                </div>
              </div>

              <!-- Divider -->
              <div class="pd-info-block w-full h-px bg-slate-100 mb-5"></div>

              <!-- Accordions -->
              <div class="pd-info-block space-y-1">
                ${[
                  {
                    id: "acc-desc",
                    icon: "fa-file-lines",
                    label: "Mô Tả Sản Phẩm",
                    content: `<p class="text-sm text-slate-600 leading-relaxed">
                      Sản phẩm được thiết kế với công nghệ vải hiện đại, mang lại sự thoải mái tối đa trong suốt cả ngày.
                      Chất liệu cao cấp, thấm hút mồ hôi tốt, giữ dáng bền đẹp qua nhiều lần giặt.
                      Phù hợp cho cả hoạt động thể thao lẫn phong cách casual hàng ngày.
                    </p>`
                  },
                  {
                    id: "acc-material",
                    icon: "fa-shirt",
                    label: "Chất Liệu & Bảo Quản",
                    content: `<ul class="text-sm text-slate-600 space-y-2">
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-[#2a83e9]"></i> Cotton compact 100% cao cấp</li>
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-[#2a83e9]"></i> Giặt máy ở nhiệt độ ≤ 30°C</li>
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-[#2a83e9]"></i> Không dùng chất tẩy mạnh</li>
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-[#2a83e9]"></i> Phơi trong bóng mát, không phơi trực tiếp dưới nắng</li>
                    </ul>`
                  },
                  {
                    id: "acc-shipping",
                    icon: "fa-truck",
                    label: "Giao Hàng & Đổi Trả",
                    content: `<ul class="text-sm text-slate-600 space-y-2">
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Freeship cho đơn hàng từ 200.000đ</li>
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Giao hàng nhanh 2–4 giờ tại Hà Nội, TP.HCM</li>
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Toàn quốc: 1–3 ngày làm việc</li>
                      <li class="flex items-center gap-2"><i class="fa-solid fa-circle text-[6px] text-emerald-500"></i> Đổi trả miễn phí trong vòng 60 ngày</li>
                    </ul>`
                  }
                ].map(({ id, icon, label, content }) => `
                  <div class="border border-slate-100 rounded-xl overflow-hidden bg-white">
                    <button
                      data-accordion="${id}"
                      class="w-full flex items-center justify-between px-5 py-4 text-left group"
                    >
                      <span class="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.15em] text-slate-800">
                        <i class="fa-solid ${icon} text-[#2a83e9] text-sm w-4"></i>
                        ${label}
                      </span>
                      <i data-acc-icon class="fa-solid fa-plus text-slate-400 text-sm transition-transform duration-300 group-hover:text-slate-700"></i>
                    </button>
                    <div id="${id}" class="acc-panel">
                      <div class="px-5 pb-5 pt-1">${content}</div>
                    </div>
                  </div>
                `).join("")}
              </div>

            </div>
          </div>

          <!-- Related Products (same category) -->
          <section id="pd-related" class="mt-24 hidden">
            <div class="flex items-end justify-between mb-8">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">Cùng Danh Mục</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900">Sản Phẩm Liên Quan</h2>
              </div>
              <a href="/products" class="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors">
                Xem Tất Cả <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>
            <div id="pd-related-grid" class="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
              <!-- Injected by JS -->
            </div>
          </section>

          <!-- Cross-sell Products (different category) -->
          <section id="pd-crosssell" class="mt-20 hidden">
            <div class="flex items-end justify-between mb-8">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Gợi Ý Phối Đồ</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900">Mua Kèm Để Hoàn Thiện Outfit</h2>
                <p id="pd-crosssell-subtitle" class="text-sm text-slate-500 mt-1"></p>
              </div>
              <a href="/products" class="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors">
                Khám Phá <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>
            <!-- Decorative accent -->
            <div class="w-full h-px bg-gradient-to-r from-amber-200 via-amber-400 to-transparent mb-8"></div>
            <div id="pd-crosssell-grid" class="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
              <!-- Injected by JS -->
            </div>
          </section>

          <!-- SEO Article -->
          <section id="pd-seo-article" class="mt-20 hidden bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-10 md:px-14 md:py-14">
            <!-- Injected by JS -->
          </section>

          <!-- Reviews -->
          <section id="pd-reviews" class="mt-20 hidden">
            <!-- Injected by JS -->
          </section>

        </main>

        
    `;
  }

  private templateSkeleton(): string {
    return `
      
        <div class="pt-24 max-w-7xl mx-auto px-5 lg:px-10 py-10">
          <div class="h-3 bg-slate-200 rounded w-72 mb-10 animate-pulse"></div>
          <div class="flex flex-col lg:flex-row gap-10 xl:gap-16">
            <div class="w-full lg:w-[52%] flex gap-3">
              <div class="hidden md:flex flex-col gap-3 w-[80px]">
                ${[0,1,2].map(() => `<div class="w-full aspect-square rounded-xl bg-slate-200 animate-pulse"></div>`).join("")}
              </div>
              <div class="flex-1 aspect-[3/4] rounded-3xl bg-slate-200 animate-pulse shadow-xl"></div>
            </div>
            <div class="w-full lg:w-[48%] py-2 space-y-6 animate-pulse">
              <div class="h-3 bg-slate-200 rounded w-32"></div>
              <div class="space-y-3">
                <div class="h-10 bg-slate-200 rounded w-full"></div>
                <div class="h-10 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div class="h-10 bg-slate-200 rounded w-40"></div>
              <div class="h-px bg-slate-200 rounded"></div>
              <div class="flex gap-3">
                ${[0,1,2,3].map(() => `<div class="w-10 h-10 rounded-full bg-slate-200"></div>`).join("")}
              </div>
              <div class="flex gap-2.5">
                ${[0,1,2,3].map(() => `<div class="w-14 h-12 rounded-xl bg-slate-200"></div>`).join("")}
              </div>
              <div class="flex gap-3">
                <div class="h-14 w-36 bg-slate-200 rounded-xl"></div>
                <div class="h-14 flex-1 bg-slate-200 rounded-xl"></div>
                <div class="h-14 w-14 bg-slate-200 rounded-xl"></div>
              </div>
              <div class="h-14 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
        
    `;
  }

  private templateNotFound(): string {
    return `
      
        <div class="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32">
          <div class="text-8xl mb-6">😵</div>
          <h1 class="text-3xl font-black text-slate-900 mb-3">Không Tìm Thấy Sản Phẩm</h1>
          <p class="text-slate-500 mb-8">Sản phẩm bạn đang tìm có thể đã hết hàng hoặc không tồn tại.</p>
          <a href="/products" class="inline-flex items-center gap-2 bg-slate-900 text-white font-black text-sm px-8 py-4 rounded-xl hover:bg-[#2a83e9] transition-colors">
            <i class="fa-solid fa-arrow-left"></i> Tiếp Tục Mua Sắm
          </a>
        </div>
        
    `;
  }
}
