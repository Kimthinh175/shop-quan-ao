import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';
import { PromotionService } from '../../services/promotion.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen pb-[200px]">
      <!-- Header -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between sticky top-14 bg-white/90 backdrop-blur z-40">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="text-gray-800 hover:text-blue-600">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h1 class="font-bold text-lg uppercase tracking-wider text-gray-800">Thanh toán</h1>
        </div>
      </div>

      <div class="p-4 space-y-4">
        
        <!-- Order Summary (Accordion style) -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="flex justify-between items-center cursor-pointer" (click)="isSummaryOpen = !isSummaryOpen">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900">
              Đơn hàng ({{ totalCount }} SP)
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-blue-600">{{ totalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
              <i class="fa-solid fa-chevron-down text-gray-400 transition-transform" [class.rotate-180]="isSummaryOpen"></i>
            </div>
          </div>
          
          <div *ngIf="isSummaryOpen" class="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div *ngFor="let item of items" class="flex items-center gap-3">
              <div class="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img [src]="item.image || 'https://via.placeholder.com/150'" class="w-full h-full object-cover">
                <span class="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {{ item.quantity }}
                </span>
              </div>
              <div class="flex-1">
                <h4 class="text-xs font-bold text-gray-900 uppercase line-clamp-1">{{ item.name }}</h4>
                <p class="text-[10px] text-gray-500 uppercase">{{ item.color }} <span *ngIf="item.size">/ {{ item.size }}</span></p>
              </div>
              <span class="text-xs font-bold">{{ (item.price * item.quantity) | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Info Form -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">Thông tin giao hàng</h2>
          
          <div class="space-y-4">
            <div>
              <input type="text" [(ngModel)]="orderData.customerName" placeholder="Họ và tên" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
            </div>
            <div>
              <input type="tel" [(ngModel)]="orderData.phone" placeholder="Số điện thoại" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
            </div>
            <div>
              <input type="text" [(ngModel)]="orderData.address" placeholder="Địa chỉ giao hàng (Số nhà, Đường...)" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
            </div>
            <div>
              <textarea [(ngModel)]="orderData.note" rows="2" placeholder="Ghi chú (Tùy chọn)" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium resize-none"></textarea>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Phương thức thanh toán</h2>
          
          <div class="space-y-3">
            <label class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors"
                   [ngClass]="orderData.paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [ngClass]="orderData.paymentMethod === 'COD' ? 'border-black' : 'border-gray-300'">
                <div *ngIf="orderData.paymentMethod === 'COD'" class="w-2.5 h-2.5 bg-black rounded-full"></div>
              </div>
              <input type="radio" name="payment" value="COD" [(ngModel)]="orderData.paymentMethod" class="hidden">
              <span class="text-sm font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</span>
            </label>

            <label class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors"
                   [ngClass]="orderData.paymentMethod === 'BANK' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [ngClass]="orderData.paymentMethod === 'BANK' ? 'border-black' : 'border-gray-300'">
                <div *ngIf="orderData.paymentMethod === 'BANK'" class="w-2.5 h-2.5 bg-black rounded-full"></div>
              </div>
              <input type="radio" name="payment" value="BANK" [(ngModel)]="orderData.paymentMethod" class="hidden">
              <span class="text-sm font-bold text-gray-900">Chuyển khoản ngân hàng</span>
            </label>
          </div>
        </div>

      </div>

      <!-- Submit Fixed Bottom -->
      <div class="fixed bottom-[65px] w-full md:w-[480px] bg-white border-t border-gray-100 pt-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <!-- Summary -->
        <div class="px-4 py-4 bg-gray-50 border-t border-gray-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-gray-500">Tạm tính ({{ totalCount }} SP)</span>
            <span *ngIf="originalTotalPrice > totalPrice" class="text-xs text-gray-400 line-through mr-2">
              {{ originalTotalPrice | currency:'VND':'symbol':'1.0-0' }}
            </span>
            <span class="text-sm font-bold">{{ totalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs text-gray-500">Phí vận chuyển</span>
            <span class="text-sm font-bold text-green-600">Miễn phí</span>
          </div>
          <div class="h-px w-full bg-gray-200 mb-4"></div>
          <div class="flex justify-between items-end">
            <span class="text-sm font-bold uppercase tracking-widest text-gray-800">Tổng cộng</span>
            <span class="text-2xl font-black text-gray-900">{{ totalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
        </div>
        <div class="p-4 pb-safe">
          <button (click)="placeOrder()" [disabled]="submitting || !isValid()" 
                  class="w-full flex items-center justify-center h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed">
            <span *ngIf="!submitting">Hoàn tất đặt hàng</span>
            <i *ngIf="submitting" class="fa-solid fa-spinner fa-spin text-xl"></i>
          </button>
        </div>
      </div>

    </div>
  `
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private promoService = inject(PromotionService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  items: CartItem[] = [];
  totalPrice = 0;
  originalTotalPrice = 0;
  totalCount = 0;
  
  isSummaryOpen = false;
  submitting = false;
  isBuyNow = false;

  orderData = {
    customerName: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD'
  };

  ngOnInit() {
    const buyNow = this.cartService.getBuyNowItem();
    if (buyNow) {
      this.isBuyNow = true;
      this.processItems([buyNow]);
    } else {
      this.cartService.cart$.subscribe(items => {
        if (!this.isBuyNow) {
          if (items.length === 0 && !this.submitting) {
            this.router.navigate(['/cart']); // redirect if empty
            return;
          }
          this.processItems(items);
        }
      });
    }
  }

  processItems(rawItems: CartItem[]) {
    this.promoService.loadActivePromotions().subscribe(() => {
      this.items = rawItems.map(item => item); // Currently cart assumes price is already updated, but we could reapply here
      this.totalPrice = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      this.originalTotalPrice = this.items.reduce((acc, item) => acc + ((item as any).original_price || item.price) * item.quantity, 0);
      this.totalCount = this.items.reduce((acc, item) => acc + item.quantity, 0);
    });
  }

  isValid(): boolean {
    return !!(this.orderData.customerName.trim() && this.orderData.phone.trim() && this.orderData.address.trim());
  }

  placeOrder() {
    if (!this.isValid()) return alert('Vui lòng điền đủ thông tin giao hàng!');
    if (!this.auth.isLoggedIn()) {
      alert('Vui lòng đăng nhập để thanh toán');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    
    this.submitting = true;

    const payload = {
      total_price: this.totalPrice,
      total_amount: this.totalPrice,
      receiver_name: this.orderData.customerName,
      receiver_phone: this.orderData.phone,
      receiver_address: this.orderData.address,
      note: this.orderData.note,
      payment_method: this.orderData.paymentMethod,
      items: this.items.map(item => ({
        product_id: item.product_id,
        product_variant_id: item.variant_id || item.product_id,
        variant_id: item.variant_id,
        name: item.name,
        color: item.color,
        size: item.size,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      }))
    };

    this.api.createOrder(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (this.isBuyNow) {
          this.cartService.clearBuyNowItem();
        } else {
          this.cartService.clearCart();
        }
        const orderId = res.order?._id || res._id || Math.floor(100000 + Math.random() * 900000);
        
        if (res.payos_link && this.orderData.paymentMethod === 'TRANSFER') {
          window.location.href = res.payos_link;
        } else {
          this.router.navigate(['/order-complete'], { queryParams: { orderId } });
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
        console.error(err);
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
