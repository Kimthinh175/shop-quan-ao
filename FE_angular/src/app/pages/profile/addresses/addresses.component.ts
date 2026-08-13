import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter, take } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

interface GHNItem {
  ProvinceID?: number;
  ProvinceName?: string;
  DistrictID?: number;
  DistrictName?: string;
  WardCode?: string;
  WardName?: string;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24 animate-[fadeIn_0.3s_ease-out] relative">
      <!-- Header -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div class="h-14 flex items-center justify-between px-4 max-w-md mx-auto">
          <button (click)="router.navigate(['/profile'])" class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-black transition-colors rounded-full hover:bg-gray-50">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <h1 class="font-serif-brand font-black text-sm uppercase tracking-[0.15em] text-gray-900">Sổ Địa Chỉ</h1>
          <button (click)="openAddModal()" class="text-xs font-serif-brand font-black text-amber-600 uppercase tracking-wider hover:text-amber-700">
            + Thêm
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="p-4 max-w-md mx-auto space-y-4">

        <!-- Skeleton Loading State -->
        <div *ngIf="loading" class="space-y-4">
          <div *ngFor="let item of [1, 2, 3]" class="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div class="flex justify-between items-center mb-3">
              <div class="h-4 w-32 bg-gray-200 rounded-lg"></div>
              <div class="h-4 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div class="h-3 w-3/4 bg-gray-100 rounded-md mb-2"></div>
            <div class="h-3 w-1/2 bg-gray-100 rounded-md mb-4"></div>
            <div class="flex gap-2 pt-2 border-t border-gray-50">
              <div class="h-8 flex-1 bg-gray-100 rounded-xl"></div>
              <div class="h-8 flex-1 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Saved Addresses List -->
        <div *ngIf="!loading && addresses.length > 0" class="space-y-3.5">
          <div *ngFor="let addr of addresses" 
               class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:border-amber-400/50">
            
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="font-bold text-sm text-gray-900 mr-2">{{ addr.recipient_name || addr.fullName || addr.name || 'Người nhận' }}</span>
                <span class="text-xs text-gray-500 font-mono">{{ addr.phone || addr.receiver_phone }}</span>
              </div>
              <span *ngIf="addr.is_default || addr.isDefault" class="text-[9px] font-black text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Mặc định
              </span>
            </div>

            <div class="text-xs text-gray-600 leading-relaxed mb-3 flex items-start gap-2">
              <i class="fa-solid fa-location-dot text-amber-500 text-sm mt-0.5 shrink-0"></i>
              <div>
                <strong class="text-gray-900 font-medium block">{{ addr.street_address || addr.street }}</strong>
                <span>{{ addr.ward ? addr.ward + ', ' : '' }}{{ addr.district ? addr.district + ', ' : '' }}{{ addr.province || addr.city }}</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center gap-2 border-t border-gray-100 pt-3">
              <button (click)="openEditModal(addr)" class="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-black py-2 text-center bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <i class="fa-solid fa-pen text-[9px] mr-1"></i> Sửa
              </button>
              <button *ngIf="!addr.is_default && !addr.isDefault" (click)="deleteAddress(addr._id)" class="flex-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 py-2 text-center bg-red-50 rounded-xl transition-colors">
                <i class="fa-solid fa-trash text-[9px] mr-1"></i> Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && addresses.length === 0" class="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div class="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/20 text-amber-500">
            <i class="fa-regular fa-map text-2xl"></i>
          </div>
          <h3 class="font-serif-brand font-black text-gray-900 mb-1 uppercase tracking-wider text-sm">Chưa có địa chỉ giao hàng</h3>
          <p class="text-xs text-gray-500 mb-6 max-w-xs mx-auto">Vui lòng thêm địa chỉ nhận hàng để thuận tiện khi mua sắm tại CLOSET.</p>
          <button (click)="openAddModal()" class="px-6 py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/20 active:scale-95 transition-all">
            + Thêm địa chỉ mới
          </button>
        </div>

        <!-- Floating Add Button at Bottom -->
        <div *ngIf="!loading && addresses.length > 0">
          <button (click)="openAddModal()" class="w-full bg-black text-white rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all hover:bg-gray-800 flex items-center justify-center gap-2">
            <i class="fa-solid fa-plus text-amber-400"></i> Thêm địa chỉ mới
          </button>
        </div>
      </div>


