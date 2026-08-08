import { ApiClient } from "../../api/ApiClient";

export class ProfileModule {
  private user: any = null;
  private addresses: any[] = [];
  private currentTab: 'profile' | 'address' = 'profile';
  private ghnToken: string = "d32ad384-5f5e-11f1-a973-aee5264794df";

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    if (window.location.hash === '#address') {
      this.currentTab = 'address';
    }

    // Removed templateSkeleton() to avoid screen flashing when navigating

    try {
      this.user = await ApiClient.get<any>("/customers/me");
      this.addresses = this.user.addresses || [];
      app.innerHTML = this.template();
      this.bindEvents();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("401")) {
        // Chuyển hướng hoặc báo đăng nhập
        app.innerHTML = this.templateError("Vui lòng đăng nhập để xem thông tin cá nhân.");
      } else {
        app.innerHTML = this.templateError("Có lỗi xảy ra: " + err.message);
      }
    }
  }

  private templateSkeleton(): string {
    return `
      
        <main class="flex-1 flex items-center justify-center py-20">
          <i class="fa-solid fa-spinner fa-spin text-4xl text-[#2a83e9]"></i>
        </main>
        
    `;
  }

  private templateError(msg: string): string {
    return `
      
        <main class="flex-1 flex items-center justify-center py-20 px-4">
          <div class="bg-white p-10 rounded-3xl text-center shadow-sm max-w-md w-full">
            <h1 class="text-2xl font-black text-slate-900 font-serif mb-4">Lỗi</h1>
            <p class="text-slate-500 mb-8">${msg}</p>
            <a href="/account/login" class="bg-[#2a83e9] text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-blue-600 transition-colors inline-block">Đăng Nhập</a>
          </div>
        </main>
        
    `;
  }

  private template(): string {
    return `
      
        
        <main class="flex-1 max-w-7xl mx-auto w-full px-5 lg:px-10 pt-6 pb-10 lg:pb-16">
          <div class="flex flex-col lg:flex-row gap-8">
            
            <!-- Sidebar -->
            <div class="w-full lg:w-1/4">
              <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
                <div class="flex items-center gap-4 mb-8">
                  <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xl font-bold uppercase">
                    ${this.user?.full_name ? this.user.full_name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 line-clamp-1">${this.user?.full_name || 'Khách Hàng'}</p>
                    <p class="text-xs text-slate-500">${this.user?.phone || ''}</p>
                  </div>
                </div>
                
                <nav class="space-y-2">
                  <button id="tab-profile" class="w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${this.currentTab === 'profile' ? 'bg-[#2a83e9] text-white' : 'text-slate-600 hover:bg-slate-50'}">
                    <i class="fa-regular fa-user mr-3 ${this.currentTab === 'profile' ? 'opacity-100' : 'opacity-50'}"></i> Thông tin cá nhân
                  </button>
                  <button id="tab-address" class="w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${this.currentTab === 'address' ? 'bg-[#2a83e9] text-white' : 'text-slate-600 hover:bg-slate-50'}">
                    <i class="fa-regular fa-map mr-3 ${this.currentTab === 'address' ? 'opacity-100' : 'opacity-50'}"></i> Sổ địa chỉ
                  </button>
                  <a href="/account/orders" class="block px-4 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <i class="fa-solid fa-clock-rotate-left mr-3 opacity-50"></i> Lịch sử mua hàng
                  </a>
                  <button onclick="localStorage.removeItem('token'); window.location.href='/';" class="w-full text-left px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-colors mt-4">
                    <i class="fa-solid fa-arrow-right-from-bracket mr-3 opacity-50"></i> Đăng xuất
                  </button>
                </nav>
              </div>
            </div>

            <!-- Content -->
            <div class="w-full lg:w-3/4">
              <div class="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm" id="profile-content">
                ${this.currentTab === 'profile' ? this.profileFormTemplate() : this.addressTemplate()}
              </div>
            </div>

          </div>
        </main>
        
        
    `;
  }

  private profileFormTemplate(): string {
    return `
      <h2 class="text-2xl font-black text-slate-900 font-serif mb-8">Thông tin cá nhân</h2>
      <form id="profile-form" class="max-w-2xl space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Họ và Tên</label>
          <input type="text" id="prof_name" value="${this.user?.full_name || ''}" class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
          <input type="tel" id="prof_phone" value="${this.user?.phone || ''}" disabled class="w-full border border-slate-200 bg-slate-100 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed">
          <p class="text-[10px] text-slate-400 mt-1">Số điện thoại không thể thay đổi</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
          <input type="email" id="prof_email" value="${this.user?.email || ''}" class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors">
        </div>
        <div class="pt-4">
          <button type="submit" id="btn-save-profile" class="bg-[#2a83e9] text-white px-8 py-3.5 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
            Lưu Thay Đổi
          </button>
          <p id="prof-msg" class="text-sm font-bold mt-4 hidden"></p>
        </div>
      </form>
    `;
  }

  private addressTemplate(): string {
    return `
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-black text-slate-900 font-serif">Sổ địa chỉ</h2>
        <button id="btn-add-address" class="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
          <i class="fa-solid fa-plus mr-1"></i> Thêm địa chỉ mới
        </button>
      </div>

      <!-- Form thêm mới (Ẩn mặc định) -->
      <div id="add-address-form-wrap" class="hidden mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-4">Thêm địa chỉ mới</h3>
        <form id="add-address-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Người nhận *</label>
              <input type="text" id="addr_name" required class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a83e9]">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Số điện thoại *</label>
              <input type="text" id="addr_phone" required class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a83e9]">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Tỉnh / Thành phố *</label>
              <select id="addr_province" required class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a83e9]">
                <option value="">Chọn Tỉnh/Thành</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Quận / Huyện *</label>
              <select id="addr_district" required disabled class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a83e9] disabled:opacity-50">
                <option value="">Chọn Quận/Huyện</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Phường / Xã *</label>
              <select id="addr_ward" required disabled class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a83e9] disabled:opacity-50">
                <option value="">Chọn Phường/Xã</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Số nhà, tên đường *</label>
              <input type="text" id="addr_street" required placeholder="123 Lê Lợi..." class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a83e9]">
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="addr_default" class="w-4 h-4 rounded text-[#2a83e9] focus:ring-[#2a83e9]">
            <label for="addr_default" class="text-sm font-bold text-slate-700">Đặt làm địa chỉ mặc định</label>
          </div>
          <div class="pt-2 flex gap-3">
            <button type="submit" class="bg-[#2a83e9] text-white px-6 py-2 rounded-lg font-bold text-sm">Lưu địa chỉ</button>
            <button type="button" id="btn-cancel-address" class="px-6 py-2 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-200">Hủy</button>
          </div>
        </form>
      </div>

      <div class="space-y-4">
        ${this.addresses.length === 0 ? '<p class="text-slate-500 text-sm">Bạn chưa lưu địa chỉ nào.</p>' : ''}
        ${this.addresses.map((addr, index) => `
          <div class="flex justify-between items-start p-6 rounded-2xl border ${addr.is_default ? 'border-[#2a83e9] bg-blue-50/30' : 'border-slate-200'}">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="font-bold text-slate-900">${addr.recipient_name || addr.receiver_name || this.user?.full_name}</span>
                <span class="text-slate-400">|</span>
                <span class="text-slate-500 text-sm">${addr.phone || this.user?.phone}</span>
                ${addr.is_default ? `<span class="bg-[#2a83e9] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Mặc định</span>` : ''}
              </div>
              <p class="text-slate-600 text-sm">
                ${addr.street_address || addr.address}${addr.ward ? `, ${addr.ward}` : ''}${addr.district ? `, ${addr.district}` : ''}${addr.province ? `, ${addr.province}` : ''}
              </p>
            </div>
            <button class="text-red-500 hover:text-red-600 p-2 btn-del-addr" data-id="${addr._id}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  private bindEvents(): void {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Tabs
    const tabProfile = document.getElementById("tab-profile");
    const tabAddress = document.getElementById("tab-address");
    
    if (tabProfile) {
      tabProfile.addEventListener("click", () => {
        this.currentTab = 'profile';
        const ct = document.getElementById("profile-content");
        if (ct) ct.innerHTML = this.profileFormTemplate();
        this.updateTabUI();
        this.bindEvents(); // re-bind for new content
      });
    }

    if (tabAddress) {
      tabAddress.addEventListener("click", () => {
        this.currentTab = 'address';
        const ct = document.getElementById("profile-content");
        if (ct) ct.innerHTML = this.addressTemplate();
        this.updateTabUI();
        this.bindEvents(); // re-bind for new content
      });
    }

    // Profile form
    const pForm = document.getElementById("profile-form") as HTMLFormElement;
    if (pForm) {
      pForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-save-profile") as HTMLButtonElement;
        const msg = document.getElementById("prof-msg") as HTMLParagraphElement;
        const name = (document.getElementById("prof_name") as HTMLInputElement).value;
        const email = (document.getElementById("prof_email") as HTMLInputElement).value;

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
        
        try {
          const data = await ApiClient.put<any>("/customers/me", { full_name: name, email });
          this.user = data;
          msg.textContent = "Cập nhật thành công!";
          msg.className = "text-sm font-bold mt-4 text-emerald-500 block";
        } catch (err: any) {
          msg.textContent = err.message;
          msg.className = "text-sm font-bold mt-4 text-red-500 block";
        } finally {
          btn.disabled = false;
          btn.innerHTML = 'Lưu Thay Đổi';
        }
      });
    }

    // Address forms
    const btnAddAddr = document.getElementById("btn-add-address");
    const formWrap = document.getElementById("add-address-form-wrap");
    const btnCancelAddr = document.getElementById("btn-cancel-address");
    const aForm = document.getElementById("add-address-form") as HTMLFormElement;

    if (btnAddAddr && formWrap) {
      btnAddAddr.addEventListener("click", () => {
        formWrap.classList.remove("hidden");
        this.loadProvinces();
      });
    }
    if (btnCancelAddr && formWrap) {
      btnCancelAddr.addEventListener("click", () => formWrap.classList.add("hidden"));
    }

    const provSelect = document.getElementById("addr_province") as HTMLSelectElement;
    const distSelect = document.getElementById("addr_district") as HTMLSelectElement;
    const wardSelect = document.getElementById("addr_ward") as HTMLSelectElement;

    if (provSelect) {
      provSelect.addEventListener("change", () => {
        const provId = provSelect.value;
        if (provId) this.loadDistricts(provId);
        else {
          distSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
          distSelect.disabled = true;
          wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
          wardSelect.disabled = true;
        }
      });
    }

    if (distSelect) {
      distSelect.addEventListener("change", () => {
        const distId = distSelect.value;
        if (distId) this.loadWards(distId);
        else {
          wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
          wardSelect.disabled = true;
        }
      });
    }

    if (aForm) {
      aForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const recipient_name = (document.getElementById("addr_name") as HTMLInputElement).value;
        const phone = (document.getElementById("addr_phone") as HTMLInputElement).value;
        const street_address = (document.getElementById("addr_street") as HTMLInputElement).value;
        const province = provSelect.options[provSelect.selectedIndex]?.text;
        const district = distSelect.options[distSelect.selectedIndex]?.text;
        const ward = wardSelect.options[wardSelect.selectedIndex]?.text;
        const is_default = (document.getElementById("addr_default") as HTMLInputElement).checked;

        if (!province || !district || !ward) {
            alert("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện và Phường/Xã.");
            return;
        }

        try {
          const data = await ApiClient.post<any[]>("/customers/me/addresses", { 
            recipient_name, 
            phone, 
            street_address, 
            province, 
            district, 
            ward, 
            is_default 
          });
          this.addresses = data;
          this.currentTab = 'address';
          this.render();
        } catch (err: any) {
          alert(err.message);
        }
      });
    }

    // Delete Address
    app.querySelectorAll(".btn-del-addr").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (!id || !confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        try {
          const data = await ApiClient.delete<any[]>(`/customers/me/addresses/${id}`);
          this.addresses = data;
          this.render();
        } catch (err: any) {
          alert(err.message);
        }
      });
    });
  }

  private updateTabUI(): void {
    const tabProfile = document.getElementById("tab-profile");
    const tabAddress = document.getElementById("tab-address");
    
    if (this.currentTab === 'profile') {
      tabProfile?.className.replace('text-slate-600 hover:bg-slate-50', 'bg-[#2a83e9] text-white');
      tabProfile?.classList.add('bg-[#2a83e9]', 'text-white');
      tabProfile?.classList.remove('text-slate-600', 'hover:bg-slate-50');
      tabProfile?.querySelector('i')?.classList.replace('opacity-50', 'opacity-100');

      tabAddress?.classList.remove('bg-[#2a83e9]', 'text-white');
      tabAddress?.classList.add('text-slate-600', 'hover:bg-slate-50');
      tabAddress?.querySelector('i')?.classList.replace('opacity-100', 'opacity-50');
    } else {
      tabAddress?.classList.add('bg-[#2a83e9]', 'text-white');
      tabAddress?.classList.remove('text-slate-600', 'hover:bg-slate-50');
      tabAddress?.querySelector('i')?.classList.replace('opacity-50', 'opacity-100');

      tabProfile?.classList.remove('bg-[#2a83e9]', 'text-white');
      tabProfile?.classList.add('text-slate-600', 'hover:bg-slate-50');
      tabProfile?.querySelector('i')?.classList.replace('opacity-100', 'opacity-50');
    }
  }

  private async loadProvinces(): Promise<void> {
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province", {
        headers: { "Token": this.ghnToken }
      });
      const data = await res.json();
      const select = document.getElementById("addr_province") as HTMLSelectElement;
      if (!select) return;
      select.innerHTML = '<option value="">Chọn Tỉnh/Thành</option>';
      if (data.data) {
        data.data.forEach((p: any) => {
          const option = document.createElement("option");
          option.value = p.ProvinceID;
          option.textContent = p.ProvinceName;
          select.appendChild(option);
        });
      }
    } catch (err) {
      console.error("Lỗi tải Tỉnh/Thành:", err);
    }
  }

  private async loadDistricts(provinceId: string): Promise<void> {
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district", {
        method: "POST",
        headers: { "Token": this.ghnToken, "Content-Type": "application/json" },
        body: JSON.stringify({ province_id: Number(provinceId) })
      });
      const data = await res.json();
      const select = document.getElementById("addr_district") as HTMLSelectElement;
      if (!select) return;
      select.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
      if (data.data) {
        data.data.forEach((d: any) => {
          const option = document.createElement("option");
          option.value = d.DistrictID;
          option.textContent = d.DistrictName;
          select.appendChild(option);
        });
        select.disabled = false;
      }
    } catch (err) {
      console.error("Lỗi tải Quận/Huyện:", err);
    }
  }

  private async loadWards(districtId: string): Promise<void> {
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=" + districtId, {
        headers: { "Token": this.ghnToken }
      });
      const data = await res.json();
      const select = document.getElementById("addr_ward") as HTMLSelectElement;
      if (!select) return;
      select.innerHTML = '<option value="">Chọn Phường/Xã</option>';
      if (data.data) {
        data.data.forEach((w: any) => {
          const option = document.createElement("option");
          option.value = w.WardCode;
          option.textContent = w.WardName;
          select.appendChild(option);
        });
        select.disabled = false;
      }
    } catch (err) {
      console.error("Lỗi tải Phường/Xã:", err);
    }
  }
}
