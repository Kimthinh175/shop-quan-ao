import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white min-h-screen pb-[100px] animate-[fadeIn_0.3s_ease-out]">
      <!-- Sticky Header for Reading -->
      <div class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors rounded-full bg-gray-50">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div class="flex gap-2">
          <button class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors rounded-full bg-gray-50">
            <i class="fa-regular fa-bookmark"></i>
          </button>
          <button class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors rounded-full bg-gray-50">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>

      <!-- Hero Image -->
      <div class="w-full aspect-[4/3] relative">
        <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6 text-white">
          <div class="mb-3 flex gap-2">
            <span class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
              Phối đồ
            </span>
          </div>
          <h1 class="text-2xl font-serif font-black italic leading-tight mb-3">
            Làm thế nào để mặc phong cách Quiet Luxury đúng chuẩn?
          </h1>
          <div class="flex items-center gap-3 text-xs text-gray-300 font-medium">
            <span><i class="fa-regular fa-clock mr-1"></i> 14 Tháng 7, 2026</span>
            <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>Tác giả: CLOSET Team</span>
          </div>
        </div>
      </div>

      <!-- Post Content -->
      <div class="p-6">
        <div class="prose prose-sm md:prose-base prose-slate max-w-none">
          <p class="text-lg font-medium text-gray-600 leading-relaxed mb-6 italic">
            "Sang trọng tĩnh lặng" (Quiet Luxury) không phải là trào lưu nhất thời, mà là một lối sống. Bí quyết nằm ở chất liệu và sự tối giản.
          </p>

          <p class="mb-4 text-gray-800 leading-loose">
            Bạn có bao giờ tự hỏi làm sao một người có thể trông cực kỳ đắt tiền mà không hề có bất kỳ logo hàng hiệu nào trên người? Đó chính là cốt lõi của Quiet Luxury.
          </p>

          <h3 class="text-xl font-bold mt-8 mb-4">1. Tập trung vào chất liệu</h3>
          <p class="mb-4 text-gray-800 leading-loose">
            Cashmere, lụa tơ tằm, len merino hay cotton Ai Cập. Những chất liệu này tự thân nó đã toát lên vẻ đẹp đắt giá qua độ rủ, độ bóng nhẹ và cảm giác tuyệt vời khi chạm vào da.
          </p>

          <img src="https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full rounded-2xl my-6">

          <h3 class="text-xl font-bold mt-8 mb-4">2. Bảng màu trung tính</h3>
          <p class="mb-4 text-gray-800 leading-loose">
            Beige, navy, xám, trắng, và đen. Hãy chọn những tông màu không bao giờ lỗi mốt. Phối đồ theo kiểu ton-sur-ton (monochrome) cũng là một mẹo rất hay để hack dáng và trông thanh lịch hơn.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border-l-4 border-black my-8">
            <p class="font-serif italic text-lg text-gray-900 leading-relaxed mb-0">
              "Sự sang trọng thực sự là khi bạn không cần phải hét lên để người khác biết bạn là ai."
            </p>
          </div>

          <h3 class="text-xl font-bold mt-8 mb-4">3. Vừa vặn hoàn hảo (Tailoring)</h3>
          <p class="mb-4 text-gray-800 leading-loose">
            Một chiếc áo khoác rẻ tiền nhưng được may đo vừa vặn ôm khít cơ thể sẽ luôn trông đẹp hơn một chiếc áo khoác hàng hiệu nhưng sai size. Hãy tìm cho mình một người thợ may giỏi.
          </p>
        </div>
      </div>

      <!-- Related Products -->
      <div class="px-6 py-8 bg-gray-50 border-t border-gray-100">
        <h3 class="font-black text-lg uppercase tracking-widest mb-6 text-center">Sản phẩm gợi ý</h3>
        <!-- Horizontal Scroll of Products -->
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          
          <a routerLink="/catalog" class="w-[140px] shrink-0 group">
            <div class="bg-white rounded-xl overflow-hidden aspect-[3/4] mb-3 relative">
              <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400" class="w-full h-full object-cover">
            </div>
            <h4 class="text-xs font-bold text-gray-900 line-clamp-1 mb-1">Áo Vest Nam Cổ Điển</h4>
            <p class="text-[10px] text-gray-500 font-bold">1,250,000đ</p>
          </a>

          <a routerLink="/catalog" class="w-[140px] shrink-0 group">
            <div class="bg-white rounded-xl overflow-hidden aspect-[3/4] mb-3 relative">
              <img src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=400" class="w-full h-full object-cover">
            </div>
            <h4 class="text-xs font-bold text-gray-900 line-clamp-1 mb-1">Quần Tây Slimfit</h4>
            <p class="text-[10px] text-gray-500 font-bold">650,000đ</p>
          </a>

        </div>
      </div>
    </div>
  `
})
export class PostDetailComponent {
  goBack() {
    window.history.back();
  }
}
