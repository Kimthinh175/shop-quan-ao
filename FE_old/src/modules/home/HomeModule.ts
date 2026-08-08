import { ApiClient } from "../../api/ApiClient";
import { ProductCard } from "../../components/ProductCard";
import { IProduct } from "../../shared/models/IProduct";
import { IArticle } from "../../shared/interfaces/IPost";
import { PostService, articleThumbnail, formatArticleDate } from "../../shared/services/PostService";

interface IPromotion {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  discountBadge: string;
  image: string;
  daysRemaining: number;
}

export class HomeModule {
  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    // Loading State
    app.innerHTML = this.template([], [], []);

    try {
      let products: IProduct[] = [];
      let posts: IArticle[] = [];
      
      // Mock Promotions - Phong cách thực dụng, Flash Sale
      let promotions: IPromotion[] = [
        {
          id: 1,
          title: "Combo Mùa Hè - Mua 2 Tặng 1",
          subtitle: "Flash Sale",
          description: "Gói combo áo thun và quần đùi thấm hút mồ hôi tối đa. Hoàn hảo cho thời tiết nắng nóng.",
          discountBadge: "-30%",
          image: "https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=800",
          daysRemaining: 99
        },
        {
          id: 2,
          title: "Tuần Lễ Quần Short",
          subtitle: "Deal Chớp Nhoáng",
          description: "Các mẫu quần short thể thao và dạo phố đồng giá từ 149k. Số lượng có hạn.",
          discountBadge: "Đồng giá 149k",
          image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800",
          daysRemaining: 5
        }
      ];

      try {
        const productRes = await ApiClient.get<import("../../shared/interfaces/ITypes").IPaginationResponse<IProduct>>("/products?limit=8&sort=-createdAt");
        if (productRes && productRes.results) products = productRes.results;
      } catch (e) {
        console.warn("Lỗi load products, dùng Mock Data", e);
        // Mock data Coolmate style
        products = [
          {
            id: 1,
            name: "Áo Thun Cotton Compact Phom Suông",
            description: "Chất liệu 100% cotton compact, mềm mịn, không bai dão.",
            price: 199000,
            image: "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=600",
            category_id: 1
          },
          {
            id: 2,
            name: "Quần Short Thể Thao Siêu Nhẹ",
            description: "Chất vải polyester kháng nước, co giãn 4 chiều.",
            price: 249000,
            image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600",
            category_id: 2
          },
          {
            id: 3,
            name: "Áo Polo Pique Trượt Nước",
            description: "Công nghệ chống thấm nước nhẹ, form chuẩn cho dân công sở.",
            price: 350000,
            image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600",
            category_id: 1
          },
          {
            id: 4,
            name: "Set Bộ Đồ Ngủ Cotton",
            description: "Thoải mái tuyệt đối cho giấc ngủ ngon.",
            price: 399000,
            image: "https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg?auto=compress&cs=tinysrgb&w=600",
            category_id: 3
          },
          {
            id: 5,
            name: "Áo Sơ Mi Vải Linen Mát Lạnh",
            description: "Thấm hút cực tốt, phù hợp cho ngày hè oi bức.",
            price: 450000,
            image: "https://images.pexels.com/photos/3317434/pexels-photo-3317434.jpeg?auto=compress&cs=tinysrgb&w=600",
            category_id: 1
          }
        ];
      }

      try {
        const postService = new PostService();
        const postRes = await postService.fetchPosts({ limit: 3, sort: "-published_at" });
        if (postRes?.results) posts = postRes.results;
      } catch (e) {
        console.warn("Lỗi load posts", e);
      }

      app.innerHTML = this.template(products, posts, promotions);

    } catch (error) {
      console.error("HomeModule Error:", error);
    }
  }

  private renderProductGrid(products: IProduct[]): string {
    if (!products || products.length === 0) {
      return `<div class="py-10 text-center text-slate-500">Đang tải sản phẩm...</div>`;
    }

    let html = `<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">`;
    
    // Fallback if we have fewer products just loop them to fill the grid for demo
    const displayProducts = products.length >= 5 ? products : [...products, ...products, ...products, ...products].slice(0, 5);

    displayProducts.forEach(product => {
      html += ProductCard.render(product);
    });

    html += `</div>`;
    return html;
  }

  private renderPromotions(promotions: IPromotion[]): string {
    if (!promotions || promotions.length === 0) return '';
    
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">';
    promotions.forEach((promo) => {
        html += `
        <div class="bg-[#4b6275] text-white rounded-xl overflow-hidden flex flex-col sm:flex-row shadow-lg hover:shadow-xl transition-shadow relative">
            <div class="w-full sm:w-2/5 aspect-square sm:aspect-auto bg-slate-800 relative">
                <img src="${promo.image}" class="w-full h-full object-cover" alt="${promo.title}">
                <div class="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded shadow-sm uppercase">
                    ${promo.discountBadge}
                </div>
            </div>
            <div class="w-full sm:w-3/5 p-6 sm:p-8 flex flex-col justify-center">
                <span class="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2 block"><i class="fa-solid fa-bolt mr-1"></i> ${promo.subtitle}</span>
                <h3 class="text-2xl font-black mb-3 leading-tight">${promo.title}</h3>
                <p class="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-3">${promo.description}</p>
                <div class="mt-auto">
                    <div class="flex items-center gap-2 mb-3 text-sm font-bold bg-white/10 w-max px-3 py-1.5 rounded-lg">
                        <i class="fa-regular fa-clock"></i> Còn ${promo.daysRemaining} ngày
                    </div>
                    <a href="/promotions" class="inline-block bg-white text-black font-bold uppercase text-sm px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors w-full text-center sm:w-auto shadow-md">
                        Xem Ưu Đãi
                    </a>
                </div>
            </div>
        </div>
        `;
    });
    html += '</div>';
    return html;
  }

  private renderJournal(posts: IArticle[]): string {
    if (!posts.length) return "";

    const cards = posts
      .map(
        (post) => `
        <a href="/posts/${post.slug}" class="group block bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <img src="${articleThumbnail(post)}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            ${post.category ? `<span class="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">${post.category}</span>` : ""}
          </div>
          <div class="p-4">
            ${formatArticleDate(post) ? `<p class="text-[11px] font-bold text-slate-400 mb-2">${formatArticleDate(post)}</p>` : ""}
            <h3 class="text-sm font-black text-slate-900 line-clamp-2 group-hover:text-[#2a83e9] transition-colors duration-200">${post.title}</h3>
            <p class="text-xs text-slate-500 mt-2 line-clamp-2">${post.excerpt || ""}</p>
          </div>
        </a>`
      )
      .join("");

    return `
      <section class="py-12 bg-white border-t border-slate-100">
        <div class="container mx-auto px-4 lg:px-8">
          <div class="flex justify-between items-center mb-8">
            <div>
              <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">CLOSET Journal</p>
              <h2 class="text-2xl font-black uppercase text-slate-900">Tin Tức &amp; Phong Cách</h2>
            </div>
            <a href="/blog" class="text-sm font-bold text-[#2a83e9] hover:text-slate-900 transition-colors duration-200">
              Xem tất cả <i class="fa-solid fa-chevron-right text-xs ml-1"></i>
            </a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            ${cards}
          </div>
        </div>
      </section>`;
  }

  private template(products: IProduct[], posts: IArticle[], promotions: IPromotion[]): string {
    return `
      
        
        <!-- Hero Banner (Functional/Sales focused) -->
        <section class="bg-slate-900 relative">
            <div class="hidden md:block w-full h-[500px]">
                <img src="https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&cs=tinysrgb&w=2000" class="w-full h-full object-cover object-top opacity-60" alt="Banner">
            </div>
            <div class="md:hidden w-full aspect-square">
                <img src="https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&cs=tinysrgb&w=800" class="w-full h-full object-cover object-top opacity-60" alt="Banner">
            </div>
            
            <div class="absolute inset-0 flex items-center">
                <div class="container mx-auto px-4 lg:px-8">
                    <div class="max-w-xl text-white">
                        <div class="bg-red-500 text-white text-xs font-black uppercase px-3 py-1 rounded inline-block mb-4 shadow-lg">Sale Cuối Tháng</div>
                        <h1 class="text-4xl md:text-6xl font-black mb-4 leading-tight">Tuần Lễ Thời Trang<br>Nam Giới</h1>
                        <p class="text-lg text-slate-200 mb-8 max-w-md">Mua sắm các sản phẩm cơ bản với giá tốt nhất. Giảm đến 50% toàn bộ áo thun và quần short.</p>
                        <div class="flex gap-4">
                            <a href="/products" class="bg-white text-black font-black uppercase px-8 py-3 rounded hover:bg-slate-200 transition-colors shadow-lg">Mua Ngay</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Value Propositions (Lý do chọn CLOSET) -->
        <section class="bg-white py-6 border-b border-slate-200">
            <div class="container mx-auto px-4 lg:px-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-slate-100">
                    <div class="flex flex-col items-center gap-2 p-2">
                        <i class="fa-solid fa-truck-fast text-2xl text-[#2a83e9]"></i>
                        <h4 class="font-bold text-sm">Miễn phí vận chuyển</h4>
                        <p class="text-xs text-slate-500">Cho đơn hàng từ 200k</p>
                    </div>
                    <div class="flex flex-col items-center gap-2 p-2">
                        <i class="fa-solid fa-rotate-left text-2xl text-[#2a83e9]"></i>
                        <h4 class="font-bold text-sm">Đổi trả 60 ngày</h4>
                        <p class="text-xs text-slate-500">Không cần lý do</p>
                    </div>
                    <div class="flex flex-col items-center gap-2 p-2">
                        <i class="fa-solid fa-shield-halved text-2xl text-[#2a83e9]"></i>
                        <h4 class="font-bold text-sm">Chất lượng đảm bảo</h4>
                        <p class="text-xs text-slate-500">Cam kết 100% chính hãng</p>
                    </div>
                    <div class="flex flex-col items-center gap-2 p-2">
                        <i class="fa-solid fa-headset text-2xl text-[#2a83e9]"></i>
                        <h4 class="font-bold text-sm">Hỗ trợ 24/7</h4>
                        <p class="text-xs text-slate-500">Luôn đồng hành cùng bạn</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Flash Sale / Promotions -->
        <section class="py-12 bg-slate-50">
            <div class="container mx-auto px-4 lg:px-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-black uppercase text-slate-900 flex items-center gap-2">
                        <i class="fa-solid fa-fire text-red-500"></i> Khuyến Mãi Hot
                    </h2>
                </div>
                ${this.renderPromotions(promotions)}
            </div>
        </section>

        <!-- Sản Phẩm Mới (Product Grid) -->
        <section class="py-12 bg-white">
            <div class="container mx-auto px-4 lg:px-8">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-black uppercase text-slate-900">Mới Ra Mắt</h2>
                    <a href="/products" class="text-sm font-bold text-[#2a83e9] hover:text-[#6a859a] transition-colors">
                        Xem tất cả <i class="fa-solid fa-chevron-right text-xs ml-1"></i>
                    </a>
                </div>
                
                ${this.renderProductGrid(products)}
            </div>
        </section>
        
        <!-- Sản Phẩm Bán Chạy (Re-using grid for demo) -->
        <section class="py-12 bg-slate-50">
            <div class="container mx-auto px-4 lg:px-8">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-black uppercase text-slate-900">Bán Chạy Nhất</h2>
                    <a href="/products" class="text-sm font-bold text-[#2a83e9] hover:text-[#6a859a] transition-colors">
                        Xem tất cả <i class="fa-solid fa-chevron-right text-xs ml-1"></i>
                    </a>
                </div>
                
                ${this.renderProductGrid(products)}
            </div>
        </section>

        ${this.renderJournal(posts)}
    `;
  }
}
