import Link from 'next/link';

export default function Page() {
  return (
    <>


    {/* Hero Fullscreen Intro */}
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
            <img src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=2400" className="w-full h-full object-cover opacity-80" alt="Lookbook Cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20"></div>
        </div>
        <div className="container mx-auto px-8 z-10 text-center text-white fade-in">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.6em] mb-6 opacity-90 drop-shadow-sm">Bộ sưu tập mùa Đông</span>
            <h1 className="font-serif text-6xl md:text-9xl font-black mb-6 leading-none drop-shadow-sm">Winter<br /><i className="font-normal italic text-white/80">Symphony.</i></h1>
            <p className="text-white/70 text-sm max-w-lg mx-auto uppercase tracking-widest font-bold">Khám phá nghệ thuật sắp đặt hình khối và ánh sáng.</p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-70">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Khám phá</span>
            <div className="w-[1px] h-12 bg-white/50"></div>
        </div>
    </section>

    <main className="py-32 bg-[#faf9f6]">
        <div className="container mx-auto px-4 md:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-24 reveal-item">
                <h2 className="font-serif text-4xl font-black italic mb-6">The Visual Experience</h2>
                <p className="text-slate-500 text-sm leading-relaxed">Bộ sưu tập là một bản giao hưởng của những đường cắt hoàn hảo và chất liệu vượt thời gian. Không có rào cản, chỉ có cái đẹp thuần túy hiện hữu qua từng bức ảnh.</p>
            </div>

            {/* Asymmetric Masonry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                
                {/* Row 1 */}
                <div className="md:col-span-7 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group" style={{ height: '80vh' }}>
                    <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1200" className="w-full h-full object-cover object-center look-img" alt="Look 01" />
                    <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] font-black uppercase tracking-widest block mb-2">Look 01</span>
                        <h3 className="font-serif text-2xl font-black italic">Classic Midnight Suit</h3>
                    </div>
                </div>

                <div className="md:col-span-5 flex flex-col gap-8 md:gap-12">
                    <div className="flex-1 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group">
                        <img src="https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=800" className="w-full h-full object-cover object-center look-img" alt="Look 02" />
                        <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <span className="text-[9px] font-black uppercase tracking-widest block mb-2">Look 02</span>
                            <h3 className="font-serif text-2xl font-black italic">Heritage Overcoat</h3>
                        </div>
                    </div>
                    <div className="flex-1 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group">
                        <img src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800" className="w-full h-full object-cover object-center look-img" alt="Look 03" />
                        <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <span className="text-[9px] font-black uppercase tracking-widest block mb-2">Look 03</span>
                            <h3 className="font-serif text-2xl font-black italic">Artistic Tailoring</h3>
                        </div>
                    </div>
                </div>

                {/* Row 2 (Full Width Quote + Image) */}
                <div className="md:col-span-12 my-20 reveal-item text-center px-4">
                    <p className="font-serif text-3xl md:text-5xl font-black text-slate-800 italic leading-snug max-w-4xl mx-auto">
                        "Sang trọng không phải là điều để phô trương. Nó là trải nghiệm cá nhân sâu sắc giữa cơ thể và những chất liệu thượng hạng nhất."
                    </p>
                </div>

                {/* Row 3 */}
                <div className="md:col-span-4 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group" style={{ height: '60vh' }}>
                    <img src="https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800" className="w-full h-full object-cover object-center look-img" alt="Look 04" />
                    <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] font-black uppercase tracking-widest block mb-2">Look 04</span>
                        <h3 className="font-serif text-xl font-black italic">Chelsea Boots</h3>
                    </div>
                </div>

                <div className="md:col-span-8 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group" style={{ height: '60vh' }}>
                    <img src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1600" className="w-full h-full object-cover object-[center_30%] look-img" alt="Look 05" />
                    <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] font-black uppercase tracking-widest block mb-2">Look 05</span>
                        <h3 className="font-serif text-2xl font-black italic">Silk Evening Gown</h3>
                    </div>
                </div>

                {/* Row 4 */}
                <div className="md:col-span-6 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group" style={{ height: '70vh' }}>
                    <img src="https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg?auto=compress&cs=tinysrgb&w=1200" className="w-full h-full object-cover object-center look-img" alt="Look 06" />
                </div>

                <div className="md:col-span-6 reveal-item look-card relative overflow-hidden rounded-xl bg-slate-100 group" style={{ height: '70vh' }}>
                    <img src="https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg?auto=compress&cs=tinysrgb&w=1200" className="w-full h-full object-cover object-center look-img" alt="Look 07" />
                </div>
            </div>
            
            <div className="text-center mt-32 reveal-item">
                <Link href="/shop" className="inline-flex items-center gap-4 border-b border-black pb-2 text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-all">
                    Chuyển đến cửa hàng <i className="fa-solid fa-arrow-right-long"></i>
                </Link>
            </div>
        </div>
    </main>

    
    </>
  );
}