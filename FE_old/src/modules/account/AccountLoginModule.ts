import { ApiClient } from "../../api/ApiClient";

export class AccountLoginModule {
  private activeTab: 'login' | 'register' = 'login';

  public render(): void {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Nếu đã đăng nhập thì redirect
    if (localStorage.getItem("token")) {
      const returnUrl = new URLSearchParams(window.location.search).get("return") || "/";
      window.location.href = returnUrl;
      return;
    }

    app.innerHTML = this.template();
    this.bindEvents();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private template(): string {
    return `
      <main class="flex-1 flex items-center justify-center py-16 px-4">
        <div class="w-full max-w-md">
          <!-- Logo -->
          <div class="text-center mb-8">
            <a href="/" class="inline-block">
              <h1 class="text-3xl font-black tracking-tighter" style="font-family:'Playfair Display',serif;">CLOSET.</h1>
            </a>
            <p class="text-slate-500 text-sm mt-2">Đăng nhập để tiếp tục mua sắm</p>
          </div>

          <!-- Card -->
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Tabs -->
            <div class="flex border-b border-slate-100">
              <button id="tab-login" class="flex-1 py-4 text-sm font-bold transition-colors bg-[#2a83e9] text-white">
                Đăng nhập
              </button>
              <button id="tab-register" class="flex-1 py-4 text-sm font-bold transition-colors text-slate-500 hover:bg-slate-50">
                Đăng ký
              </button>
            </div>

            <div class="p-8">
              <!-- Login Form -->
              <form id="login-form">
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email hoặc Số điện thoại</label>
                    <input type="text" id="login-identity" autocomplete="username"
                      class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors"
                      placeholder="email@example.com hoặc 0901234567" required>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu</label>
                    <div class="relative">
                      <input type="password" id="login-password" autocomplete="current-password"
                        class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors"
                        placeholder="••••••••" required>
                      <button type="button" id="toggle-pwd" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <i class="fa-regular fa-eye text-sm"></i>
                      </button>
                    </div>
                  </div>
                  <p id="login-error" class="text-red-500 text-xs font-bold hidden"></p>
                  <button type="submit" id="btn-login"
                    class="w-full bg-[#2a83e9] text-white py-3.5 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    <span>Đăng nhập</span>
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </form>

              <!-- Register Form (hidden by default) -->
              <form id="register-form" class="hidden">
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Họ và tên</label>
                    <input type="text" id="reg-name" autocomplete="name"
                      class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors"
                      placeholder="Nguyễn Văn A" required>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
                    <input type="tel" id="reg-phone" autocomplete="tel"
                      class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors"
                      placeholder="0901234567" required>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" id="reg-email" autocomplete="email"
                      class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors"
                      placeholder="email@example.com">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu</label>
                    <input type="password" id="reg-password" autocomplete="new-password"
                      class="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a83e9] focus:bg-white transition-colors"
                      placeholder="Tối thiểu 6 ký tự" required minlength="6">
                  </div>
                  <p id="reg-error" class="text-red-500 text-xs font-bold hidden"></p>
                  <button type="submit" id="btn-register"
                    class="w-full bg-[#2a83e9] text-white py-3.5 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    <span>Tạo tài khoản</span>
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Back link -->
          <p class="text-center text-sm text-slate-400 mt-6">
            <a href="/" class="hover:text-slate-600 transition-colors">← Về trang chủ</a>
          </p>
        </div>
      </main>
    `;
  }

  private bindEvents(): void {
    const tabLogin = document.getElementById("tab-login")!;
    const tabRegister = document.getElementById("tab-register")!;
    const loginForm = document.getElementById("login-form")!;
    const registerForm = document.getElementById("register-form")!;

    // Tab switching
    tabLogin.addEventListener("click", () => {
      this.activeTab = 'login';
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
      tabLogin.className = "flex-1 py-4 text-sm font-bold transition-colors bg-[#2a83e9] text-white";
      tabRegister.className = "flex-1 py-4 text-sm font-bold transition-colors text-slate-500 hover:bg-slate-50";
    });

    tabRegister.addEventListener("click", () => {
      this.activeTab = 'register';
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
      tabRegister.className = "flex-1 py-4 text-sm font-bold transition-colors bg-[#2a83e9] text-white";
      tabLogin.className = "flex-1 py-4 text-sm font-bold transition-colors text-slate-500 hover:bg-slate-50";
    });

    // Toggle password visibility
    document.getElementById("toggle-pwd")?.addEventListener("click", () => {
      const input = document.getElementById("login-password") as HTMLInputElement;
      const icon = document.querySelector("#toggle-pwd i")!;
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash text-sm";
      } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye text-sm";
      }
    });

    // Login submit
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn-login") as HTMLButtonElement;
      const errEl = document.getElementById("login-error")!;
      const identity = (document.getElementById("login-identity") as HTMLInputElement).value;
      const password = (document.getElementById("login-password") as HTMLInputElement).value;

      errEl.classList.add("hidden");
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';

      try {
        const res = await ApiClient.post<{ token: string; user: any }>("/auth/user/login", {
          identity,
          password
        });

        localStorage.setItem("token", res.token);
        if (res.user) localStorage.setItem("user_info", JSON.stringify(res.user));

        // Redirect về returnUrl hoặc trang chủ
        const returnUrl = new URLSearchParams(window.location.search).get("return") || "/";
        window.location.href = returnUrl;
      } catch (err: any) {
        let msg = "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
        try {
          const body = JSON.parse(err.message.split(" - ")[1] || "{}");
          msg = body.message || msg;
        } catch {}
        errEl.textContent = msg;
        errEl.classList.remove("hidden");
        btn.disabled = false;
        btn.innerHTML = '<span>Đăng nhập</span><i class="fa-solid fa-arrow-right text-xs"></i>';
      }
    });

    // Register submit
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn-register") as HTMLButtonElement;
      const errEl = document.getElementById("reg-error")!;
      const full_name = (document.getElementById("reg-name") as HTMLInputElement).value;
      const phone = (document.getElementById("reg-phone") as HTMLInputElement).value;
      const email = (document.getElementById("reg-email") as HTMLInputElement).value;
      const password = (document.getElementById("reg-password") as HTMLInputElement).value;

      errEl.classList.add("hidden");
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo tài khoản...';

      try {
        const res = await ApiClient.post<{ token: string; user: any }>("/auth/user/register", {
          full_name,
          phone,
          email,
          password
        });

        localStorage.setItem("token", res.token);
        if (res.user) localStorage.setItem("user_info", JSON.stringify(res.user));

        const returnUrl = new URLSearchParams(window.location.search).get("return") || "/";
        window.location.href = returnUrl;
      } catch (err: any) {
        let msg = "Đăng ký thất bại. Vui lòng thử lại.";
        try {
          const body = JSON.parse(err.message.split(" - ")[1] || "{}");
          msg = body.message || msg;
        } catch {}
        errEl.textContent = msg;
        errEl.classList.remove("hidden");
        btn.disabled = false;
        btn.innerHTML = '<span>Tạo tài khoản</span><i class="fa-solid fa-arrow-right text-xs"></i>';
      }
    });
  }
}
