var e=class{static render(){return`
      <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <!-- Logo -->
          <a href="/" class="text-2xl font-serif font-black tracking-tighter text-slate-900">
            CLOSET<span class="text-indigo-600">.</span>
          </a>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-10">
            <a href="/" class="text-sm font-black uppercase tracking-widest text-slate-900 hover:text-indigo-600 transition-colors">Trang chủ</a>
            <a href="/products" class="text-sm font-black uppercase tracking-widest text-slate-900 hover:text-indigo-600 transition-colors">Cửa hàng</a>
            <a href="/about" class="text-sm font-black uppercase tracking-widest text-slate-900 hover:text-indigo-600 transition-colors">Về chúng tôi</a>
          </nav>

          <!-- Icons -->
          <div class="flex items-center gap-6 text-slate-900">
            <button class="hover:text-indigo-600 transition-colors"><i class="fa-solid fa-magnifying-glass"></i></button>
            <a href="/cart" class="relative hover:text-indigo-600 transition-colors">
              <i class="fa-solid fa-cart-shopping"></i>
              <span class="absolute -top-2 -right-2 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
            </a>
            <button class="md:hidden"><i class="fa-solid fa-bars"></i></button>
          </div>
        </div>
      </header>
    `}},t=class{static render(){return`
      <footer class="bg-slate-900 text-white py-20">
        <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="col-span-1 md:col-span-1">
            <h3 class="text-2xl font-serif font-black mb-6">CLOSET.</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Nâng tầm phong cách cá nhân với những thiết kế tối giản và chất liệu cao cấp nhất.</p>
          </div>
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest mb-6">Liên kết</h4>
            <ul class="space-y-4 text-slate-400 text-sm">
              <li><a href="/products" class="hover:text-white transition-colors">Sản phẩm</a></li>
              <li><a href="/blog" class="hover:text-white transition-colors">Bộ sưu tập</a></li>
              <li><a href="/about" class="hover:text-white transition-colors">Về chúng tôi</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest mb-6">Hỗ trợ</h4>
            <ul class="space-y-4 text-slate-400 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Hướng dẫn chọn size</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest mb-6">Đăng ký nhận tin</h4>
            <div class="flex gap-2">
              <input type="email" placeholder="Email của bạn" class="bg-slate-800 border-none rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:ring-2 focus:ring-indigo-600">
              <button class="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-all"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-slate-800 text-center text-slate-500 text-xs">
          © 2026 Closet. All rights reserved. Designed for Quiet Luxury.
        </div>
      </footer>
    `}};export{e as n,t};