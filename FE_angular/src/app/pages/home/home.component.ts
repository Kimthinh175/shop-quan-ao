import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { PromotionService } from '../../services/promotion.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

interface Banner {
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, CurrencyPipe],
  template: `
    <div class="bg-gray-50 min-h-screen pb-0 animate-[fadeIn_0.3s_ease-out]">

      <!-- ── 1. HERO CAROUSEL SLIDER ── -->
      <section class="relative w-full h-[58vh] min-h-[380px] max-h-[500px] overflow-hidden bg-gray-900 group">
        <!-- Slides -->
        <div *ngFor="let banner of banners; let i = index" 
             class="absolute inset-0 transition-opacity duration-700 ease-in-out"
             [ngClass]="activeBannerIndex === i ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'">
          <img [src]="banner.image" [alt]="banner.title" class="w-full h-full object-cover scale-105 transition-transform duration-[4000ms]" [class.scale-100]="activeBannerIndex === i">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>

          <!-- Banner Content -->
          <div class="absolute inset-0 flex flex-col items-center justify-end text-white text-center p-6 pb-12">
            <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-[0.25em] mb-3 text-brand-gold border border-white/30 animate-[fadeIn_0.5s]">
              {{ banner.badge }}
            </span>
            <h1 class="text-3xl font-serif font-black italic mb-3 leading-tight tracking-tight drop-shadow-md" [innerHTML]="banner.title">
            </h1>
            <p class="text-xs text-gray-200 font-medium mb-6 max-w-[280px] line-clamp-2">
              {{ banner.subtitle }}
            </p>
            <a [routerLink]="banner.link" class="px-8 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all shadow-xl active:scale-95">
              Khám phá ngay <i class="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
            </a>
          </div>
        </div>

        <!-- Carousel Indicators -->
        <div class="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-2">
          <button *ngFor="let banner of banners; let i = index" 
                  (click)="setBanner(i)"
                  [ngClass]="activeBannerIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'"
                  class="h-2 rounded-full transition-all duration-300"></button>
        </div>
      </section>


      <!-- ── 2. MARQUEE BADGE BAR ── -->
      <div class="bg-black text-white overflow-hidden py-3 border-y border-gray-800">
        <div class="whitespace-nowrap animate-[marquee_18s_linear_infinite] flex gap-8 items-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span><i class="fa-solid fa-crown text-amber-400 mr-2"></i> THƯƠNG HIỆU CAO CẤP</span>
          <span><i class="fa-solid fa-gem text-amber-400 mr-2"></i> CHẤT LIỆU THƯỢNG HẠNG</span>
          <span><i class="fa-solid fa-bolt text-amber-400 mr-2"></i> GIAO HÀNG HỎA TỐC</span>
          <span><i class="fa-solid fa-rotate-left text-amber-400 mr-2"></i> 7 NGÀY ĐỔI TRẢ</span>
          <span><i class="fa-solid fa-crown text-amber-400 mr-2"></i> THƯƠNG HIỆU CAO CẤP</span>
        </div>
      </div>


      <!-- ── 3. CLOSET BRAND CATEGORY CARDS ── -->
      <section class="py-8 px-0 bg-white border-b border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="flex items-end justify-between mb-5 px-4">
          <div>
            <p class="text-[9px] font-extrabold uppercase tracking-[0.3em] text-amber-500 mb-1">Shop by Category</p>
            <h2 class="text-lg font-black uppercase tracking-[0.12em] text-gray-900 leading-none" style="font-family: 'Playfair Display', Georgia, serif">
              Danh mục nổi bật
            </h2>
          </div>
          <a routerLink="/catalog" class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Tất cả <i class="fa-solid fa-arrow-right text-[9px]"></i>
          </a>
        </div>

        <!-- Horizontal Scroll Cards -->
        <div class="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-brand scroll-smooth">
          <a *ngFor="let cat of categories; let i = index"
             [routerLink]="['/catalog']"
             [queryParams]="{ category: cat.slug || cat._id }"
             class="group relative shrink-0 rounded-2xl overflow-hidden cursor-pointer"
             style="width: 140px; height: 190px">

            <!-- Background image -->
            <img *ngIf="cat.image" [src]="cat.image" [alt]="cat.name"
                 class="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110">

            <!-- Placeholder when no image -->
            <div *ngIf="!cat.image"
                 class="absolute inset-0 flex items-center justify-center"
                 style="background: linear-gradient(145deg, #1a1a1a, #2d2d2d)">
              <i class="fa-solid fa-layer-group text-3xl text-gray-600"></i>
            </div>

            <!-- Multi-layer gradient for depth -->
            <div class="absolute inset-0 transition-opacity duration-500 group-hover:opacity-70"
                 style="background: linear-gradient(175deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.92) 100%)"></div>

            <!-- Gold top-left accent line -->
            <div class="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style="background: linear-gradient(90deg, #D4AF37, transparent)"></div>

            <!-- Category index number -->
            <div class="absolute top-3 right-3">
              <span class="text-[10px] font-black tabular-nums opacity-40 text-white group-hover:opacity-70 transition-opacity"
                    style="font-variant-numeric: tabular-nums">
                0{{ i + 1 }}
              </span>
            </div>

            <!-- Bottom content -->
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <!-- CLOSET brand tag -->
              <div class="mb-1.5">
                <span class="inline-block px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.25em] rounded"
                      style="background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); color: #D4AF37">
                  CLOSET
                </span>
              </div>

              <!-- Category name -->
              <span class="block text-sm font-black uppercase tracking-wider text-white leading-tight group-hover:text-amber-300 transition-colors duration-300 line-clamp-2">
                {{ cat.name }}
              </span>

              <!-- Shop now -->
              <div class="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                <span class="text-[9px] font-bold uppercase tracking-widest text-amber-400">Xem ngay</span>
                <i class="fa-solid fa-arrow-right text-[8px] text-amber-400"></i>
              </div>
            </div>
          </a>

          <!-- Tất cả danh mục card -->
          <a routerLink="/catalog"
             class="group relative shrink-0 rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center"
             style="width: 100px; height: 190px; background: linear-gradient(145deg, #111, #1c1c1c); border: 1px solid rgba(212,175,55,0.2)">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                 style="background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.3)">
              <i class="fa-solid fa-grip text-base" style="color: #D4AF37"></i>
            </div>
            <span class="text-[10px] font-black uppercase tracking-[0.15em] text-center leading-tight"
                  style="color: rgba(255,255,255,0.7)">
              Tất cả<br>danh mục
            </span>
          </a>
        </div>
      </section>


      <!-- ── 4. FLASH SALE WITH COUNTDOWN TIMER ── -->
      <section class="w-full bg-[#0a0a0a] py-5 px-4 text-white relative overflow-hidden" style="border-top: 1px solid rgba(212,175,55,0.3)">
        <!-- Background ember glow effects -->
        <div class="absolute -top-16 -right-10 w-52 h-52 rounded-full blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)"></div>

        <!-- Header Row -->
        <div class="flex items-center justify-between mb-4 relative z-10">
          <!-- Left: Badge + Title -->
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5" 
                 style="background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 0 12px rgba(220,38,38,0.5)">
              <i class="fa-solid fa-fire text-amber-300"></i>
              <span>Flash Sale</span>
            </div>
            <h3 class="text-lg font-black uppercase tracking-[0.12em] text-white leading-none" style="font-family: 'Playfair Display', Georgia, serif; letter-spacing: 0.1em">
              Ưu Đãi Giờ Vàng
            </h3>
          </div>

          <!-- Right: Countdown -->
          <div class="flex items-center gap-1 text-center font-mono">
            <ng-container *ngIf="days !== '00'">
              <div class="flex flex-col items-center px-2 py-1.5 rounded-xl" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.2); backdrop-filter: blur(8px)">
                <span class="block text-sm font-black leading-none" style="color: #D4AF37">{{ days }}</span>
                <span class="block text-[7px] uppercase tracking-wider mt-0.5" style="color: rgba(255,255,255,0.4)">Ngày</span>
              </div>
              <span class="text-sm font-black mx-0.5" style="color: #D4AF37">:</span>
            </ng-container>
            <div class="flex flex-col items-center px-2 py-1.5 rounded-xl" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.2); backdrop-filter: blur(8px)">
              <span class="block text-sm font-black leading-none" style="color: #D4AF37">{{ hours }}</span>
              <span class="block text-[7px] uppercase tracking-wider mt-0.5" style="color: rgba(255,255,255,0.4)">Giờ</span>
            </div>
            <span class="text-sm font-black mx-0.5" style="color: #D4AF37">:</span>
            <div class="flex flex-col items-center px-2 py-1.5 rounded-xl" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.2); backdrop-filter: blur(8px)">
              <span class="block text-sm font-black leading-none" style="color: #D4AF37">{{ minutes }}</span>
              <span class="block text-[7px] uppercase tracking-wider mt-0.5" style="color: rgba(255,255,255,0.4)">Phút</span>
            </div>
            <span class="text-sm font-black mx-0.5" style="color: #D4AF37">:</span>
            <div class="flex flex-col items-center px-2 py-1.5 rounded-xl" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.2); backdrop-filter: blur(8px)">
              <span class="block text-sm font-black leading-none" style="color: #D4AF37">{{ seconds }}</span>
              <span class="block text-[7px] uppercase tracking-wider mt-0.5" style="color: rgba(255,255,255,0.4)">Giây</span>
            </div>
          </div>
        </div>

        <!-- "Burn Line" Separator -->
        <div class="w-full h-px mb-4 relative">
          <div class="absolute inset-0" style="background: linear-gradient(90deg, transparent 0%, #7f1d1d 20%, #dc2626 40%, #ea580c 50%, #dc2626 60%, #7f1d1d 80%, transparent 100%)"></div>
          <div class="absolute inset-0 blur-sm" style="background: linear-gradient(90deg, transparent 0%, #dc2626 35%, #f97316 50%, #dc2626 65%, transparent 100%); opacity: 0.6"></div>
        </div>

        <!-- Slider Wrapper -->
        <div class="relative group/slider z-10">
          <!-- Prev -->
          <button (click)="scrollSlider(flashSaleSlider, -200)"
                  class="absolute left-0 top-[40%] -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all active:scale-90"
                  style="background: rgba(10,10,10,0.9); border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; box-shadow: 0 0 12px rgba(220,38,38,0.3)">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <!-- Cards -->
          <div #flashSaleSlider class="flex gap-3 overflow-x-auto pb-2 scroll-smooth px-1" style="scrollbar-width: none; -ms-overflow-style: none;">
            <div *ngFor="let p of flashSaleProducts" class="w-[158px] shrink-0 flex flex-col">

              <!-- Product Card (custom override for dark theme) -->
              <div class="rounded-2xl overflow-hidden flex flex-col relative cursor-pointer group/card transition-all duration-300"
                   style="background: #141414; border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 8px 24px rgba(0,0,0,0.5)"
                   [routerLink]="['/product', p._id]">
                <!-- Image -->
                <div class="relative w-full overflow-hidden" style="aspect-ratio: 3/4">
                  <img [src]="p.main_img" [alt]="p.name" class="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105">
                  <!-- Brand tag -->
                  <div class="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white" 
                       style="background: #0a0a0a; letter-spacing: 0.15em">CLOSET</div>
                  <!-- Discount badge -->
                  <div class="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                       style="background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 0 10px rgba(220,38,38,0.6)">
                    -{{ p.discount_percent }}%
                  </div>
                </div>
                <!-- Info -->
                <div class="p-2.5 flex-1">
                  <p class="text-[8px] font-black uppercase tracking-widest mb-0.5" style="color: rgba(212,175,55,0.8)">Luxury Selection</p>
                  <p class="text-xs font-black text-white line-clamp-1 mb-1.5 uppercase tracking-wide">{{ p.name }}</p>
                  <div class="flex items-baseline gap-1.5 flex-wrap">
                    <span class="text-sm font-black text-white">{{ p.sale_price | currency:'VND':'symbol':'1.0-0' }}</span>
                    <span class="text-[9px] text-gray-600 line-through">{{ p.original_price | currency:'VND':'symbol':'1.0-0' }}</span>
                  </div>
                  <!-- Gold savings -->
                  <div class="mt-1 text-[9px] font-black uppercase tracking-wider" style="color: #D4AF37">
                    <i class="fa-solid fa-tag mr-0.5 text-[8px]"></i>
                    Tiết kiệm {{ (p.original_price - p.sale_price) | currency:'VND':'symbol':'1.0-0' }}
                  </div>
                </div>
              </div>

              <!-- Ember Progress Bar -->
              <div class="mt-2">
                <!-- Labels row above bar -->
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[8px] font-black text-white/80">🔥 Đã bán <span class="text-white">{{ p.flash_sold || 0 }}</span></span>
                  <span class="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white" style="background: #1a1a1a; border: 1px solid rgba(245,158,11,0.5); color: #f59e0b">Còn {{ (p.flash_limit || 0) - (p.flash_sold || 0) }}</span>
                </div>
                <!-- Bar -->
                <div class="relative overflow-hidden rounded-full h-2" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.06)">
                  <div class="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                       [style.width.%]="((p.flash_sold || 0) / (p.flash_limit || 1)) * 100"
                       style="background: linear-gradient(90deg, #7f1d1d 0%, #dc2626 45%, #ea580c 75%, #f59e0b 100%)">
                    <div class="absolute right-0 top-0 h-full w-3" style="background: linear-gradient(90deg, transparent, rgba(251,191,36,0.8)); filter: blur(1px)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Next -->
          <button (click)="scrollSlider(flashSaleSlider, 200)"
                  class="absolute right-0 top-[40%] -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all active:scale-90"
                  style="background: rgba(10,10,10,0.9); border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; box-shadow: 0 0 12px rgba(220,38,38,0.3)">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </section>


      <!-- ── 5. TABBED PRODUCT GRID (SẢN PHẨM NỔI BẬT) ── -->
      <section class="py-6 px-4 bg-white border-b border-gray-100">
        <!-- Tabs Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-2 bg-gray-100 p-1 rounded-full">
            <button (click)="activeTab = 'new'"
                    [ngClass]="activeTab === 'new' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'"
                    class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all">
              Mới nhất
            </button>
            <button (click)="activeTab = 'popular'"
                    [ngClass]="activeTab === 'popular' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'"
                    class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all">
              Bán chạy
            </button>
          </div>

          <a routerLink="/catalog" class="text-xs font-bold text-gray-400 hover:text-black">
            Tất cả <i class="fa-solid fa-arrow-right ml-1"></i>
          </a>
        </div>

        <!-- Product Grid -->
        <div *ngIf="loadingProducts" class="flex justify-center py-12">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-300"></i>
        </div>

        <div *ngIf="!loadingProducts" class="grid grid-cols-2 gap-3.5">
          <app-product-card *ngFor="let p of displayedProducts" [product]="p" [mode]="activeTab === 'new' ? 'new' : 'popular'"></app-product-card>
        </div>
      </section>


      <!-- ── 6. MOBILE "MÓC ÁO" FEATURED SLIDER ── -->
      <section class="py-8 px-4 bg-slate-900 text-white w-full shadow-xl overflow-hidden relative border-b border-slate-800">
        <div class="flex justify-between items-end mb-6 relative z-10">
          <div>
            <span class="text-[9px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block mb-1">Thiết Kế Độc Bản</span>
            <h3 class="text-base font-serif-brand font-black uppercase tracking-[0.15em] text-white">BST Thời Trang Nam</h3>
          </div>
          
          <a routerLink="/catalog" class="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white">
            Khám phá <i class="fa-solid fa-chevron-right text-[8px]"></i>
          </a>
        </div>

        <!-- Horizontal Scroll Slider Wrapper with Floating Side Buttons -->
        <div class="relative group/slider">
          <!-- Prev Button (Left) -->
          <button (click)="scrollSlider(mensSlider, -200)" 
                  class="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-amber-400 border border-amber-400/50 backdrop-blur-md flex items-center justify-center text-xs transition-all shadow-2xl active:scale-95 opacity-90 hover:opacity-100"
                  title="Lướt sang trái">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <!-- Horizontal Scroll Slider for Product Cards -->
          <div #mensSlider class="flex gap-3.5 overflow-x-auto pb-3.5 scrollbar-brand relative z-10 scroll-smooth px-1">
            <div *ngFor="let p of mensCollection" class="w-[165px] shrink-0">
              <app-product-card [product]="p"></app-product-card>
            </div>
          </div>

          <!-- Next Button (Right) -->
          <button (click)="scrollSlider(mensSlider, 200)" 
                  class="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-amber-400 border border-amber-400/50 backdrop-blur-md flex items-center justify-center text-xs transition-all shadow-2xl active:scale-95 opacity-90 hover:opacity-100"
                  title="Lướt sang phải">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </section>


      <!-- ── 7. BRAND VALUES & POLICY HIGHLIGHTS (CLOSET IDENTITY) ── -->
      <section class="py-6 px-4 bg-gradient-to-br from-[#0B0B0B] via-[#141414] to-[#1c1c1c] w-full border-b border-amber-400/25 shadow-2xl relative overflow-hidden">
        <!-- Subtle Gold Glow -->
        <div class="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl"></div>
        
        <div class="grid grid-cols-2 gap-3 relative z-10">
          <div class="bg-white/5 border border-amber-400/20 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:border-amber-400/60 transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-all">
              <i class="fa-solid fa-truck-fast text-base"></i>
            </div>
            <div>
              <h4 class="text-[11px] font-serif-brand font-bold uppercase tracking-wider text-white">Miễn phí giao hàng</h4>
              <p class="text-[9px] text-amber-200/60 tracking-tight">Đơn từ 500k</p>
            </div>
          </div>

          <div class="bg-white/5 border border-amber-400/20 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:border-amber-400/60 transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-all">
              <i class="fa-solid fa-rotate-left text-base"></i>
            </div>
            <div>
              <h4 class="text-[11px] font-serif-brand font-bold uppercase tracking-wider text-white">Đổi trả 7 ngày</h4>
              <p class="text-[9px] text-amber-200/60 tracking-tight">Đổi mới tận nhà</p>
            </div>
          </div>

          <div class="bg-white/5 border border-amber-400/20 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:border-amber-400/60 transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-all">
              <i class="fa-solid fa-shield-halved text-base"></i>
            </div>
            <div>
              <h4 class="text-[11px] font-serif-brand font-bold uppercase tracking-wider text-white">100% Chính hãng</h4>
              <p class="text-[9px] text-amber-200/60 tracking-tight">Cam kết thượng hạng</p>
            </div>
          </div>

          <div class="bg-white/5 border border-amber-400/20 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-md hover:border-amber-400/60 transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-all">
              <i class="fa-solid fa-headset text-base"></i>
            </div>
            <div>
              <h4 class="text-[11px] font-serif-brand font-bold uppercase tracking-wider text-white">Hỗ trợ 24/7</h4>
              <p class="text-[9px] text-amber-200/60 tracking-tight">Tư vấn phong cách</p>
            </div>
          </div>
        </div>
      </section>


      <!-- ── 8. FASHION JOURNAL / BLOG EDITORIAL (CLOSET IDENTITY) ── -->
      <section class="py-6 px-4 bg-white border-b border-gray-100">
        <div class="flex justify-between items-end mb-5">
          <div>
            <span class="text-[9px] font-serif-brand font-extrabold uppercase tracking-[0.2em] text-amber-600 block mb-1">Tạp Chí Thời Trang</span>
            <h3 class="text-base font-serif-brand font-black uppercase tracking-[0.15em] text-gray-900">Xu Hướng & Phong Cách</h3>
          </div>
          <a routerLink="/blog" class="text-xs font-bold text-gray-400 hover:text-black">
            Xem tất cả <i class="fa-solid fa-arrow-right ml-0.5"></i>
          </a>
        </div>

        <div class="space-y-4">
          <a *ngFor="let art of articles; let isLast = last" 
             [routerLink]="['/blog']" 
             class="flex gap-3 group cursor-pointer"
             [class.border-b]="!isLast"
             [class.border-gray-100]="!isLast"
             [class.pb-3]="!isLast">
            <div class="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <img [src]="art.thumbnail || art.image || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400'" 
                   [alt]="art.title"
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="flex-1 flex flex-col justify-center">
              <span class="text-[9px] font-serif-brand font-extrabold text-amber-600 uppercase tracking-[0.2em] mb-1">
                {{ art.category || 'Quiet Luxury' }}
              </span>
              <h4 class="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                {{ art.title }}
              </h4>
            </div>
          </a>

          <div *ngIf="!articles || articles.length === 0" class="text-xs text-gray-400 text-center py-4">
            Chưa có bài viết mới.
          </div>
        </div>
      </section>

    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private cartService = inject(CartService);
  private promoService = inject(PromotionService);

  // Banner State
  activeBannerIndex = 0;
  private bannerTimer: any;

  banners: Banner[] = [
    {
      badge: 'Bộ sưu tập Xuân Hè 2026',
      title: 'Quiet Luxury<br>& Timeless',
      subtitle: 'Sự kết hợp hoàn hảo giữa đường nét tối giản và chất liệu thượng hạng.',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      link: '/catalog'
    },
    {
      badge: 'Ưu đãi đặc biệt',
      title: 'Mid-Season Sale<br>Up to 50%',
      subtitle: 'Cơ hội sở hữu những thiết kế cao cấp với mức giá ưu đãi nhất mùa.',
      image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      link: '/catalog'
    },
    {
      badge: 'Bộ sưu tập mới',
      title: 'Modern Minimalist<br>Collection',
      subtitle: 'Định hình phong cách hiện đại với tính ứng dụng cao.',
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      link: '/catalog'
    }
  ];

  // Data States
  products: any[] = [];
  categories: any[] = [];
  loadingProducts = true;
  activeTab: 'new' | 'popular' = 'new';

  // Flash Sale Timer State
  days = '00';
  hours = '00';
  minutes = '00';
  seconds = '00';
  private countdownTimer: any;

  popularProducts: any[] = [];
  mensCollection: any[] = [];
  articles: any[] = [];
  flashSale: any = null;

  scrollSlider(element: HTMLElement, offset: number) {
    if (element) {
      element.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  get flashSaleProducts() {
    if (this.flashSale?.products && this.flashSale.products.length > 0) {
      return this.flashSale.products;
    }
    return this.products.slice(0, 4);
  }

  get displayedProducts() {
    if (this.activeTab === 'popular') {
      return this.popularProducts.length > 0 ? this.popularProducts : [...this.products].reverse();
    }
    return this.products;
  }

  ngOnInit() {
    this.startBannerTimer();
    this.startCountdown();
    this.fetchData();
  }

  ngOnDestroy() {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  setBanner(index: number) {
    this.activeBannerIndex = index;
    this.startBannerTimer(); // Reset timer on manual click
  }

  startBannerTimer() {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
    this.bannerTimer = setInterval(() => {
      this.activeBannerIndex = (this.activeBannerIndex + 1) % this.banners.length;
    }, 4500);
  }

  startCountdown(targetEndTime?: string | Date) {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    const updateTimer = () => {
      let targetDate: Date;
      if (targetEndTime) {
        targetDate = new Date(targetEndTime);
      } else {
        // Mặc định tính tới cuối ngày hôm nay nếu không có promotion cụ thể
        targetDate = new Date();
        targetDate.setHours(23, 59, 59, 999);
      }

      const diffMs = targetDate.getTime() - Date.now();
      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        const d = Math.floor(totalSeconds / (3600 * 24));
        const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        this.days = String(d).padStart(2, '0');
        this.hours = String(h).padStart(2, '0');
        this.minutes = String(m).padStart(2, '0');
        this.seconds = String(s).padStart(2, '0');
      } else {
        this.days = '00';
        this.hours = '00';
        this.minutes = '00';
        this.seconds = '00';
      }
    };

    updateTimer();
    this.countdownTimer = setInterval(updateTimer, 1000);
  }

  fetchData() {
    this.loadingProducts = true;
    this.api.getHomeData().subscribe({
      next: (res: any) => {
        const d = res.data || res;
        
        // Helper to apply promo to a list of products
        const applyPromo = (list: any[]) => {
          return list.map(p => {
            const base = p.default_price > 0 ? p.default_price : (p.variants?.[0]?.price || 0);
            const promo = this.promoService.applyPromotion(p._id, base);
            return {
              ...p,
              sale_price: promo.salePrice,
              original_price: promo.originalPrice,
              discount_percent: promo.discountPercent,
              is_flash_sale: !!promo.promotion
            };
          });
        };

        this.promoService.loadActivePromotions().subscribe(() => {
          this.products = applyPromo(d.products || []);
          this.popularProducts = applyPromo(d.popularProducts || []);
          this.mensCollection = applyPromo(d.mensCollection || []);
        });

        this.categories = d.categories || [];
        this.articles = d.articles || [];
        this.flashSale = d.flashSale || null;
        if (this.flashSale?.promotion?.end_time) {
          this.startCountdown(this.flashSale.promotion.end_time);
        }
        if (d.banners && d.banners.length > 0) {
          this.banners = d.banners;
        }
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
        this.api.getProducts({ page: 1, limit: 8 }).subscribe({
          next: (res: any) => {
            this.products = res.results || res.data || [];
            this.loadingProducts = false;
          },
          error: () => { this.loadingProducts = false; }
        });
        this.api.getCategories().subscribe({
          next: (res: any) => {
            this.categories = Array.isArray(res) ? res : (res.data || []);
          }
        });
      }
    });
  }

  quickAddToCart(product: any) {
    this.cartService.addToCart({
      id: product._id || product.id,
      product_id: product._id || product.id,
      name: product.name,
      price: product.price || product.default_price || 350000,
      quantity: 1,
      image: product.main_img || 'https://via.placeholder.com/150'
    });
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }
}
