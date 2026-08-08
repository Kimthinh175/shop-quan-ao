import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-black text-gray-900 uppercase tracking-widest">Đơn hàng</h2>
      </div>

      <!-- Search bar -->
      <div class="flex gap-2 mb-4">
        <input type="text" [(ngModel)]="search" placeholder="Tìm mã, tên, số điện thoại..." 
               class="flex-1 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-black transition-colors">
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-300"></i>
      </div>

      <div *ngIf="!loading" class="space-y-4">
        <!-- Order Card -->
        <div *ngFor="let order of filteredOrders" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
            <div>
              <span class="text-xs font-bold text-blue-600 mr-2">#{{ getShortId(order._id) }}</span>
              <span class="text-[10px] text-gray-400">{{ order.createdAt | date:'dd/MM HH:mm' }}</span>
            </div>
            <span class="inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest"
                  [ngClass]="getStatusClass(order.status)">
              {{ order.status }}
            </span>
          </div>
          
          <div class="flex justify-between items-center mb-4">
            <div>
              <div class="text-sm font-black text-gray-900">{{ order.receiver_name }}</div>
              <div class="text-[10px] text-gray-500">{{ order.receiver_phone }}</div>
            </div>
            <div class="text-right">
              <div class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Tổng tiền</div>
              <div class="text-sm font-black text-gray-900">{{ order.total_amount | currency:'VND':'symbol':'1.0-0' }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <select [ngModel]="order.status" (ngModelChange)="updateStatus(order._id, $event)" 
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-black bg-gray-50 transition-colors">
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
              <option value="SHIPPING">Đang giao (SHIPPING)</option>
              <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>
        </div>

        <div *ngIf="filteredOrders.length === 0" class="bg-white p-8 rounded-2xl text-center text-gray-500 text-sm shadow-sm border border-gray-100">
          Không tìm thấy đơn hàng nào.
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private http = inject(HttpClient);
  
  orders: any[] = [];
  search: string = '';
  loading = true;

  get filteredOrders() {
    if (!this.search) return this.orders;
    const s = this.search.toLowerCase();
    return this.orders.filter(o => 
      o._id.toLowerCase().includes(s) || 
      o.receiver_name.toLowerCase().includes(s) || 
      o.receiver_phone.includes(s)
    );
  }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading = true;
    this.http.get('/api/orders').subscribe({
      next: (res: any) => {
        this.orders = res.data || res.orders || res;
        this.loading = false;
      },
      error: () => {
        // Fallback demo data
        this.orders = [
          { _id: 'ORD123456', receiver_name: 'Nguyen Van A', receiver_phone: '0901234567', total_amount: 1250000, status: 'PENDING', createdAt: new Date() },
          { _id: 'ORD654321', receiver_name: 'Tran Thi B', receiver_phone: '0912345678', total_amount: 3450000, status: 'CONFIRMED', createdAt: new Date(Date.now() - 86400000) },
          { _id: 'ORD789012', receiver_name: 'Le Van C', receiver_phone: '0987654321', total_amount: 650000, status: 'SHIPPING', createdAt: new Date(Date.now() - 172800000) },
          { _id: 'ORD345678', receiver_name: 'Pham Thi D', receiver_phone: '0934567890', total_amount: 890000, status: 'COMPLETED', createdAt: new Date(Date.now() - 259200000) },
        ];
        this.loading = false;
      }
    });
  }

  updateStatus(id: string, newStatus: string) {
    const order = this.orders.find(o => o._id === id);
    if (!order) return;
    
    const oldStatus = order.status;
    if (oldStatus === newStatus) return;

    // Lấy tên trạng thái tiếng Việt
    const getStatusName = (st: string) => {
      switch(st) {
        case 'PENDING': return 'Chờ xử lý';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPING': return 'Đang giao';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        default: return st;
      }
    };

    // Kiểm tra logic nghiệp vụ cơ bản
    if (oldStatus === 'COMPLETED') {
      alert('Đơn hàng đã hoàn thành, không thể thay đổi trạng thái!');
      setTimeout(() => order.status = oldStatus, 0); // Revert UI
      return;
    }
    if (oldStatus === 'CANCELLED') {
      alert('Đơn hàng đã hủy, không thể thay đổi trạng thái!');
      setTimeout(() => order.status = oldStatus, 0); // Revert UI
      return;
    }

    if (!confirm(`Bạn có chắc muốn chuyển đơn hàng #${this.getShortId(id)} sang trạng thái "${getStatusName(newStatus)}"?`)) {
      setTimeout(() => order.status = oldStatus, 0); // Revert UI
      return;
    }

    // Optimistic update
    order.status = newStatus;
    
    // API Call
    this.http.put(`/api/orders/${id}/status`, { status: newStatus }).subscribe({
      next: () => {
        // success
      },
      error: (err) => {
        alert(err.error?.message || 'Cập nhật trạng thái thất bại!');
        order.status = oldStatus; // Revert on failure
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-amber-100 text-amber-600';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600';
      case 'SHIPPING': return 'bg-indigo-100 text-indigo-600';
      case 'COMPLETED': return 'bg-green-100 text-green-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.toString().slice(-6).toUpperCase();
  }
}
