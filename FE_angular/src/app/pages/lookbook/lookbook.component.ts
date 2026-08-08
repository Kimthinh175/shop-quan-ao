import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lookbook',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-[#f5f5f0] min-h-screen pb-[100px] animate-[fadeIn_0.3s_ease-out]">
      <!-- Header -->
      <div class="p-6 pt-10 text-center relative z-10">
        <h1 class="font-serif font-black text-4xl tracking-tighter text-gray-900 mb-2 italic">Lookbook</h1>
        <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Bộ sưu tập Xuân Hè 2026</p>
      </div>

      <!-- Pinterest-style Grid (Masonry fallback using CSS Columns) -->
      <div class="p-4 pt-0 columns-2 gap-4 space-y-4">
        
        <!-- Image 1 -->
        <div class="relative group rounded-2xl overflow-hidden cursor-pointer inline-block w-full">
          <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest border border-white px-3 py-1 rounded-full backdrop-blur-sm">Xem chi tiết</span>
          </div>
        </div>

        <!-- Image 2 -->
        <div class="relative group rounded-2xl overflow-hidden cursor-pointer inline-block w-full">
          <img src="https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest border border-white px-3 py-1 rounded-full backdrop-blur-sm">Xem chi tiết</span>
          </div>
        </div>

        <!-- Image 3 -->
        <div class="relative group rounded-2xl overflow-hidden cursor-pointer inline-block w-full">
          <img src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest border border-white px-3 py-1 rounded-full backdrop-blur-sm">Xem chi tiết</span>
          </div>
        </div>

        <!-- Image 4 -->
        <div class="relative group rounded-2xl overflow-hidden cursor-pointer inline-block w-full">
          <img src="https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest border border-white px-3 py-1 rounded-full backdrop-blur-sm">Xem chi tiết</span>
          </div>
        </div>

        <!-- Image 5 -->
        <div class="relative group rounded-2xl overflow-hidden cursor-pointer inline-block w-full">
          <img src="https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest border border-white px-3 py-1 rounded-full backdrop-blur-sm">Xem chi tiết</span>
          </div>
        </div>

        <!-- Image 6 -->
        <div class="relative group rounded-2xl overflow-hidden cursor-pointer inline-block w-full">
          <img src="https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=600" class="w-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest border border-white px-3 py-1 rounded-full backdrop-blur-sm">Xem chi tiết</span>
          </div>
        </div>

      </div>
      
      <!-- Load More -->
      <div class="p-8 text-center pb-16">
        <a routerLink="/catalog" class="inline-block px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors shadow-xl">
          Mua sắm ngay
        </a>
      </div>

    </div>
  `
})
export class LookbookComponent {}
