export class ClientFooter {
  public static render(): string {
    return `
      <footer class="bg-[#0b0c10] text-[#c5c6c7] pt-28 pb-16 border-t border-[#1f2833]/20 relative overflow-hidden">
        <!-- Ambient light glow -->
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-6 relative z-10">
          <!-- Top Section: Logo & Newsletter -->
          <div class="flex flex-col lg:flex-row justify-between items-start gap-16 pb-20 border-b border-slate-800/40">
            <div class="max-w-md">
              <h3 class="font-serif text-4xl font-black text-white tracking-tighter mb-6 italic">CLOSET.</h3>
              <p class="text-slate-400 text-sm leading-relaxed mb-8">
                Đỉnh cao của nghệ thuật tối giản và thời trang thượng hạng. Chúng tôi kiến tạo những giá trị vượt thời gian, định hình phong cách sang trọng thầm lặng.
              </p>
              <div class="flex items-center gap-6">
                <a href="#" class="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all duration-300"><i class="fa-brands fa-instagram text-sm"></i></a>
                <a href="#" class="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all duration-300"><i class="fa-brands fa-facebook-f text-sm"></i></a>
                <a href="#" class="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all duration-300"><i class="fa-brands fa-pinterest-p text-sm"></i></a>
                <a href="#" class="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all duration-300"><i class="fa-brands fa-tiktok text-sm"></i></a>
              </div>
            </div>

            <div class="w-full lg:max-w-md">
              <h4 class="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Đăng ký nhận bản tin sớm</h4>
              <p class="text-slate-400 text-xs leading-relaxed mb-6">Nhận thông tin về các bộ sưu tập mới nhất và những ưu đãi độc quyền.</p>
              <div class="flex gap-2 w-full">
                <input type="email" placeholder="Địa chỉ email của bạn" class="flex-1 bg-slate-900/60 border border-slate-800 px-6 py-4 rounded-xl text-xs text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-slate-500 font-bold uppercase tracking-widest">
                <button type="submit" class="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-lg shadow-white/5">Đăng ký</button>
              </div>
            </div>
          </div>

          <!-- Middle Section: Navigation Columns -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-12 py-20 text-sm">
            <div>
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Bộ sưu tập</h4>
              <ul class="space-y-4 text-xs font-bold text-slate-400 tracking-wider">
                <li><a href="/catalog" class="hover:text-white transition-all">Classic Suit</a></li>
                <li><a href="/catalog" class="hover:text-white transition-all">Heritage Overcoat</a></li>
                <li><a href="/catalog" class="hover:text-white transition-all">Merino Knitwear</a></li>
                <li><a href="/catalog" class="hover:text-white transition-all">Evening Dress</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Khám phá</h4>
              <ul class="space-y-4 text-xs font-bold text-slate-400 tracking-wider">
                <li><a href="/catalog" class="hover:text-white transition-all">Cửa hàng chính hãng</a></li>
                <li><a href="/blog" class="hover:text-white transition-all">Bản tin Journal</a></li>
                <li><a href="#" class="hover:text-white transition-all">Lookbook Tĩnh</a></li>
                <li><a href="#" class="hover:text-white transition-all">Câu chuyện thương hiệu</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Dịch vụ khách hàng</h4>
              <ul class="space-y-4 text-xs font-bold text-slate-400 tracking-wider">
                <li><a href="#" class="hover:text-white transition-all">Liên hệ hỗ trợ</a></li>
                <li><a href="#" class="hover:text-white transition-all">Chính sách vận chuyển</a></li>
                <li><a href="#" class="hover:text-white transition-all">Đổi trả & Bảo hành</a></li>
                <li><a href="#" class="hover:text-white transition-all">Hướng dẫn chọn size</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Cửa hàng</h4>
              <p class="text-xs text-slate-400 leading-relaxed mb-4">
                <strong class="text-white block mb-1">Flagship Store</strong>
                123 Đường Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </p>
              <p class="text-xs text-slate-400 leading-relaxed">
                <strong class="text-white block mb-1">Hotline liên hệ</strong>
                1900 123 456 (9:00 - 22:00)
              </p>
            </div>
          </div>

          <!-- Bottom Section: Copyright & Payments -->
          <div class="pt-8 border-t border-slate-800/40 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <p>&copy; 2026 Closet Fashion Store. All Rights Reserved. Designed for Quiet Luxury.</p>
            <div class="flex items-center gap-6">
              <span class="opacity-50">Phương thức thanh toán:</span>
              <div class="flex gap-3 text-lg text-slate-500">
                <i class="fa-brands fa-cc-visa hover:text-white transition-all"></i>
                <i class="fa-brands fa-cc-mastercard hover:text-white transition-all"></i>
                <i class="fa-brands fa-cc-apple-pay hover:text-white transition-all"></i>
                <i class="fa-solid fa-money-bill-transfer hover:text-white transition-all"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}
