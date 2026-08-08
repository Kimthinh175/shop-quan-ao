import { IArticle } from "../../shared/interfaces/IPost";
import {
  PostService,
  articleThumbnail,
  formatArticleDate,
} from "../../shared/services/PostService";

export class PostListModule {
  private postService = new PostService();
  private searchTimer: number | undefined;

  private state = {
    posts: [] as IArticle[],
    searchQuery: "",
    nextCursor: null as string | null,
    hasNextPage: false,
    loading: false,
    loadingMore: false,
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();
    await this.loadPosts(true);
  }

  private async loadPosts(isInitial = false): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    if (isInitial) {
      this.state.posts = [];
      this.state.nextCursor = null;
      this.state.loading = true;
    } else {
      this.state.loadingMore = true;
    }

    try {
      const res = await this.postService.fetchPosts({
        limit: 12,
        cursor: isInitial ? undefined : this.state.nextCursor || undefined,
        search: this.state.searchQuery || undefined,
        sort: "-published_at",
      });

      const batch = res.results || [];
      this.state.posts = isInitial ? batch : [...this.state.posts, ...batch];
      this.state.nextCursor = res.nextCursor;
      this.state.hasNextPage = !!res.hasNextPage;
    } catch (err) {
      console.error(err);
      if (isInitial) this.state.posts = [];
    } finally {
      this.state.loading = false;
      this.state.loadingMore = false;
      app.innerHTML = this.template();
      this.bindEvents();
    }
  }

  private bindEvents(): void {
    const searchInput = document.getElementById("blog-search") as HTMLInputElement | null;
    searchInput?.addEventListener("input", () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => {
        this.state.searchQuery = searchInput.value.trim();
        this.loadPosts(true);
      }, 300);
    });

    document.getElementById("btn-load-more-posts")?.addEventListener("click", () => {
      if (this.state.hasNextPage && !this.state.loadingMore) {
        this.loadPosts(false);
      }
    });
  }

  private renderPostCard(post: IArticle): string {
    const date = formatArticleDate(post);
    const category = post.category?.trim();
    const readingTime = this.getReadingTime(post.content);

    return `
      <a href="/posts/${post.slug}" class="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
        <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src="${articleThumbnail(post)}"
            alt="${post.title}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent"></div>
          ${category ? `<span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black uppercase tracking-[0.22em] px-2.5 py-1.5 rounded-full shadow-sm">${category}</span>` : ""}
        </div>
        <div class="p-4 md:p-5">
          <div class="flex items-center justify-between gap-3 mb-3 text-[11px] font-bold text-slate-400">
            ${date ? `<span><i class="fa-regular fa-calendar mr-1"></i>${date}</span>` : `<span>&nbsp;</span>`}
            <span><i class="fa-regular fa-clock mr-1"></i>${readingTime} phút đọc</span>
          </div>
          <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#2a83e9] transition-colors duration-200">${post.title}</h3>
          <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${post.excerpt || ""}</p>
          <span class="inline-flex items-center gap-2 mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#2a83e9]">
            Đọc tiếp <i class="fa-solid fa-arrow-right text-[9px] group-hover:translate-x-1 transition-transform duration-200"></i>
          </span>
        </div>
      </a>
    `;
  }

  private template(): string {
    const { posts, hasNextPage, loadingMore, searchQuery } = this.state;

    return `
      <section class="bg-slate-50 min-h-[70vh]">
        <div class="relative overflow-hidden bg-slate-950">
          <div class="absolute inset-0">
            <img src="https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&w=1800" alt="" class="w-full h-full object-cover opacity-35" />
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/55"></div>
          </div>
          <div class="relative max-w-7xl mx-auto px-5 lg:px-10 py-14 md:py-20">
            <div class="max-w-3xl text-white">
              <p class="text-[11px] font-black uppercase tracking-[0.35em] text-[#7cc0ff] mb-3">CLOSET Journal</p>
              <h1 class="text-3xl md:text-5xl font-black leading-tight mb-4">Tin tức, cảm hứng phối đồ và những câu chuyện phía sau sản phẩm.</h1>
              <p class="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">Trang bài viết được làm theo kiểu tạp chí ngắn: dễ đọc nhanh, rõ thứ tự, nhưng vẫn đủ chiều sâu để lướt tiếp hoặc xem kỹ từng bài.</p>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-5 lg:px-10 py-8 md:py-12">
          <div class="flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between mb-8">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:max-w-3xl">
              <div class="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">Tổng bài</div>
                <div class="text-2xl font-black text-slate-900">${posts.length}</div>
              </div>
              <div class="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">Chế độ</div>
                <div class="text-2xl font-black text-slate-900">Journal</div>
              </div>
              <div class="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">Từ khóa</div>
                <div class="text-2xl font-black text-slate-900">${searchQuery ? "1" : "0"}</div>
              </div>
              <div class="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
                <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">Mới nhất</div>
                <div class="text-2xl font-black text-slate-900">Live</div>
              </div>
            </div>
            <div class="relative w-full lg:max-w-md">
              <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                id="blog-search"
                type="search"
                value="${searchQuery.replace(/"/g, "&quot;")}"
                placeholder="Tìm bài viết theo tiêu đề, chủ đề..."
                class="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#2a83e9] focus:ring-4 focus:ring-[#2a83e9]/10 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          ${
            posts.length === 0
              ? `<div class="py-24 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <i class="fa-regular fa-newspaper text-5xl text-slate-300 mb-4"></i>
                  <h2 class="text-xl font-black text-slate-900 mb-2">${searchQuery ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào được xuất bản"}</h2>
                  <p class="text-slate-500 font-medium max-w-md mx-auto">Thử đổi từ khóa hoặc quay lại sau khi đội nội dung đăng thêm bài mới.</p>
                </div>`
              : `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7">
                  ${posts.map((p) => this.renderPostCard(p)).join("")}
                </div>`
          }

          ${
            hasNextPage
              ? `<div class="mt-10 text-center">
                  <button
                    id="btn-load-more-posts"
                    class="inline-flex items-center gap-2 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-[#2a83e9] transition-colors duration-200 disabled:opacity-50 shadow-sm"
                    ${loadingMore ? "disabled" : ""}
                  >
                    ${loadingMore ? `<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...` : `Xem thêm bài viết <i class="fa-solid fa-chevron-down text-[10px]"></i>`}
                  </button>
                </div>`
              : ""
          }
        </div>
      </section>
    `;
  }

  private templateSkeleton(): string {
    return `
      <section class="bg-slate-50 min-h-[70vh]">
        <div class="relative overflow-hidden bg-slate-950">
          <div class="max-w-7xl mx-auto px-5 lg:px-10 py-14 md:py-20">
            <div class="h-3 w-28 bg-slate-700/70 rounded-full animate-pulse mb-4"></div>
            <div class="h-12 w-3/4 max-w-[720px] bg-slate-700/70 rounded-2xl animate-pulse mb-4"></div>
            <div class="h-4 w-2/3 max-w-[580px] bg-slate-700/50 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-5 lg:px-10 py-8 md:py-12">
          <div class="h-14 w-full max-w-xl bg-slate-200 rounded-2xl animate-pulse mb-8"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7">
            ${Array(8)
              .fill(0)
              .map(
                () => `
              <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div class="aspect-[16/10] bg-slate-200 animate-pulse"></div>
                <div class="p-4 space-y-3">
                  <div class="h-3 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                  <div class="h-5 w-full bg-slate-200 rounded-full animate-pulse"></div>
                  <div class="h-3 w-full bg-slate-100 rounded-full animate-pulse"></div>
                </div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  private getReadingTime(content: string): number {
    const words = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }
}
