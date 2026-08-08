import { CartService, ICartItem } from "../../core/CartService";
import { ApiClient } from "../../api/ApiClient";

export class CheckoutModule {
  private ghnToken = "d32ad384-5f5e-11f1-a973-aee5264794df"; // GHN Dev Token from backend
  private shippingFee = 30000;
  private selectedDistrictId: number | null = null;
  private selectedWardCode: string | null = null;

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Guard: phải đăng nhập mới được checkout
    if (!localStorage.getItem("token")) {
      window.location.href = "/account/login?return=/checkout";
      return;
    }

    const cart = CartService.getCart();
    if (cart.length === 0) {
      window.location.href = "/cart";
      return;
    }

    app.innerHTML = this.template(cart);
    this.bindEvents();
    await this.loadProvinces();
    await this.prefillCustomerData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private async prefillCustomerData(): Promise<void> {
    try {
      const customer = await ApiClient.get<any>("/customers/me");
      if (!customer) return;

      const nameInput = document.getElementById("cus_name") as HTMLInputElement;
      const phoneInput = document.getElementById("cus_phone") as HTMLInputElement;
      
      const defaultAddr = customer.addresses?.find((a: any) => a.is_default) || customer.addresses?.[0];
      
      if (defaultAddr) {
        if (nameInput) nameInput.value = defaultAddr.recipient_name || defaultAddr.receiver_name || customer.full_name || '';
        if (phoneInput) phoneInput.value = defaultAddr.phone || customer.phone || '';
        
        const streetInput = document.getElementById("street") as HTMLInputElement;
        if (streetInput) streetInput.value = defaultAddr.street_address || defaultAddr.address || '';

        // Auto-select Province
        const provSelect = document.getElementById("province-select") as HTMLSelectElement;
        if (provSelect && defaultAddr.province) {
          const provOption = Array.from(provSelect.options).find(o => o.text === defaultAddr.province);
          if (provOption) {
            provSelect.value = provOption.value;
            await this.loadDistricts(provSelect.value);

            // Auto-select District
            const distSelect = document.getElementById("district-select") as HTMLSelectElement;
            if (distSelect && defaultAddr.district) {
              const distOption = Array.from(distSelect.options).find(o => o.text === defaultAddr.district);
              if (distOption) {
                distSelect.value = distOption.value;
                await this.loadWards(distSelect.value);

                // Auto-select Ward
                const wardSelect = document.getElementById("ward-select") as HTMLSelectElement;
                if (wardSelect && defaultAddr.ward) {
                  const wardOption = Array.from(wardSelect.options).find(o => o.text === defaultAddr.ward);
                  if (wardOption) {
                    wardSelect.value = wardOption.value;
                    this.selectedDistrictId = Number(distSelect.value);
                    this.selectedWardCode = wardSelect.value;
                    await this.calculateShippingFee(distSelect.value, wardSelect.value);
                  }
                }
              }
            }
          }
        }
      } else {
        if (nameInput) nameInput.value = customer.full_name || '';
        if (phoneInput) phoneInput.value = customer.phone || '';
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin khách hàng:", error);
    }
  }

  private template(cart: ICartItem[]): string {
    const subtotal = CartService.getTotalPrice();

    return `
      
        
        <main class="flex-1 max-w-7xl mx-auto w-full px-5 lg:px-10 pt-6 pb-10 lg:pb-16">
          <div class="flex flex-col lg:flex-row gap-10">
            
            <!-- Left: Checkout Form -->
            <div class="w-full lg:w-3/5">
              <form id="checkout-form" class="space-y-8">
                <!-- Contact Info -->
                <section class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 class="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">1</span>
                    Thông tin liên hệ
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Họ và tên *</label>
                      <input type="text" id="cus_name" required class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors" placeholder="Nguyễn Văn A">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại *</label>
                      <input type="tel" id="cus_phone" required class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors" placeholder="0901234567">
                    </div>
                  </div>
                </section>

                <!-- Shipping Address -->
                <section class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 class="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">2</span>
                    Địa chỉ giao hàng
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tỉnh / Thành phố *</label>
                      <select id="province-select" required class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors appearance-none">
                        <option value="">Chọn Tỉnh/Thành</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quận / Huyện *</label>
                      <select id="district-select" required disabled class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors appearance-none disabled:opacity-50">
                        <option value="">Chọn Quận/Huyện</option>
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phường / Xã *</label>
                      <select id="ward-select" required disabled class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors appearance-none disabled:opacity-50">
                        <option value="">Chọn Phường/Xã</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số nhà, Tên đường *</label>
                      <input type="text" id="street" required class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors" placeholder="123 Lê Lợi">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ghi chú giao hàng (Tùy chọn)</label>
                    <textarea id="note" rows="2" class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors" placeholder="Giao giờ hành chính..."></textarea>
                  </div>
                </section>

                <!-- Payment Method -->
                <section class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 class="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">3</span>
                    Phương thức thanh toán
                  </h2>
                  <div class="space-y-4">
                    <label class="flex items-center justify-between p-4 border-2 border-[#2a83e9] bg-blue-50/30 rounded-2xl cursor-pointer">
                      <div class="flex items-center gap-4">
                        <input type="radio" name="payment_method" value="COD" checked class="w-5 h-5 text-[#2a83e9] focus:ring-[#2a83e9]">
                        <div>
                          <p class="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</p>
                          <p class="text-xs text-slate-500 mt-1">Khách hàng thanh toán bằng tiền mặt khi nhận hàng</p>
                        </div>
                      </div>
                      <i class="fa-solid fa-money-bill-wave text-[#2a83e9] text-xl"></i>
                    </label>
                    
                    <label class="flex items-center justify-between p-4 border-2 border-slate-100 hover:border-slate-200 rounded-2xl cursor-pointer transition-colors">
                      <div class="flex items-center gap-4">
                        <input type="radio" name="payment_method" value="TRANSFER" class="w-5 h-5 text-[#2a83e9] focus:ring-[#2a83e9]">
                        <div>
                          <p class="font-bold text-slate-900">Chuyển khoản qua QRCode</p>
                          <p class="text-xs text-slate-500 mt-1">Hỗ trợ tất cả các ngân hàng qua hệ thống PayOS</p>
                        </div>
                      </div>
                      <i class="fa-solid fa-qrcode text-slate-400 text-xl"></i>
                    </label>
                  </div>
                </section>
              </form>
            </div>

            <!-- Right: Order Summary -->
            <div class="w-full lg:w-2/5">
              <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 sticky top-24">
                <h2 class="text-lg font-black text-slate-900 mb-6 font-serif">Đơn hàng của bạn</h2>
                
                <div class="divide-y divide-slate-100 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  ${cart.map(item => `
                    <div class="py-4 flex gap-4">
                      <div class="relative w-16 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src="${item.image}" class="w-full h-full object-cover">
                        <span class="absolute top-0 right-0 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">${item.quantity}</span>
                      </div>
                      <div class="flex-1 flex flex-col justify-center">
                        <p class="text-sm font-bold text-slate-900 line-clamp-2">${item.name}</p>
                        <p class="text-xs text-slate-500 mt-1">${item.color} - ${item.size}</p>
                        <p class="text-[#2a83e9] font-black text-sm mt-1">${(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Voucher Input -->
                <div class="flex gap-2 mb-6">
                  <input type="text" id="voucher-input" placeholder="Nhập mã giảm giá" class="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] uppercase">
                  <button id="apply-voucher-btn" class="bg-slate-900 text-white font-bold px-6 rounded-xl hover:bg-slate-800 transition-colors text-sm">Áp dụng</button>
                </div>

                <div class="space-y-4 mb-6">
                  <div class="flex justify-between text-slate-600 text-sm">
                    <span>Tạm tính</span>
                    <span class="font-bold" id="subtotal-display" data-value="${subtotal}">${subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div class="flex justify-between text-slate-600 text-sm">
                    <span>Phí vận chuyển</span>
                    <span class="font-bold" id="shipping-fee-display">Vui lòng chọn địa chỉ</span>
                  </div>
                  <div class="flex justify-between text-red-500 text-sm hidden" id="discount-row">
                    <span>Giảm giá</span>
                    <span class="font-bold" id="discount-display">-0đ</span>
                  </div>
                </div>
                
                <div class="pt-4 border-t border-slate-100 mb-8">
                  <div class="flex justify-between items-end">
                    <span class="text-slate-900 font-bold">Tổng thanh toán</span>
                    <span class="text-2xl font-black text-[#2a83e9]" id="total-display">${subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                
                <button id="submit-order-btn" form="checkout-form" class="w-full bg-[#2a83e9] text-white text-center px-6 py-4 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                  <span>Đặt Hàng Ngay</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>

                <p id="error-message" class="text-red-500 text-xs font-bold text-center mt-4 hidden"></p>
              </div>
            </div>
            
          </div>
        </main>

        
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      </style>
    `;
  }

  private async loadProvinces(): Promise<void> {
    try {
      const res = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province", {
        headers: { "Token": this.ghnToken }
      });
      const data = await res.json();
      const select = document.getElementById("province-select") as HTMLSelectElement;
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
      const select = document.getElementById("district-select") as HTMLSelectElement;
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
      const select = document.getElementById("ward-select") as HTMLSelectElement;
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

  private async calculateShippingFee(districtId: string, wardCode: string): Promise<void> {
    const cart = CartService.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    try {
      const res = await ApiClient.post<{ fee: number }>("/orders/shipping-fee", {
        to_district_id: districtId,
        to_ward_code: wardCode,
        total_items: totalItems
      });
      
      this.shippingFee = res.fee || 30000;
      this.updateTotal();
    } catch (error) {
      console.error("Lỗi tính phí ship:", error);
      this.shippingFee = 30000; // Fallback
      this.updateTotal();
    }
  }

  private updateTotal(): void {
    const subtotal = CartService.getTotalPrice();
    const discount = 0; // Tương lai tích hợp voucher
    const total = subtotal + this.shippingFee - discount;

    const shipDisplay = document.getElementById("shipping-fee-display");
    const totalDisplay = document.getElementById("total-display");

    if (shipDisplay) shipDisplay.textContent = `${this.shippingFee.toLocaleString('vi-VN')}đ`;
    if (totalDisplay) totalDisplay.textContent = `${Math.max(0, total).toLocaleString('vi-VN')}đ`;
  }

  private bindEvents(): void {
    const provinceSelect = document.getElementById("province-select") as HTMLSelectElement;
    const districtSelect = document.getElementById("district-select") as HTMLSelectElement;
    const wardSelect = document.getElementById("ward-select") as HTMLSelectElement;
    const form = document.getElementById("checkout-form") as HTMLFormElement;

    if (provinceSelect) {
      provinceSelect.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val) {
          this.loadDistricts(val);
          districtSelect.disabled = true;
          wardSelect.disabled = true;
          wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
        }
      });
    }

    if (districtSelect) {
      districtSelect.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val) {
          this.selectedDistrictId = Number(val);
          this.loadWards(val);
          wardSelect.disabled = true;
        }
      });
    }

    if (wardSelect) {
      wardSelect.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val && this.selectedDistrictId) {
          this.selectedWardCode = val;
          document.getElementById("shipping-fee-display")!.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-slate-400"></i>';
          this.calculateShippingFee(this.selectedDistrictId.toString(), val);
        }
      });
    }

    const radios = document.querySelectorAll('input[name="payment_method"]');
    radios.forEach(r => {
      r.addEventListener("change", (e) => {
        document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
          const parent = radio.closest('label');
          if ((radio as HTMLInputElement).checked) {
            parent?.classList.replace('border-slate-100', 'border-[#2a83e9]');
            parent?.classList.add('bg-blue-50/30');
          } else {
            parent?.classList.replace('border-[#2a83e9]', 'border-slate-100');
            parent?.classList.remove('bg-blue-50/30');
          }
        });
      });
    });

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("submit-order-btn") as HTMLButtonElement;
        const errEl = document.getElementById("error-message") as HTMLParagraphElement;
        
        errEl.classList.add('hidden');
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

        try {
          // Gộp form data
          const pName = provinceSelect.options[provinceSelect.selectedIndex].text;
          const dName = districtSelect.options[districtSelect.selectedIndex].text;
          const wName = wardSelect.options[wardSelect.selectedIndex].text;
          const street = (document.getElementById("street") as HTMLInputElement).value;
          const address_str = `${street}, ${wName}, ${dName}, ${pName}`;

          const orderData = {
            receiver_name: (document.getElementById("cus_name") as HTMLInputElement).value,
            receiver_phone: (document.getElementById("cus_phone") as HTMLInputElement).value,
            receiver_address: address_str,
            to_district_id: this.selectedDistrictId,
            to_ward_code: this.selectedWardCode,
            shipping_fee: this.shippingFee,
            note: (document.getElementById("note") as HTMLTextAreaElement).value,
            payment_method: (document.querySelector('input[name="payment_method"]:checked') as HTMLInputElement).value,
            items: CartService.getCart().map(item => ({
              product_variant_id: item.variant_id,
              quantity: item.quantity,
            }))
          };

          const res = await ApiClient.post<{ _id: string, payosData?: { checkoutUrl: string } }>("/orders", orderData);
          
          CartService.clearCart();
          
          if (res.payosData?.checkoutUrl) {
            window.location.href = res.payosData.checkoutUrl;
          } else {
            window.location.href = `/checkout/success?id=${res._id}`;
          }
        } catch (error: any) {
          console.error("Lỗi đặt hàng:", error);
          errEl.textContent = error.message || "Có lỗi xảy ra, vui lòng thử lại sau";
          errEl.classList.remove('hidden');
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    }
  }
}
