import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { DragDropCartService } from '../../services/drag-drop-cart.service';

import { FooterComponent } from '../../components/footer/footer.component';
import { CartDropZoneComponent } from '../../components/cart-drop-zone/cart-drop-zone.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule, FooterComponent, CartDropZoneComponent],
  template: `
    <!-- Nền xám cho màn hình Desktop -->
    <div class="bg-gray-100 min-h-screen flex justify-center font-sans text-gray-900">
      
      <!-- Khung giao diện điện thoại (Rộng tối đa 480px) -->
      <div class="w-full md:w-[480px] bg-white min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Header (Cố định trên cùng) -->
        <header class="sticky top-0 bg-white/95 backdrop-blur-md z-50 h-14 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
          <div class="flex items-center gap-3">
            <button (click)="isMenuOpen = true" class="text-xl p-1 text-gray-800 hover:text-blue-600 transition-colors">
              <i class="fa-solid fa-bars"></i>
            </button>
            <a routerLink="/" class="font-serif-brand font-black text-2xl tracking-tight flex items-center group">
              <span class="bg-gradient-to-r from-[#D4AF37] via-[#EBC563] to-[#B38B1B] bg-clip-text text-transparent drop-shadow-sm group-hover:brightness-110 transition-all">CLOSET</span>
              <span class="text-amber-500 font-sans text-sm font-black -ml-0.5">.</span>
            </a>
          </div>
          <div class="flex items-center gap-4">
            <button (click)="isSearchOpen = !isSearchOpen" class="text-xl text-gray-800 hover:text-blue-600 transition-colors">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
            <a routerLink="/cart" class="relative text-gray-800 hover:text-blue-600 transition-colors">
              <i class="fa-solid fa-bag-shopping text-xl"></i>
              <span *ngIf="cartCount > 0" class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {{ cartCount > 99 ? '99+' : cartCount }}
              </span>
            </a>
          </div>
        </header>

        <!-- Search Bar (Toggleable) -->
        <div *ngIf="isSearchOpen" class="bg-white border-b border-gray-100 p-3 px-4 animate-[fadeIn_0.2s_ease-out]">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" 
                   [(ngModel)]="searchKeyword" 
                   (keyup.enter)="onSearch()"
                   placeholder="Tìm kiếm sản phẩm..." 
                   class="w-full bg-gray-100 text-sm rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all">
          </div>
        </div>

        <!-- Vùng nội dung chính -->
        <main class="flex-1 w-full pb-0">
          <router-outlet></router-outlet>
          <app-footer></app-footer>
        </main>

        <!-- Cart Drop Zone (Kéo Thả Giỏ Hàng Siêu Thị - Chỉ ẩn khi ở trang Checkout/Cart) -->
        <app-cart-drop-zone *ngIf="!hideDropZone()"></app-cart-drop-zone>

        <!-- Bottom Tab Bar (Luôn hiển thị) -->
        <nav class="fixed bottom-0 w-full md:w-[480px] h-[65px] bg-white border-t border-gray-100 flex justify-around items-center px-1 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          
          <!-- 1. Trang chủ -->
          <a routerLink="/" routerLinkActive="!text-black font-black scale-105" [routerLinkActiveOptions]="{exact: true}" 
             class="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-black transition-all w-14 h-full">
            <i class="fa-solid fa-house text-[19px]"></i>
            <span class="text-[9px] font-extrabold tracking-tight">Trang chủ</span>
          </a>

          <!-- 2. Khám phá -->
          <a routerLink="/catalog" routerLinkActive="!text-black font-black scale-105" 
             class="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-black transition-all w-14 h-full">
            <i class="fa-solid fa-compass text-[19px]"></i>
            <span class="text-[9px] font-extrabold tracking-tight">Khám phá</span>
          </a>

          <!-- 3. Đơn hàng (Nổi bật hình tròn ở giữa + Badge số đơn chưa hoàn thành) -->
          <a routerLink="/orders" routerLinkActive="group/active" 
             class="relative flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 transition-all w-16 h-full group">
            
            <!-- Floating Metallic Gold Ring -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-white flex items-center justify-center -translate-y-3.5 shadow-[0_4px_14px_rgba(212,175,55,0.45)] border-4 border-white group-hover:scale-110 transition-all duration-300">
              <i class="fa-solid fa-receipt text-lg drop-shadow-sm"></i>
              
              <!-- Badge cho đơn hàng chưa hoàn thành (ẩn khi = 0) -->
              <span *ngIf="pendingOrdersCount > 0" 
                    class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                {{ pendingOrdersCount }}
              </span>
            </div>

            <span class="text-[9px] font-extrabold tracking-tight text-gray-800 -mt-2.5 group-hover:text-amber-600 transition-colors">Đơn hàng</span>
          </a>

          <!-- 4. Tin tức -->
          <a routerLink="/blog" routerLinkActive="!text-black font-black scale-105" 
             class="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-black transition-all w-14 h-full">
            <i class="fa-solid fa-newspaper text-[19px]"></i>
            <span class="text-[9px] font-extrabold tracking-tight">Tin tức</span>
          </a>

          <!-- 5. Hồ sơ / Đăng nhập -->
          <a *ngIf="user" routerLink="/profile" routerLinkActive="!text-black font-black scale-105" 
             class="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-black transition-all w-14 h-full">
            <i class="fa-regular fa-user text-[19px]"></i>
            <span class="text-[9px] font-extrabold tracking-tight">Hồ sơ</span>
          </a>

          <a *ngIf="!user" [routerLink]="['/login']" [queryParams]="{ returnUrl: currentUrl || '/' }" routerLinkActive="!text-black font-black scale-105" 
             class="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-black transition-all w-14 h-full">
            <i class="fa-solid fa-arrow-right-to-bracket text-[19px]"></i>
            <span class="text-[9px] font-extrabold tracking-tight">Đăng nhập</span>
          </a>
        </nav>

      </div>
      
      <!-- Slide-over Menu (Drawer) -->
      <div *ngIf="isMenuOpen" class="absolute inset-0 z-[100] flex justify-center">
        <div class="w-full md:w-[480px] h-full relative overflow-hidden">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="isMenuOpen = false"></div>
          
          <!-- Menu Panel -->
          <div class="absolute top-0 left-0 w-3/4 max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-[slideRight_0.3s_ease-out]">
            <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span class="font-serif font-black text-xl tracking-tighter">DANH MỤC</span>
              <button (click)="isMenuOpen = false" class="text-gray-400 hover:text-red-500 text-2xl transition-colors"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <a routerLink="/catalog" (click)="isMenuOpen = false" class="text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-blue-600 block border-b border-gray-50 pb-2">
                Tất cả sản phẩm
              </a>
              
              <div *ngFor="let cat of parentCategories" class="flex flex-col border-b border-gray-50 pb-2">
                
                <!-- Có danh mục con: Click để mở rộng/thu gọn -->
                <div *ngIf="childCategories[cat._id || cat.slug]?.length; else noChildren" 
                     (click)="toggleCategory(cat._id || cat.slug)" 
                     class="flex items-center justify-between cursor-pointer text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-blue-600 select-none">
                  <span>{{ cat.name }}</span>
                  <i class="fa-solid text-[10px] text-gray-300 transition-transform" 
                     [ngClass]="expandedCatId === (cat._id || cat.slug) ? 'fa-chevron-down text-blue-600' : 'fa-chevron-right'"></i>
                </div>
                
                <!-- Danh sách danh mục con -->
                <div *ngIf="expandedCatId === (cat._id || cat.slug)" class="flex flex-col gap-4 mt-4 pl-4 border-l-2 border-gray-100 ml-1 mb-2 animate-[fadeIn_0.2s_ease-out]">
                  <a [routerLink]="['/catalog']" [queryParams]="{category: cat._id || cat.slug}" (click)="isMenuOpen = false" class="text-[13px] font-semibold text-gray-500 hover:text-blue-600">
                    Tất cả {{ cat.name }}
                  </a>
                  <a *ngFor="let child of childCategories[cat._id || cat.slug]" [routerLink]="['/catalog']" [queryParams]="{category: child._id || child.slug}" (click)="isMenuOpen = false" class="text-[13px] font-semibold text-gray-500 hover:text-blue-600">
                    {{ child.name }}
                  </a>
                </div>

                <!-- Không có danh mục con: Click chuyển trang luôn -->
                <ng-template #noChildren>
                  <a [routerLink]="['/catalog']" [queryParams]="{category: cat._id || cat.slug}" (click)="isMenuOpen = false" class="block text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-blue-600">
                    {{ cat.name }}
                  </a>
                </ng-template>

              </div>
              <!-- Các trang nội dung -->
              <div class="flex flex-col gap-4 mt-2 mb-4">
                <a routerLink="/lookbook" (click)="isMenuOpen = false" class="text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-blue-600 block">
                  Lookbook
                </a>
                <a routerLink="/brand" (click)="isMenuOpen = false" class="text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-blue-600 block">
                  Về CLOSET
                </a>
                <a routerLink="/blog" (click)="isMenuOpen = false" class="text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-blue-600 block">
                  Tạp chí thời trang
                </a>
              </div>
            </div>
            
            <!-- Account / Login Link -->
            <div class="p-6 border-t border-gray-100 bg-gray-50 mt-auto">
              <a *ngIf="user" (click)="isMenuOpen = false" routerLink="/profile" class="flex items-center gap-3 text-gray-900 font-bold uppercase tracking-widest text-xs group cursor-pointer">
                <div class="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <i class="fa-regular fa-user"></i>
                </div>
                <div>
                  <span class="block text-gray-900">{{ user.name }}</span>
                  <span class="text-[10px] text-gray-400 font-medium normal-case">Quản lý tài khoản</span>
                </div>
              </a>
              
              <a *ngIf="!user" (click)="isMenuOpen = false" [routerLink]="['/login']" [queryParams]="{ returnUrl: currentUrl || '/' }" class="flex items-center gap-3 text-gray-900 font-bold uppercase tracking-widest text-xs group cursor-pointer">
                <div class="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <i class="fa-solid fa-arrow-right-to-bracket"></i>
                </div>
                Đăng nhập / Đăng ký
              </a>
            </div>

          </div>
        </div>
      </div>

    </div>
  `
})
export class ClientLayoutComponent implements OnInit {
  isMenuOpen = false;
  isSearchOpen = false;
  searchKeyword = '';
  
