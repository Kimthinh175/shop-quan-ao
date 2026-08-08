import Link from 'next/link';

export default function Page() {
  return (
    <>


    {/* Header Section */}
    <header className="pt-48 pb-20 border-b border-slate-200/60 text-center fade-in">
        <div className="container mx-auto px-8 max-w-4xl">
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Triết lý của chúng tôi</span>
            <h1 className="font-serif text-5xl md:text-7xl font-black italic mb-10 leading-tight">Tinh hoa của sự tĩnh lặng.</h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium px-4">Tại CLOSET, chúng tôi tin rằng sự sang trọng thực sự không nằm ở những logo hào nhoáng hay những thiết kế rườm rà. Sang trọng là khi bạn cảm nhận được giá trị tuyệt đối trong từng đường kim, sợi chỉ, trên những chất liệu thượng hạng được chế tác hoàn toàn thủ công.</p>
        </div>
    </header>

    <main>
        {/* Section: The Craft (Zig-Zag 1) */}
        <section className="py-24 md:py-36 border-b border-slate-200/50">
            <div className="container mx-auto px-8">
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 reveal-item">
                    <div className="md:w-1/2">
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-xl">
                            <img src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1200" className="w-full h-full object-cover" alt="The Craftsmanship" />
                        </div>
                    </div>
                    <div className="md:w-1/2 max-w-lg">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Nghệ nhân & Kỹ thuật</span>
                        <h2 className="font-serif text-4xl md:text-5xl font-black mb-8 leading-tight"><i className="font-normal italic text-slate-400">The</i> Craft.</h2>
                        <p className="text-slate-600 leading-relaxed mb-6 text-sm">Quá trình tạo ra một chiếc áo khoác của CLOSET đòi hỏi hơn 40 giờ lao động thủ công từ những nghệ nhân có ít nhất 15 năm kinh nghiệm. Mỗi chi tiết nhỏ, từ những khuy cài sừng thật đến các mũi khâu ẩn, đều được thực hiện với độ chính xác tuyệt đối.</p>
                        <p className="text-slate-600 leading-relaxed text-sm">Chúng tôi từ chối sản xuất công nghiệp hàng loạt để giữ gìn cái hồn của nghệ thuật may đo truyền thống, nơi máy móc không thể thay thế bàn tay con người.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section: The Materials (Zig-Zag 2) */}
        <section className="py-24 md:py-36 bg-white">
            <div className="container mx-auto px-8">
                <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24 reveal-item">
                    <div className="md:w-1/2">
                        <div className="aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-xl">
                            <img src="https://images.pexels.com/photos/2220329/pexels-photo-2220329.jpeg?auto=compress&cs=tinysrgb&w=1200" className="w-full h-full object-cover" alt="Premium Materials" />
                        </div>
                    </div>
                    <div className="md:w-1/2 max-w-lg">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Nguồn gốc nguyên liệu</span>
                        <h2 className="font-serif text-4xl md:text-5xl font-black mb-8 leading-tight"><i className="font-normal italic text-slate-400">Pure</i> Materials.</h2>
                        <p className="text-slate-600 leading-relaxed mb-6 text-sm">Chúng tôi tìm kiếm những nhà cung cấp sợi tốt nhất trên thế giới. Lụa tơ tằm nguyên bản, len Merino siêu mịn từ Australia và Cashmere tinh khiết từ cao nguyên Nội Mông.</p>
                        <p className="text-slate-600 leading-relaxed text-sm">Sự bền vững là ưu tiên hàng đầu. Chúng tôi chỉ hợp tác với các trang trại chăn nuôi nhân đạo và các xưởng nhuộm tuân thủ tiêu chuẩn sinh thái nghiêm ngặt nhất.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Philosophy Banner */}
        <section className="relative py-40 bg-[#0b0c10] text-white overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40">
                <img src="https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=2400" className="w-full h-full object-cover" alt="Creative Director" />
                <div className="absolute inset-0 bg-black/70"></div>
            </div>
            
            <div className="container mx-auto px-8 text-center relative z-10 max-w-4xl reveal-item">
                <i className="fa-solid fa-quote-left text-4xl text-indigo-500/50 mb-8"></i>
                <p className="font-serif text-3xl md:text-5xl font-black italic leading-snug mb-10">
                    "Trang phục không nên làm lu mờ người mặc. Nó sinh ra để là phông nền tĩnh lặng, làm nổi bật khí chất bên trong của bạn."
                </p>
                <div className="w-16 h-[1px] bg-white/30 mx-auto mb-6"></div>
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-1">Alexandre Nguyen</h4>
                <cite className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Giám đốc Sáng tạo</cite>
            </div>
        </section>

    </main>

    
    </>
  );
}