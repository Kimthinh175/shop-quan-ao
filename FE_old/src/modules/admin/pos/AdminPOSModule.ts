import { ApiClient } from "../../../api/ApiClient";
import { IProduct } from "../../../shared/models/IProduct";

export class AdminPOSModule {
  private state = {
    cart: [] as { variant: any; product: any; quantity: number }[],
    loading: false,
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.template();
    this.initEvents();
  }

  private initEvents() {
    // Product Search
    const searchInput = document.getElementById("pos-search-input") as HTMLInputElement;
    const searchResults = document.getElementById("pos-search-results") as HTMLDivElement;
    let searchTimeout: any = null;

    if (searchInput && searchResults) {
      searchInput.addEventListener("input", (e) => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
          searchResults.classList.add("hidden");
          return;
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
          try {
            const res = await ApiClient.get<any>(`/products?keyword=${encodeURIComponent(keyword)}&limit=10`);
            const products = res.results || [];
            
            if (products.length === 0) {
              searchResults.innerHTML = `<div class="p-4 text-center text-sm text-slate-500">Không tìm thấy sản phẩm</div>`;
              searchResults.classList.remove("hidden");
              return;
            }

            // Flatten products into variants
            let html = '';
            products.forEach((p: any) => {
              if (p.variants && p.variants.length > 0) {
                p.variants.forEach((v: any) => {
                  html += `
                    <div class="pos-search-item p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                         data-product='${JSON.stringify(p).replace(/'/g, "&#39;")}'
                         data-variant='${JSON.stringify(v).replace(/'/g, "&#39;")}'>
                      <img src="${p.main_img || 'https://images.unsplash.com/photo-1594932224011-042041c62fed?w=100'}" class="w-10 h-10 object-cover rounded-lg">
                      <div class="flex-1">
                        <h4 class="text-sm font-bold text-slate-800 line-clamp-1">${p.name}</h4>
                        <div class="text-xs text-slate-500 mt-0.5">
                          ${v.color} - Size ${v.size} | SKU: ${v.sku}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-bold text-[#2a83e9]">${v.price.toLocaleString()}đ</div>
                        <div class="text-xs text-slate-400">Tồn: ${v.stock || 0}</div>
                      </div>
                    </div>
                  `;
                });
              }
            });

            if (!html) {
              searchResults.innerHTML = `<div class="p-4 text-center text-sm text-slate-500">Sản phẩm không có phiên bản nào</div>`;
            } else {
              searchResults.innerHTML = html;
            }
            searchResults.classList.remove("hidden");

            // Add click events to items
            const items = searchResults.querySelectorAll('.pos-search-item');
            items.forEach(item => {
              item.addEventListener('click', () => {
                const pData = JSON.parse(item.getAttribute('data-product') || '{}');
                const vData = JSON.parse(item.getAttribute('data-variant') || '{}');
                
                this.addToCart(vData, pData, 1);
                
                // Reset search
                searchInput.value = '';
                searchResults.classList.add("hidden");
                searchInput.focus();
              });
            });

          } catch (error) {
            console.error("Lỗi tìm kiếm sản phẩm:", error);
          }
        }, 500);
      });

      // Hide results when clicking outside
      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target as Node) && !searchResults.contains(e.target as Node)) {
          searchResults.classList.add("hidden");
        }
      });
      
      // Show results when focusing on input if it has value
      searchInput.addEventListener("focus", () => {
         if (searchInput.value.trim() && searchResults.innerHTML.trim() !== '') {
            searchResults.classList.remove("hidden");
         }
      });
    }

    // Add product to cart via SKU
    const addForm = document.getElementById("pos-add-form") as HTMLFormElement;
    if (addForm) {
      addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const skuInput = document.getElementById("pos-sku") as HTMLInputElement;
        const qtyInput = document.getElementById("pos-qty") as HTMLInputElement;
        if (!skuInput || !qtyInput) return;

        const sku = skuInput.value.trim().toUpperCase();
        const qty = parseInt(qtyInput.value) || 1;
        if (!sku) return;

        try {
          // Fetch product by SKU
          const res = await ApiClient.get<any>(`/products/sku/${sku}`);
          if (res && res.variant && res.product) {
            this.addToCart(res.variant, res.product, qty);
            skuInput.value = "";
            qtyInput.value = "1";
            skuInput.focus();
          }
        } catch (e: any) {
          alert("Không tìm thấy sản phẩm với SKU: " + sku);
        }
      });
    }

    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="pos_payment_method"]');
    paymentMethods.forEach(p => {
      p.addEventListener("change", (e) => {
        document.querySelectorAll('input[name="pos_payment_method"]').forEach(radio => {
          const parent = radio.closest('label');
          if ((radio as HTMLInputElement).checked) {
            parent?.classList.replace('border-slate-200', 'border-[#2a83e9]');
            parent?.classList.add('bg-blue-50/30');
          } else {
            parent?.classList.replace('border-[#2a83e9]', 'border-slate-200');
            parent?.classList.remove('bg-blue-50/30');
          }
        });
      });
    });

    // Checkout event
    const payBtn = document.getElementById("pos-pay-btn");
    if (payBtn) {
      payBtn.addEventListener("click", async () => {
        if (this.state.cart.length === 0) {
          alert("Giỏ hàng đang trống!");
          return;
        }

        const originalText = payBtn.innerHTML;
        payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        (payBtn as HTMLButtonElement).disabled = true;

        try {
          const items = this.state.cart.map(item => ({
            product_variant_id: item.variant.id || item.variant._id,
            quantity: item.quantity
          }));

          let total_price = 0;
          this.state.cart.forEach(item => {
            total_price += item.variant.price * item.quantity;
          });

          const selectedMethod = (document.querySelector('input[name="pos_payment_method"]:checked') as HTMLInputElement).value;

          if (selectedMethod === 'TRANSFER') {
            // TRANSFER: Tạo đơn hàng, lấy PayOS checkoutUrl, mở modal QR
            const res = await ApiClient.adminPost<any>('/orders', {
              is_pos: true,
              total_price,
              total_amount: total_price,
              payment_method: 'TRANSFER', 
              payment_status: 'UNPAID',
              status: 'PENDING',
              receiver_name: 'Khách lẻ tại quầy',
              items
            });

            const orderObj = res.order || res;
            const payosData = res.payosData || orderObj.payosData;

            if (orderObj && orderObj._id && payosData?.checkoutUrl) {
              this.showPayOSModal(orderObj._id.toString(), payosData.checkoutUrl, total_price);
            } else {
              alert("Lỗi khi tạo link thanh toán PayOS!");
            }
          } else {
            // CASH: Thanh toán tiền mặt
            await ApiClient.adminPost('/orders', {
              is_pos: true,
              total_price,
              total_amount: total_price,
              payment_method: 'CASH', 
              payment_status: 'PAID',
              status: 'COMPLETED',
              receiver_name: 'Khách lẻ tại quầy',
              items
            });

            alert("Thanh toán tiền mặt thành công!");
            this.state.cart = [];
            this.updateCartUI();
          }
        } catch (e: any) {
          alert("Lỗi khi tạo đơn hàng: " + (e.message || "Unknown error"));
        } finally {
          payBtn.innerHTML = originalText;
          (payBtn as HTMLButtonElement).disabled = false;
        }
      });
    }
  }

  // Show PayOS QR Code modal overlay
  private showPayOSModal(orderId: string, checkoutUrl: string, totalAmount: number) {
    // Remove existing modal if any
    const existing = document.getElementById("pos-payos-modal");
    if (existing) existing.remove();

    // Create container
    const modal = document.createElement("div");
    modal.id = "pos-payos-modal";
    modal.className = "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in";

    // QR image URL helper using PayOS public quick template if direct QR is desired, 
    // or just show instructions to scan the checkout URL via an iframe or a redirect button.
    // However, showing PayOS checkout page directly inside a beautifully styled modal or iframe is best!
    // Or, we can extract the qr code directly or use an iframe showing checkoutUrl.
    // Since payos checkoutUrl is designed for browser redirect, using an iframe inside modal is excellent and feels super premium.
    modal.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        <div class="bg-[#2a83e9] text-white p-6 text-center relative">
          <button id="pos-modal-close" class="absolute top-4 right-4 text-white/80 hover:text-white text-xl">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fa-solid fa-qrcode text-xl"></i>
          </div>
          <h3 class="text-lg font-black font-serif">Quét mã QR Thanh toán</h3>
          <p class="text-xs text-blue-100 mt-1">Đơn hàng #${orderId.slice(-6).toUpperCase()} • ${totalAmount.toLocaleString()}đ</p>
        </div>
        <div class="p-6 flex flex-col items-center justify-center">
          <div class="w-full h-[380px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative">
            <iframe src="${checkoutUrl}" class="w-full h-full border-0"></iframe>
          </div>
          <div class="mt-4 flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-100 px-4 py-2 rounded-xl">
            <i class="fa-solid fa-circle-notch fa-spin text-[#2a83e9]"></i>
            <span>Đang chờ khách thanh toán qua PayOS...</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close button event
    const closeBtn = modal.querySelector("#pos-modal-close");
    closeBtn?.addEventListener("click", async () => {
      if (confirm("Hủy thanh toán đơn hàng này? Đồng thời đơn hàng sẽ bị hủy bỏ.")) {
        clearInterval(pollInterval);
        try {
          // Call API to cancel the order
          await ApiClient.adminPut(`/orders/${orderId}/status`, { status: 'CANCELLED' });
        } catch (err) {
          console.error("Lỗi khi cập nhật hủy đơn hàng:", err);
        }
        modal.remove();
      }
    });

    // Poll payment status every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const orderRes = await ApiClient.adminGet<any>(`/orders/${orderId}`);
        const order = orderRes.order || orderRes;
        if (order && order.payment_status === 'PAID') {
          clearInterval(pollInterval);
          modal.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-8 text-center animate-[scaleIn_0.3s_ease-out]">
              <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <i class="fa-solid fa-check"></i>
              </div>
              <h3 class="text-xl font-black text-slate-800 font-serif">Thành Công!</h3>
              <p class="text-slate-500 text-sm mt-2">Đơn hàng đã được thanh toán qua PayOS</p>
              <button id="pos-modal-success-done" class="mt-6 w-full bg-[#2a83e9] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all">
                Đóng
              </button>
            </div>
          `;
          
          const doneBtn = modal.querySelector("#pos-modal-success-done");
          doneBtn?.addEventListener("click", () => {
            modal.remove();
            this.state.cart = [];
            this.updateCartUI();
          });
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái đơn hàng:", err);
      }
    }, 3000);
  }

  private addToCart(variant: any, product: any, quantity: number) {
    const existing = this.state.cart.find(
      (item) =>
        (item.variant.id || item.variant._id) === (variant.id || variant._id),
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.state.cart.push({ variant, product, quantity });
    }
    this.updateCartUI();
  }

  private removeFromCart(index: number) {
    this.state.cart.splice(index, 1);
    this.updateCartUI();
  }

  private updateCartUI() {
    const container = document.getElementById("pos-cart-items");
    if (!container) return;

    if (this.state.cart.length === 0) {
      container.innerHTML = `<p class="text-slate-400 text-sm text-center py-10">Giỏ hàng trống</p>`;
      this.updateTotals();
      return;
    }

    container.innerHTML = this.state.cart
      .map((item, index) => {
        const price = item.variant.price;
        return `
        <div class="flex gap-4 items-center group relative border-b border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 pr-8">
          <img src="${item.product.main_img || item.product.image || "https://images.unsplash.com/photo-1594932224011-042041c62fed?w=100"}" class="w-12 h-12 object-cover rounded-xl" alt="">
          <div class="flex-1">
            <h4 class="text-sm font-bold text-slate-800 line-clamp-1">${item.product.name} - ${item.variant.color} - Size ${item.variant.size}</h4>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-slate-400">SL: ${item.quantity}</span>
              <span class="font-bold text-[#2a83e9]">${(price * item.quantity).toLocaleString()}đ</span>
            </div>
          </div>
          <button class="pos-remove-item text-slate-300 hover:text-red-500 transition-colors p-2 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" data-index="${index}" title="Xóa khỏi giỏ hàng">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
          `;
      })
      .join("");
      
    // Add remove events
    const removeBtns = container.querySelectorAll('.pos-remove-item');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index') || '0');
        this.removeFromCart(index);
      });
    });

    this.updateTotals();
  }

  private updateTotals() {
    const subtotalEl = document.getElementById("pos-subtotal");
    const totalEl = document.getElementById("pos-total");

    let subtotal = 0;
    this.state.cart.forEach((item) => {
      const price = item.variant.price;
      subtotal += price * item.quantity;
    });

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()}đ`;
    if (totalEl) totalEl.textContent = `${subtotal.toLocaleString()}đ`;
  }

  private template(): string {
    return `
      <div class="bg-slate-50 h-[calc(100vh-80px)] overflow-hidden flex w-full">


        <!-- Main POS Area -->
        <main class="flex-1 flex overflow-hidden">
          <!-- Left Side: SKU Input Form -->
          <section class="flex-1 flex flex-col p-6 overflow-hidden bg-slate-50 items-center justify-center">
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
              <div class="mb-6 text-center">
                <div class="w-16 h-16 bg-[#2a83e9]/10 text-[#2a83e9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  <i class="fa-solid fa-barcode"></i>
                </div>
                <h2 class="text-xl font-black text-slate-800">Thêm sản phẩm</h2>
                <p class="text-slate-500 text-sm mt-1">Tìm kiếm hoặc nhập SKU để thêm vào giỏ hàng</p>
              </div>

              <!-- Product Search -->
              <div class="mb-6 relative">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Tìm kiếm sản phẩm (Tên)</label>
                <div class="relative">
                  <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input type="text" id="pos-search-input" class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:ring-2 focus:ring-[#2a83e9]/20 transition-all" placeholder="Nhập tên sản phẩm..." autocomplete="off">
                </div>
                <!-- Search Results Dropdown -->
                <div id="pos-search-results" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-80 overflow-y-auto z-50 hidden custom-scrollbar">
                  <!-- Results render here -->
                </div>
              </div>

              <div class="flex items-center gap-4 mb-6">
                 <div class="h-px bg-slate-200 flex-1"></div>
                 <span class="text-xs font-bold text-slate-400 uppercase">Hoặc nhập SKU</span>
                 <div class="h-px bg-slate-200 flex-1"></div>
              </div>

              <form id="pos-add-form" class="space-y-5">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Mã SKU</label>
                  <input type="text" id="pos-sku" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors uppercase font-mono tracking-wider" placeholder="VD: TSHIRT-BLK-L" required autocomplete="off">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Số lượng</label>
                  <input type="number" id="pos-qty" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors" value="1" min="1" required>
                </div>
                <button type="submit" class="w-full bg-[#2a83e9] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                  <i class="fa-solid fa-plus"></i> Thêm vào giỏ hàng
                </button>
              </form>
            </div>
          </section>

          <!-- Right Side: Cart & Payment -->
          <section class="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-2xl shrink-0">
            <!-- Customer Selector -->
            <div class="p-6 border-bottom border-slate-100 bg-slate-50/50">
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-slate-800">Khách lẻ tại quầy</h2>
              </div>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-6 custom-scrollbar" id="pos-cart-items">
              <p class="text-slate-400 text-sm text-center py-10">Giỏ hàng trống</p>
            </div>

            <!-- Summary & Checkout -->
            <div class="p-6 bg-slate-50 border-t border-slate-200">
              <div class="mb-5">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Phương thức thanh toán</label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="flex items-center justify-center gap-2 p-3 border-2 border-[#2a83e9] bg-blue-50/30 rounded-xl cursor-pointer hover:bg-blue-50/10 transition-colors">
                    <input type="radio" name="pos_payment_method" value="CASH" checked class="hidden">
                    <i class="fa-solid fa-money-bill-wave text-sm"></i>
                    <span class="text-xs font-bold">Tiền mặt</span>
                  </label>
                  <label class="flex items-center justify-center gap-2 p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="pos_payment_method" value="TRANSFER" class="hidden">
                    <i class="fa-solid fa-qrcode text-sm"></i>
                    <span class="text-xs font-bold">Chuyển khoản</span>
                  </label>
                </div>
              </div>

              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính</span>
                  <span class="font-bold text-slate-800" id="pos-subtotal">0đ</span>
                </div>
                <div class="flex justify-between text-xl font-extrabold text-slate-800 pt-3 border-t border-slate-200">
                  <span>Tổng cộng</span>
                  <span class="text-[#2a83e9]" id="pos-total">0đ</span>
                </div>
              </div>

              <button class="w-full py-4 bg-slate-900 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-slate-200 hover:bg-[#2a83e9] transition-all" id="pos-pay-btn">
                THANH TOÁN (F12)
              </button>
            </div>
          </section>
        </main>
      </div>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div class="bg-slate-50 h-[calc(100vh-80px)] overflow-hidden flex w-full animate-pulse">
        <main class="flex-1 flex overflow-hidden">
          <div class="flex-1 p-6 space-y-6">
            <div class="h-10 bg-slate-200 rounded w-1/4"></div>
            <div class="grid grid-cols-4 gap-4">
              ${Array(4)
                .fill(0)
                .map(() => `<div class="h-48 bg-slate-200 rounded-2xl"></div>`)
                .join("")}
            </div>
          </div>
        </main>
      </div>
    `;
  }
}
