import { ApiClient } from "../../api/ApiClient";
import { ProductCard } from "../../components/ProductCard";
import { IProduct } from "../../shared/models/IProduct";
import { IPaginationResponse } from "../../shared/interfaces/ITypes";

interface IVoucher {
  code: string;
  name: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_value: number;
  end_date: string;
  color: string;
  icon: string;
  tag: string;
}

export class PromotionModule {
  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;
    app.innerHTML = this.templateSkeleton();

    try {
      const [saleRes, newRes, hotRes] = await Promise.all([
        ApiClient.get<IPaginationResponse<IProduct>>("/products?limit=8&sort=-sold"),
        ApiClient.get<IPaginationResponse<IProduct>>("/products?limit=4&sort=-_id"),
        ApiClient.get<IPaginationResponse<IProduct>>("/products?limit=4&sort=-sold"),
      ]);
      const saleProducts = saleRes.results || [];
      const newProducts  = newRes.results  || [];
      const hotProducts  = hotRes.results  || [];

      app.innerHTML = this.template(saleProducts, newProducts, hotProducts);
      this.initCountdowns();
      this.initCopyButtons();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      app.innerHTML = "<p class='text-center py-20 text-slate-500'>Đã xảy ra lỗi, vui lòng thử lại.</p>";
    }
  }

  private initCountdowns(): void {
    // Flash sale ends at next midnight
    const target = new Date();
    target.setHours(23, 59, 59, 0);

    const el = document.getElementById("promo-countdown");
    if (!el) return;

    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { el.textContent = "00:00:00"; return; }
      const h  = Math.floor(diff / 3600000);
      const m  = Math.floor((diff % 3600000) / 60000);
      const s  = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");

      const boxes = el.querySelectorAll("[data-unit]");
      (boxes[0] as HTMLElement).textContent = pad(h);
      (boxes[1] as HTMLElement).textContent = pad(m);
      (boxes[2] as HTMLElement).textContent = pad(s);
    };
    update();
    setInterval(update, 1000);
  }

  private initCopyButtons(): void {
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = (btn as HTMLElement).dataset["copy"] || "";
        navigator.clipboard.writeText(code).catch(() => {});
        const orig = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check mr-1"></i> Đã sao chép!`;
        btn.classList.add("bg-emerald-500", "border-emerald-500", "text-white");
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove("bg-emerald-500", "border-emerald-500", "text-white");
        }, 2000);
      });
    });
  }

  private vouchers(): IVoucher[] {
    return [
      { code: "HELLO2026",  name: "Chào Hè 2026",           discount_type: "percentage",   discount_value: 10,     min_order_value: 1000000, end_date: "30/06/2026", color: "from-[#2a83e9] to-blue-700",          icon: "fa-gift",        tag: "Phổ biến" },
      { code: "VIP100",     name: "Giảm 100K VIP",          discount_type: "fixed_amount",  discount_value: 100000, min_order_value: 500000,  end_date: "31/07/2026", color: "from-violet-600 to-purple-800",       icon: "fa-crown",       tag: "VIP" },
      { code: "FREESHIP",   name: "Freeship Toàn Quốc",     discount_type: "fixed_amount",  discount_value: 30000,  min_order_value: 200000,  end_date: "31/12/2026", color: "from-emerald-500 to-teal-700",        icon: "fa-truck-fast",  tag: "Hot" },
      { code: "NEWUSER50",  name: "Tân Binh Giảm 50K",      discount_type: "fixed_amount",  discount_value: 50000,  min_order_value: 300000,  end_date: "31/08/2026", color: "from-pink-500 to-rose-700",           icon: "fa-user-plus",   tag: "Mới" },
      { code: "SPORT20",   name: "Thể Thao Giảm 20%",       discount_type: "percentage",   discount_value: 20,     min_order_value: 700000,  end_date: "15/07/2026", color: "from-amber-500 to-orange-600",        icon: "fa-dumbbell",    tag: "Thể thao" },
      { code: "SUMMER15",  name: "Hè Rực Rỡ 15%",          discount_type: "percentage",   discount_value: 15,     min_order_value: 500000,  end_date: "31/08/2026", color: "from-yellow-400 to-amber-600",        icon: "fa-sun",         tag: "Mùa hè" },
    ];
  }

  private voucherCard(v: IVoucher): string {
    const discountLabel = v.discount_type === "percentage"
      ? `Giảm ${v.discount_value}%`
      : `Giảm ${v.discount_value.toLocaleString("vi-VN")}đ`;

    return `
      <div class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 group">
        <!-- Left gradient panel -->
        <div class="bg-gradient-to-br ${v.color} p-5 flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
            <i class="fa-solid ${v.icon} text-white text-2xl"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">${v.tag}</span>
            </div>
            <p class="text-white font-black text-lg leading-tight">${discountLabel}</p>
            <p class="text-white/80 text-xs font-medium mt-0.5">${v.name}</p>
          </div>
        </div>

        <!-- Right info panel -->
        <div class="bg-white px-5 py-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1">Mã giảm giá</p>
              <div class="flex items-center gap-2">
                <code class="text-base font-black text-slate-900 tracking-widest bg-slate-100 px-3 py-1 rounded-lg">${v.code}</code>
              </div>
            </div>
            <button
              data-copy="${v.code}"
              class="flex items-center gap-1.5 border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-200"
            >
              <i class="fa-regular fa-copy text-[12px]"></i> Copy
            </button>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <span class="flex items-center gap-1">
              <i class="fa-solid fa-circle-info text-[10px]"></i>
              Đơn tối thiểu ${v.min_order_value.toLocaleString("vi-VN")}đ
            </span>
            <span class="flex items-center gap-1 text-red-500 font-bold">
              <i class="fa-regular fa-clock text-[10px]"></i>
              HSD: ${v.end_date}
            </span>
          </div>
        </div>

        <!-- Perforated edge decoration -->
        <div class="absolute left-[calc(40%+5rem)] top-0 bottom-0 flex flex-col justify-around pointer-events-none" aria-hidden="true">
          ${Array(8).fill(0).map(() => `<div class="w-3 h-3 rounded-full bg-[#f9f9f7]"></div>`).join("")}
        </div>
      </div>
    `;
  }

  private template(saleProducts: IProduct[], newProducts: IProduct[], hotProducts: IProduct[]): string {
    const vouchers = this.vouchers();

    return `
      <style>
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: slideRight 2s ease-in-out infinite;
        }
        .promo-hero-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2a83e9 100%);
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float-anim { animation: float 3s ease-in-out infinite; }
        @keyframes badgePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } }
        .badge-pulse { animation: badgePulse 1.5s infinite; }
      </style>

      

        <!-- ========== HERO BANNER ========== -->
        <section class="promo-hero-bg overflow-hidden relative">
          <!-- Decorative circles -->
          <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
          <div class="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[#2a83e9]/20 pointer-events-none"></div>

          <div class="max-w-7xl mx-auto px-5 lg:px-10 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
            <!-- Text -->
            <div class="flex-1 text-center md:text-left">
              <div class="inline-flex items-center gap-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 badge-pulse">
                <i class="fa-solid fa-bolt"></i> Flash Sale — Hôm Nay
              </div>
              <h1 class="text-4xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-4">
                SALE<br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">LÊN ĐẾN</span><br>
                <span class="text-5xl md:text-7xl xl:text-8xl">50%</span>
              </h1>
              <p class="text-blue-200 text-lg font-medium mb-8 max-w-md mx-auto md:mx-0">
                Ưu đãi lớn nhất năm — Hàng ngàn sản phẩm đồng loạt giảm giá sâu. Mua ngay trước khi hết!
              </p>
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <a href="/products" class="inline-flex items-center gap-2 bg-white text-slate-900 font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors shadow-xl">
                  <i class="fa-solid fa-bag-shopping"></i> Mua Ngay
                </a>
                <div class="flex items-center gap-2 text-blue-200 text-sm font-bold">
                  <i class="fa-solid fa-shield-halved text-emerald-400"></i> Đổi trả 60 ngày · Freeship từ 200k
                </div>
              </div>
            </div>

            <!-- Countdown -->
            <div class="shrink-0 text-center">
              <p class="text-blue-300 text-[11px] font-black uppercase tracking-[0.3em] mb-4">Flash Sale Kết Thúc Sau</p>
              <div id="promo-countdown" class="flex items-center gap-3">
                ${["h","m","s"].map((u) => `
                  <div class="flex flex-col items-center">
                    <div class="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-white font-black text-4xl tabular-nums" data-unit="${u}">00</div>
                    <span class="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-2">${u === "h" ? "Giờ" : u === "m" ? "Phút" : "Giây"}</span>
                  </div>
                  ${u !== "s" ? `<span class="text-white/50 text-3xl font-black mb-6">:</span>` : ""}
                `).join("")}
              </div>
            </div>
          </div>
        </section>

        <!-- ========== PROMO STRIPS ========== -->
        <div class="bg-amber-400 overflow-hidden py-3">
          <div class="flex animate-[scroll_20s_linear_infinite] whitespace-nowrap gap-12" style="animation: marquee 20s linear infinite; width: max-content;">
            ${Array(6).fill(0).map(() => `
              <span class="text-[11px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-8">
                <i class="fa-solid fa-bolt"></i> FLASH SALE HÔM NAY
                <i class="fa-solid fa-star"></i> FREESHIP TOÀN QUỐC
                <i class="fa-solid fa-rotate-left"></i> ĐỔI TRẢ 60 NGÀY
                <i class="fa-solid fa-tag"></i> GIẢM ĐẾN 50%
              </span>
            `).join("")}
          </div>
        </div>
        <style>
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        </style>

        <main class="max-w-7xl mx-auto px-5 lg:px-10 py-14 space-y-20">

          <!-- ========== VOUCHER SECTION ========== -->
          <section>
            <div class="flex items-end justify-between mb-8">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">Bắt Ngay Kẻo Lỡ</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900">Mã Giảm Giá Đặc Biệt</h2>
              </div>
              <div class="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                <i class="fa-regular fa-clock text-[#2a83e9]"></i>
                Click vào CODE để sao chép
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              ${vouchers.map((v) => this.voucherCard(v)).join("")}
            </div>
          </section>

          <!-- ========== FLASH SALE PRODUCTS ========== -->
          <section>
            <div class="flex items-end justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-red-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl badge-pulse">
                  <i class="fa-solid fa-bolt"></i> Flash Sale
                </div>
                <div>
                  <h2 class="text-2xl md:text-3xl font-black text-slate-900">Sản Phẩm Bán Chạy</h2>
                  <p class="text-xs text-slate-500 mt-0.5">Hàng số lượng có hạn — mua ngay kẻo hết!</p>
                </div>
              </div>
              <a href="/products?sort=-sold" class="hidden md:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors">
                Xem Tất Cả <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>

            <!-- Product grid with sale badges forced -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              ${saleProducts.map((p, i) => {
                const pp = p as IProduct & { main_img?: string };
                if (!pp.image && pp.main_img) pp.image = pp.main_img;
                // Override price for sale display
                const price = p.price || (p.variants && p.variants.length > 0 ? (p.variants[0] as { price: number }).price : 0);
                return `
                  <div class="relative">
                    <div class="absolute top-2 left-2 z-30 flex flex-col gap-1">
                      <span class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md leading-tight">-${[20,25,30,33,40,50][i % 6]}%</span>
                      ${i < 3 ? `<span class="bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-md leading-tight uppercase tracking-wide">🔥 Hot</span>` : ""}
                    </div>
                    ${ProductCard.render(p)}
                  </div>
                `;
              }).join("")}
            </div>
          </section>

          <!-- ========== DEAL STRIPS (Category Deals) ========== -->
          <section>
            <div class="mb-8">
              <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">Chọn Theo Danh Mục</p>
              <h2 class="text-2xl md:text-3xl font-black text-slate-900">Ưu Đãi Theo Loại</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              ${[
                { label: "Áo Thun", tag: "Giảm tới 40%", emoji: "👕", href: "/products?category_id=1", from: "from-blue-500", to: "to-blue-700", img: "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&w=400" },
                { label: "Quần Short", tag: "Giảm tới 35%", emoji: "🩳", href: "/products?category_id=3", from: "from-emerald-500", to: "to-teal-700", img: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400" },
                { label: "Áo Khoác", tag: "Giảm tới 50%", emoji: "🧥", href: "/products?category_id=2", from: "from-violet-500", to: "to-purple-700", img: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=400" },
                { label: "Đồ Thể Thao", tag: "Giảm tới 30%", emoji: "🏋️", href: "/products?sport_id=2", from: "from-red-500", to: "to-rose-700", img: "https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&w=400" },
              ].map((deal) => `
                <a href="${deal.href}" class="group relative overflow-hidden rounded-2xl aspect-[4/3] block">
                  <img src="${deal.img}" alt="${deal.label}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                  <div class="absolute inset-0 bg-gradient-to-t ${deal.from} ${deal.to} opacity-60 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div class="absolute inset-0 flex flex-col justify-end p-5">
                    <span class="text-3xl mb-1">${deal.emoji}</span>
                    <h3 class="text-white font-black text-lg leading-tight">${deal.label}</h3>
                    <span class="inline-flex items-center mt-2 bg-white/20 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full self-start">
                      ${deal.tag} <i class="fa-solid fa-arrow-right ml-2 text-[9px] group-hover:translate-x-1 transition-transform"></i>
                    </span>
                  </div>
                </a>
              `).join("")}
            </div>
          </section>

          <!-- ========== NEW ARRIVALS ========== -->
          <section>
            <div class="flex items-end justify-between mb-6">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2">Vừa Ra Mắt</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900">Hàng Mới Về</h2>
              </div>
              <a href="/products?sort=-_id" class="hidden md:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors">
                Xem Tất Cả <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              ${newProducts.map((p) => {
                const pp = p as IProduct & { main_img?: string };
                if (!pp.image && pp.main_img) pp.image = pp.main_img;
                return `
                  <div class="relative">
                    <div class="absolute top-2 left-2 z-30">
                      <span class="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md leading-tight">MỚI</span>
                    </div>
                    ${ProductCard.render(p)}
                  </div>
                `;
              }).join("")}
            </div>
          </section>

          <!-- ========== LOYALTY / POINTS BANNER ========== -->
          <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#1e3a5f] p-8 md:p-12">
            <div class="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-[#2a83e9]/20 pointer-events-none"></div>
            <div class="absolute -left-6 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
            <div class="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div class="w-20 h-20 rounded-2xl bg-[#2a83e9]/20 border border-[#2a83e9]/30 flex items-center justify-center shrink-0 float-anim">
                <i class="fa-solid fa-gem text-[#2a83e9] text-4xl"></i>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">Tích Điểm — Đổi Quà</p>
                <h2 class="text-2xl md:text-3xl font-black text-white mb-3">Mua Hàng Nhận Điểm Thưởng</h2>
                <p class="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Mỗi <strong class="text-white">10.000đ</strong> mua hàng = <strong class="text-[#2a83e9]">1 điểm</strong>. Tích đủ điểm để đổi voucher giảm giá, sản phẩm miễn phí hoặc vận chuyển ưu tiên.
                </p>
              </div>
              <a href="/login" class="shrink-0 inline-flex items-center gap-2 bg-[#2a83e9] text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-blue-500 transition-colors shadow-xl shadow-[#2a83e9]/30 whitespace-nowrap">
                <i class="fa-solid fa-user-plus"></i> Đăng Ký Ngay
              </a>
            </div>
          </section>

          <!-- ========== HOT PICKS ========== -->
          <section>
            <div class="flex items-end justify-between mb-6">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">Được Yêu Thích Nhất</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900">Top Bán Chạy Tuần Này</h2>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              ${hotProducts.map((p, i) => {
                const pp = p as IProduct & { main_img?: string };
                if (!pp.image && pp.main_img) pp.image = pp.main_img;
                const medals = ["🥇", "🥈", "🥉", ""];
                return `
                  <div class="relative">
                    ${medals[i] ? `<div class="absolute top-2 left-2 z-30 text-xl leading-none">${medals[i]}</div>` : ""}
                    ${ProductCard.render(p)}
                  </div>
                `;
              }).join("")}
            </div>
          </section>

          <!-- ========== FAQ / TERMS ========== -->
          <section class="bg-white rounded-3xl border border-slate-100 p-8 md:p-12">
            <div class="max-w-3xl mx-auto">
              <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2 text-center">Thông Tin</p>
              <h2 class="text-2xl font-black text-slate-900 text-center mb-8">Điều Kiện Áp Dụng Khuyến Mãi</h2>
              <div class="space-y-4">
                ${[
                  { q: "Mã giảm giá có hạn sử dụng không?", a: "Mỗi mã có thời hạn riêng được ghi rõ trên phiếu. Vui lòng kiểm tra ngày hết hạn (HSD) trước khi thanh toán." },
                  { q: "Tôi có thể dùng nhiều mã cùng lúc không?", a: "Hệ thống chỉ cho phép áp dụng 1 mã giảm giá cho mỗi đơn hàng. Bạn nên chọn mã có ưu đãi lớn nhất." },
                  { q: "Flash Sale có áp dụng cho tất cả sản phẩm không?", a: "Flash Sale áp dụng cho các sản phẩm được gắn nhãn trong trang này. Một số sản phẩm mới hoặc đã giảm giá trước đó có thể không áp dụng." },
                  { q: "Điểm tích lũy được tính thế nào?", a: "Cứ 10.000đ trong tổng giá trị đơn hàng (sau khi trừ voucher) sẽ được tích 1 điểm. Điểm không áp dụng cho phí vận chuyển." },
                ].map((faq, i) => `
                  <div class="border border-slate-100 rounded-xl overflow-hidden">
                    <button data-accordion="promo-faq-${i}" class="w-full flex items-center justify-between px-5 py-4 text-left group">
                      <span class="text-[13px] font-black text-slate-800">${faq.q}</span>
                      <i data-acc-icon class="fa-solid fa-plus text-slate-400 text-sm transition-transform duration-300 group-hover:text-slate-700 shrink-0 ml-4"></i>
                    </button>
                    <div id="promo-faq-${i}" class="acc-panel" style="max-height:0;opacity:0;overflow:hidden;transition:max-height .4s cubic-bezier(.4,0,.2,1),opacity .3s ease">
                      <p class="px-5 pb-5 text-sm text-slate-600 leading-relaxed">${faq.a}</p>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </section>

        </main>

        

      <script>
        // FAQ accordion
        document.querySelectorAll('[data-accordion]').forEach(function(trigger) {
          trigger.addEventListener('click', function() {
            var id = trigger.dataset.accordion;
            var panel = document.getElementById(id);
            var icon = trigger.querySelector('[data-acc-icon]');
            if (!panel) return;
            if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
              panel.style.maxHeight = '0px'; panel.style.opacity = '0';
              if (icon) icon.classList.remove('rotate-45');
            } else {
              document.querySelectorAll('.acc-panel').forEach(function(p) { p.style.maxHeight='0px'; p.style.opacity='0'; });
              document.querySelectorAll('[data-acc-icon]').forEach(function(ic) { ic.classList.remove('rotate-45'); });
              panel.style.maxHeight = panel.scrollHeight + 'px'; panel.style.opacity = '1';
              if (icon) icon.classList.add('rotate-45');
            }
          });
        });
      </script>
    `;
  }

  private templateSkeleton(): string {
    return `
      
        <div class="h-64 bg-gradient-to-br from-slate-900 to-slate-700 animate-pulse"></div>
        <div class="max-w-7xl mx-auto px-5 py-14 space-y-12">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            ${Array(6).fill(0).map(() => `<div class="h-36 bg-slate-200 rounded-2xl animate-pulse"></div>`).join("")}
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${Array(8).fill(0).map(() => `<div class="aspect-[3/4] bg-slate-200 rounded-2xl animate-pulse"></div>`).join("")}
          </div>
        </div>
      </div>
    `;
  }
}
