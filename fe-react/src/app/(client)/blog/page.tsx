import Link from "next/link";
import Pagination from "../../../components/client/Pagination";
import BlogCard from "../../../components/client/BlogCard";

export default function Page() {
  return (
    <>
      {/* Header Section */}
      <header className="pt-40 pb-20 border-b border-slate-200/60 text-center fade-in">
        <div className="container mx-auto px-8">
          <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
            Tạp chí thời trang
          </span>
          <h1 className="font-serif text-6xl md:text-8xl font-black italic mb-10">
            Journal.
          </h1>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-12">
            <Link
              href="#"
              className="text-slate-900 border-b border-slate-900 pb-2"
            >
              Tất cả
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-all pb-2">
              Thời trang
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-all pb-2">
              Di sản
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-all pb-2">
              Phong cách sống
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-all pb-2">
              Nghệ thuật
            </Link>
          </div>
        </div>
      </header>

      <main className="py-24 fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="container mx-auto px-8">
          {/* Hero Featured Article */}
          <div className="mb-24 cursor-pointer group article-card">
            <Link href="/post-detail" className="block">
              <div className="relative w-full aspect-[21/9] bg-slate-100 rounded-2xl overflow-hidden mb-10">
                <img
                  src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=2400"
                  className="w-full h-full object-cover object-[center_30%] transition-transform duration-[1500ms] ease-out"
                  alt="Hero Article"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                  <span className="bg-white/20 backdrop-blur text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6 inline-block">
                    Mới nhất
                  </span>
                  <h2 className="font-serif text-4xl md:text-6xl font-black italic mb-4">
                    Sức hút của sự Tĩnh Lặng: Định hình phong cách Thu Đông 2026
                  </h2>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/70">
                    <span>18 Tháng 5, 2026</span>
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <span>Bởi Closet Team</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {/* Article 1 */}
            <BlogCard
              image="https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800"
              category="Thời trang"
              title="Nghệ thuật phối đồ tối giản cho nam giới hiện đại"
              excerpt="Làm thế nào để tạo ra điểm nhấn chỉ với những gam màu trung tính và phom dáng cổ điển..."
              date="15 Tháng 5, 2026"
              readTime="5 phút đọc"
            />
            {/* Article 2 */}
            <BlogCard
              image="https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=800"
              category="Di sản"
              title="Gặp gỡ Giám đốc sáng tạo đằng sau CLOSET"
              excerpt="Cuộc phỏng vấn độc quyền về nguồn cảm hứng và triết lý thiết kế Quiet Luxury của thương hiệu..."
              date="10 Tháng 5, 2026"
              readTime="12 phút đọc"
            />
            {/* Article 3 */}
            <BlogCard
              image="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800"
              category="Phong cách sống"
              title="Lookbook: Ánh sáng ban mai rực rỡ tại Paris"
              excerpt="Theo chân người mẫu lang thang trên những con phố tĩnh lặng nhất của thủ đô ánh sáng..."
              date="05 Tháng 5, 2026"
              readTime="3 phút đọc"
            />
            {/* Article 4 */}
            <BlogCard
              image="https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=800"
              category="Sự kiện"
              title="Nhìn Lại Tuần Lễ Thời Trang Milan 2026"
              excerpt="Tổng hợp những thiết kế ấn tượng nhất và các xu hướng sắp tới cho mùa mốt tiếp theo..."
              date="01 Tháng 5, 2026"
              readTime="8 phút đọc"
            />
            {/* Article 5 */}
            <BlogCard
              image="https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=800"
              category="Thời trang"
              title="Bí Quyết Bảo Quản Áo Khoác Cashmere Cao Cấp"
              excerpt="Những kiến thức căn bản để giữ gìn món đồ xa xỉ của bạn luôn bền đẹp như mới qua năm tháng..."
              date="28 Tháng 4, 2026"
              readTime="4 phút đọc"
            />
            {/* Article 6 */}
            <BlogCard
              image="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800"
              category="Nghệ thuật"
              title="Phong Cách Monochrome: Sức Hút Từ Sự Đơn Sắc"
              excerpt="Sử dụng một tông màu duy nhất để tạo chiều sâu và đẳng cấp cho trang phục của bạn..."
              date="20 Tháng 4, 2026"
              readTime="6 phút đọc"
            />
          </div>

          {/* Pagination */}
          <Pagination currentPage={1} totalPages={3} baseHref="/blog" />
        </div>
      </main>
    </>
  );
}
