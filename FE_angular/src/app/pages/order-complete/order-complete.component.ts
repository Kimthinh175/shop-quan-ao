import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-complete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.5s_ease-out]">
      
      <!-- Success Icon -->
      <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 text-white text-3xl">
          <i class="fa-solid fa-check"></i>
        </div>
      </div>

      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-widest mb-2">Đặt hàng thành công</h1>
      <p class="text-gray-500 text-sm mb-8">Cảm ơn bạn đã mua sắm tại CLOSET. Đơn hàng của bạn sẽ sớm được xử lý và giao đến tận nơi.</p>

      <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 w-full max-w-sm mb-10">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
        <p class="text-lg font-black text-blue-600">{{ orderId || 'N/A' }}</p>
      </div>

      <div class="w-full max-w-sm flex flex-col gap-3">
        <button class="w-full h-14 border border-gray-200 text-gray-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:border-black transition-colors">
          Xem chi tiết đơn hàng
        </button>
        <a routerLink="/catalog" class="w-full flex items-center justify-center h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
          Tiếp tục mua sắm
        </a>
      </div>
      
    </div>
  `
})
export class OrderCompleteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  orderId = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
    });
  }
}
