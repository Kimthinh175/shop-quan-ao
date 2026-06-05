import { ApiClient } from "../../api/ApiClient";
import { ClientHeader } from "../../components/ClientHeader";
import { ClientFooter } from "../../components/ClientFooter";
import { ProductCard } from "../../components/ProductCard";
import { IProduct } from "../../shared/models/IProduct";
import { IPost } from "../../shared/interfaces/IPost";

export class HomeModule {
  public async render(): Promise<void> {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = this.template([], []);

    try {
      let products: IProduct[] = [];
      let posts: IPost[] = [];

      try {
        const productRes = await ApiClient.get<{ data: IProduct[] }>(
          "/products?limit=8&sort=-createdAt",
        );
        if (productRes && productRes.data) products = productRes.data;
      } catch (e) {
        console.warn("Lỗi load products", e);
      }

      try {
        const postRes = await ApiClient.get<{ data: IPost[] }>("/posts");
        if (postRes && postRes.data) posts = postRes.data;
      } catch (e) {
        console.warn("Lỗi load posts (chưa làm API)", e);
      }

      app.innerHTML = this.template(products, posts);

      this.initScrollReveal();
      this.initScrollNav();
    } catch (error) {
      console.error("HomeModule Error:", error);
    }
  }

  private initScrollReveal(): void {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal-item").forEach((item) => {
      observer.observe(item);
    });
  }

  private handleScroll = () => {
    const nav = document.getElementById("main-nav");
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add("nav-scrolled");
        nav.style.height = "80px";
      } else {
        nav.classList.remove("nav-scrolled");
        nav.style.height = "96px";
      }
    }
  };

  private initScrollNav(): void {
    window.removeEventListener("scroll", this.handleScroll);
    window.addEventListener("scroll", this.handleScroll);
  }

  private renderProductGrid(products: IProduct[]): string {
    if (!products || products.length < 4) {
      return `
      <!-- Skeleton Loading -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="col-span-12 md:col-span-7 bg-slate-100 rounded-2xl animate-pulse" style="height: 680px;"></div>
          <div class="col-span-12 md:col-span-5 flex flex-col gap-6" style="height: 680px;">
              <div class="flex-1 bg-slate-100 rounded-2xl animate-pulse"></div>
              <div class="flex-1 bg-slate-100 rounded-2xl animate-pulse"></div>
          </div>
          <div class="col-span-12 bg-slate-100 rounded-2xl animate-pulse" style="height: 340px;"></div>
      </div>
      `;
    }

    return `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Product 1: HERO - Large Left -->
        <div class="col-span-12 md:col-span-7 group cursor-pointer" style="height: 680px;">
            <a href="/products/${products[0]?.id}" class="relative w-full h-full block overflow-hidden rounded-2xl bg-slate-100">
                <img src="${products[0]?.image}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[1500ms] ease-out" alt="${products[0]?.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div class="absolute top-8 left-8 flex items-center gap-3">
                    <span class="bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full">New Season</span>
                </div>
                <div class="absolute top-6 right-8 font-serif text-[120px] font-black text-white/5 leading-none select-none" style="font-family: 'Playfair Display', serif;">01</div>
                <div class="absolute bottom-0 left-0 right-0 p-10">
                    <div class="flex items-end justify-between">
                        <div>
                            <h3 class="font-serif text-3xl md:text-4xl font-black text-white mb-2 leading-tight" style="font-family: 'Playfair Display', serif;">${products[0]?.name}</h3>
                            <p class="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">${products[0]?.description?.substring(0, 60)}${(products[0]?.description?.length || 0) > 60 ? "..." : ""}</p>
                        </div>
                        <div class="text-right flex-shrink-0 ml-6">
                            <p class="text-white text-2xl font-black">${(products[0]?.price || 0).toLocaleString()}đ</p>
                            <span class="inline-flex items-center gap-2 mt-3 bg-white/10 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-300">
                                Xem ngay <i class="fa-solid fa-arrow-right-long"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </a>
        </div>

        <!-- Right Column: Products 2 & 3 stacked -->
        <div class="col-span-12 md:col-span-5 flex flex-col gap-6" style="height: 680px;">
            <!-- Product 2: Top Right -->
            <div class="group cursor-pointer flex-1">
                <a href="/products/${products[1]?.id}" class="relative w-full h-full block overflow-hidden rounded-2xl bg-slate-100">
                    <img src="${products[1]?.image}" class="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-[1200ms] ease-out" alt="${products[1]?.name}">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div class="absolute top-5 right-6 font-serif text-[80px] font-black text-white/5 leading-none select-none" style="font-family: 'Playfair Display', serif;">02</div>
                    <div class="absolute bottom-0 left-0 right-0 p-7">
                        <div class="flex items-end justify-between">
                            <h3 class="font-serif text-xl font-black text-white leading-tight" style="font-family: 'Playfair Display', serif;">${products[1]?.name}</h3>
                            <p class="text-white font-black text-lg ml-4 flex-shrink-0">${(products[1]?.price || 0).toLocaleString()}đ</p>
                        </div>
                        <div class="mt-3 w-0 group-hover:w-full h-[1px] bg-white/50 transition-all duration-700"></div>
                    </div>
                </a>
            </div>

            <!-- Product 3: Bottom Right -->
            <div class="group cursor-pointer flex-1">
                <a href="/products/${products[2]?.id}" class="relative w-full h-full block overflow-hidden rounded-2xl bg-slate-800">
                    <img src="${products[2]?.image}" class="w-full h-full object-cover object-center opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[1200ms] ease-out" alt="${products[2]?.name}">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div class="absolute top-5 right-6 font-serif text-[80px] font-black text-white/5 leading-none select-none" style="font-family: 'Playfair Display', serif;">03</div>
                    <div class="absolute bottom-0 left-0 right-0 p-7">
                        <div class="flex items-end justify-between">
                            <h3 class="font-serif text-xl font-black text-white leading-tight" style="font-family: 'Playfair Display', serif;">${products[2]?.name}</h3>
                            <p class="text-white font-black text-lg ml-4 flex-shrink-0">${(products[2]?.price || 0).toLocaleString()}đ</p>
                        </div>
                        <div class="mt-3 w-0 group-hover:w-full h-[1px] bg-white/50 transition-all duration-700"></div>
                    </div>
                </a>
            </div>
        </div>

        <!-- Product 4: WIDE BOTTOM BANNER -->
        <div class="col-span-12 group cursor-pointer" style="height: 340px;">
            <a href="/products/${products[3]?.id}" class="relative w-full h-full block overflow-hidden rounded-2xl bg-slate-900">
                <img src="${products[3]?.image}" class="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-[1500ms] ease-out" alt="${products[3]?.name}">
                <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div class="absolute bottom-4 right-10 font-serif text-[180px] font-black text-white/5 leading-none select-none hidden md:block" style="font-family: 'Playfair Display', serif;">04</div>
                <div class="absolute inset-0 flex items-center px-14">
                    <div>
                        <span class="text-white/50 text-[9px] font-black uppercase tracking-[0.5em] mb-4 block">Điểm nhấn mới</span>
                        <h3 class="font-serif text-3xl md:text-5xl font-black text-white mb-6 leading-tight" style="font-family: 'Playfair Display', serif;">${products[3]?.name}</h3>
                        <div class="flex items-center gap-8">
                            <p class="text-white text-2xl font-black">${(products[3]?.price || 0).toLocaleString()}đ</p>
                            <span class="group/btn flex items-center gap-3 bg-white text-black text-[9px] font-black uppercase tracking-widest px-8 py-4 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300">
                                Khám phá <i class="fa-solid fa-arrow-right-long transition-transform group-hover/btn:translate-x-1 duration-300"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </div>
    `;
  }

  private template(products: IProduct[], posts: IPost[]): string {
    return `
      <div class="min-h-screen bg-[#faf9f6]">
        ${ClientHeader.render()}
        
        <!-- Hero Section (Editorial Fashion Cover) -->
        <section class="relative h-screen flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 z-0">
                <img 
                    src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=2400" 
                    class="w-full h-full object-cover scale-105 transition-transform duration-[10000ms] ease-out" 
                    alt="Fashion Editorial"
                    style="transform-origin: center center;"
                >
                <!-- Gradient overlay: tối hơn ở dưới, nhạt dần lên trên -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>
                <!-- Subtle color tint -->
                <div class="absolute inset-0 bg-slate-900/10"></div>
            </div>
            <div class="container mx-auto px-8 z-10 text-center text-white fade-in">
                <span class="inline-block text-[10px] font-black uppercase tracking-[0.6em] mb-6 opacity-90 drop-shadow-sm">Mùa Thu / Đông 2026</span>
                <h1 class="font-serif text-7xl md:text-[10rem] font-black mb-10 leading-none drop-shadow-lg" style="font-family: 'Playfair Display', serif;">Timeless<br><i class="font-normal italic">Elegance</i></h1>
                <p class="text-white/70 text-sm font-light tracking-widest mb-12 max-w-md mx-auto">Thời trang thượng hạng. Tinh tế đến từng đường may.</p>
                <div class="flex justify-center gap-6">
                    <a href="/catalog" class="group relative px-14 py-5 overflow-hidden rounded-xl shadow-2xl">
                        <div class="absolute inset-0 bg-white transition-all duration-500 group-hover:bg-white/90"></div>
                        <span class="relative text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            Xem Bộ Sưu Tập <i class="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-2 duration-300"></i>
                        </span>
                    </a>
                    <a href="/blog" class="group px-14 py-5 rounded-xl border border-white/40 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
                        Journal <i class="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-2 duration-300"></i>
                    </a>
                </div>
            </div>
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-70 z-10">
                <span class="text-[9px] font-black uppercase tracking-[0.3em] text-white">Cuộn để khám phá</span>
                <div class="w-[1px] h-14 bg-gradient-to-b from-white to-transparent"></div>
            </div>
        </section>

        <!-- NEW FEATURE: Animated Marquee Banner & Scroll Reveal Brand Showcase -->
        <div class="bg-white border-b border-slate-100 py-6 overflow-hidden select-none">
            <div class="marquee-container flex items-center">
                <div class="marquee-content text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap flex items-center gap-16">
                    <span>Silent Luxury</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Crafted to Perfection</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>The Minimalist Ethos</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Timeless Heritage</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Silent Luxury</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Crafted to Perfection</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>The Minimalist Ethos</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Timeless Heritage</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                </div>
                <!-- Duplicated content for seamless loop -->
                <div class="marquee-content text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap flex items-center gap-16" aria-hidden="true">
                    <span>Silent Luxury</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Crafted to Perfection</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>The Minimalist Ethos</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Timeless Heritage</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Silent Luxury</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Crafted to Perfection</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>The Minimalist Ethos</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Timeless Heritage</span>
                    <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                </div>
            </div>
        </div>

        <!-- Scroll Reveal Brand Showcase -->
        <section class="py-28 bg-white overflow-hidden">
            <div class="container mx-auto px-8">
                <div class="reveal-item flex flex-col lg:flex-row items-center gap-20">
                    <!-- Left: Big typography story with metrics -->
                    <div class="lg:w-1/2">
                        <span class="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Định nghĩa mới về sự sang trọng</span>
                        <h2 class="font-serif text-5xl md:text-6xl font-black leading-tight mb-8">Tinh hoa chế tác<br/>phục vụ <i class="font-normal italic">Cá tính độc bản</i></h2>
                        <p class="text-slate-500 leading-relaxed mb-10 text-base">
                            Mỗi sản phẩm không chỉ là một món trang phục, đó là một tác phẩm nghệ thuật tĩnh lặng. Chúng tôi chọn lọc những loại sợi tự nhiên thượng hạng nhất để tạo nên phom dáng chuẩn mực, tôn vinh khí chất thanh lịch tự nhiên của người mặc.
                        </p>
                        <div class="flex items-center gap-10">
                            <div class="border-r border-slate-100 pr-10">
                                <span class="block font-serif text-5xl font-black text-slate-900 mb-1">100%</span>
                                <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Cashmere & Silk</span>
                            </div>
                            <div>
                                <span class="block font-serif text-5xl font-black text-slate-900 mb-1">20+</span>
                                <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Nghệ nhân may đo</span>
                            </div>
                        </div>
                    </div>
                    <!-- Right: Artistic Overlapping Collage Image -->
                    <div class="lg:w-1/2 relative flex justify-center items-center py-10">
                        <div class="w-[70%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative z-10 hover:scale-[1.02] transition-all duration-700">
                            <img src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover" alt="Artistic Fashion">
                        </div>
                        <div class="absolute -bottom-6 -left-6 w-[45%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl z-20 hover:scale-[1.05] transition-all duration-700">
                            <img src="https://images.pexels.com/photos/2220329/pexels-photo-2220329.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full h-full object-cover" alt="Fashion Detail">
                        </div>
                        <!-- Golden-ratio thin elegant border -->
                        <div class="absolute -top-6 -right-6 w-36 h-36 border-t-2 border-r-2 border-indigo-500/10 rounded-tr-3xl pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Curated Collections Grid -->
        <section class="py-28 bg-[#faf9f6]">
            <div class="container mx-auto px-8">
                <div class="max-w-2xl mb-16">
                    <span class="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Danh mục đặc sắc</span>
                    <h2 class="font-serif text-4xl md:text-5xl font-black italic">Curated Collections.</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Suit Category -->
                    <a href="/catalog" class="collection-card group relative aspect-[4/5] bg-slate-200 overflow-hidden block rounded-2xl shadow-sm">
                        <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1200" class="w-full h-full object-cover transition-all duration-1000 ease-out" alt="Classic Suit">
                        <div class="overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 flex flex-col justify-end p-10">
                            <span class="text-white text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Đồ Âu Cao Cấp</span>
                            <h3 class="font-serif text-2xl font-black text-white italic">The Classic Suit <i class="fa-solid fa-arrow-right text-xs ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></i></h3>
                        </div>
                    </a>
                    
                    <!-- Overcoat Category -->
                    <a href="/catalog" class="collection-card group relative aspect-[4/5] bg-slate-200 overflow-hidden block rounded-2xl shadow-sm">
                        <img src="https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=1200" class="w-full h-full object-cover transition-all duration-1000 ease-out" alt="Heritage Overcoat">
                        <div class="overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 flex flex-col justify-end p-10">
                            <span class="text-white text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Thu Đông Ấm Áp</span>
                            <h3 class="font-serif text-2xl font-black text-white italic">Heritage Overcoat <i class="fa-solid fa-arrow-right text-xs ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></i></h3>
                        </div>
                    </a>
                    
                    <!-- Knitwear Category -->
                    <a href="/catalog" class="collection-card group relative aspect-[4/5] bg-slate-200 overflow-hidden block rounded-2xl shadow-sm">
                        <img src="https://images.pexels.com/photos/3621117/pexels-photo-3621117.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover transition-all duration-1000 ease-out" alt="Merino Knitwear">
                        <div class="overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 flex flex-col justify-end p-10">
                            <span class="text-white text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Phong Cách Sợi Merino</span>
                            <h3 class="font-serif text-2xl font-black text-white italic">Knitwear & Basics <i class="fa-solid fa-arrow-right text-xs ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></i></h3>
                        </div>
                    </a>
                </div>
            </div>
        </section>

        <!-- EDITORIAL FEATURED PRODUCTS -->
        <section style="background:#faf9f6; overflow:hidden;">
            <!-- Section Header -->
            <div style="max-width:1280px; margin:0 auto; padding:7rem 2rem 4rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:2rem;">
                    <div>
                        <span style="color:#4f46e5; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.5em; display:block; margin-bottom:1rem;">Bộ sưu tập mới nhất</span>
                        <h2 style="font-family:'Playfair Display',serif; font-size:clamp(3rem,7vw,5rem); font-weight:900; line-height:1; margin:0;">
                            New<br><i style="font-weight:400; color:#94a3b8;">Arrivals.</i>
                        </h2>
                    </div>
                    <div style="text-align:right;">
                        <p style="color:#94a3b8; font-size:0.875rem; max-width:20rem; line-height:1.6; margin-bottom:1rem;">Những thiết kế mới nhất, thể hiện tinh thần thời đại qua từng đường chỉ.</p>
                        <a href="/catalog" style="font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.3em; text-decoration:none; color:inherit; border-bottom:1px solid currentColor; padding-bottom:4px;">
                            Xem toàn bộ &nbsp;→
                        </a>
                    </div>
                </div>
            </div>

            <!-- Editorial Layout -->
            <div style="padding:0 2rem 7rem; max-width:1280px; margin:0 auto;">
                ${this.renderProductGrid(products)}
            </div>
        </section>

        <!-- Luxury Philosophy Quote Banner -->
        <section class="relative py-36 bg-[#0b0c10] text-[#c5c6c7] overflow-hidden">
            <div class="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div class="container mx-auto px-8 text-center relative z-10 max-w-4xl">
                <span class="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8 block">Tuyên ngôn thương hiệu</span>
                <p class="font-serif text-3xl md:text-5xl font-black text-white italic leading-snug mb-10">
                    "Sự xa xỉ thực sự không cần phải lên tiếng. Nó ẩn mình trong sự hoàn hảo của từng thớ vải và những đường may tinh xảo."
                </p>
                <div class="w-16 h-[1px] bg-indigo-500/30 mx-auto mb-6"></div>
                <cite class="text-[10px] font-black uppercase tracking-widest text-slate-400 block">— CLOSET Journal</cite>
            </div>
        </section>

        <!-- Editorial Showcase Section -->
        <section class="py-28 bg-[#faf9f6]">
            <div class="container mx-auto px-8">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                    <div class="lg:col-span-5">
                        <span class="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Câu chuyện thương hiệu</span>
                        <h2 class="font-serif text-5xl font-black mb-8 leading-tight">Nghệ thuật của Sự Tối Giản<br></h2>
                        <p class="text-slate-500 leading-relaxed mb-10 text-base">
                            Chúng tôi tin rằng thời trang thực sự không cần phải ồn ào. Mỗi thiết kế tại Closet là sự kết tinh của chất liệu cao cấp bậc nhất thế giới (sợi cashmere Merino, lụa tơ tằm) và kỹ thuật may đo đỉnh cao từ những nghệ nhân tâm huyết.
                        </p>
                        <a href="#" class="text-xs font-black uppercase tracking-[0.3em] border-b border-black pb-2 hover:opacity-50 transition-all flex items-center gap-2 w-max">
                            Đọc câu chuyện <i class="fa-solid fa-arrow-right-long transition-transform duration-300"></i>
                        </a>
                    </div>
                    <div class="lg:col-span-7 grid grid-cols-2 gap-8">
                        <div class="pt-20"><img src="https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-auto shadow-2xl rounded-2xl" alt="Brand story fashion 1"></div>
                        <div><img src="https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-auto shadow-2xl rounded-2xl" alt="Brand story fashion 2"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Latest Journal Stories (Expanded to 6 Articles in an Editorial Grid!) -->
        <section class="py-28 bg-white">
            <div class="container mx-auto px-8">
                <div class="flex justify-between items-end mb-20">
                    <div>
                        <span class="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Bản tin Journal</span>
                        <h2 class="font-serif text-4xl md:text-5xl font-black italic">The Editorial.</h2>
                    </div>
                    <a href="/blog" class="text-[10px] font-black uppercase tracking-[0.3em] border-b border-black pb-2 hover:opacity-50 transition-all">Xem tất cả</a>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-20">
                    <!-- Article 1 -->
                    <article class="group cursor-pointer">
                        <a href="/blog">
                            <div class="aspect-video bg-slate-100 overflow-hidden mb-8 rounded-xl"><img src="https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="Xu hướng phối đồ tối giản"></div>
                            <h3 class="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all">Nghệ thuật phối đồ tối giản cho mùa Thu 2026</h3>
                            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400"><span>15 Tháng 5, 2026</span><span class="w-1 h-1 bg-slate-200 rounded-full"></span><span>5 phút đọc</span></div>
                        </a>
                    </article>
                    <!-- Article 2 -->
                    <article class="group cursor-pointer">
                        <a href="/blog">
                            <div class="aspect-video bg-slate-100 overflow-hidden mb-8 rounded-xl"><img src="https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="Creative director story"></div>
                            <h3 class="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all">Gặp gỡ Giám đốc sáng tạo của CLOSET</h3>
                            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400"><span>10 Tháng 5, 2026</span><span class="w-1 h-1 bg-slate-200 rounded-full"></span><span>12 phút đọc</span></div>
                        </a>
                    </article>
                    <!-- Article 3 -->
                    <article class="group cursor-pointer">
                        <a href="/blog">
                            <div class="aspect-video bg-slate-100 overflow-hidden mb-8 rounded-xl"><img src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="Lookbook Paris"></div>
                            <h3 class="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all">Lookbook: Ánh sáng ban mai tại Paris</h3>
                            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400"><span>05 Tháng 5, 2026</span><span class="w-1 h-1 bg-slate-200 rounded-full"></span><span>3 phút đọc</span></div>
                        </a>
                    </article>
                    <!-- Article 4 -->
                    <article class="group cursor-pointer">
                        <a href="/blog">
                            <div class="aspect-video bg-slate-100 overflow-hidden mb-8 rounded-xl"><img src="https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="Milan Fashion Week"></div>
                            <h3 class="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all">Nhìn Lại Tuần Lễ Thời Trang Milan 2026</h3>
                            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400"><span>01 Tháng 5, 2026</span><span class="w-1 h-1 bg-slate-200 rounded-full"></span><span>8 phút đọc</span></div>
                        </a>
                    </article>
                    <!-- Article 5 -->
                    <article class="group cursor-pointer">
                        <a href="/blog">
                            <div class="aspect-video bg-slate-100 overflow-hidden mb-8 rounded-xl"><img src="https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="Cashmere Care"></div>
                            <h3 class="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all">Bí Quyết Bảo Quản Áo Khoác Cashmere Cao Cấp</h3>
                            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400"><span>28 Tháng 4, 2026</span><span class="w-1 h-1 bg-slate-200 rounded-full"></span><span>4 phút đọc</span></div>
                        </a>
                    </article>
                    <!-- Article 6 -->
                    <article class="group cursor-pointer">
                        <a href="/blog">
                            <div class="aspect-video bg-slate-100 overflow-hidden mb-8 rounded-xl"><img src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt="Monochrome Style"></div>
                            <h3 class="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all">Phong Cách Monochrome: Sức Hút Từ Sự Đơn Sắc</h3>
                            <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400"><span>20 Tháng 4, 2026</span><span class="w-1 h-1 bg-slate-200 rounded-full"></span><span>6 phút đọc</span></div>
                        </a>
                    </article>
                </div>
            </div>
        </section>

        ${ClientFooter.render()}
      </div>
    `;
  }
}
