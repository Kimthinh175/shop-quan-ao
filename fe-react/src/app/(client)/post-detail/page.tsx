import Link from 'next/link';

export default function Page() {
  return (
    <>


    <article className="pt-40 pb-20">
        <div className="container mx-auto px-8 max-w-4xl">
            {/* Header */}
            <header className="text-center mb-20">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-6 block">Xu hướng</span>
                <h1 className="font-serif text-5xl md:text-7xl font-black italic mb-10 leading-tight">Nghệ thuật phối đồ tối giản cho mùa Thu 2026.</h1>
                <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Thịnh Admin</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>15 Tháng 5, 2026</span>
                </div>
            </header>

            {/* Featured Image */}
            <div className="aspect-video bg-slate-100 overflow-hidden mb-20">
                <img src="https://images.unsplash.com/photo-1490481651871-ab68624d5517?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
            </div>

            {/* Content */}
            <div className="space-y-12 text-slate-600 text-lg leading-relaxed first-letter:text-7xl first-letter:font-serif first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-slate-900">
                <p>Mùa thu không chỉ là sự thay đổi của thời tiết, mà còn là khoảnh khắc để chúng ta làm mới lại tâm hồn và phong cách cá nhân. Tại Closet, chúng tôi luôn tin rằng sự đơn giản chính là đỉnh cao của sự tinh tế. Thay vì chạy theo những xu hướng nhất thời, việc tập trung vào chất liệu và phom dáng sẽ giúp bạn tỏa sáng một cách thầm lặng nhưng đầy uy quyền.</p>

                <h2 className="font-serif text-3xl text-slate-900 font-black italic">1. Sức mạnh của các gam màu trung tính</h2>
                <p>Màu be, xám khói, và xanh navy là những "vũ khí" bí mật của phong cách Quiet Luxury. Việc kết hợp các sắc độ khác nhau của cùng một tông màu sẽ tạo nên một chiều sâu thị giác đầy thú vị mà không cần đến những họa tiết cầu kỳ.</p>
                
                <div className="grid grid-cols-2 gap-8 my-16">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" className="w-full aspect-[3/4] object-cover" alt="" />
                    <img src="https://images.unsplash.com/photo-1539109132314-3477524c859c?w=800" className="w-full aspect-[3/4] object-cover" alt="" />
                </div>

                <h2 className="font-serif text-3xl text-slate-900 font-black italic">2. Chất liệu là linh hồn</h2>
                <p>Một chiếc áo khoác Merino hay một bộ suit lụa tơ tằm không chỉ đẹp ở vẻ ngoài mà còn ở cảm giác chạm vào làn da. Đầu tư vào chất liệu là cách bạn thể hiện sự tôn trọng với chính bản thân mình.</p>

                <blockquote className="border-l-4 border-indigo-600 pl-8 py-4 my-16">
                    <p className="font-serif text-2xl text-slate-800 italic">"Thời trang có thể mua được, nhưng phong cách là thứ bạn phải sở hữu."</p>
                    <cite className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 block">— Nhà thiết kế Closet</cite>
                </blockquote>

                <p>Kết thúc bài viết này, chúng tôi hy vọng bạn sẽ tìm thấy cảm hứng để kiến tạo nên một tủ đồ tối giản nhưng mang đậm dấu ấn cá nhân. Hãy nhớ rằng, sự sang trọng không nằm ở logo, mà nằm ở thần thái và cách bạn lựa chọn những gì tốt nhất cho mình.</p>
            </div>

            {/* Share & Navigation */}
            <footer className="mt-24 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex gap-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chia sẻ:</span>
                    <a href="#" className="hover:text-indigo-600 transition-all"><i className="fa-brands fa-facebook-f"></i></a>
                    <a href="#" className="hover:text-indigo-600 transition-all"><i className="fa-brands fa-pinterest-p"></i></a>
                    <a href="#" className="hover:text-indigo-600 transition-all"><i className="fa-brands fa-twitter"></i></a>
                </div>
                <div className="flex gap-12">
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest group">
                        <span className="text-slate-400 block mb-1">Bài trước</span>
                        <span className="group-hover:text-indigo-600 transition-all">Bí quyết chọn vải</span>
                    </a>
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest group text-right">
                        <span className="text-slate-400 block mb-1">Bài tiếp</span>
                        <span className="group-hover:text-indigo-600 transition-all">Paris Lookbook</span>
                    </a>
                </div>
            </footer>
        </div>
    </article>

    
    </>
  );
}