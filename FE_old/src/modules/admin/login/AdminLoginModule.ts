import { ApiClient } from "../../../api/ApiClient";

export class AdminLoginModule {
  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.template();
    this.attachEvents();
  }

  private attachEvents() {
    const form = document.getElementById("admin-login-form") as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById("admin-username") as HTMLInputElement;
      const passwordInput = document.getElementById("admin-password") as HTMLInputElement;
      const errorDiv = document.getElementById("admin-login-error");
      const submitBtn = document.getElementById("admin-login-btn") as HTMLButtonElement;
      
      if (!usernameInput || !passwordInput || !errorDiv || !submitBtn) return;
      
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        errorDiv.textContent = "Vui lòng nhập đầy đủ tài khoản và mật khẩu.";
        errorDiv.classList.remove("hidden");
        return;
      }

      errorDiv.classList.add("hidden");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang đăng nhập...';
      submitBtn.disabled = true;

      try {
        const res = await ApiClient.post<any>("/auth/admin/login", { username, password });
        if (res.token) {
          localStorage.setItem("admin_token", res.token);
          if (res.admin) {
             localStorage.setItem("admin_info", JSON.stringify(res.admin));
          }
          // Redirect to dashboard
          window.location.href = "/admin";
        } else {
          throw new Error("Không nhận được token từ server");
        }
      } catch (error: any) {
        errorDiv.textContent = error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
        errorDiv.classList.remove("hidden");
      } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  private template(): string {
    return `
      <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <!-- Background Decorations -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]"></div>
            <div class="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]"></div>
        </div>

        <div class="relative w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 mb-4">
              <i class="fa-solid fa-shield-halved text-2xl text-white"></i>
            </div>
            <h1 class="text-2xl font-black text-white tracking-tight">Hệ Thống Quản Trị</h1>
            <p class="text-slate-400 text-sm mt-2">Đăng nhập để truy cập Control Center</p>
          </div>

          <div id="admin-login-error" class="hidden mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
            <!-- Error message will appear here -->
          </div>

          <form id="admin-login-form" class="space-y-6">
            <div>
              <label for="admin-username" class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tài khoản Admin</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fa-solid fa-user text-slate-500"></i>
                </div>
                <input type="text" id="admin-username" 
                  class="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Nhập username...">
              </div>
            </div>

            <div>
              <label for="admin-password" class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Mật khẩu</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fa-solid fa-lock text-slate-500"></i>
                </div>
                <input type="password" id="admin-password" 
                  class="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="••••••••">
              </div>
            </div>

            <button type="submit" id="admin-login-btn"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 flex items-center justify-center">
              Đăng nhập hệ thống <i class="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </form>
          
          <div class="mt-8 text-center">
            <a href="/" class="text-sm text-slate-500 hover:text-white transition-colors">
              <i class="fa-solid fa-arrow-left mr-1"></i> Quay lại Cửa hàng
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
