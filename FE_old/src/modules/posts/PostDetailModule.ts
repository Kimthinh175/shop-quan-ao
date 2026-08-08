import { IArticle } from "../../shared/interfaces/IPost";
import {
  PostService,
  articleThumbnail,
  formatArticleDate,
} from "../../shared/services/PostService";

export class PostDetailModule {
  private postService = new PostService();

  public async render(slug: string): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    const article = await this.postService.fetchPostBySlug(slug);
    if (!article || article.status !== "published") {
      const { NotFoundModule } = await import("../errors/NotFoundModule");
      new NotFoundModule().render();
      return;
    }

    let related: IArticle[] = [];
    try {
      const res = await this.postService.fetchPosts({
        limit: 6,
        sort: "-published_at",
      });
      related = (res.results || []).filter((p) => p.slug !== slug).slice(0, 4);
    } catch {
      related = [];
    }

    app.innerHTML = this.template(article, related);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private renderRelatedCard(post: IArticle): string {
    const date = formatArticleDate(post);
    const readingTime = this.getReadingTime(post.content);

    return `
      <a href="/posts/${post.slug}" class="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img src="${articleThumbnail(post)}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent"></div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between gap-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
            ${date ? `<span>${date}</span>` : `<span>&nbsp;</span>`}
            <span>${readingTime} phút đọc</span>
          </div>
          <h4 class="text-sm font-black text-slate-900 line-clamp-2 group-hover:text-[#2a83e9] transition-colors duration-200">${post.title}</h4>
        </div>
      </a>
    `;
  }

