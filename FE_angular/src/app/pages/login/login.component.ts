import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-white min-h-screen flex flex-col p-6 animate-[fadeIn_0.3s_ease-out]">
      <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <!-- Logo -->
        <div class="text-center mb-10">
          <a routerLink="/" class="font-serif font-black text-4xl tracking-tighter text-gray-900 inline-block">CLOSET.</a>
          <p class="text-xs font-bold text-gray-400 tracking-widest uppercase mt-2">Chào mừng trở lại</p>
        </div>

        <div *ngIf="errorMessage" class="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl mb-6 text-center">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <div class="space-y-4 mb-8">
          <div>
            <input type="tel" [(ngModel)]="phone" placeholder="Số điện thoại" 
                   class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
          </div>
          <div>
            <input type="password" [(ngModel)]="password" placeholder="Mật khẩu" 
                   class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
          </div>
          <div class="text-right">
            <a href="#" class="text-xs font-bold text-gray-400 hover:text-black transition-colors">Quên mật khẩu?</a>
          </div>
        </div>

        <!-- Action -->
        <button (click)="login()" [disabled]="loading || !phone || !password" 
                class="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 disabled:bg-gray-300 disabled:shadow-none mb-6">
          <span *ngIf="!loading">Đăng nhập</span>
          <i *ngIf="loading" class="fa-solid fa-spinner fa-spin text-xl"></i>
        </button>

        <!-- Divider -->
        <div class="relative flex items-center justify-center mb-6">
          <div class="absolute w-full border-t border-gray-100"></div>
          <span class="bg-white px-4 text-xs font-bold text-gray-400 tracking-widest uppercase relative">Hoặc</span>
        </div>

        <!-- Google Login Button Container -->
        <div class="flex justify-center mb-6" id="google-btn-container"></div>

        <!-- Register Link -->
        <div class="text-center">
          <span class="text-sm font-medium text-gray-500">Chưa có tài khoản? </span>
          <a routerLink="/register" class="text-sm font-bold text-black hover:underline">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements AfterViewInit {
  phone = '';
  password = '';
  loading = false;
  errorMessage = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  ngAfterViewInit() {
    this.initGoogleLogin();
  }

  private googleInitAttempts = 0;

  initGoogleLogin() {
    if (typeof google === 'undefined' || !google.accounts) {
      if (this.googleInitAttempts < 20) {
        this.googleInitAttempts++;
        setTimeout(() => this.initGoogleLogin(), 100);
      } else {
        console.warn('Google Sign-In API could not be loaded.');
      }
      return;
    }

    google.accounts.id.initialize({
      client_id: '353464933030-gs4nius9ik1kikb6meq9acigl5kju766.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn-container'),
      { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill', width: 250 }
    );
  }

  handleCredentialResponse(response: any) {
    if (response.credential) {
      this.loading = true;
      this.errorMessage = '';
      this.auth.googleLogin(response.credential).subscribe({
        next: () => {
          this.loading = false;
          const returnUrl = localStorage.getItem('returnUrl') || '/profile';
          localStorage.removeItem('returnUrl');
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Đăng nhập Google thất bại.';
        }
      });
    }
  }

  login() {
    this.loading = true;
    this.errorMessage = '';
    
    this.auth.login(this.phone, this.password).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = localStorage.getItem('returnUrl') || '/profile';
        localStorage.removeItem('returnUrl');
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    });
  }
}
