import { ApiClient } from "../../../api/ApiClient";

interface Promotion {
  _id: string;
  name: string;
  type: string;
  value: number;
  start_date: string;
  end_date: string;
  status: string;
  description?: string;
  min_order_value?: number;
}

interface Voucher {
  _id: string;
  code: string;
  type: string;
  value: number;
  min_order_value: number;
  max_uses: number;
  used_count: number;
  start_date: string;
  end_date: string;
  status: string;
}

export class AdminPromotionsModule {
  private state = {
    activeTab: "promotions" as "promotions" | "vouchers",
    promotions: [] as Promotion[],
    vouchers: [] as Voucher[],
  };

  public async render(): Promise<void> {
    const appEl = document.getElementById("app-main");
    if (!appEl) return;

    appEl.innerHTML = `
      <div id="promotions-root" style="padding: 28px; max-width: 1200px; font-family: 'Inter', sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
          <div>
            <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Quản lý Khuyến mãi</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Chương trình khuyến mãi & Mã giảm giá</p>
          </div>
          <button id="btn-add-item" style="
            display: flex; align-items: center; gap: 8px;
            padding: 10px 18px; background: #2a83e9; color: white;
            border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: background 0.15s;
          " onmouseover="this.style.background='#1d6fd4'" onmouseout="this.style.background='#2a83e9'">
            <i class="fa-solid fa-plus"></i> Thêm mới
          </button>
        </div>

        <div style="display: flex; gap: 4px; background: #f1f5f9; border-radius: 10px; padding: 4px; margin-bottom: 20px; width: fit-content;">
          <button id="tab-promotions" class="promo-tab" data-tab="promotions" style="
            padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600;
            background: #2a83e9; color: white; transition: all 0.15s;
          "><i class="fa-solid fa-tag" style="margin-right: 6px;"></i>Chương trình KM</button>
          <button id="tab-vouchers" class="promo-tab" data-tab="vouchers" style="
            padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600;
            background: transparent; color: #64748b; transition: all 0.15s;
          "><i class="fa-solid fa-ticket" style="margin-right: 6px;"></i>Mã giảm giá (Voucher)</button>
        </div>

        <div id="promo-table-area" style="background: white; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: center; padding: 60px; gap: 12px; color: #64748b;">
            <i class="fa-solid fa-spinner fa-spin"></i> Đang tải...
          </div>
        </div>
      </div>

      <div id="promo-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:1000; align-items:center; justify-content:center;">
        <div id="promo-modal-content" style="background:white; border-radius:16px; padding: 28px; width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
        </div>
      </div>
    `;

    this.bindTabEvents();
    await this.loadPromotions();
  }

