import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-950 text-gray-400 pt-10 pb-24 px-5 border-t border-gray-800 relative overflow-hidden">
      <!-- Ambient light glow -->
      <div class="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-md mx-auto relative z-10 space-y-8">
        <!-- Brand Info -->
        <div>
          <h3 class="font-serif-brand text-3xl font-black tracking-tighter mb-3 flex items-center">
            <span class="bg-gradient-to-r from-[#D4AF37] via-[#EBC563] to-[#B38B1B] bg-clip-text text-transparent">CLOSET</span>
            <span class="text-amber-500 font-sans text-lg font-black -ml-0.5">.</span>
          </h3>
          <p class="text-xs text-gray-400 leading-relaxed mb-5">
            Đỉnh cao của nghệ thuật tối giản và thời trang thượng hạng. Định hình phong cách sang trọng thầm lặng.
          </p>

          <!-- Social Icons -->
          <div class="flex items-center gap-3">
            <a href="#" class="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
              <i class="fa-brands fa-instagram text-xs"></i>
            </a>
            <a href="#" class="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
              <i class="fa-brands fa-facebook-f text-xs"></i>
            </a>
            <a href="#" class="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
              <i class="fa-brands fa-pinterest-p text-xs"></i>
            </a>
            <a href="#" class="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
              <i class="fa-brands fa-tiktok text-xs"></i>
            </a>
          </div>
        </div>

        <!-- Newsletter Signup -->
        <div class="bg-gray-900/80 p-4 rounded-2xl border border-gray-800/80">
          <h4 class="text-xs font-black uppercase tracking-widest text-white mb-2">Đăng ký nhận bản tin</h4>
          <p class="text-[11px] text-gray-400 leading-relaxed mb-3">Nhận thông tin bộ sưu tập mới và ưu đãi đặc quyền.</p>
          <div class="flex gap-2">
            <input type="email" placeholder="Email của bạn..." class="flex-1 bg-black border border-gray-800 px-3.5 py-2.5 rounded-xl text-xs text-white outline-none focus:border-white transition-all placeholder:text-gray-600">
            <button type="button" class="px-4 py-2.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors shrink-0">
              Đăng ký
            </button>
          </div>
        </div>

        <!-- Links Section -->
        <div class="grid grid-cols-2 gap-6 pt-2 border-t border-gray-900 text-xs">
          <div>
            <h4 class="text-[10px] font-black uppercase tracking-widest text-white mb-3">Bộ sưu tập</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a routerLink="/catalog" class="hover:text-white transition-colors">Classic Suit</a></li>
              <li><a routerLink="/catalog" class="hover:text-white transition-colors">Heritage Overcoat</a></li>
              <li><a routerLink="/catalog" class="hover:text-white transition-colors">Merino Knitwear</a></li>
              <li><a routerLink="/catalog" class="hover:text-white transition-colors">Evening Dress</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-[10px] font-black uppercase tracking-widest text-white mb-3">Khám phá</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a routerLink="/brand" class="hover:text-white transition-colors">Về CLOSET</a></li>
              <li><a routerLink="/blog" class="hover:text-white transition-colors">Tạp chí Journal</a></li>
              <li><a routerLink="/lookbook" class="hover:text-white transition-colors">Lookbook 2026</a></li>
              <li><a routerLink="/catalog" class="hover:text-white transition-colors">Hệ thống cửa hàng</a></li>
            </ul>
          </div>
        </div>

        <!-- Store Info & Support -->
        <div class="bg-gray-900/40 p-4 rounded-2xl border border-gray-900 text-xs space-y-3">
          <div>
            <strong class="text-white block text-[11px] font-bold uppercase tracking-wider mb-1">
              <i class="fa-solid fa-location-dot text-red-500 mr-1.5"></i> Flagship Store
            </strong>
            <p class="text-gray-400 text-[11px] leading-relaxed">123 Đường Đồng Khởi, Bến Nghé, Quận 1, TP. HCM</p>
          </div>

          <div class="pt-2 border-t border-gray-800/50">
            <strong class="text-white block text-[11px] font-bold uppercase tracking-wider mb-1">
              <i class="fa-solid fa-phone text-emerald-500 mr-1.5"></i> Hotline hỗ trợ
            </strong>
            <p class="text-gray-400 text-[11px]">1900 123 456 (9:00 - 22:00)</p>
          </div>
        </div>

        <!-- Bottom Copyright & Payments -->
        <div class="pt-6 border-t border-gray-900 text-[10px] text-gray-500 flex flex-col items-center gap-3 text-center">
          <div class="flex items-center gap-4 text-lg text-gray-600">
            <i class="fa-brands fa-cc-visa hover:text-white transition-colors"></i>
            <i class="fa-brands fa-cc-mastercard hover:text-white transition-colors"></i>
            <i class="fa-brands fa-cc-apple-pay hover:text-white transition-colors"></i>
            <i class="fa-solid fa-money-bill-transfer hover:text-white transition-colors"></i>
          </div>
          <p>© 2026 CLOSET Store. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