      <!-- ── ADD / EDIT ADDRESS MODAL WITH GHN & MAP PREVIEW ── -->
      <div *ngIf="showModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 pb-[72px] sm:p-4 animate-[fadeIn_0.2s_ease-out]">
        <div class="bg-white w-full max-w-md rounded-3xl max-h-[75vh] flex flex-col overflow-hidden shadow-2xl animate-[slideUp_0.3s_ease-out]">
          
          <!-- Modal Header -->
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 class="font-serif-brand font-black text-sm uppercase tracking-widest text-gray-900">
              {{ editingId ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới' }}
            </h3>
            <button (click)="closeModal()" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- Modal Body Form -->
          <div class="p-5 overflow-y-auto space-y-4 flex-1">
            
            <!-- Recipient Name & Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Người nhận *</label>
                <input type="text" [(ngModel)]="formData.recipient_name" placeholder="Nguyễn Văn A" 
                       class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all">
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Số điện thoại *</label>
                <input type="tel" [(ngModel)]="formData.phone" placeholder="0901234567" 
                       class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all">
              </div>
            </div>

            <!-- GHN Cascading Location Selectors -->
            <div class="space-y-3">
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tỉnh / Thành phố *</label>
                <select [(ngModel)]="selectedProvinceId" (change)="onProvinceChange()" 
                        class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all cursor-pointer">
                  <option [value]="null">-- Chọn Tỉnh / Thành phố --</option>
                  <option *ngFor="let p of provinces" [value]="p.ProvinceID">{{ p.ProvinceName }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Quận / Huyện *</label>
                  <select [(ngModel)]="selectedDistrictId" (change)="onDistrictChange()" [disabled]="!selectedProvinceId"
                          class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <option [value]="null">-- Chọn Quận / Huyện --</option>
                    <option *ngFor="let d of districts" [value]="d.DistrictID">{{ d.DistrictName }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Phường / Xã *</label>
                  <select [(ngModel)]="selectedWardCode" (change)="onWardChange()" [disabled]="!selectedDistrictId"
                          class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <option [value]="null">-- Chọn Phường / Xã --</option>
                    <option *ngFor="let w of wards" [value]="w.WardCode">{{ w.WardName }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Street Address -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Số nhà, tên đường chi tiết *</label>
              <input type="text" [(ngModel)]="formData.street_address" (input)="updateMapUrl()" placeholder="Ví dụ: 123 Lê Lợi, Tòa nhà Bitexco..." 
                     class="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-black focus:bg-white transition-all">
            </div>

            <!-- Default Checkbox -->
            <div class="flex items-center gap-2 pt-1">
              <input type="checkbox" id="is_default_check" [(ngModel)]="formData.is_default" class="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer">
              <label for="is_default_check" class="text-xs font-bold text-gray-700 cursor-pointer">Đặt làm địa chỉ giao hàng mặc định</label>
            </div>

            <!-- 🗺️ INTERACTIVE MAP PREVIEW BOX -->
            <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
              <div class="bg-gray-900 text-white px-3.5 py-2 flex items-center justify-between">
                <span class="text-[10px] font-serif-brand font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <i class="fa-solid fa-map-location-dot"></i> Bản đồ vị trí giao hàng
                </span>
                <span class="text-[9px] text-gray-400">OpenStreetMap</span>
              </div>

              <div class="w-full h-44 relative bg-gray-200">
                <iframe *ngIf="safeMapUrl" [src]="safeMapUrl" width="100%" height="100%" frameborder="0" class="w-full h-full border-0"></iframe>
                <div *ngIf="!safeMapUrl" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <i class="fa-solid fa-location-crosshairs text-2xl mb-1 text-amber-500 animate-bounce"></i>
                  <span class="text-[10px] font-bold">Vui lòng chọn địa chỉ để xem vị trí trên bản đồ</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer Actions -->
          <div class="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button (click)="closeModal()" class="flex-1 py-3 bg-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-300 transition-colors">
              Hủy
            </button>
            <button (click)="saveAddress()" [disabled]="submitting" 
                    class="flex-1 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
              <span *ngIf="!submitting"><i class="fa-solid fa-check mr-1"></i> {{ editingId ? 'Cập nhật' : 'Lưu địa chỉ' }}</span>
              <span *ngIf="submitting"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang xử lý...</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})
export class AddressesComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  router = inject(Router);

  ghnToken = 'd32ad384-5f5e-11f1-a973-aee5264794df';

  addresses: any[] = [];
  loading = true;
  showModal = false;
  editingId: string | null = null;
  submitting = false;

  // GHN Cascading options
  provinces: GHNItem[] = [];
  districts: GHNItem[] = [];
  wards: GHNItem[] = [];

  selectedProvinceId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedWardCode: string | null = null;

  formData = {
    recipient_name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street_address: '',
    is_default: false
  };

  safeMapUrl: SafeResourceUrl | null = null;

  ngOnInit() {
    this.authService.checkAuth().subscribe(user => {
      if (user) {
        this.fetchAddresses();
        this.loadProvinces();
      } else {
        this.loading = false;
        localStorage.setItem('returnUrl', '/profile/addresses');
        this.router.navigate(['/login']);
      }
    });
  }

  fetchAddresses() {
    this.loading = true;
    this.http.get<any>('/api/customers/me/addresses').subscribe({
      next: (res) => {
        this.addresses = res.data || res.addresses || (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.editingId = null;
    this.formData = {
      recipient_name: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      street_address: '',
      is_default: this.addresses.length === 0
    };
    this.selectedProvinceId = null;
    this.selectedDistrictId = null;
    this.selectedWardCode = null;
    this.districts = [];
    this.wards = [];
    this.safeMapUrl = null;
    this.showModal = true;
  }

  openEditModal(addr: any) {
    this.editingId = addr._id;
    this.formData = {
      recipient_name: addr.recipient_name || addr.fullName || addr.name || '',
      phone: addr.phone || addr.receiver_phone || '',
      province: addr.province || addr.city || '',
      district: addr.district || '',
      ward: addr.ward || '',
      street_address: addr.street_address || addr.street || '',
      is_default: !!(addr.is_default || addr.isDefault)
    };

    this.showModal = true;
    this.updateMapUrl();
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
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

  onProvinceChange() {
    this.districts = [];
    this.wards = [];
    this.selectedDistrictId = null;
    this.selectedWardCode = null;

    const found = this.provinces.find(p => p.ProvinceID == this.selectedProvinceId);
    this.formData.province = found ? (found.ProvinceName || '') : '';

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
    this.updateMapUrl();
  }

  onDistrictChange() {
    this.wards = [];
    this.selectedWardCode = null;

    const found = this.districts.find(d => d.DistrictID == this.selectedDistrictId);
    this.formData.district = found ? (found.DistrictName || '') : '';

    if (this.selectedDistrictId) {
      fetch(`https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${this.selectedDistrictId}`, {
        headers: { Token: this.ghnToken }
      })
      .then(r => r.json())
      .then(res => {
        if (res.data) this.wards = res.data;
      });
    }
    this.updateMapUrl();
  }

  onWardChange() {
    const found = this.wards.find(w => w.WardCode == this.selectedWardCode);
    this.formData.ward = found ? (found.WardName || '') : '';
    this.updateMapUrl();
  }

  updateMapUrl() {
    const fullQuery = [this.formData.street_address, this.formData.ward, this.formData.district, this.formData.province, 'Việt Nam']
      .filter(Boolean)
      .join(', ');

    if (!fullQuery.trim()) {
      this.safeMapUrl = null;
      return;
    }

    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  saveAddress() {
    if (!this.formData.recipient_name.trim() || !this.formData.phone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại người nhận.');
      return;
    }

    if (!this.formData.province || !this.formData.district || !this.formData.ward || !this.formData.street_address) {
      alert('Vui lòng điền đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà.');
      return;
    }

    this.submitting = true;

    if (this.editingId) {
      this.http.put(`/api/customers/me/addresses/${this.editingId}`, this.formData).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.fetchAddresses();
        },
        error: (err) => {
          this.submitting = false;
          alert('Lỗi cập nhật: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.http.post('/api/customers/me/addresses', this.formData).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.fetchAddresses();
        },
        error: (err) => {
          this.submitting = false;
          alert('Lỗi thêm mới: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  deleteAddress(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    this.http.delete(`/api/customers/me/addresses/${id}`).subscribe({
      next: () => this.fetchAddresses(),
      error: (err) => alert('Lỗi xóa địa chỉ: ' + (err.error?.message || err.message))
    });
  }
}
