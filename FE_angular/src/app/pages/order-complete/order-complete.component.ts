import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-complete',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  template: `
    <div class="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.5s_ease-out]">
      
      <!-- Loading State -->
      <div *ngIf="loadingPage" class="flex flex-col items-center justify-center">
         <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300 mb-4"></i>
         <p class="text-sm text-gray-500 font-medium">Đang kiểm tra đơn hàng...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loadingPage && (orderNotFound || orderForbidden)" class="flex flex-col items-center justify-center w-full max-w-sm">
        <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <i class="fa-solid fa-triangle-exclamation text-3xl text-red-500"></i>
        </div>
        <h1 class="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">Đơn hàng không tồn tại</h1>
        <p class="text-gray-500 text-sm mb-8">
          {{ orderForbidden ? 'Bạn không có quyền xem thông tin đơn hàng này.' : 'Không tìm thấy thông tin đơn hàng yêu cầu.' }}
        </p>
        <a routerLink="/catalog" class="w-full flex items-center justify-center h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
          Tiếp tục mua sắm
        </a>
      </div>

      <!-- Success State -->
      <ng-container *ngIf="!loadingPage && !orderNotFound && !orderForbidden">
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
          <button (click)="showDetails = !showDetails" class="w-full h-14 border border-gray-200 text-gray-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:border-black transition-colors flex items-center justify-center gap-2">
            <span>Xem chi tiết đơn hàng</span>
            <i class="fa-solid" [class.fa-chevron-down]="!showDetails" [class.fa-chevron-up]="showDetails"></i>
          </button>

          <!-- Order Details Area -->
          <div *ngIf="showDetails" class="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left animate-[fadeIn_0.3s_ease-out]">
             <div class="space-y-3">
               <div *ngFor="let item of orderItems" class="flex items-start gap-3 border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                 <!-- Product Image -->
                 <div class="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100">
                   <img [src]="item.variant_snapshot?.main_img || 'https://via.placeholder.com/150'" class="w-full h-full object-cover">
                 </div>
                 <div class="flex-1">
                   <div class="text-xs font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{{ item.variant_snapshot?.name || 'Sản phẩm' }}</div>
                   <div class="text-[10px] text-gray-500 mb-1 font-medium">Màu: {{ item.variant_snapshot?.color || 'N/A' }} - Size: {{ item.variant_snapshot?.size || 'N/A' }}</div>
                   <div class="flex justify-between items-center">
                     <span class="text-[10px] font-bold text-gray-400">SL: {{ item.total_quantity }}</span>
                     <span class="text-xs font-black text-blue-600">{{ item.unit_price | currency:'VND':'symbol':'1.0-0' }}</span>
                   </div>
                 </div>
               </div>
               
               <!-- Totals -->
               <div class="pt-3 border-t border-gray-200 space-y-2">
                 <div class="flex justify-between text-[11px]">
                   <span class="text-gray-500">Người nhận</span>
                   <span class="font-bold text-gray-900">{{ orderData.receiver_name }} - {{ orderData.receiver_phone }}</span>
                 </div>
                 <div class="flex justify-between text-[11px] items-start">
                   <span class="text-gray-500 mt-0.5">Địa chỉ</span>
                   <span class="font-bold text-gray-900 text-right max-w-[200px] leading-tight">{{ orderData.receiver_address }}</span>
                 </div>
                 <div class="flex justify-between text-[11px]">
                   <span class="text-gray-500">Thanh toán</span>
                   <span class="font-bold text-gray-900">{{ orderData.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : (orderData.payment_method === 'TRANSFER' ? 'Chuyển khoản' : orderData.payment_method) }}</span>
                 </div>
                 <div *ngIf="orderData.discount_amount > 0" class="flex justify-between text-[11px]">
                   <span class="text-gray-500">Giảm giá</span>
                   <span class="font-bold text-green-600">-{{ orderData.discount_amount | currency:'VND':'symbol':'1.0-0' }}</span>
                 </div>
                 <div class="flex justify-between text-xs mt-2 pt-2 border-t border-gray-200">
                   <span class="font-bold text-gray-900">Tổng cộng</span>
                   <span class="font-black text-blue-600 text-sm">{{ orderData.total_amount | currency:'VND':'symbol':'1.0-0' }}</span>
                 </div>
               </div>
             </div>
          </div>

          <a routerLink="/catalog" class="w-full flex items-center justify-center h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
            Tiếp tục mua sắm
          </a>
        </div>
      </ng-container>
    </div>
  `
})
export class OrderCompleteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  orderId = '';
  showDetails = false;
  
  loadingPage = true;
  orderNotFound = false;
  orderForbidden = false;

  orderData: any = null;
  orderItems: any[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.fetchOrderDetails();
      } else {
        this.orderNotFound = true;
        this.loadingPage = false;
      }
    });
  }

  fetchOrderDetails() {
    this.loadingPage = true;
    this.http.get(`/api/orders/${this.orderId}`, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.loadingPage = false;
        if (res.order) {
          this.orderData = res.order;
          this.orderItems = res.items || [];
        } else {
          this.orderNotFound = true;
        }
      },
      error: (err) => {
        this.loadingPage = false;
        if (err.status === 403) {
          this.orderForbidden = true;
        } else {
          this.orderNotFound = true;
        }
      }
    });
  }
}
