import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen pb-[100px]">
      <!-- App Header -->
      <div class="p-4 bg-white flex items-center justify-between sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-black transition-colors">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <h1 class="font-black text-base uppercase tracking-wider text-gray-900">Lịch sử đơn hàng</h1>
        </div>
        <span class="text-xs font-bold text-gray-400" *ngIf="orders.length > 0">{{ orders.length }} đơn hàng</span>
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-20 text-gray-400">
        <i class="fa-solid fa-box-open text-5xl mb-4 text-gray-200"></i>
        <p class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Chưa có đơn hàng nào</p>
        <a routerLink="/catalog" class="inline-block px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors">Mua sắm ngay</a>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="p-4 space-y-4 animate-[fadeIn_0.3s_ease-out]">
        <div *ngFor="let order of orders" 
             (click)="viewOrderDetail(order)"
             class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-black/30 hover:shadow-md transition-all active:scale-[0.99]">
          
          <!-- Order Header -->
          <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Mã đơn hàng</span>
              <span class="text-sm font-black text-blue-600 font-mono">#{{ order._id }}</span>
            </div>
            <div class="text-right">
              <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    [ngClass]="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
              <p class="text-[10px] text-gray-400 mt-1">{{ (order.createdAt || order.create_at) | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
          
          <!-- Order Items Preview -->
          <div class="space-y-2.5 mb-3">
            <div *ngFor="let item of (order.items || [])" 
                 (click)="goToProductDetail(item, $event)"
                 class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 group-hover:border-black transition-colors">
                <img [src]="getItemImage(item)" [alt]="getItemName(item)" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ getItemName(item) }}</h4>
                <p class="text-[10px] text-gray-500">Phân loại: {{ getItemColor(item) }} / {{ getItemSize(item) }}</p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-xs font-bold text-gray-900">{{ getItemPrice(item) | currency:'VND':'symbol':'1.0-0' }}</span>
                <p class="text-[10px] text-gray-400 font-bold">x{{ getItemQty(item) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Order Footer -->
          <div class="flex justify-between items-center pt-3 border-t border-gray-100">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <i class="fa-regular fa-eye"></i> Nhấn để xem chi tiết đơn
            </span>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Tổng tiền</span>
              <span class="text-base font-black text-gray-900">{{ (order.total_amount || order.total_price) | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Detail Modal -->
      <div *ngIf="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
        <div class="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl relative">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Chi tiết đơn hàng</span>
              <h3 class="text-base font-black text-blue-600 font-mono">#{{ selectedOrder._id }}</h3>
            </div>
            <button (click)="selectedOrder = null" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- Status & Date -->
          <div class="bg-gray-50 rounded-2xl p-3.5 mb-4 border border-gray-100 flex justify-between items-center">
            <div>
              <span class="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Trạng thái</span>
              <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5"
                    [ngClass]="getStatusClass(selectedOrder.status)">
                {{ getStatusText(selectedOrder.status) }}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Ngày đặt</span>
              <span class="text-xs font-bold text-gray-800">{{ (selectedOrder.createdAt || selectedOrder.create_at) | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>

          <!-- Receiver Info -->
          <div class="bg-gray-50 rounded-2xl p-3.5 mb-4 border border-gray-100 space-y-1.5 text-xs">
            <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Thông tin giao hàng</h4>
            <p class="font-bold text-gray-900 flex items-center gap-2">
              <i class="fa-solid fa-user text-gray-400 text-xs"></i> {{ selectedOrder.receiver_name || selectedOrder.customer_id?.full_name || 'Khách hàng' }}
            </p>
            <p class="text-gray-600 flex items-center gap-2">
              <i class="fa-solid fa-phone text-gray-400 text-xs"></i> {{ selectedOrder.receiver_phone || selectedOrder.customer_id?.phone || '---' }}
            </p>
            <p class="text-gray-600 flex items-start gap-2 leading-relaxed">
              <i class="fa-solid fa-location-dot text-gray-400 text-xs mt-0.5 shrink-0"></i> {{ selectedOrder.receiver_address || '---' }}
            </p>
            <p *ngIf="selectedOrder.note" class="text-amber-600 italic text-[11px] pt-1">
              Ghi chú: "{{ selectedOrder.note }}"
            </p>
          </div>

          <!-- Order Items List -->
          <div class="space-y-2.5 mb-4">
            <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-400">Danh sách sản phẩm ({{ selectedOrder.items?.length || 0 }})</h4>
            
            <div *ngFor="let item of (selectedOrder.items || [])" 
                 (click)="goToProductDetail(item, $event)"
                 class="flex flex-col gap-2 p-2.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-black cursor-pointer transition-all active:scale-[0.98] group"
                 title="Nhấn để xem chi tiết sản phẩm">
              
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-200 group-hover:border-black transition-colors">
                  <img [src]="getItemImage(item)" [alt]="getItemName(item)" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ getItemName(item) }}</h5>
                  <p class="text-[10px] text-gray-500 mt-0.5">Phân loại: {{ getItemColor(item) }} / {{ getItemSize(item) }}</p>
                  <span class="text-xs font-black text-gray-900 mt-1 block">{{ getItemPrice(item) | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
                <div class="text-right shrink-0 flex flex-col items-end gap-1">
                  <span class="text-xs font-extrabold text-gray-500">x{{ getItemQty(item) }}</span>
                  <span class="text-[9px] font-bold text-blue-600 uppercase tracking-wider group-hover:underline">Xem mẫu <i class="fa-solid fa-chevron-right text-[7px]"></i></span>
                </div>
              </div>
              
              <!-- Nút đánh giá -->
              <div *ngIf="selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DA_GIAO' || selectedOrder.status === 'HOAN_THANH'" class="border-t border-gray-100 pt-2 mt-1">
                <button *ngIf="!myReviewedItemIds.has(item._id || item.order_item_id)"
                        (click)="openReviewModal(item, $event)"
                        class="w-full py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors">
                  <i class="fa-solid fa-star text-yellow-400 mr-1"></i> Đánh giá sản phẩm
                </button>
                <div *ngIf="myReviewedItemIds.has(item._id || item.order_item_id)" 
                     class="w-full text-center py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  <i class="fa-solid fa-check text-green-500 mr-1"></i> Đã đánh giá
                </div>
              </div>

            </div>
          </div>

          <!-- Payment Summary -->
          <div class="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <div class="flex justify-between text-gray-500">
              <span>Phương thức thanh toán</span>
              <span class="font-bold text-gray-900">{{ selectedOrder.payment_method || 'COD' }}</span>
            </div>
            <div class="flex justify-between text-gray-500">
              <span>Trạng thái thanh toán</span>
              <span class="font-bold" [ngClass]="selectedOrder.payment_status === 'PAID' ? 'text-green-600' : 'text-amber-600'">
                {{ selectedOrder.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
              </span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-sm font-black text-gray-900">
              <span>Tổng thanh toán</span>
              <span class="text-base text-blue-600">{{ (selectedOrder.total_amount || selectedOrder.total_price) | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <button (click)="selectedOrder = null" class="w-full mt-5 py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
            Đóng
          </button>
        </div>
      </div>

      <!-- Review Modal -->
      <div *ngIf="reviewModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
        <div class="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl relative">
          <div class="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
            <h3 class="text-base font-black text-gray-900 uppercase tracking-widest">Đánh giá sản phẩm</h3>
            <button (click)="closeReviewModal()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- Stars -->
          <div class="flex justify-center gap-2 mb-4">
            <button *ngFor="let star of [1,2,3,4,5]" 
                    (click)="setRating(star)"
                    class="text-3xl transition-transform hover:scale-110"
                    [ngClass]="star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'">
              <i class="fa-solid fa-star"></i>
            </button>
          </div>

          <!-- Content -->
          <textarea [(ngModel)]="reviewForm.content" 
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                    rows="3"
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition-colors mb-3"></textarea>
          
          <!-- Image Upload -->
          <div class="mb-4">
            <label class="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-widest">Hình ảnh thực tế (Tối đa 5)</label>
            <div class="flex flex-wrap gap-2">
              <div *ngFor="let img of reviewForm.images; let i = index" class="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 relative group">
                <img [src]="img" class="w-full h-full object-cover">
                <button (click)="removeReviewImage(i)" class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
              
              <label *ngIf="reviewForm.images.length < 5" 
                     class="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors cursor-pointer"
                     [class.opacity-50]="uploadingImages">
                <i *ngIf="!uploadingImages" class="fa-solid fa-camera text-xl mb-1"></i>
                <i *ngIf="uploadingImages" class="fa-solid fa-spinner fa-spin text-xl mb-1"></i>
                <input type="file" multiple accept="image/*" class="hidden" (change)="onReviewImagesSelected($event)" [disabled]="uploadingImages">
              </label>
            </div>
          </div>

          <button (click)="submitReview()" 
                  [disabled]="submittingReview || uploadingImages"
                  class="w-full py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <i *ngIf="submittingReview" class="fa-solid fa-spinner fa-spin mr-2"></i> 
            {{ submittingReview ? 'Đang gửi...' : 'Gửi đánh giá' }}
          </button>
        </div>
      </div>

    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  selectedOrder: any = null;
  loading = true;

  private api = inject(ApiService);
  private router = inject(Router);

  ngOnInit() {
    this.fetchMyReviews();
    this.api.getMyOrders().subscribe({
      next: (res: any) => {
        this.orders = res.data || res.orders || (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewOrderDetail(order: any) {
    this.selectedOrder = order;
  }

  goToProductDetail(item: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const productId = item.variant_snapshot?.product_id || 
                      item.product_variant_id?.product_id?._id || 
                      item.product_variant_id?.product_id || 
                      item.product_id ||
                      item.id ||
                      1;

    this.selectedOrder = null;
    this.router.navigate(['/product', productId]);
  }

  getItemImage(item: any): string {
    if (item.variant_snapshot?.main_img) return item.variant_snapshot.main_img;
    if (item.product_variant_id?.product_id?.main_img) return item.product_variant_id.product_id.main_img;
    if (item.image || item.main_img) return item.image || item.main_img;
    return 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=400';
  }

  getItemName(item: any): string {
    return item.variant_snapshot?.name || item.product_variant_id?.product_id?.name || item.name || 'Sản phẩm CLOSET';
  }

  getItemColor(item: any): string {
    return item.variant_snapshot?.color || item.product_variant_id?.color || item.color || 'Default';
  }

  getItemSize(item: any): string {
    return item.variant_snapshot?.size || item.product_variant_id?.size || item.size || 'M';
  }

  getItemPrice(item: any): number {
    return item.unit_price || item.price || 0;
  }

  getItemQty(item: any): number {
    return item.total_quantity || item.quantity || 1;
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    switch(s) {
      case 'PENDING': case 'CHO_DUYET': return 'bg-amber-100 text-amber-600';
      case 'CONFIRMED': case 'DA_DUYET': return 'bg-blue-100 text-blue-600';
      case 'SHIPPING': case 'DANG_GIAO': return 'bg-indigo-100 text-indigo-600';
      case 'COMPLETED': case 'DA_GIAO': case 'HOAN_THANH': return 'bg-green-100 text-green-600';
      case 'CANCELLED': case 'DA_HUY': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusText(status: string): string {
    const s = (status || '').toUpperCase();
    switch(s) {
      case 'PENDING': return 'Chờ duyệt';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status || 'Đang xử lý';
    }
  }

  // --- Review Logic ---
  myReviewedItemIds: Set<number> = new Set();
  reviewModalOpen = false;
  submittingReview = false;
  uploadingImages = false;
  reviewForm = {
    order_item_id: null as number | null,
    product_id: null as number | null,
    rating: 5,
    content: '',
    images: [] as string[]
  };

  fetchMyReviews() {
    this.api.getMyReviews().subscribe({
      next: (res: any) => {
        const reviews = res.results || res.data?.results || res.docs || res.data?.docs || res.data || res.reviews || [];
        this.myReviewedItemIds = new Set(reviews.map((r: any) => r.order_item_id));
      },
      error: () => {}
    });
  }

  openReviewModal(item: any, event: Event) {
    event.stopPropagation();
    const productId = item.variant_snapshot?.product_id || 
                      item.product_variant_id?.product_id?._id || 
                      item.product_variant_id?.product_id || 
                      item.product_id ||
                      item.id;
                      
    this.reviewForm = {
      order_item_id: item._id || item.order_item_id,
      product_id: productId,
      rating: 5,
      content: '',
      images: []
    };
    this.reviewModalOpen = true;
  }

  closeReviewModal() {
    this.reviewModalOpen = false;
  }

  setRating(star: number) {
    this.reviewForm.rating = star;
  }

  async onReviewImagesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    if (this.reviewForm.images.length + files.length > 5) {
      alert('Bạn chỉ được upload tối đa 5 ảnh!');
      return;
    }

    this.uploadingImages = true;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res: any = await this.api.uploadImage(file).toPromise();
        if (res?.url) {
          this.reviewForm.images.push(res.url);
        }
      }
    } catch (error) {
      alert('Upload ảnh thất bại!');
    } finally {
      this.uploadingImages = false;
      event.target.value = '';
    }
  }

  removeReviewImage(index: number) {
    this.reviewForm.images.splice(index, 1);
  }

  submitReview() {
    if (!this.reviewForm.content.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    this.submittingReview = true;
    this.api.createReview(this.reviewForm).subscribe({
      next: () => {
        alert('Đánh giá sản phẩm thành công!');
        if (this.reviewForm.order_item_id) {
          this.myReviewedItemIds.add(this.reviewForm.order_item_id);
        }
        this.closeReviewModal();
        this.submittingReview = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Có lỗi xảy ra khi gửi đánh giá!');
        this.submittingReview = false;
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
