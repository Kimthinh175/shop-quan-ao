import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Backdrop for More menu -->
    <div *ngIf="showMore" (click)="showMore=false" class="fixed inset-0 z-20"></div>

    <!-- More Menu Overlay -->
    <div *ngIf="showMore"
         class="absolute bottom-16 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-30 p-4">
      <p class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Chức năng khác</p>
      <div class="grid grid-cols-3 gap-3">
        <a routerLink="/admin/inventory" (click)="showMore=false"
           routerLinkActive="!bg-black !text-white"
           class="flex flex-col items-center justify-center py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors gap-1.5">
          <i class="fa-solid fa-boxes-stacked text-lg"></i>
          <span class="text-[9px] font-black uppercase tracking-wider">Tồn kho</span>
        </a>
        <a routerLink="/admin/posts" (click)="showMore=false"
           routerLinkActive="!bg-black !text-white"
           class="flex flex-col items-center justify-center py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors gap-1.5">
          <i class="fa-solid fa-newspaper text-lg"></i>
          <span class="text-[9px] font-black uppercase tracking-wider">Bài viết</span>
        </a>
        <a routerLink="/admin/promotions" (click)="showMore=false"
           routerLinkActive="!bg-black !text-white"
           class="flex flex-col items-center justify-center py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors gap-1.5">
          <i class="fa-solid fa-tag text-lg"></i>
          <span class="text-[9px] font-black uppercase tracking-wider">Khuyến mãi</span>
        </a>
      </div>
    </div>

    <!-- Bottom Nav Bar -->
    <nav class="sticky bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-16 z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <a routerLink="/admin/dashboard"
         routerLinkActive="!text-black"
         [routerLinkActiveOptions]="{exact: true}"
         class="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-black transition-colors gap-1">
        <i class="fa-solid fa-chart-pie text-lg"></i>
        <span class="text-[9px] font-bold uppercase tracking-wider">Tổng quan</span>
      </a>

      <a routerLink="/admin/orders"
         routerLinkActive="!text-black"
         class="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-black transition-colors gap-1">
        <i class="fa-solid fa-box-open text-lg"></i>
        <span class="text-[9px] font-bold uppercase tracking-wider">Đơn hàng</span>
      </a>

      <a routerLink="/admin/products"
         routerLinkActive="!text-black"
         class="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-black transition-colors gap-1">
        <i class="fa-solid fa-tags text-lg"></i>
        <span class="text-[9px] font-bold uppercase tracking-wider">Sản phẩm</span>
      </a>

      <a routerLink="/admin/pos"
         routerLinkActive="!text-black"
         class="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-black transition-colors gap-1">
        <i class="fa-solid fa-cash-register text-lg"></i>
        <span class="text-[9px] font-bold uppercase tracking-wider">POS</span>
      </a>

      <button (click)="showMore = !showMore"
              [ngClass]="showMore ? 'text-black' : 'text-gray-400 hover:text-black'"
              class="flex flex-col items-center justify-center flex-1 h-full transition-colors gap-1">
        <i class="fa-solid fa-ellipsis text-lg"></i>
        <span class="text-[9px] font-bold uppercase tracking-wider">Thêm</span>
      </button>
    </nav>
  `
})
export class AdminBottomNavComponent {
  showMore = false;
}
