import { ApiClient } from "../../../api/ApiClient";
import { UploadService } from "../../../api/UploadService";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import BlotFormatter from "@enzedonline/quill-blot-formatter2";

Quill.register("modules/blotFormatter", BlotFormatter);

type PostStatus = "published" | "draft" | "archived";

interface Post {
  _id: string | number;
  title: string;
  slug: string;
  thumbnail?: string;
  content: string;
  status: PostStatus;
  published_at?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostsResponse {
  results?: Post[];
  docs?: Post[];
  data?: Post[];
}

export class AdminPostsModule {
  private searchTimer: number | undefined;
  private quillEditor: Quill | null = null;

  private state = {
    posts: [] as Post[],
    searchQuery: "",
    filterStatus: "",
    saving: false,
  };

  public async render(): Promise<void> {
    const appEl = document.getElementById("app-main");
    if (!appEl) return;

    appEl.innerHTML = `
      <div style="padding:28px; max-width:1240px; font-family:'Plus Jakarta Sans', sans-serif;">
        <div style="display:flex; justify-content:space-between; gap:20px; align-items:flex-start; margin-bottom:22px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 10px; border-radius:999px; background:#eef6ff; color:#2563eb; font-size:11px; font-weight:800; margin-bottom:10px;">
              <i class="fa-solid fa-newspaper"></i>
              Nội dung website
            </div>
            <h1 style="font-size:24px; line-height:1.2; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Quản lý bài viết</h1>
            <p style="color:#64748b; font-size:13px; margin:0;">Tạo, chỉnh sửa và xuất bản tin tức/blog cho website.</p>
          </div>
          <button id="btn-new-post" style="display:inline-flex; align-items:center; gap:8px; padding:11px 18px; background:#0f172a; color:white; border:none; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; box-shadow:0 10px 24px rgba(15,23,42,0.18);">
            <i class="fa-solid fa-plus"></i>
            Viết bài mới
          </button>
        </div>

        <div id="post-stats" style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:12px; margin-bottom:18px;"></div>

        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap;">
          <div style="position:relative; width:min(420px, 100%);">
            <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:13px;"></i>
            <input id="post-search" type="search" placeholder="Tìm theo tiêu đề, slug hoặc nội dung..." style="width:100%; padding:11px 12px 11px 38px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; outline:none; box-sizing:border-box; background:white;">
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="post-filter-status" style="padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; color:#334155; background:white; outline:none;">
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Lưu trữ</option>
            </select>
            <button id="btn-refresh-posts" title="Tải lại" style="width:38px; height:38px; border:1px solid #e2e8f0; background:white; color:#475569; border-radius:8px; cursor:pointer;">
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>

        <div id="posts-table-area" style="background:white; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; box-shadow:0 1px 2px rgba(15,23,42,0.04);">
          ${this.renderLoading()}
        </div>
      </div>

      <div id="post-modal" style="display:none; position:fixed; inset:0; z-index:1000; background:rgba(15,23,42,0.55); align-items:flex-start; justify-content:center; overflow:auto; padding:28px 16px;">
        <div id="post-modal-content" style="width:min(860px, 100%); background:white; border-radius:12px; box-shadow:0 24px 70px rgba(15,23,42,0.34);"></div>
      </div>
    `;

    this.bindEvents();
    await this.loadPosts();
  }

  private bindEvents(): void {
    document
      .getElementById("btn-new-post")
      ?.addEventListener("click", () => this.showPostEditor());
    document
      .getElementById("btn-refresh-posts")
      ?.addEventListener("click", () => this.loadPosts());

    document
      .getElementById("post-search")
      ?.addEventListener("input", (event) => {
        this.state.searchQuery = (event.target as HTMLInputElement).value
          .trim()
          .toLowerCase();
        window.clearTimeout(this.searchTimer);
        this.searchTimer = window.setTimeout(() => this.loadPosts(), 250);
      });

    document
      .getElementById("post-filter-status")
      ?.addEventListener("change", (event) => {
        this.state.filterStatus = (event.target as HTMLSelectElement).value;
        this.loadPosts();
      });

    document
      .getElementById("post-modal")
      ?.addEventListener("click", (event) => {
        if (event.target === document.getElementById("post-modal"))
          this.closeModal();
      });
  }

