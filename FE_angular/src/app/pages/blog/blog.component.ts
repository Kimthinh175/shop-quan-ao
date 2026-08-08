import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white min-h-screen pb-[100px] animate-[fadeIn_0.3s_ease-out]">
      <!-- Header -->
      <div class="p-6 pb-2 text-center">
        <h1 class="font-serif font-black text-3xl tracking-tighter text-gray-900 mb-2">Tạp chí CLOSET</h1>
        <p class="text-xs text-gray-500 font-medium">Cập nhật xu hướng & Phong cách sống</p>
      </div>

      <!-- Categories Tab -->
      <div class="px-4 py-4 flex gap-4 overflow-x-auto no-scrollbar border-b border-gray-100">
        <button class="whitespace-nowrap px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full">
          Mới nhất
        </button>
        <button class="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-500 hover:text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors">
          Ưu đãi
        </button>
        <button class="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-500 hover:text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors">
          Phối đồ
        </button>
        <button class="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-500 hover:text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors">
          Sự kiện
        </button>
      </div>

      <!-- Blog Grid -->
      <div class="p-4 flex flex-col gap-8 mt-4">
        
        <!-- Featured Post -->
        <a routerLink="/post/1" class="group block cursor-pointer">
          <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
            <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
              <span class="text-[10px] font-bold uppercase tracking-widest text-black">Phối đồ</span>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
              Làm thế nào để mặc phong cách Quiet Luxury đúng chuẩn?
            </h2>
            <p class="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
              Sang trọng tĩnh lặng (Quiet Luxury) không phải là trào lưu nhất thời, mà là một lối sống. Bí quyết nằm ở chất liệu và sự tối giản.
            </p>
            <div class="flex items-center gap-3 text-xs text-gray-400 font-medium">
              <span><i class="fa-regular fa-clock mr-1"></i> 14 Tháng 7, 2026</span>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>5 phút đọc</span>
            </div>
          </div>
        </a>

        <!-- Normal Post -->
        <a routerLink="/post/2" class="group block cursor-pointer flex gap-4">
          <div class="w-1/3 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shrink-0">
            <img src="https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=400" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 block">Ưu đãi</span>
            <h2 class="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
              Mid-Season Sale: Giảm đến 50% các thiết kế Thu Đông
            </h2>
            <div class="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-auto">
              <span>10 Tháng 7, 2026</span>
            </div>
          </div>
        </a>

        <!-- Normal Post -->
        <a routerLink="/post/3" class="group block cursor-pointer flex gap-4">
          <div class="w-1/3 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shrink-0">
            <img src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=400" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Sự kiện</span>
            <h2 class="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
              Sự kiện ra mắt BST Hè tại Flagship Store
            </h2>
            <div class="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-auto">
              <span>5 Tháng 7, 2026</span>
            </div>
          </div>
        </a>
        
      </div>
      
      <!-- Load More -->
      <div class="p-6 text-center">
        <button class="px-8 py-3 bg-white border-2 border-black text-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
          Tải thêm bài viết
        </button>
      </div>

    </div>
  `
})
export class BlogComponent {}
