import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#171717] border-t border-slate-200/80 dark:border-[#D4AF37]/20 pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h2 className="font-serif text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-100 mb-1">
              CLOSET.
            </h2>
            <p className="text-[10px] font-bold text-indigo-600 dark:text-[#D4AF37] uppercase tracking-[0.25em] mb-4">
              THE ART OF DRESSING
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Trải nghiệm mua sắm thời trang tối giản, tinh tế và sang trọng. Tự
              tin thể hiện phong cách độc bản của chính bạn.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#232223] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-black transition-colors"
              >
                <i className="fa-brands fa-facebook-f text-sm"></i>
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#232223] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-600 dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-black transition-colors"
              >
                <i className="fa-brands fa-instagram text-sm"></i>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">
              Cửa hàng
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                >
                  Hàng mới về
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?discount=true"
                  className="hover:text-indigo-600 dark:hover:text-[#D4AF37] transition-colors text-red-500 dark:text-amber-400 font-bold"
                >
                  Giảm giá
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">
              Hỗ trợ
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                >
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">
              Nhận bản tin
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Đăng ký để nhận ưu đãi đặc quyền và bộ sưu tập mới nhất.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 bg-slate-100 dark:bg-[#232223] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-[#D4AF37] rounded-l-xl"
              />
              <button
                type="button"
                className="bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-black px-4 py-2 text-sm font-bold hover:bg-indigo-700 dark:hover:bg-[#EBC563] transition-colors rounded-r-xl"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            &copy; 2026 CLOSET. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
