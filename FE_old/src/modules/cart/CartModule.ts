import { CartService, ICartItem } from "../../core/CartService";

export class CartModule {
  public render(): void {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.template();
    this.bindEvents();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private template(): string {
    const cart = CartService.getCart();
    const isEmpty = cart.length === 0;

    return `
      
        
        <main class="flex-1 max-w-7xl mx-auto w-full px-5 lg:px-10 pt-6 pb-10 lg:pb-16">
          <div class="w-full">
            <!-- Header -->
            ${
              !isEmpty
                ? `
            <div class="flex justify-end mb-6">
              <button id="clear-cart-btn" class="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                <i class="fa-regular fa-trash-can mr-1"></i> Xóa tất cả
              </button>
            </div>
            `
                : ""
            }

            ${isEmpty ? this.emptyCartTemplate() : this.cartContentTemplate(cart)}
          </div>
        </main>

        
    `;
  }

  private emptyCartTemplate(): string {
    return `
      <div class="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div class="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-4xl mb-6">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-2 font-serif">Giỏ hàng trống</h2>
        <p class="text-slate-500 mb-8 max-w-md">Có vẻ như bạn chưa chọn sản phẩm nào. Khám phá ngay các bộ sưu tập mới nhất của chúng tôi.</p>
        <a href="/products" class="bg-[#2a83e9] text-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
          Tiếp tục mua sắm
        </a>
      </div>
    `;
  }

  private cartContentTemplate(cart: ICartItem[]): string {
    const subtotal = CartService.getTotalPrice();

    return `
      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- Cart Items List -->
        <div class="w-full lg:w-2/3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-6 sm:p-8">
            <div class="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
              <div class="col-span-6">Sản phẩm</div>
              <div class="col-span-3 text-center">Số lượng</div>
              <div class="col-span-3 text-right">Tổng</div>
            </div>
            
            <div class="divide-y divide-slate-100" id="cart-items-container">
              ${cart.map((item, index) => this.cartItemTemplate(item, index)).join("")}
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="w-full lg:w-1/3 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 sticky top-32">
          <h2 class="text-lg font-black text-slate-900 mb-6 font-serif">Tóm tắt đơn hàng</h2>
          
          <div class="space-y-4 mb-6">
            <div class="flex justify-between text-slate-600 text-sm">
              <span>Tạm tính</span>
              <span class="font-bold">${subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div class="flex justify-between text-slate-600 text-sm">
              <span>Phí vận chuyển</span>
              <span class="text-slate-400 italic">Tính ở bước sau</span>
            </div>
          </div>
          
          <div class="pt-4 border-t border-slate-100 mb-8">
            <div class="flex justify-between items-end">
              <span class="text-slate-900 font-bold">Tổng cộng</span>
              <span class="text-2xl font-black text-[#2a83e9]">${subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <p class="text-[10px] text-slate-400 text-right mt-1">(Đã bao gồm VAT)</p>
          </div>
          
          <a href="/checkout" id="btn-proceed-checkout" data-link class="block w-full bg-slate-900 text-white text-center px-6 py-4 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-slate-800 transition-colors shadow-lg">
            Tiến Hành Thanh Toán
          </a>
          
          <div class="mt-6 pt-6 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-500 mb-4"><i class="fa-solid fa-shield-halved mr-1"></i> Thanh toán an toàn và bảo mật</p>
            <div class="flex justify-center gap-2">
              <div class="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs"><i class="fa-brands fa-cc-visa"></i></div>
              <div class="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs"><i class="fa-brands fa-cc-mastercard"></i></div>
              <div class="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-[10px] font-bold">COD</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private cartItemTemplate(item: ICartItem, index: number): string {
    return `
      <div class="py-6 sm:py-8 flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center cart-item" data-index="${index}">
        <!-- Product Info -->
        <div class="col-span-6 flex gap-4 w-full">
          <a href="/products/${item.id}" class="w-24 h-32 shrink-0 bg-slate-100 rounded-xl overflow-hidden block">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </a>
          <div class="flex flex-col justify-center">
            <a href="/products/${item.id}" class="text-sm font-bold text-slate-900 hover:text-[#2a83e9] transition-colors line-clamp-2 mb-1">${item.name}</a>
            <p class="text-xs text-slate-500 mb-2">Phân loại: ${item.color} - ${item.size}</p>
            <p class="text-[#2a83e9] font-black sm:hidden">${(item.price || 0).toLocaleString("vi-VN")}đ</p>
          </div>
        </div>

        <!-- Quantity Control -->
        <div class="col-span-3 flex justify-between sm:justify-center w-full sm:w-auto items-center">
          <span class="sm:hidden text-xs font-bold text-slate-500">Số lượng:</span>
          <div class="flex items-center bg-slate-50 rounded-lg border border-slate-200">
            <button class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#2a83e9] transition-colors btn-decrease" data-index="${index}">
              <i class="fa-solid fa-minus text-[10px]"></i>
            </button>
            <input type="number" value="${item.quantity}" min="1" max="99" class="w-10 h-8 bg-transparent text-center text-sm font-bold text-slate-900 outline-none qty-input" data-index="${index}" readonly>
            <button class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#2a83e9] transition-colors btn-increase" data-index="${index}">
              <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Total & Remove -->
        <div class="col-span-3 flex justify-between sm:justify-end w-full sm:w-auto items-center">
          <span class="sm:hidden text-xs font-bold text-slate-500">Tổng:</span>
          <div class="text-right flex items-center gap-4 sm:gap-6">
            <span class="font-black text-slate-900 hidden sm:block">${((item.price || 0) * item.quantity).toLocaleString("vi-VN")}đ</span>
            <button class="text-slate-300 hover:text-red-500 transition-colors btn-remove" data-index="${index}" title="Xóa sản phẩm">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.querySelectorAll(".btn-decrease").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(
          (e.currentTarget as HTMLElement).dataset.index || "0",
        );
        const cart = CartService.getCart();
        if (cart[index] && cart[index].quantity > 1) {
          CartService.updateQuantity(index, cart[index].quantity - 1);
          this.render();
        }
      });
    });

    app.querySelectorAll(".btn-increase").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(
          (e.currentTarget as HTMLElement).dataset.index || "0",
        );
        const cart = CartService.getCart();
        if (cart[index] && cart[index].quantity < 99) {
          CartService.updateQuantity(index, cart[index].quantity + 1);
          this.render();
        }
      });
    });

    app.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(
          (e.currentTarget as HTMLElement).dataset.index || "0",
        );
        if (confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
          CartService.removeItem(index);
          this.render();
        }
      });
    });

    const clearBtn = app.querySelector("#clear-cart-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
          CartService.clearCart();
          this.render();
        }
      });
    }

    const checkoutBtn = app.querySelector("#btn-proceed-checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", (e) => {
        const token = localStorage.getItem("token");
        if (!token) {
          e.preventDefault();
          if ((window as any).showAuthModal) {
            (window as any).showAuthModal('login');
          } else {
            alert('Vui lòng đăng nhập để tiếp tục thanh toán');
          }
        }
      });
    }
  }
}