  private async loadPosts(): Promise<void> {
    const area = document.getElementById("posts-table-area");
    if (area) area.innerHTML = this.renderLoading();

    try {
      const params = new URLSearchParams({ limit: "100", sort: "-createdAt" });
      if (this.state.searchQuery) params.set("search", this.state.searchQuery);
      if (this.state.filterStatus)
        params.set("status", this.state.filterStatus);

      const response = await ApiClient.adminGet<Post[] | PostsResponse>(
        `/posts/admin?${params.toString()}`,
      );
      this.state.posts = this.normalizePosts(response);
      this.renderDashboard();
    } catch (error: any) {
      if (area) {
        area.innerHTML = `
          <div style="padding:44px; text-align:center; color:#b91c1c; background:#fff7f7;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:24px; margin-bottom:10px; display:block;"></i>
            Không tải được danh sách bài viết: ${this.escapeHtml(error.message || "Lỗi không xác định")}
          </div>
        `;
      }
    }
  }

  private normalizePosts(response: Post[] | PostsResponse): Post[] {
    if (Array.isArray(response)) return response;
    return response.results || response.docs || response.data || [];
  }

  private renderDashboard(): void {
    this.renderStats();
    this.renderTable();
  }

  private renderStats(): void {
    const statsEl = document.getElementById("post-stats");
    if (!statsEl) return;

    const total = this.state.posts.length;
    const published = this.state.posts.filter(
      (post) => post.status === "published",
    ).length;
    const draft = this.state.posts.filter(
      (post) => post.status === "draft",
    ).length;
    const archived = this.state.posts.filter(
      (post) => post.status === "archived",
    ).length;

    const cards = [
      {
        label: "Tổng bài viết",
        value: total,
        icon: "fa-layer-group",
        color: "#0f172a",
        bg: "#f8fafc",
      },
      {
        label: "Đã đăng",
        value: published,
        icon: "fa-circle-check",
        color: "#15803d",
        bg: "#f0fdf4",
      },
      {
        label: "Bản nháp",
        value: draft,
        icon: "fa-pen-nib",
        color: "#b45309",
        bg: "#fffbeb",
      },
      {
        label: "Lưu trữ",
        value: archived,
        icon: "fa-box-archive",
        color: "#475569",
        bg: "#f1f5f9",
      },
    ];

    statsEl.innerHTML = cards
      .map(
        (card) => `
      <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:14px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:5px;">${card.label}</div>
          <div style="font-size:23px; color:#0f172a; font-weight:900;">${card.value}</div>
        </div>
        <div style="width:38px; height:38px; border-radius:9px; display:flex; align-items:center; justify-content:center; background:${card.bg}; color:${card.color};">
          <i class="fa-solid ${card.icon}"></i>
        </div>
      </div>
    `,
      )
      .join("");
  }

