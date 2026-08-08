import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col animate-[fadeIn_0.5s_ease-out]">
      <!-- Header / Logo -->
      <div class="pt-20 pb-10 flex flex-col items-center justify-center text-center px-6 relative z-10">
        <h1 class="font-serif font-black text-5xl tracking-tighter mb-2 text-gray-900 drop-shadow-sm">CLOSET.</h1>
        <p class="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hệ thống quản trị</p>
      </div>

      <!-- Form -->
      <div class="flex-1 flex flex-col justify-center px-8 pb-20">
        <div class="mb-10 text-center">
          <h2 class="text-2xl font-black text-gray-900 mb-1">Đăng nhập</h2>
          <p class="text-xs text-gray-500">Dành riêng cho nhân viên</p>
        </div>

        <div *ngIf="errorMessage" class="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation text-sm"></i>
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="login()" class="space-y-5">
          <div>
            <label class="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1.5" for="user_login">Tài khoản</label>
            <input type="text" id="user_login" [(ngModel)]="username" name="username"
                   placeholder="VD: 0999999999"
                   class="w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:bg-white outline-none focus:border-black transition-all bg-gray-50">
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-[10px] font-black text-gray-900 uppercase tracking-widest" for="user_pass">Mật khẩu</label>
            </div>
            <input type="password" id="user_pass" [(ngModel)]="password" name="password"
                   placeholder="Nhập mật khẩu..."
                   class="w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:bg-white outline-none focus:border-black transition-all bg-gray-50">
          </div>

          <div class="pt-4">
            <button type="submit" [disabled]="loading || !username || !password" 
                    class="w-full bg-black text-white px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex justify-center items-center gap-2 shadow-lg shadow-black/20">
              <span *ngIf="!loading">Đăng nhập</span>
              <i *ngIf="loading" class="fa-solid fa-spinner fa-spin text-lg"></i>
            </button>
          </div>
          
          <div class="text-center mt-6">
            <a href="/" class="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <i class="fa-solid fa-arrow-left"></i> Về trang mua sắm
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  login() {
    this.loading = true;
    this.errorMessage = '';
    
    this.auth.adminLogin(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Tài khoản hoặc mật khẩu không chính xác.';
      }
    });
  }
}
