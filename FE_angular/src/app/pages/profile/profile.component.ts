import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-50 min-h-screen pb-[100px]">
      
      <!-- App Header -->
      <div class="p-4 bg-white flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <h1 class="font-bold text-lg uppercase tracking-wider text-gray-900">Tài khoản</h1>
        <button (click)="goHome()" class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black">
          <i class="fa-solid fa-house"></i>
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
      </div>

      <div *ngIf="!loading && user" class="animate-[fadeIn_0.3s_ease-out]">
        <!-- Profile Header -->
        <div class="bg-white p-6 flex items-center gap-4 border-b border-gray-100 shadow-sm mb-4">
          <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-3xl shrink-0 overflow-hidden">
            <i class="fa-solid fa-user"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 leading-tight">{{ user.name }}</h2>
            <p class="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">{{ user.username }}</p>
          </div>
        </div>

        <!-- Menu Group 1 -->
        <div class="bg-white border-y border-gray-100 shadow-sm mb-4">
          <a routerLink="/orders" class="flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4 text-gray-700 group-hover:text-black">
              <i class="fa-solid fa-box w-5 text-center text-lg"></i>
              <span class="text-sm font-bold">Lịch sử đơn hàng</span>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
          </a>
          <a href="javascript:void(0)" class="flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4 text-gray-700 group-hover:text-black">
              <i class="fa-regular fa-heart w-5 text-center text-lg"></i>
              <span class="text-sm font-bold">Sản phẩm yêu thích</span>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
          </a>
          <a routerLink="/profile/addresses" class="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4 text-gray-700 group-hover:text-black">
              <i class="fa-regular fa-map w-5 text-center text-lg"></i>
              <span class="text-sm font-bold">Địa chỉ giao hàng</span>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
          </a>
        </div>

        <!-- Menu Group 2 -->
        <div class="bg-white border-y border-gray-100 shadow-sm mb-8">
          <a href="javascript:void(0)" class="flex items-center justify-between p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4 text-gray-700 group-hover:text-black">
              <i class="fa-solid fa-shield-halved w-5 text-center text-lg"></i>
              <span class="text-sm font-bold">Bảo mật & Đổi mật khẩu</span>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
          </a>
          <a href="javascript:void(0)" class="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4 text-gray-700 group-hover:text-black">
              <i class="fa-regular fa-circle-question w-5 text-center text-lg"></i>
              <span class="text-sm font-bold">Trung tâm hỗ trợ</span>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 text-sm"></i>
          </a>
        </div>

        <!-- Logout Button -->
        <div class="px-4">
          <button (click)="logout()" class="w-full h-14 bg-red-50 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-colors">
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      this.loading = false;
      if (!this.loading && !this.user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