  private renderTable(): void {
    const area = document.getElementById("posts-table-area");
    if (!area) return;

    const filtered = this.getFilteredPosts();
    if (!filtered.length) {
      area.innerHTML = `
        <div style="padding:60px 20px; text-align:center; color:#64748b;">
          <i class="fa-regular fa-newspaper" style="font-size:42px; color:#cbd5e1; margin-bottom:14px; display:block;"></i>
          <div style="font-size:15px; font-weight:800; color:#334155; margin-bottom:4px;">Chưa có bài viết phù hợp</div>
          <div style="font-size:13px;">Thử đổi bộ lọc hoặc tạo bài viết mới.</div>
        </div>
      `;
      return;
    }

    area.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; min-width:900px;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <th style="padding:13px 16px; text-align:left; font-weight:800; color:#64748b;">Bài viết</th>
              <th style="padding:13px 16px; text-align:left; font-weight:800; color:#64748b;">Slug</th>
              <th style="padding:13px 16px; text-align:left; font-weight:800; color:#64748b;">Trạng thái</th>
              <th style="padding:13px 16px; text-align:left; font-weight:800; color:#64748b;">Xuất bản</th>
             
              <th style="padding:13px 16px; text-align:right; font-weight:800; color:#64748b;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((post) => this.renderRow(post)).join("")}
          </tbody>
        </table>
      </div>
      <div style="padding:13px 16px; background:#f8fafc; border-top:1px solid #e2e8f0; color:#64748b; font-size:12px; display:flex; justify-content:space-between;">
        <span>Đang hiển thị <strong>${filtered.length}</strong> / ${this.state.posts.length} bài viết</span>
        <span>Sắp xếp theo dữ liệu trả về từ API</span>
      </div>
    `;

    document.querySelectorAll(".btn-edit-post").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const id = (event.currentTarget as HTMLElement).dataset.id;
        if (!id) return;
        await this.openExistingPost(id);
      });
    });

    document.querySelectorAll(".btn-delete-post").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const id = (event.currentTarget as HTMLElement).dataset.id;
        if (!id) return;
        await this.deletePost(id);
      });
    });

    document.querySelectorAll(".btn-copy-slug").forEach((button) => {
      button.addEventListener("click", (event) => {
        const slug = (event.currentTarget as HTMLElement).dataset.slug || "";
        navigator.clipboard.writeText(slug).then(() => {
          const btn = event.currentTarget as HTMLElement;
          btn.innerHTML = '<i class="fa-solid fa-check"></i>';
          btn.style.color = "#16a34a";
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            btn.style.color = "#94a3b8";
          }, 1500);
        });
      });
    });
  }

  private renderRow(post: Post): string {
    const title = this.escapeHtml(post.title || "Không có tiêu đề");
    const summary = this.escapeHtml(this.makeSummary(post.content));
    const thumbnail = post.thumbnail
      ? `<img src="${this.escapeAttribute(post.thumbnail)}" alt="" style="width:54px; height:54px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;">`
      : `<div style="width:54px; height:54px; border-radius:8px; background:#f1f5f9; color:#94a3b8; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-image"></i></div>`;

    return `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:14px 16px;">
          <div style="display:flex; gap:12px; align-items:center;">
            ${thumbnail}
            <div style="min-width:0;">
              <div style="font-weight:850; color:#0f172a; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${title}">${title}</div>
              <div style="font-size:12px; color:#64748b; max-width:360px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:3px;">${summary}</div>
            </div>
          </div>
        </td>
        <td style="padding:14px 16px;">
          <div style="display:flex; align-items:center; gap:6px; max-width:220px;">
            <code style="font-size:12px; color:#475569; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:4px 7px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:170px; display:inline-block;" title="${this.escapeAttribute(post.slug || "")}">${this.escapeHtml(post.slug || "-")}</code>
            <button class="btn-copy-slug" data-slug="${this.escapeAttribute(post.slug || "")}" title="Copy slug" style="width:26px; height:26px; border:none; background:#f1f5f9; color:#94a3b8; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; font-size:11px; transition:0.15s;" onmouseover="this.style.color='#2563eb';this.style.background='#eef6ff'" onmouseout="this.style.color='#94a3b8';this.style.background='#f1f5f9'">
              <i class="fa-regular fa-copy"></i>
            </button>
          </div>
        </td>
        <td style="padding:14px 16px;">${this.statusBadge(post.status)}</td>
        <td style="padding:14px 16px; color:#64748b; font-size:12px;">${this.formatDate(post.published_at)}</td>
        <td style="padding:14px 16px; text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <a href="/posts/${this.escapeAttribute(post.slug)}" target="_blank" title="Xem bài viết" style="width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:#eef6ff; color:#2563eb; border-radius:7px; text-decoration:none;">
              <i class="fa-solid fa-eye"></i>
            </a>
            <button class="btn-edit-post" data-id="${post._id}" title="Sửa" style="width:32px; height:32px; border:none; background:#f1f5f9; color:#475569; border-radius:7px; cursor:pointer;">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-delete-post" data-id="${post._id}" title="Xóa" style="width:32px; height:32px; border:none; background:#fff1f2; color:#e11d48; border-radius:7px; cursor:pointer;">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  private getFilteredPosts(): Post[] {
    return this.state.posts;
  }

  private async openExistingPost(id: string): Promise<void> {
    try {
      const post = await ApiClient.adminGet<Post>(`/posts/${id}`);
      this.showPostEditor(post);
    } catch (error: any) {
      alert(error.message || "Không mở được bài viết");
    }
  }

  private async deletePost(id: string): Promise<void> {
    if (!confirm("Xóa bài viết này? Hành động này không thể hoàn tác.")) return;

    try {
      await ApiClient.adminDelete(`/posts/${id}`);
      await this.loadPosts();
    } catch (error: any) {
      alert(error.message || "Không xóa được bài viết");
    }
  }

