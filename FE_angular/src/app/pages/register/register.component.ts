import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-white min-h-screen flex flex-col p-6 animate-[fadeIn_0.3s_ease-out]">
      <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <!-- Header -->
        <div class="text-center mb-10">
          <a routerLink="/" class="font-serif font-black text-4xl tracking-tighter text-gray-900 inline-block">CLOSET.</a>
          <p class="text-xs font-bold text-gray-400 tracking-widest uppercase mt-2">Tạo tài khoản mới</p>
        </div>

        <div *ngIf="errorMessage" class="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl mb-6 text-center">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <div class="space-y-4 mb-8">
          <div>
            <input type="text" [(ngModel)]="name" placeholder="Họ và tên" 
                   class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
          </div>
          <div>
            <input type="tel" [(ngModel)]="phone" placeholder="Số điện thoại" 
                   class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
          </div>
          <div>
            <input type="password" [(ngModel)]="password" placeholder="Mật khẩu" 
                   class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
          </div>
        </div>

        <!-- Action -->
        <button (click)="register()" [disabled]="loading || !name || !phone || !password" 
                class="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 disabled:bg-gray-300 disabled:shadow-none mb-6">
          <span *ngIf="!loading">Đăng ký</span>
          <i *ngIf="loading" class="fa-solid fa-spinner fa-spin text-xl"></i>
        </button>

        <!-- Divider -->
        <div class="relative flex items-center justify-center mb-6">
          <div class="absolute w-full border-t border-gray-100"></div>
          <span class="bg-white px-4 text-xs font-bold text-gray-400 tracking-widest uppercase relative">Hoặc</span>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <span class="text-sm font-medium text-gray-500">Đã có tài khoản? </span>
          <a routerLink="/login" class="text-sm font-bold text-black hover:underline">Đăng nhập ngay</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  phone = '';
  password = '';
  loading = false;
  errorMessage = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  register() {
    this.loading = true;
    this.errorMessage = '';
    
    this.auth.register(this.name, this.phone, this.password).subscribe({
      next: () => {
        // Tự động đăng nhập sau khi đăng ký thành công
        this.auth.login(this.phone, this.password).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/profile']);
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/login']); // Fallback to login page
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      }
    });
  }
}
