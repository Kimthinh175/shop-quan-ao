export class ClientHeader {
  public static render(): string {
    return `
      <nav id="main-nav" class="fixed top-0 w-full z-[100] transition-all duration-500 h-24 flex items-center">
        <div class="container mx-auto px-8 flex justify-between items-center">
          <!-- Logo -->
          <a href="/" class="font-serif text-3xl font-black tracking-tighter hover:opacity-70 transition-all">
            CLOSET.
          </a>

          <!-- Navigation -->
          <ul class="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
            <li><a href="/catalog" class="hover:text-indigo-600 transition-all duration-300">Cửa hàng</a></li>
            <li><a href="/blog" class="hover:text-indigo-600 transition-all duration-300">Blog</a></li>
            <li><a href="#" class="hover:text-indigo-600 transition-all duration-300">Lookbook</a></li>
            <li><a href="#" class="hover:text-indigo-600 transition-all duration-300">Thương hiệu</a></li>
          </ul>

          <!-- Icons -->
          <div class="flex items-center gap-8 text-sm">
            <button class="hover:opacity-50 transition-all"><i class="fa-solid fa-magnifying-glass"></i></button>
            <a href="/cart" class="relative hover:opacity-50 transition-all flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-widest">GIỎ HÀNG</span>
              <span class="text-[10px] bg-slate-900 text-white w-5 h-5 flex items-center justify-center rounded-full font-black">0</span>
            </a>
          </div>
        </div>
      </nav>
    `;
  }
}