  private bindTabEvents() {
    document.querySelectorAll(".promo-tab").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset.tab as
          | "promotions"
          | "vouchers";
        this.state.activeTab = tab;
        document.querySelectorAll(".promo-tab").forEach((b) => {
          const el = b as HTMLButtonElement;
          el.style.background =
            el.dataset.tab === tab ? "#2a83e9" : "transparent";
          el.style.color = el.dataset.tab === tab ? "white" : "#64748b";
        });
        if (tab === "promotions") await this.loadPromotions();
        else await this.loadVouchers();
      });
    });

    document.getElementById("btn-add-item")?.addEventListener("click", () => {
      if (this.state.activeTab === "promotions") this.showPromotionModal();
      else this.showVoucherModal();
    });

    document.getElementById("promo-modal")?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("promo-modal"))
        this.closeModal();
    });
  }

  private async loadPromotions() {
    const area = document.getElementById("promo-table-area")!;
    area.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;padding:60px;gap:12px;color:#64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>`;
    try {
      const data = await ApiClient.adminGet<Promotion[] | { data?: Promotion[]; results?: Promotion[] }>("/promotions?limit=100");
      this.state.promotions = Array.isArray(data)
        ? data
        : (data as any).results || (data as any).data || [];
      this.renderPromotionsTable();
    } catch (e: any) {
      area.innerHTML = `<div style="padding:40px;text-align:center;color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> ${e.message}</div>`;
    }
  }

  private renderPromotionsTable() {
    const area = document.getElementById("promo-table-area")!;
    if (!this.state.promotions.length) {
      area.innerHTML = `<div style="padding:60px;text-align:center;color:#94a3b8;"><i class="fa-solid fa-tag" style="font-size:36px;margin-bottom:14px;display:block;opacity:0.4;"></i>Chưa có chương trình khuyến mãi nào</div>`;
      return;
    }
    area.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Tên chương trình</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Loại</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Giá trị</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Thời gian</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Trạng thái</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#64748b;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.promotions
            .map(
              (p) => `
            <tr style="border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:12px 16px;">
                <div style="font-weight:600;color:#0f172a;">${p.name}</div>
                ${p.description ? `<div style="color:#94a3b8;font-size:11px;margin-top:2px;">${p.description}</div>` : ""}
              </td>
              <td style="padding:12px 16px;">
                <span style="background:#e0f2fe;color:#0284c7;padding:3px 8px;border-radius:5px;font-size:11px;font-weight:600;">
                  ${p.type === "percentage" ? "% Giảm" : "Giảm tiền"}
                </span>
              </td>
              <td style="padding:12px 16px;font-weight:600;color:#0f172a;">
                ${p.type === "percentage" ? p.value + "%" : p.value.toLocaleString("vi-VN") + "đ"}
              </td>
              <td style="padding:12px 16px;color:#64748b;font-size:12px;">
                ${new Date(p.start_date).toLocaleDateString("vi-VN")} → ${new Date(p.end_date).toLocaleDateString("vi-VN")}
              </td>
              <td style="padding:12px 16px;">${this.statusBadge(p.status, p.end_date)}</td>
              <td style="padding:12px 16px;text-align:center;">
                <div style="display:flex;gap:6px;justify-content:center;">
                  <button class="btn-edit-promo" data-id="${p._id}" style="padding:6px 10px;background:#f1f5f9;color:#64748b;border:none;border-radius:7px;cursor:pointer;font-size:12px;" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn-del-promo" data-id="${p._id}" style="padding:6px 10px;background:#fff1f2;color:#ef4444;border:none;border-radius:7px;cursor:pointer;font-size:12px;" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    `;
    document.querySelectorAll(".btn-edit-promo").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        this.showPromotionModal(
          this.state.promotions.find((p) => p._id === id),
        );
      });
    });
    document.querySelectorAll(".btn-del-promo").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        if (!confirm("Xóa chương trình khuyến mãi này?")) return;
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        try {
          await ApiClient.adminDelete(`/promotions/${id}`);
          await this.loadPromotions();
        } catch (err: any) {
          alert(err.message);
        }
      });
    });
  }

  private async loadVouchers() {
    const area = document.getElementById("promo-table-area")!;
    area.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;padding:60px;gap:12px;color:#64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>`;
    try {
      const data = await ApiClient.adminGet<Voucher[] | { data?: Voucher[]; results?: Voucher[] }>("/vouchers?limit=100");
      this.state.vouchers = Array.isArray(data)
        ? data
        : (data as any).results || (data as any).data || [];
      this.renderVouchersTable();
    } catch (e: any) {
      area.innerHTML = `<div style="padding:40px;text-align:center;color:#ef4444;">${e.message}</div>`;
    }
  }

  private renderVouchersTable() {
    const area = document.getElementById("promo-table-area")!;
    if (!this.state.vouchers.length) {
      area.innerHTML = `<div style="padding:60px;text-align:center;color:#94a3b8;"><i class="fa-solid fa-ticket" style="font-size:36px;margin-bottom:14px;display:block;opacity:0.4;"></i>Chưa có mã giảm giá nào</div>`;
      return;
    }
    area.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Mã code</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Giá trị</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Đơn tối thiểu</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Đã dùng</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Thời gian</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#64748b;">Trạng thái</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#64748b;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.vouchers
            .map(
              (v) => `
            <tr style="border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:12px 16px;"><code style="background:#f1f5f9;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:1px;color:#1e293b;">${v.code}</code></td>
              <td style="padding:12px 16px;"><span style="background:#e0f2fe;color:#0284c7;padding:3px 8px;border-radius:5px;font-size:11px;font-weight:600;">${v.type === "percentage" ? v.value + "%" : v.value.toLocaleString("vi-VN") + "đ"}</span></td>
              <td style="padding:12px 16px;color:#64748b;">${(v.min_order_value || 0).toLocaleString("vi-VN")}đ</td>
              <td style="padding:12px 16px;color:#64748b;">${v.used_count ?? 0} / ${v.max_uses ?? "∞"}</td>
              <td style="padding:12px 16px;color:#64748b;font-size:12px;">${new Date(v.start_date).toLocaleDateString("vi-VN")} → ${new Date(v.end_date).toLocaleDateString("vi-VN")}</td>
              <td style="padding:12px 16px;">${this.statusBadge(v.status, v.end_date)}</td>
              <td style="padding:12px 16px;text-align:center;">
                <div style="display:flex;gap:6px;justify-content:center;">
                  <button class="btn-edit-voucher" data-id="${v._id}" style="padding:6px 10px;background:#f1f5f9;color:#64748b;border:none;border-radius:7px;cursor:pointer;font-size:12px;"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn-del-voucher" data-id="${v._id}" style="padding:6px 10px;background:#fff1f2;color:#ef4444;border:none;border-radius:7px;cursor:pointer;font-size:12px;"><i class="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    `;
    document.querySelectorAll(".btn-edit-voucher").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        this.showVoucherModal(this.state.vouchers.find((v) => v._id === id));
      });
    });
    document.querySelectorAll(".btn-del-voucher").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        if (!confirm("Xóa mã voucher này?")) return;
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        try {
          await ApiClient.adminDelete(`/vouchers/${id}`);
          await this.loadVouchers();
        } catch (err: any) {
          alert(err.message);
        }
      });
    });
  }

  private statusBadge(status: string, endDate?: string) {
    const expired = endDate && new Date(endDate) < new Date();
    if (expired)
      return `<span style="background:#fef2f2;color:#ef4444;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:600;">Hết hạn</span>`;
    if (status === "active")
      return `<span style="background:#f0fdf4;color:#16a34a;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:600;">Đang chạy</span>`;
    return `<span style="background:#fef9c3;color:#ca8a04;padding:3px 10px;border-radius:5px;font-size:11px;font-weight:600;">Tạm dừng</span>`;
  }

  private showPromotionModal(promo?: Promotion) {
    const modal = document.getElementById("promo-modal")!;
    const content = document.getElementById("promo-modal-content")!;
    const isEdit = !!promo;
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0;">${isEdit ? "Sửa" : "Thêm"} Chương trình KM</h2>
        <button id="close-modal" style="background:none;border:none;cursor:pointer;color:#64748b;font-size:18px;"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form id="promo-form" style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Tên chương trình *</label>
          <input id="promo-name" type="text" value="${promo?.name || ""}" placeholder="VD: Black Friday 2026" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Mô tả</label>
          <input id="promo-desc" type="text" value="${promo?.description || ""}" placeholder="Mô tả ngắn..." style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Loại giảm *</label>
            <select id="promo-type" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
              <option value="percentage" ${promo?.type === "percentage" ? "selected" : ""}>% Giảm</option>
              <option value="fixed_amount" ${promo?.type === "fixed_amount" ? "selected" : ""}>Giảm tiền cố định</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Giá trị *</label>
            <input id="promo-value" type="number" value="${promo?.value || ""}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Ngày bắt đầu *</label>
            <input id="promo-start" type="date" value="${promo?.start_date ? promo.start_date.split("T")[0] : ""}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Ngày kết thúc *</label>
            <input id="promo-end" type="date" value="${promo?.end_date ? promo.end_date.split("T")[0] : ""}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
          </div>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Trạng thái</label>
          <select id="promo-status" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
            <option value="active" ${!promo || promo.status === "active" ? "selected" : ""}>Đang chạy</option>
            <option value="inactive" ${promo?.status === "inactive" ? "selected" : ""}>Tạm dừng</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
          <button type="button" id="cancel-modal" style="padding:10px 18px;background:#f1f5f9;color:#64748b;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;">Hủy</button>
          <button type="submit" id="submit-promo" style="padding:10px 20px;background:#2a83e9;color:white;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;">
            <i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>${isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </button>
        </div>
      </form>
    `;
    modal.style.display = "flex";
    document
      .getElementById("close-modal")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-modal")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("promo-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById(
          "submit-promo",
        ) as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = "Đang lưu...";
        const payload = {
          name: (document.getElementById("promo-name") as HTMLInputElement)
            .value,
          description: (
            document.getElementById("promo-desc") as HTMLInputElement
          ).value,
          type: (document.getElementById("promo-type") as HTMLSelectElement)
            .value,
          value: Number(
            (document.getElementById("promo-value") as HTMLInputElement).value,
          ),
          start_date: (
            document.getElementById("promo-start") as HTMLInputElement
          ).value,
          end_date: (document.getElementById("promo-end") as HTMLInputElement)
            .value,
          status: (document.getElementById("promo-status") as HTMLSelectElement)
            .value,
        };
        try {
          if (isEdit)
            await ApiClient.adminPut(`/promotions/${promo!._id}`, payload);
          else await ApiClient.adminPost("/promotions", payload);
          this.closeModal();
          await this.loadPromotions();
        } catch (err: any) {
          alert(err.message);
          btn.disabled = false;
          btn.textContent = isEdit ? "Lưu thay đổi" : "Tạo mới";
        }
      });
  }

  private showVoucherModal(v?: Voucher) {
    const modal = document.getElementById("promo-modal")!;
    const content = document.getElementById("promo-modal-content")!;
    const isEdit = !!v;
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0;">${isEdit ? "Sửa" : "Tạo"} Mã giảm giá</h2>
        <button id="close-modal" style="background:none;border:none;cursor:pointer;color:#64748b;font-size:18px;"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form id="voucher-form" style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Mã code *</label>
            <input id="v-code" type="text" value="${v?.code || ""}" placeholder="SALE20" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;text-transform:uppercase;font-weight:700;letter-spacing:1px;" required>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Loại *</label>
            <select id="v-type" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
              <option value="percentage" ${v?.type === "percentage" ? "selected" : ""}>% Giảm</option>
              <option value="fixed_amount" ${v?.type === "fixed_amount" ? "selected" : ""}>Giảm tiền cố định</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Giá trị *</label>
            <input id="v-value" type="number" value="${v?.value || ""}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Đơn tối thiểu (đ)</label>
            <input id="v-min" type="number" value="${v?.min_order_value || 0}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Số lần dùng tối đa</label>
            <input id="v-maxuses" type="number" value="${v?.max_uses || ""}" placeholder="Để trống = không giới hạn" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Trạng thái</label>
            <select id="v-status" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
              <option value="active" ${!v || v.status === "active" ? "selected" : ""}>Hoạt động</option>
              <option value="inactive" ${v?.status === "inactive" ? "selected" : ""}>Tạm dừng</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Ngày bắt đầu *</label>
            <input id="v-start" type="date" value="${v?.start_date ? v.start_date.split("T")[0] : ""}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Ngày kết thúc *</label>
            <input id="v-end" type="date" value="${v?.end_date ? v.end_date.split("T")[0] : ""}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;" required>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
          <button type="button" id="cancel-modal" style="padding:10px 18px;background:#f1f5f9;color:#64748b;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;">Hủy</button>
          <button type="submit" id="submit-voucher" style="padding:10px 20px;background:#2a83e9;color:white;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;">
            <i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>${isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </button>
        </div>
      </form>
    `;
    modal.style.display = "flex";
    document
      .getElementById("close-modal")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-modal")
      ?.addEventListener("click", () => this.closeModal());
    document.getElementById("v-code")?.addEventListener("input", (e) => {
      (e.target as HTMLInputElement).value = (
        e.target as HTMLInputElement
      ).value.toUpperCase();
    });
    document
      .getElementById("voucher-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById(
          "submit-voucher",
        ) as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = "Đang lưu...";
        const maxUsesVal = (
          document.getElementById("v-maxuses") as HTMLInputElement
        ).value;
        const payload = {
          code: (
            document.getElementById("v-code") as HTMLInputElement
          ).value.toUpperCase(),
          type: (document.getElementById("v-type") as HTMLSelectElement).value,
          value: Number(
            (document.getElementById("v-value") as HTMLInputElement).value,
          ),
          min_order_value: Number(
            (document.getElementById("v-min") as HTMLInputElement).value,
          ),
          max_uses: maxUsesVal ? Number(maxUsesVal) : null,
          status: (document.getElementById("v-status") as HTMLSelectElement)
            .value,
          start_date: (document.getElementById("v-start") as HTMLInputElement)
            .value,
          end_date: (document.getElementById("v-end") as HTMLInputElement)
            .value,
        };
        try {
          if (isEdit) await ApiClient.adminPut(`/vouchers/${v!._id}`, payload);
          else await ApiClient.adminPost("/vouchers", payload);
          this.closeModal();
          await this.loadVouchers();
        } catch (err: any) {
          alert(err.message);
          btn.disabled = false;
          btn.textContent = isEdit ? "Lưu thay đổi" : "Tạo mới";
        }
      });
  }

  private closeModal() {
    const modal = document.getElementById("promo-modal");
    if (modal) modal.style.display = "none";
  }
}