  private showPostEditor(post?: Post): void {
    const modal = document.getElementById("post-modal");
    const content = document.getElementById("post-modal-content");
    if (!modal || !content) return;

    const isEdit = Boolean(post);
    content.innerHTML = `
      <form id="post-form">
        <div style="padding:22px 24px; border-bottom:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; gap:16px;">
          <div>
            <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0 0 4px;">${isEdit ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h2>
            <p style="font-size:12px; color:#64748b; margin:0;">Nội dung sẽ hiển thị ở khu vực blog/tin tức của website.</p>
          </div>
          <button type="button" id="close-post-modal" title="Đóng" style="width:36px; height:36px; border:none; background:#f1f5f9; color:#475569; border-radius:8px; cursor:pointer;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style="padding:22px 24px; display:grid; grid-template-columns:minmax(0, 1fr) 250px; gap:18px;">
          <div style="display:flex; flex-direction:column; gap:14px;">
            ${this.renderField("Tiêu đề *", `<input id="post-title" required value="${this.escapeAttribute(post?.title || "")}" placeholder="Ví dụ: 5 cách phối áo sơ mi cho mùa hè" style="${this.inputStyle("font-weight:800; font-size:15px;")}">`)}
            ${this.renderField("Slug", `<input id="post-slug" value="${this.escapeAttribute(post?.slug || "")}" placeholder="tu-dong-tao-tu-tieu-de" style="${this.inputStyle("font-family:monospace;")}">`)}
            ${this.renderField(
              "Nội dung *",
              `
              <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; background:white;">
                <div id="post-content-editor" style="min-height:320px;"></div>
              </div>
            `,
            )}
          </div>

          <aside style="display:flex; flex-direction:column; gap:14px;">
            ${this.renderField(
              "Trạng thái",
              `
              <select id="post-status" style="${this.inputStyle()}">
                <option value="draft" ${!post || post.status === "draft" ? "selected" : ""}>Bản nháp</option>
                <option value="published" ${post?.status === "published" ? "selected" : ""}>Đã đăng</option>
                <option value="archived" ${post?.status === "archived" ? "selected" : ""}>Lưu trữ</option>
              </select>
            `,
            )}
            <label style="display:block; margin-bottom:12px;">
              <span style="display:block; color:#334155; font-size:12px; font-weight:850; margin-bottom:6px;">Ảnh thumbnail</span>
              <div style="display:flex; gap:10px;">
                <input id="post-thumbnail" value="${this.escapeAttribute(post?.thumbnail || "")}" placeholder="https://..." style="${this.inputStyle()}">
                <button type="button" id="btn-upload-thumbnail" style="padding:11px 16px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; font-weight:700; color:#475569;" title="Tải ảnh lên"><i class="fa-solid fa-upload"></i></button>
                <input type="file" id="post-thumbnail-upload" accept="image/*" style="display:none;">
              </div>
            </label>
            <div id="post-thumbnail-preview" style="position:relative; height:150px; border:1px dashed #cbd5e1; border-radius:10px; background:#f8fafc; overflow:hidden; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
              ${
                post?.thumbnail
                  ? `
                <img src="${this.escapeAttribute(post.thumbnail)}" alt="" style="width:100%; height:100%; object-fit:cover;">
                <button type="button" class="btn-remove-thumbnail" style="position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.5); color:white; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; transition:0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'"><i class="fa-solid fa-xmark"></i></button>
              `
                  : '<i class="fa-solid fa-image" style="font-size:26px;"></i>'
              }
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:13px;">
              <div style="font-size:12px; color:#64748b; font-weight:800; margin-bottom:8px;">Thông tin</div>
              <div style="display:grid; gap:7px; color:#475569; font-size:12px;">
                <div>Tạo: <strong>${this.formatDate(post?.createdAt)}</strong></div>
                <div>Cập nhật: <strong>${this.formatDate(post?.updatedAt)}</strong></div>
                <div>Xuất bản: <strong>${this.formatDate(post?.published_at)}</strong></div>
              </div>
            </div>
          </aside>
        </div>

        <div style="padding:16px 24px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" id="cancel-post-modal" style="padding:10px 16px; background:#f1f5f9; color:#475569; border:none; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer;">Hủy</button>
          <button type="submit" id="submit-post" style="padding:10px 18px; background:#0f172a; color:white; border:none; border-radius:8px; font-size:13px; font-weight:850; cursor:pointer;">
            <i class="fa-solid fa-floppy-disk" style="margin-right:7px;"></i>${isEdit ? "Lưu thay đổi" : "Tạo bài viết"}
          </button>
        </div>
      </form>
    `;

    modal.style.display = "flex";
    this.bindEditorEvents(post);
  }