  private template(article: IArticle, related: IArticle[]): string {
    const date = formatArticleDate(article);
    const category = article.category?.trim();
    const tags = article.tags || [];
    const readingTime = this.getReadingTime(article.content);

    return `
      <article class="bg-slate-50 min-h-[70vh]">
        <div class="relative overflow-hidden bg-slate-950">
          <div class="absolute inset-0">
            <img src="${articleThumbnail(article)}" alt="${article.title}" class="w-full h-full object-cover opacity-25" />
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40"></div>
          </div>
          <div class="relative max-w-7xl mx-auto px-5 lg:px-10 py-14 md:py-20">
            <div class="max-w-4xl text-white">
              <nav class="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-6">
                <a href="/" class="hover:text-white transition-colors duration-200">Trang chủ</a>
                <i class="fa-solid fa-chevron-right text-[8px]"></i>
                <a href="/blog" class="hover:text-white transition-colors duration-200">Journal</a>
                ${category ? `<i class="fa-solid fa-chevron-right text-[8px]"></i><span class="text-[#7cc0ff]">${category}</span>` : ""}
              </nav>

              <div class="flex flex-wrap items-center gap-3 mb-5">
                ${category ? `<span class="bg-white/10 text-white backdrop-blur text-[10px] font-black uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border border-white/10">${category}</span>` : ""}
                ${date ? `<span class="text-xs font-bold text-slate-300"><i class="fa-regular fa-calendar mr-1"></i>${date}</span>` : ""}
                <span class="text-xs font-bold text-slate-300"><i class="fa-regular fa-clock mr-1"></i>${readingTime} phút đọc</span>
              </div>

              <h1 class="text-3xl md:text-5xl font-black leading-tight mb-4">${article.title}</h1>
              ${article.excerpt ? `<p class="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl">${article.excerpt}</p>` : ""}
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-5 lg:px-10 py-8 md:py-12">
          <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
            <div class="space-y-8">
              <div class="rounded-3xl overflow-hidden bg-slate-200 shadow-sm">
                <img src="${articleThumbnail(article)}" alt="${article.title}" class="w-full max-h-[520px] object-cover" />
              </div>

              <div class="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm">
                <div class="prose prose-slate max-w-none text-[15px] md:text-[16px] leading-relaxed text-slate-700
                  prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
                  prose-p:my-4 prose-a:text-[#2a83e9] prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-2xl prose-img:my-6 prose-strong:text-slate-900">
                  ${article.content}
                </div>

                ${
                  tags.length
                    ? `<div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
                        ${tags.map((tag) => `<span class="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">#${tag}</span>`).join("")}
                      </div>`
                    : ""
                }
              </div>

              <div class="flex flex-col sm:flex-row gap-3">
                <a href="/blog" class="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.22em] px-6 py-3.5 rounded-2xl hover:bg-[#2a83e9] transition-colors duration-200">
                  <i class="fa-solid fa-arrow-left text-[10px]"></i> Tất cả bài viết
                </a>
                <a href="/products" class="inline-flex items-center justify-center gap-2 border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-[0.22em] px-6 py-3.5 rounded-2xl hover:bg-slate-900 hover:text-white transition-colors duration-200">
                  Mua sắm ngay
                </a>
              </div>
            </div>

            <aside class="space-y-4 xl:sticky xl:top-6">
              <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <div class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Thông tin bài viết</div>
                <div class="grid gap-4 text-sm">
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-slate-500 font-semibold">Xuất bản</span>
                    <span class="text-slate-900 font-bold text-right">${date || "-"}</span>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-slate-500 font-semibold">Danh mục</span>
                    <span class="text-slate-900 font-bold text-right">${category || "-"}</span>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-slate-500 font-semibold">Độ dài đọc</span>
                    <span class="text-slate-900 font-bold text-right">${readingTime} phút</span>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-slate-500 font-semibold">Slug</span>
                    <code class="text-slate-700 text-right text-[11px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg break-all">${article.slug}</code>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-3xl p-5 shadow-sm">
                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#7cc0ff] mb-3">Gợi ý</p>
                <h3 class="text-lg font-black mb-2 leading-snug">Mỗi bài viết đều được viết để dẫn người đọc đi tiếp.</h3>
                <p class="text-sm text-slate-300 leading-relaxed">Sau khi đọc xong, bạn có thể xem tiếp các bài liên quan hoặc quay lại danh mục sản phẩm để nối câu chuyện nội dung với mua sắm.</p>
              </div>
            </aside>
          </div>
        </div>

        ${
          related.length
            ? `<section class="border-t border-slate-200 bg-white py-12">
                <div class="max-w-7xl mx-auto px-5 lg:px-10">
                  <div class="flex items-end justify-between mb-6">
                    <div>
                      <p class="text-[11px] font-black uppercase tracking-[0.3em] text-[#2a83e9] mb-2">More reading</p>
                      <h2 class="text-xl md:text-2xl font-black text-slate-900">Bài viết liên quan</h2>
                    </div>
                    <a href="/blog" class="text-[11px] font-black uppercase tracking-widest text-[#2a83e9] hover:text-slate-900 transition-colors duration-200">Xem thêm</a>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    ${related.map((p) => this.renderRelatedCard(p)).join("")}
                  </div>
                </div>
              </section>`
            : ""
        }
      </article>
    `;
  }

  private templateSkeleton(): string {
    return `
      <div class="bg-slate-50 min-h-[70vh]">
        <div class="relative overflow-hidden bg-slate-950">
          <div class="max-w-7xl mx-auto px-5 lg:px-10 py-14 md:py-20 space-y-5">
            <div class="h-3 w-48 bg-slate-700/70 rounded-full animate-pulse"></div>
            <div class="h-12 w-3/4 max-w-[760px] bg-slate-700/70 rounded-2xl animate-pulse"></div>
            <div class="h-5 w-2/3 max-w-[620px] bg-slate-700/50 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-5 lg:px-10 py-8 md:py-12">
          <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-8">
            <div class="space-y-8">
              <div class="aspect-[16/9] bg-slate-200 rounded-3xl animate-pulse"></div>
              <div class="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm space-y-4">
                ${Array(8).fill(0).map(() => `<div class="h-4 bg-slate-100 rounded-full animate-pulse"></div>`).join("")}
              </div>
            </div>
            <div class="space-y-4">
              <div class="h-56 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
              <div class="h-48 bg-slate-900 rounded-3xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getReadingTime(content: string): number {
    const words = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }
}
