export class NotFoundModule {
  public render(): void {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Cuộn lên đầu trang khi render module mới
    window.scrollTo(0, 0);

    app.innerHTML = `
      <div class="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center py-12">
        <div class="relative mb-8">
          <h1 class="text-[120px] sm:text-[180px] font-black text-slate-100 font-serif tracking-tighter leading-none select-none">404</h1>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full shadow-2xl flex items-center justify-center animate-bounce">
              <i class="fa-solid fa-compass text-5xl sm:text-6xl text-[#2a83e9]"></i>
            </div>
          </div>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-4 font-serif">Oops! Có vẻ bạn đi nhầm hướng rồi!</h2>
        <p class="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
          Đường dẫn bạn vừa nhập không tồn tại trên hệ thống của CLOSET. Hãy kiểm tra lại URL hoặc quay về trang chủ để tiếp tục mua sắm nhé.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mx-auto">
          <a href="/" class="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-lg">
            Về Trang Chủ
          </a>
          <button onclick="window.history.back()" class="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-slate-50 transition-colors">
            Quay Lại
          </button>
        </div>
      </div>
    `;
  }
}