  parentCategories: any[] = [];
  childCategories: { [key: string]: any[] } = {};
  expandedCatId: string | number | null = null;
  
  private api = inject(ApiService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private dragDropService = inject(DragDropCartService);

  cartCount = 0;
  pendingOrdersCount = 0;
  user: any = null;
  currentUrl = '';

  hideDropZone(): boolean {
    const url = this.currentUrl || this.router.url;
    return url.includes('/checkout') || 
           url.includes('/order-complete') || 
           url.includes('/cart');
  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects || event.url;
      this.dragDropService.hideDropZone();
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });

    this.authService.currentUser$.subscribe((u: any) => {
      this.user = u;
      this.loadPendingOrders();
    });

    this.cartService.cart$.subscribe((items: any[]) => {
      this.cartCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    });

    this.api.getCategories().subscribe({
      next: (res: any) => {
        const cats = Array.isArray(res) ? res : (res.data || []);
        
        // Phân tách cha và con
        this.parentCategories = cats.filter((c: any) => !c.parent_id);
        
        cats.forEach((c: any) => {
          if (c.parent_id) {
            if (!this.childCategories[c.parent_id]) {
              this.childCategories[c.parent_id] = [];
            }
            this.childCategories[c.parent_id].push(c);
          }
        });
      }
    });
  }

  loadPendingOrders() {
    if (!this.user) {
      this.pendingOrdersCount = 0;
      return;
    }
    this.api.getMyOrders().subscribe({
      next: (res: any) => {
        const orders = res.data || res.orders || (Array.isArray(res) ? res : []);
        this.pendingOrdersCount = orders.filter((o: any) => {
          const st = (o.status || '').toLowerCase();
          return st !== 'completed' && st !== 'hoan_thanh' && st !== 'da_giao' && st !== 'cancelled' && st !== 'da_huy';
        }).length;
      },
      error: () => {
        this.pendingOrdersCount = 0;
      }
    });
  }

  toggleCategory(id: string | number) {
    this.expandedCatId = this.expandedCatId === id ? null : id;
  }

  onSearch() {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { keyword: this.searchKeyword.trim() }, queryParamsHandling: 'merge' });
      this.isSearchOpen = false;
      this.searchKeyword = '';
    }
  }
}
