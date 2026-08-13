import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
          <div class="flex flex-wrap items-center justify-between mb-5 gap-2">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900">Thông tin giao hàng</h2>
            <button *ngIf="userAddresses.length > 1" (click)="showAddressModal = true" class="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">
              Chọn ĐC khác
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <input type="text" [(ngModel)]="orderData.customerName" placeholder="Họ và tên" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
            </div>
            
            <!-- Phân cấp hành chính mới -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tỉnh / Thành phố *</label>
                <select [(ngModel)]="selectedProvinceId" (change)="onProvinceChange()"
                        class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all cursor-pointer">
                  <option [value]="null">-- Chọn Tỉnh / Thành phố --</option>
                  <option *ngFor="let p of provinces" [value]="p.ProvinceID">{{ p.ProvinceName }}</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Quận/Huyện/TP/TX *</label>
                <select [(ngModel)]="selectedDistrictId" (change)="onDistrictChange()" [disabled]="!selectedProvinceId"
                        class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <option [value]="null">-- Chọn Quận / Huyện --</option>
                  <option *ngFor="let d of districts" [value]="d.DistrictID">{{ d.DistrictName }}</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Phường/Xã/TT *</label>
                <select [(ngModel)]="selectedWardCode" (change)="onWardChange()" [disabled]="!selectedDistrictId"
                        class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <option [value]="null">-- Chọn Phường / Xã --</option>
                  <option *ngFor="let w of wards" [value]="w.WardCode">{{ w.WardName }}</option>
                </select>
              </div>
            </div>
            
            <div>
              <input type="text" [(ngModel)]="orderData.address" placeholder="Địa chỉ giao hàng (Số nhà, Đường, Phường, Quận, Tỉnh...)" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium">
            </div>
            <div>
              <textarea [(ngModel)]="orderData.note" rows="2" placeholder="Ghi chú (Tùy chọn)" class="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium resize-none"></textarea>
            </div>
          </div>

          <div *ngIf="showSaveAddressBtn" class="mt-4 pt-4 border-t border-gray-100 animate-[fadeIn_0.3s_ease-out]">
            <button (click)="saveAddress()" [disabled]="savingAddress" class="w-full sm:w-auto px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50">
               <i *ngIf="!savingAddress" class="fa-solid fa-floppy-disk mr-1.5"></i>
               <i *ngIf="savingAddress" class="fa-solid fa-spinner fa-spin mr-1.5"></i>
               Lưu địa chỉ này vào sổ
            </button>
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

    <!-- Address Modal -->
    <div *ngIf="showAddressModal" class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 overflow-hidden flex flex-col max-h-[80vh] animate-[slideUp_0.3s_ease-out] sm:animate-[zoomIn_0.2s_ease-out]">
        <div class="flex justify-between items-center mb-4 shrink-0">
          <h3 class="text-base font-black uppercase tracking-widest">Chọn địa chỉ</h3>
          <button (click)="showAddressModal = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 space-y-3 pb-safe">
          <div *ngFor="let addr of userAddresses" 
               (click)="selectAddress(addr)"
               class="p-4 border rounded-2xl cursor-pointer hover:border-black transition-colors"
               [ngClass]="isSelectedAddress(addr) ? 'border-black bg-gray-50' : 'border-gray-100'">
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                   [ngClass]="isSelectedAddress(addr) ? 'border-black' : 'border-gray-300'">
                <div *ngIf="isSelectedAddress(addr)" class="w-2.5 h-2.5 bg-black rounded-full"></div>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-bold text-gray-900">{{ addr.recipient_name }}</span>
                  <span *ngIf="addr.is_default" class="text-[9px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded uppercase tracking-wider">Mặc định</span>
                </div>
                <div class="text-xs text-gray-500 mb-1"><i class="fa-solid fa-phone mr-1.5"></i>{{ addr.phone }}</div>
                <div class="text-xs text-gray-500 leading-relaxed"><i class="fa-solid fa-location-dot mr-1.5"></i>{{ formatAddress(addr) }}</div>
              </div>
            </div>
          </div>
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
  private http = inject(HttpClient);

  items: CartItem[] = [];
  totalPrice = 0;
  originalTotalPrice = 0;
  totalCount = 0;
  
  user: any = null;
  submitting = false;
  isBuyNow = false;
  isSummaryOpen = false;

  userAddresses: any[] = [];
  showAddressModal = false;
  savingAddress = false;

  ghnToken = 'd32ad384-5f5e-11f1-a973-aee5264794df';
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  selectedProvinceId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedWardCode: string | null = null;

  orderData = {
    customerName: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD'
  };

  lastAppendedAddress: string = '';

  ngOnInit() {
    this.loadProvinces();

    this.auth.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.orderData.customerName = user.full_name || user.name || '';
        this.orderData.phone = user.phone || '';
        
        // Lấy danh sách địa chỉ từ API
        this.http.get<any>('/api/customers/me/addresses', { withCredentials: true }).subscribe({
          next: (res) => {
            const addrs = res.data || res.addresses || (Array.isArray(res) ? res : []);
            if (addrs && addrs.length > 0) {
              this.userAddresses = addrs;
              const defaultAddress = addrs.find((a: any) => a.is_default) || addrs[0];
              this.selectAddress(defaultAddress);
            }
          },
          error: (err) => {
            console.warn('Lỗi load địa chỉ (có thể chưa có địa chỉ hoặc lỗi CORS):', err);
          }
        });
      }
    });

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

  formatAddress(addr: any): string {
    let result = addr.street_address || '';
    if (addr.ward) result += `, ${addr.ward}`;
    if (addr.district) result += `, ${addr.district}`;
    if (addr.province) result += `, ${addr.province}`;
    return result;
  }

  // ── GHN API CALLS ──
  loadProvinces() {
    fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province', {
      headers: { Token: this.ghnToken }
    })
    .then(r => r.json())
    .then(res => {
      if (res.data) {
        let list = res.data;
        const getSortName = (name: string) => name.replace(/^(Tỉnh|Thành phố)\s+/i, '').trim();
        list.sort((a: any, b: any) => getSortName(a.ProvinceName).localeCompare(getSortName(b.ProvinceName)));
        
        const hn = list.find((p: any) => p.ProvinceName.includes('Hà Nội'));
        const hcm = list.find((p: any) => p.ProvinceName.includes('Hồ Chí Minh'));
        
        list = list.filter((p: any) => !p.ProvinceName.includes('Hà Nội') && !p.ProvinceName.includes('Hồ Chí Minh'));
        if (hn) list.unshift(hn);
        if (hcm) list.unshift(hcm);
        
        this.provinces = list;
      }
    })
    .catch(err => console.error('GHN Province error:', err));
  }

  autoAppendAddress() {
    const p = this.provinces.find(x => x.ProvinceID == this.selectedProvinceId)?.ProvinceName || '';
    const d = this.districts.find(x => x.DistrictID == this.selectedDistrictId)?.DistrictName || '';
    const w = this.wards.find(x => x.WardCode == this.selectedWardCode)?.WardName || '';
    
    const suffix = [w, d, p].filter(Boolean).join(', ');
    if (!suffix) return;

    if (this.orderData.address) {
       // Giữ lại phần số nhà (trước dấu phẩy đầu tiên)
       let street = this.orderData.address.split(',')[0].trim();
       this.orderData.address = street + (street ? ', ' : '') + suffix;
    } else {
       this.orderData.address = suffix;
    }
  }

  onProvinceChange() {
    this.districts = [];
    this.wards = [];
    this.selectedDistrictId = null;
    this.selectedWardCode = null;
    this.autoAppendAddress();

    if (this.selectedProvinceId) {
      fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district', {
        method: 'POST',
        headers: { Token: this.ghnToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ province_id: Number(this.selectedProvinceId) })
      })
      .then(r => r.json())
      .then(res => {
        if (res.data) this.districts = res.data;
      });
    }
  }

  onDistrictChange() {
    this.wards = [];
    this.selectedWardCode = null;
    this.autoAppendAddress();

    if (this.selectedDistrictId) {
      fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=' + this.selectedDistrictId, {
        headers: { Token: this.ghnToken }
      })
      .then(r => r.json())
      .then(res => {
        if (res.data) this.wards = res.data;
      });
    }
  }

  onWardChange() {
    this.autoAppendAddress();
  }

  selectAddress(addr: any) {
    this.orderData.customerName = addr.recipient_name || '';
    this.orderData.phone = addr.phone || '';
    this.orderData.address = this.formatAddress(addr);

    // Xóa lựa chọn cũ ở dropdown vì đã chọn từ sổ
    this.selectedProvinceId = null;
    this.selectedDistrictId = null;
    this.selectedWardCode = null;
    
    this.showAddressModal = false;
  }

  isSelectedAddress(addr: any): boolean {
    return this.orderData.customerName === addr.recipient_name &&
           this.orderData.phone === addr.phone &&
           this.orderData.address === this.formatAddress(addr);
  }

  get showSaveAddressBtn(): boolean {
    if (!this.user) return false;
    if (!this.orderData.customerName || !this.orderData.phone || !this.orderData.address) return false;
    
    // Kiểm tra xem dữ liệu hiện tại có khớp với ĐÚNG địa chỉ nào trong sổ không
    const exists = this.userAddresses.some(a => this.isSelectedAddress(a));
    return !exists;
  }

  saveAddress() {
    this.savingAddress = true;

    const provName = this.provinces.find(p => p.ProvinceID === Number(this.selectedProvinceId))?.ProvinceName || '';
    const distName = this.districts.find(d => d.DistrictID === Number(this.selectedDistrictId))?.DistrictName || '';
    const wardName = this.wards.find(w => w.WardCode === String(this.selectedWardCode))?.WardName || '';

    // Lấy phần street bằng cách bỏ đi phần suffix nếu có (để lưu vào DB chuẩn form)
    let street = this.orderData.address;
    if (this.lastAppendedAddress && street.endsWith(this.lastAppendedAddress)) {
        street = street.substring(0, street.length - this.lastAppendedAddress.length).trim();
        if (street.endsWith(',')) street = street.substring(0, street.length - 1).trim();
    }

    const payload = {
      recipient_name: this.orderData.customerName,
      phone: this.orderData.phone,
      street_address: street || this.orderData.address,
      province: provName,
      district: distName,
      ward: wardName,
      is_default: this.userAddresses.length === 0
    };

    this.http.post('/api/customers/me/addresses', payload, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.savingAddress = false;
        alert('Lưu địa chỉ thành công!');
        this.userAddresses = Array.isArray(res) ? res : (res.data || res.addresses || []);
        // Cập nhật lại list ở auth service
        this.auth.checkAuth(true).subscribe();
      },
      error: () => {
        this.savingAddress = false;
        alert('Không thể lưu địa chỉ. Vui lòng thử lại sau.');
      }
    });
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
