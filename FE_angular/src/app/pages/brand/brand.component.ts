import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-[#f5f5f0] min-h-screen pb-[100px] animate-[fadeIn_0.5s_ease-out]">
      <!-- Hero -->
      <div class="relative w-full h-[70vh] flex items-center justify-center">
        <img src="https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 text-center px-4">
          <p class="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-4">Câu chuyện thương hiệu</p>
          <h1 class="font-serif font-black italic text-5xl text-white mb-6 leading-tight">Quiet Luxury<br>Since 2026</h1>
        </div>
      </div>

      <!-- Philosophy -->
      <div class="py-16 px-6 max-w-lg mx-auto text-center">
        <i class="fa-solid fa-quote-left text-3xl text-gray-300 mb-6"></i>
        <p class="font-serif italic text-2xl text-gray-900 leading-relaxed mb-6">
          Chúng tôi tin rằng sự sang trọng không nằm ở những logo lớn hay thiết kế hào nhoáng, mà nằm ở chất liệu tinh tuyển và sự vừa vặn hoàn hảo.
        </p>
        <p class="text-sm text-gray-500 font-medium uppercase tracking-widest">— Đội ngũ CLOSET</p>
      </div>

      <!-- Detail Sections -->
      <div class="flex flex-col gap-1">
        
        <!-- Section 1 -->
        <div class="bg-white p-8">
          <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <i class="fa-solid fa-leaf text-xl text-gray-600"></i>
          </div>
          <h2 class="font-serif font-bold text-3xl text-gray-900 mb-4">Chất liệu bền vững</h2>
          <p class="text-gray-600 leading-relaxed text-sm">
            100% nguyên liệu của CLOSET được tuyển chọn từ những nhà cung cấp đạt chuẩn sinh thái. Chúng tôi ưu tiên Organic Cotton, Linen, và len Merino không chỉ vì trải nghiệm trên da tuyệt vời mà còn vì trách nhiệm với môi trường.
          </p>
        </div>

        <!-- Section 2 -->
        <div class="bg-white p-8">
          <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <i class="fa-solid fa-scissors text-xl text-gray-600"></i>
          </div>
          <h2 class="font-serif font-bold text-3xl text-gray-900 mb-4">Thiết kế vượt thời gian</h2>
          <p class="text-gray-600 leading-relaxed text-sm">
            Mỗi thiết kế của chúng tôi đều ra đời với mục tiêu: Có thể mặc trong 10 năm tới mà không hề lỗi mốt. Bảng màu trung tính và đường cắt may tối giản chính là ngôn ngữ thời trang mà CLOSET theo đuổi.
          </p>
        </div>

        <!-- Section 3 -->
        <div class="bg-white p-8">
          <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <i class="fa-solid fa-handshake text-xl text-gray-600"></i>
          </div>
          <h2 class="font-serif font-bold text-3xl text-gray-900 mb-4">Mức giá trung thực</h2>
          <p class="text-gray-600 leading-relaxed text-sm">
            Thay vì tốn chi phí cho những chiến dịch quảng cáo rầm rộ hay những mặt bằng đắt đỏ, chúng tôi dồn toàn bộ chi phí vào việc nâng cao chất lượng sản phẩm. Đó là lý do bạn có được chất lượng của những thương hiệu cao cấp với mức giá dễ tiếp cận.
          </p>
        </div>

      </div>

      <!-- CTA -->
      <div class="py-16 px-6 text-center bg-black mt-1">
        <h2 class="font-serif italic font-bold text-3xl text-white mb-6">Trải nghiệm sự khác biệt</h2>
        <a routerLink="/catalog" class="inline-block px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
          Khám phá sản phẩm
        </a>
      </div>

    </div>
  `
})
export class BrandComponent {}
