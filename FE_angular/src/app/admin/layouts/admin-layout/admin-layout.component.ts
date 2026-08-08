import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminBottomNavComponent } from '../../components/bottom-nav/admin-bottom-nav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminBottomNavComponent],
  template: `
    <!-- Outer shell: centers content to mobile width -->
    <div class="min-h-screen bg-gray-100 flex justify-center">
      <div class="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl">

        <!-- Topbar -->
        <header class="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 sticky top-0 z-20 shrink-0">
          <a routerLink="/admin"
             class="font-serif font-black text-xl tracking-tighter text-gray-900">
            CLOSET. <span class="text-[10px] text-gray-400 font-sans tracking-widest uppercase">Admin</span>
          </a>
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
              <i class="fa-solid fa-user text-[10px] text-gray-500"></i>
            </div>
            <button (click)="logout()"
                    class="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-full border border-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                    title="Đăng xuất">
              <i class="fa-solid fa-power-off text-xs"></i>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto bg-gray-50" style="padding-bottom: 72px;">
          <router-outlet></router-outlet>
        </main>

        <!-- Bottom Navigation (tách riêng component) -->
        <app-admin-bottom-nav></app-admin-bottom-nav>

      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user: any = null;

  constructor() {
    this.auth.currentUser$.subscribe(u => this.user = u);
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/admin/login']);
    });
  }
}