  private bindEditorEvents(post?: Post): void {
    const titleEl = document.getElementById(
      "post-title",
    ) as HTMLInputElement | null;
    const slugEl = document.getElementById(
      "post-slug",
    ) as HTMLInputElement | null;
    const thumbnailEl = document.getElementById(
      "post-thumbnail",
    ) as HTMLInputElement | null;
    this.initQuillEditor(post?.content || "");

    titleEl?.addEventListener("input", () => {
      if (!slugEl || slugEl.dataset.edited === "true") return;
      slugEl.value = this.slugify(titleEl.value);
    });

    slugEl?.addEventListener("input", () => {
      slugEl.dataset.edited = "true";
      slugEl.value = this.slugify(slugEl.value);
    });

    thumbnailEl?.addEventListener("input", () =>
      this.renderThumbnailPreview(thumbnailEl.value),
    );

    const btnUpload = document.getElementById("btn-upload-thumbnail");
    const fileUpload = document.getElementById(
      "post-thumbnail-upload",
    ) as HTMLInputElement | null;
    btnUpload?.addEventListener("click", () => fileUpload?.click());
    fileUpload?.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (btnUpload)
        btnUpload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        const url = await UploadService.uploadImage(file);
        if (thumbnailEl) thumbnailEl.value = url;
        this.renderThumbnailPreview(url);
      } catch (err: any) {
        alert(err.message || "Lỗi tải ảnh!");
      } finally {
        if (btnUpload)
          btnUpload.innerHTML = '<i class="fa-solid fa-upload"></i>';
        fileUpload.value = ""; // Reset input
      }
    });

    document.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      const removeBtn = target.closest(".btn-remove-thumbnail");
      if (removeBtn) {
        const url = thumbnailEl?.value;
        if (url) {
          removeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
          await UploadService.deleteImage(url);
          if (thumbnailEl) thumbnailEl.value = "";
          this.renderThumbnailPreview("");
        }
      }
    });

    document
      .getElementById("close-post-modal")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-post-modal")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("post-form")
      ?.addEventListener("submit", (event) => this.submitPost(event, post));
  }

  private initQuillEditor(content: string): void {
    const editorEl = document.getElementById("post-content-editor");
    if (!editorEl) return;

    this.quillEditor = new Quill(editorEl, {
      theme: "snow",
      placeholder: "Nhập nội dung bài viết...",
      modules: {
        blotFormatter: {},
        toolbar: {
          container: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link", "image"],
            [{ align: [] }],
            ["clean"],
          ],
          handlers: {
            image: this.quillImageHandler.bind(this),
          },
        },
      },
    });

    // Prevent default drop to avoid base64
    this.quillEditor.root.addEventListener("drop", async (e: DragEvent) => {
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        const range = this.quillEditor?.getSelection(true) || {
          index: this.quillEditor?.getLength() || 0,
          length: 0,
        };
        this.uploadAndInsertImage(file, range.index);
      }
    });

    // Prevent default paste to avoid base64
    this.quillEditor.root.addEventListener(
      "paste",
      async (e: ClipboardEvent) => {
        const file = e.clipboardData?.files?.[0];
        if (file && file.type.startsWith("image/")) {
          e.preventDefault();
          const range = this.quillEditor?.getSelection(true) || {
            index: this.quillEditor?.getLength() || 0,
            length: 0,
          };
          this.uploadAndInsertImage(file, range.index);
        }
      },
    );

    // Handle image deletion
    this.quillEditor.on("text-change", async (delta, oldContents, source) => {
      if (source !== "user") return;
      if (!this.quillEditor) return;

      const currentContents = this.quillEditor.getContents();
      const getImages = (ops: any[]) =>
        ops
          .filter((op: any) => op.insert && op.insert.image)
          .map((op: any) => op.insert.image);

      const oldImages = getImages(oldContents?.ops || []);
      const newImages = getImages(currentContents.ops || []);

      for (const imgUrl of oldImages) {
        if (
          !newImages.includes(imgUrl) &&
          imgUrl.includes("res.cloudinary.com")
        ) {
          // Fire and forget delete
          UploadService.deleteImage(imgUrl).catch(console.error);
        }
      }
    });

    if (content) {
      this.quillEditor.clipboard.dangerouslyPasteHTML(content);
    }
  }

  private async uploadAndInsertImage(file: File, index: number) {
    if (!this.quillEditor) return;
    try {
      const url = await UploadService.uploadImage(file);
      this.quillEditor.insertEmbed(index, "image", url);
    } catch (error: any) {
      alert(error.message || "Tải ảnh thất bại");
    }
  }

  private quillImageHandler(): void {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !this.quillEditor) return;

      const range = this.quillEditor.getSelection(true);
      this.uploadAndInsertImage(file, range ? range.index : 0);
    };
  }

  private getEditorHtml(): string {
    if (!this.quillEditor) return "";

    const text = this.quillEditor.getText().trim();
    if (!text) return "";

    return this.quillEditor.root.innerHTML.trim();
  }

  private async submitPost(event: Event, post?: Post): Promise<void> {
    event.preventDefault();
    if (this.state.saving) return;

    const submitButton = document.getElementById(
      "submit-post",
    ) as HTMLButtonElement | null;
    const title = (
      document.getElementById("post-title") as HTMLInputElement
    ).value.trim();
    const slug = (
      document.getElementById("post-slug") as HTMLInputElement
    ).value.trim();
    const content = this.getEditorHtml();
    const thumbnail = (
      document.getElementById("post-thumbnail") as HTMLInputElement
    ).value.trim();
    const status = (document.getElementById("post-status") as HTMLSelectElement)
      .value as PostStatus;

    const payload = {
      title,
      slug: slug || this.slugify(title),
      content,
      thumbnail,
      status,
    };

    if (!content) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    try {
      this.state.saving = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin" style="margin-right:7px;"></i>Đang lưu...';
      }

      if (post) await ApiClient.adminPut(`/posts/${post._id}`, payload);
      else await ApiClient.adminPost("/posts", payload);

      this.closeModal();
      await this.loadPosts();
    } catch (error: any) {
      alert(error.message || "Không lưu được bài viết");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `<i class="fa-solid fa-floppy-disk" style="margin-right:7px;"></i>${post ? "Lưu thay đổi" : "Tạo bài viết"}`;
      }
    } finally {
      this.state.saving = false;
    }
  }

  private renderThumbnailPreview(url: string): void {
    const preview = document.getElementById("post-thumbnail-preview");
    if (!preview) return;

    preview.innerHTML = url
      ? `
        <img src="${this.escapeAttribute(url)}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=&quot;font-size:12px;color:#ef4444;&quot;>Ảnh không tải được</span>';">
        <button type="button" class="btn-remove-thumbnail" style="position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.5); color:white; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; transition:0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'"><i class="fa-solid fa-xmark"></i></button>
        `
      : '<i class="fa-solid fa-image" style="font-size:26px;"></i>';
  }

  private closeModal(): void {
    const modal = document.getElementById("post-modal");
    if (modal) modal.style.display = "none";
    this.quillEditor = null;
  }

  private statusBadge(status: PostStatus): string {
    const config: Record<
      PostStatus,
      { label: string; style: string; icon: string }
    > = {
      published: {
        label: "Đã đăng",
        icon: "fa-circle-check",
        style: "background:#ecfdf5;color:#15803d;border:1px solid #bbf7d0;",
      },
      draft: {
        label: "Bản nháp",
        icon: "fa-pen-nib",
        style: "background:#fffbeb;color:#b45309;border:1px solid #fde68a;",
      },
      archived: {
        label: "Lưu trữ",
        icon: "fa-box-archive",
        style: "background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;",
      },
    };

    const item = config[status] || config.draft;
    return `<span style="${item.style} display:inline-flex; align-items:center; gap:6px; padding:4px 9px; border-radius:999px; font-size:11px; font-weight:850;"><i class="fa-solid ${item.icon}"></i>${item.label}</span>`;
  }

  private renderField(label: string, control: string): string {
    return `
      <label style="display:block;">
        <span style="display:block; color:#334155; font-size:12px; font-weight:850; margin-bottom:6px;">${label}</span>
        ${control}
      </label>
    `;
  }

  private inputStyle(extra = ""): string {
    return `width:100%; box-sizing:border-box; padding:11px 12px; border:1px solid #e2e8f0; border-radius:8px; outline:none; color:#0f172a; background:white; font-size:13px; ${extra}`;
  }

  private renderLoading(): string {
    return `
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; padding:58px; color:#64748b;">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Đang tải bài viết...
      </div>
    `;
  }

  private makeSummary(content = ""): string {
    const plain = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plain
      ? `${plain.slice(0, 110)}${plain.length > 110 ? "..." : ""}`
      : "Chưa có nội dung mô tả";
  }

  private formatDate(date?: string): string {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("vi-VN");
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  private escapeHtml(value: string): string {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value).replace(/`/g, "&#096;");
  }
}
