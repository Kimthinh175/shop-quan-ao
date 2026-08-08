import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-black text-gray-900 uppercase tracking-widest">Khuyến mãi</h2>
        <button class="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
          <i class="fa-solid fa-plus mr-1"></i> Thêm
        </button>
      </div>

      <!-- Tabs: Promotions / Vouchers -->
      <div class="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button (click)="activeTab='promotions'" 
                [ngClass]="activeTab === 'promotions' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'"
                class="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
          Chương trình
        </button>
        <button (click)="activeTab='vouchers'" 
                [ngClass]="activeTab === 'vouchers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'"
                class="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
          Vouchers
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-300"></i>
      </div>

      <!-- Promotions List -->
      <div *ngIf="!loading && activeTab === 'promotions'" class="space-y-3">
        <div *ngFor="let promo of promotions" class="bg-white border border-gray-100 rounded-2xl p-4">
          <div class="flex justify-between items-start mb-2">
            <div class="text-sm font-black text-gray-900">{{ promo.name }}</div>
            <span class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase"
                  [ngClass]="promo.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'">
              {{ promo.is_active ? 'Đang chạy' : 'Dừng' }}
            </span>
          </div>
          <div class="text-[10px] text-gray-500">
            {{ promo.start_date | date:'dd/MM/yy' }} — {{ promo.end_date | date:'dd/MM/yy' }}
          </div>
          <div class="text-xs font-black text-blue-600 mt-1">
            Giảm {{ promo.discount_type === 'percent' ? promo.discount_value + '%' : (promo.discount_value | currency:'VND':'symbol':'1.0-0') }}
          </div>
        </div>
        <div *ngIf="promotions.length === 0" class="bg-white p-8 rounded-2xl text-center text-gray-400 text-sm border border-gray-100">
          Chưa có chương trình khuyến mãi.
        </div>
      </div>

      <!-- Vouchers List -->
      <div *ngIf="!loading && activeTab === 'vouchers'" class="space-y-3">
        <div *ngFor="let v of vouchers" class="bg-white border border-gray-100 rounded-2xl p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="font-black text-sm text-gray-900 tracking-widest">{{ v.code }}</div>
            <span class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase"
                  [ngClass]="v.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'">
              {{ v.is_active ? 'Đang dùng' : 'Hết hạn' }}
            </span>
          </div>
          <div class="text-xs font-black text-blue-600">
            Giảm {{ v.discount_type === 'percent' ? v.discount_value + '%' : (v.discount_value | currency:'VND':'symbol':'1.0-0') }}
          </div>
          <div class="text-[10px] text-gray-400 mt-1">Đã dùng: {{ v.used_count || 0 }} / {{ v.usage_limit || '∞' }}</div>
        </div>
        <div *ngIf="vouchers.length === 0" class="bg-white p-8 rounded-2xl text-center text-gray-400 text-sm border border-gray-100">
          Chưa có voucher.
        </div>
      </div>
    </div>
  `
})
export class AdminPromotionsComponent implements OnInit {
  private http = inject(HttpClient);
  activeTab = 'promotions';
  promotions: any[] = [];
  vouchers: any[] = [];
  loading = true;

  ngOnInit() {
    Promise.all([
      this.http.get('/api/promotions').toPromise(),
      this.http.get('/api/vouchers').toPromise()
    ]).then(([promoRes, voucherRes]: any[]) => {
      this.promotions = promoRes?.data || promoRes || [];
      this.vouchers = voucherRes?.data || voucherRes || [];
      this.loading = false;
    }).catch(() => { this.loading = false; });
  }
}
