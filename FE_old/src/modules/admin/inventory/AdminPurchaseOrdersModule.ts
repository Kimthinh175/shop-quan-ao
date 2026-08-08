import { ApiClient } from "../../../api/ApiClient";

export class AdminPurchaseOrdersModule {
  private state = {
    pos: [] as any[],
    suppliers: [] as any[],
    products: [] as any[],
    loading: true,
    activeTab: "sku" as "sku" | "ri",
    newPoItems: [] as any[],
    riItems: [] as any[], // { product, ri_type, base_attribute, ri_quantity, price_per_ri, previewVariants }
  };

  public async render(): Promise<void> {
    const app = document.getElementById("app-main");
    if (!app) return;

    app.innerHTML = this.templateSkeleton();

    await Promise.all([
      this.fetchPOs(),
      this.fetchSuppliers(),
      this.fetchProducts(),
    ]);

    app.innerHTML = this.template();
    this.initEvents();
  }

  private async fetchPOs() {
    this.state.loading = true;
    try {
      const res = await ApiClient.adminGet<any>("/purchases");
      this.state.pos = res.results || res || [];
    } catch (error) {
      console.error("Failed to fetch POs:", error);
    } finally {
      this.state.loading = false;
    }
  }

  private async fetchSuppliers() {
    try {
      const res = await ApiClient.adminGet<any>("/suppliers");
      this.state.suppliers = res.results || res || [];
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  }

  private async fetchProducts() {
    try {
      const res = await ApiClient.get<any>("/products?limit=200");
      this.state.products = res.results || res || [];
    } catch (e) {
      console.error("Failed to fetch products:", e);
    }
  }

  private initEvents() {
    const createBtn = document.getElementById("btn-add-po");
    const closeBtn = document.getElementById("btn-close-modal");
    const modal = document.getElementById("po-modal");
    const form = document.getElementById("po-form") as HTMLFormElement;

    // Open Modal
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        this.state.newPoItems = [];
        this.state.riItems = [];
        this.state.activeTab = "sku";
        this.renderPoItems();
        this.renderRiItems();
        this.syncTabUI();
        if (modal) {
          modal.style.display = "flex";
          setTimeout(() => modal.classList.add("modal-visible"), 10);
        }
      });
    }

    // Close Modal
    const closeModal = () => {
      if (modal) {
        modal.classList.remove("modal-visible");
        setTimeout(() => (modal.style.display = "none"), 200);
      }
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    const closeBtnFooter = document.getElementById("btn-close-modal-footer");
    if (closeBtnFooter) closeBtnFooter.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Enter key on SKU input
    const skuInput = document.getElementById("po-sku") as HTMLInputElement;
    if (skuInput) {
      skuInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          document.getElementById("btn-add-sku")?.click();
        }
      });
    }

    // Add Item via SKU
    const addSkuBtn = document.getElementById("btn-add-sku");
    if (addSkuBtn) {
      addSkuBtn.addEventListener("click", async () => {
        const skuInput = document.getElementById("po-sku") as HTMLInputElement;
        const qtyInput = document.getElementById("po-qty") as HTMLInputElement;
        const costInput = document.getElementById(
          "po-cost",
        ) as HTMLInputElement;

        const sku = skuInput.value.trim().toUpperCase();
        const qty = parseInt(qtyInput.value) || 1;
        const cost = parseInt(costInput.value) || 0;

        if (!sku) {
          skuInput.focus();
          return;
        }

        const originalText = addSkuBtn.innerHTML;
        addSkuBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        (addSkuBtn as HTMLButtonElement).disabled = true;

        try {
          const res = await ApiClient.adminGet<any>(`/products/sku/${sku}`);
          if (res && res.variant && res.product) {
            const existing = this.state.newPoItems.find(
              (i) =>
                (i.variant.id || i.variant._id) ===
                (res.variant.id || res.variant._id),
            );
            if (existing) {
              existing.quantity += qty;
              if (cost > 0) existing.unit_cost = cost;
            } else {
              this.state.newPoItems.push({
                variant: res.variant,
                product: res.product,
                quantity: qty,
                unit_cost: cost,
              });
            }
            this.renderPoItems();
            skuInput.value = "";
            qtyInput.value = "1";
            costInput.value = "";
            skuInput.focus();
            // Flash success
            skuInput.style.borderColor = "#22c55e";
            setTimeout(() => (skuInput.style.borderColor = ""), 800);
          }
        } catch (e) {
          skuInput.style.borderColor = "#ef4444";
          setTimeout(() => (skuInput.style.borderColor = ""), 1000);
          const errEl = document.getElementById("sku-error");
          if (errEl) {
            errEl.textContent = `Không tìm thấy SKU: ${sku}`;
            errEl.style.display = "block";
            setTimeout(() => (errEl.style.display = "none"), 2500);
          }
        } finally {
          addSkuBtn.innerHTML = originalText;
          (addSkuBtn as HTMLButtonElement).disabled = false;
        }
      });
    }

    // Tab switching
    const tabSku = document.getElementById("tab-btn-sku");
    const tabRi = document.getElementById("tab-btn-ri");
    if (tabSku)
      tabSku.addEventListener("click", () => {
        this.state.activeTab = "sku";
        this.syncTabUI();
      });
    if (tabRi)
      tabRi.addEventListener("click", () => {
        this.state.activeTab = "ri";
        this.syncTabUI();
      });

    // RI: product select → load attributes
    const riProductSelect = document.getElementById(
      "ri-product",
    ) as HTMLSelectElement;
    if (riProductSelect) {
      riProductSelect.addEventListener("change", () => {
        this.updateRiAttributeOptions();
      });
    }
    const riTypeSelect = document.getElementById(
      "ri-type",
    ) as HTMLSelectElement;
    if (riTypeSelect) {
      riTypeSelect.addEventListener("change", () => {
        this.updateRiAttributeOptions();
      });
    }

    // RI: add RI row
    const addRiBtn = document.getElementById("btn-add-ri");
    if (addRiBtn) {
      addRiBtn.addEventListener("click", () => {
        const productSelect = document.getElementById(
          "ri-product",
        ) as HTMLSelectElement;
        const typeSelect = document.getElementById(
          "ri-type",
        ) as HTMLSelectElement;
        const attrSelect = document.getElementById(
          "ri-attribute",
        ) as HTMLSelectElement;
        const qtyInput = document.getElementById("ri-qty") as HTMLInputElement;
        const priceInput = document.getElementById(
          "ri-price",
        ) as HTMLInputElement;

        const productId = parseInt(productSelect.value);
        const product = this.state.products.find(
          (p) => (p._id || p.id) === productId,
        );
        const ri_type = typeSelect.value;
        const base_attribute = attrSelect.value;
        const ri_quantity = parseInt(qtyInput.value) || 1;
        const price_per_ri = parseInt(priceInput.value) || 0;

        if (!productId || !ri_type || !base_attribute) return;

        const existing = this.state.riItems.find(
          (r) =>
            r.product_id === productId &&
            r.ri_type === ri_type &&
            r.base_attribute === base_attribute,
        );
        if (existing) {
          existing.ri_quantity = ri_quantity;
          existing.price_per_ri = price_per_ri;
        } else {
          this.state.riItems.push({
            product_id: productId,
            product,
            ri_type,
            base_attribute,
            ri_quantity,
            price_per_ri,
          });
        }

        this.renderRiItems();
        // Reset
        qtyInput.value = "1";
        priceInput.value = "";
        attrSelect.value = "";
      });
    }

    // Submit PO
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const supplierSelect = document.getElementById(
          "po-supplier",
        ) as HTMLSelectElement;
        const supplier_id = supplierSelect.value;

        if (!supplier_id) {
          supplierSelect.focus();
          return;
        }

        const isRi = this.state.activeTab === "ri";

        if (isRi) {
          if (this.state.riItems.length === 0) return;
          const submitBtn = document.getElementById(
            "btn-submit-modal",
          ) as HTMLButtonElement;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo...';
          submitBtn.disabled = true;
          try {
            await ApiClient.adminPost("/purchases", {
              supplier_id,
              import_type: "RI_LEVEL",
              ri_details: this.state.riItems.map((r) => {
                const variants = r.product?.variants || [];
                let variantCount = 0;
                if (r.ri_type === "SIZE_FULL_COLOR")
                  variantCount = variants.filter(
                    (v: any) => v.size === r.base_attribute,
                  ).length;
                if (r.ri_type === "COLOR_FULL_SIZE")
                  variantCount = variants.filter(
                    (v: any) => v.color === r.base_attribute,
                  ).length;
                if (variantCount === 0) variantCount = 1;

                const unitPrice =
                  Math.round(r.price_per_ri / variantCount / 1000) * 1000;

                return {
                  product_id: r.product_id,
                  ri_type: r.ri_type,
                  base_attribute: r.base_attribute,
                  ri_quantity: r.ri_quantity,
                  price_per_ri: unitPrice,
                };
              }),
            });
            const closeBtn = document.getElementById("btn-close-modal");
            closeBtn?.click();
            await this.render();
          } catch (error: any) {
            alert("Lỗi: " + (error.message || "Không thể tạo phiếu nhập"));
          } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
          return;
        }

        if (this.state.newPoItems.length === 0) {
          const skuInput = document.getElementById(
            "po-sku",
          ) as HTMLInputElement;
          skuInput?.focus();
          return;
        }

        const items = this.state.newPoItems.map((item) => ({
          product_variant_id: item.variant.id || item.variant._id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        }));

        const submitBtn = document.getElementById(
          "btn-submit-modal",
        ) as HTMLButtonElement;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo...';
        submitBtn.disabled = true;

        try {
          await ApiClient.adminPost("/purchases", {
            supplier_id,
            import_type: "VARIANT_LEVEL",
            items,
          });
          const closeBtn = document.getElementById("btn-close-modal");
          closeBtn?.click();
          await this.render();
        } catch (error: any) {
          alert("Lỗi: " + (error.message || "Không thể tạo phiếu nhập"));
        } finally {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      });
    }

    // Approve PO
    document.querySelectorAll(".btn-approve-po").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const supplierName =
          (e.currentTarget as HTMLElement).dataset.supplier || "N/A";
        if (
          confirm(
            `Xác nhận duyệt phiếu nhập #${id} (${supplierName})?\n\nSau khi duyệt, tồn kho sẽ được cập nhật ngay lập tức.`,
          )
        ) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
          (btn as HTMLButtonElement).disabled = true;
          try {
            await ApiClient.adminPost(`/purchases/${id}/approve`, {});
            await this.render();
          } catch (error: any) {
            alert("Lỗi khi duyệt phiếu: " + (error.message || "Unknown error"));
            btn.innerHTML = originalHTML;
            (btn as HTMLButtonElement).disabled = false;
          }
        }
      });
    });

    // Detail PO Modal Handlers
    const detailModal = document.getElementById("po-detail-modal");
    const closeDetailBtn = document.getElementById("btn-close-detail-modal");

    const closeDetailModal = () => {
      if (detailModal) {
        detailModal.style.opacity = "0"; detailModal.classList.remove("modal-visible");
        setTimeout(() => (detailModal.style.display = "none"), 200);
      }
    };

    if (closeDetailBtn)
      closeDetailBtn.addEventListener("click", closeDetailModal);
    if (detailModal) {
      detailModal.addEventListener("click", (e) => {
        if (e.target === detailModal) closeDetailModal();
      });
    }

    document.querySelectorAll(".btn-detail-po").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (!id) return;

        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        (btn as HTMLButtonElement).disabled = true;

        try {
          const data = await ApiClient.adminGet<any>(`/purchases/${id}`);
          if (data && detailModal) {
            this.renderPoDetailModal(data);
            detailModal.style.display = "flex";
            setTimeout(() => { detailModal.style.opacity = "1"; detailModal.classList.add("modal-visible"); }, 10);
          }
        } catch (error: any) {
          alert(
            "Lỗi khi lấy chi tiết phiếu nhập: " +
              (error.message || "Unknown error"),
          );
        } finally {
          btn.innerHTML = originalHTML;
          (btn as HTMLButtonElement).disabled = false;
        }
      });
    });
  }

  private renderPoItems() {
    const container = document.getElementById("po-items-list");
    const totalEl = document.getElementById("po-items-total");
    const countEl = document.getElementById("po-items-count");
    if (!container) return;

    if (this.state.newPoItems.length === 0) {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; gap:12px; color:#94a3b8;">
          <i class="fa-solid fa-box-open" style="font-size:36px; opacity:0.4;"></i>
          <p style="font-size:13px; font-weight:600;">Quét hoặc nhập SKU để thêm sản phẩm</p>
        </div>`;
      if (totalEl) totalEl.textContent = "0đ";
      if (countEl) countEl.textContent = "0 sản phẩm";
      return;
    }

    let total = 0;
    container.innerHTML = this.state.newPoItems
      .map((item, index) => {
        const lineTotal = item.quantity * item.unit_cost;
        total += lineTotal;
        return `
        <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9;">
          <div style="width:40px; height:40px; border-radius:10px; background:#eff6ff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i class="fa-solid fa-shirt" style="font-size:16px; color:#2a83e9;"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <p style="font-size:13px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${item.product.name}
            </p>
            <p style="font-size:11px; color:#64748b; margin-top:2px;">
              <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace; font-weight:700;">${item.variant.sku}</span>
              &nbsp;•&nbsp; ${item.variant.color} / Size ${item.variant.size}
            </p>
          </div>
          <div style="text-align:center; flex-shrink:0; width:70px;">
            <p style="font-size:11px; color:#94a3b8; font-weight:600; margin-bottom:2px;">SL</p>
            <p style="font-size:14px; font-weight:800; color:#0f172a;">${item.quantity}</p>
          </div>
          <div style="text-align:right; flex-shrink:0; width:110px;">
            <p style="font-size:11px; color:#94a3b8; font-weight:600; margin-bottom:2px;">Thành tiền</p>
            <p style="font-size:13px; font-weight:800; color:#2a83e9;">${lineTotal.toLocaleString("vi-VN")}đ</p>
            <p style="font-size:10px; color:#94a3b8;">${item.unit_cost.toLocaleString("vi-VN")}đ/sp</p>
          </div>
          <button type="button" class="po-remove-item" data-index="${index}" style="
            width:30px; height:30px; border-radius:8px; border:none; background:#fff0f0;
            color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center;
            flex-shrink:0; transition:all 0.15s; font-size:13px;
          " onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fff0f0'">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>`;
      })
      .join("");

    if (totalEl) totalEl.textContent = total.toLocaleString("vi-VN") + "đ";
    if (countEl)
      countEl.textContent = this.state.newPoItems.length + " sản phẩm";

    // Remove events
    container.querySelectorAll(".po-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt((btn as HTMLElement).dataset.index || "0");
        this.state.newPoItems.splice(idx, 1);
        this.renderPoItems();
      });
    });
  }

  private syncTabUI() {
    const skuPanel = document.getElementById("tab-panel-sku");
    const riPanel = document.getElementById("tab-panel-ri");
    const tabSkuBtn = document.getElementById("tab-btn-sku");
    const tabRiBtn = document.getElementById("tab-btn-ri");
    const isRi = this.state.activeTab === "ri";

    const activeStyle =
      "background:#2a83e9; color:white; border-color:#2a83e9;";
    const inactiveStyle =
      "background:white; color:#64748b; border-color:#e2e8f0;";

    if (skuPanel) skuPanel.style.display = isRi ? "none" : "block";
    if (riPanel) riPanel.style.display = isRi ? "block" : "none";
    if (tabSkuBtn)
      tabSkuBtn.setAttribute(
        "style",
        `padding:7px 16px; border-radius:8px; border:1.5px solid; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.15s; ${isRi ? inactiveStyle : activeStyle}`,
      );
    if (tabRiBtn)
      tabRiBtn.setAttribute(
        "style",
        `padding:7px 16px; border-radius:8px; border:1.5px solid; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.15s; ${isRi ? activeStyle : inactiveStyle}`,
      );
  }

  private updateRiAttributeOptions() {
    const productSelect = document.getElementById(
      "ri-product",
    ) as HTMLSelectElement;
    const typeSelect = document.getElementById("ri-type") as HTMLSelectElement;
    const attrSelect = document.getElementById(
      "ri-attribute",
    ) as HTMLSelectElement;
    if (!productSelect || !typeSelect || !attrSelect) return;

    const productId = parseInt(productSelect.value);
    const riType = typeSelect.value;
    const product = this.state.products.find(
      (p) => (p._id || p.id) === productId,
    );

    attrSelect.innerHTML = '<option value="">-- Chọn --</option>';
    if (!product || !riType) return;

    const variants = product.variants || [];
    const values: Set<string> = new Set();
    variants.forEach((v: any) => {
      if (riType === "SIZE_FULL_COLOR") values.add(v.size);
      if (riType === "COLOR_FULL_SIZE") values.add(v.color);
    });

    values.forEach((val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = riType === "SIZE_FULL_COLOR" ? `Size ${val}` : val;
      attrSelect.appendChild(opt);
    });
  }

  private renderRiItems() {
    const container = document.getElementById("ri-items-list");
    const totalEl = document.getElementById("ri-items-total");
    const countEl = document.getElementById("ri-items-count");
    if (!container) return;

    if (this.state.riItems.length === 0) {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; gap:10px; color:#94a3b8;">
          <i class="fa-solid fa-layer-group" style="font-size:32px; opacity:0.4;"></i>
          <p style="font-size:13px; font-weight:600;">Chưa có RI nào được thêm</p>
        </div>`;
      if (totalEl) totalEl.textContent = "0đ";
      if (countEl) countEl.textContent = "0 RI";
      return;
    }

    let total = 0;
    container.innerHTML = this.state.riItems
      .map((ri, index) => {
        total += ri.price_per_ri || 0;
        const typeLabel =
          ri.ri_type === "SIZE_FULL_COLOR"
            ? `Size <strong>${ri.base_attribute}</strong> – tất cả màu`
            : `Màu <strong>${ri.base_attribute}</strong> – tất cả size`;
        return `
        <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9;">
          <div style="width:36px; height:36px; border-radius:9px; background:#f5f3ff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i class="fa-solid fa-layer-group" style="font-size:14px; color:#7c3aed;"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <p style="font-size:13px; font-weight:700; color:#0f172a; margin:0 0 2px 0;">${ri.product?.name || "SP #" + ri.product_id}</p>
            <p style="font-size:11px; color:#64748b; margin:0;">${typeLabel} &nbsp;•&nbsp; SL: <strong>${ri.ri_quantity}</strong> cái/variant</p>
          </div>
          <div style="text-align:right; flex-shrink:0; width:110px;">
            <p style="font-size:11px; color:#94a3b8; font-weight:600; margin-bottom:2px;">Giá cả RI</p>
            <p style="font-size:13px; font-weight:800; color:#7c3aed;">${(ri.price_per_ri || 0).toLocaleString("vi-VN")}đ</p>
          </div>
          <button type="button" class="ri-remove-item" data-index="${index}" style="
            width:30px; height:30px; border-radius:8px; border:none; background:#fff0f0;
            color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center;
            flex-shrink:0; transition:all 0.15s; font-size:13px;
          " onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fff0f0'">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>`;
      })
      .join("");

    if (totalEl) totalEl.textContent = total.toLocaleString("vi-VN") + "đ";
    if (countEl) countEl.textContent = this.state.riItems.length + " RI";

    container.querySelectorAll(".ri-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt((btn as HTMLElement).dataset.index || "0");
        this.state.riItems.splice(idx, 1);
        this.renderRiItems();
      });
    });
  }

  private templateSkeleton(): string {
    return `
      <div style="display:flex; flex-direction:column; gap:24px; animation: pulse 1.5s infinite;">
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
          ${[1, 2, 3, 4]
            .map(
              () => `
            <div style="background:white; border-radius:16px; padding:20px 22px; border:1px solid #f1f5f9; height:88px;"></div>
          `,
            )
            .join("")}
        </div>
        <div style="background:white; border-radius:16px; height:400px; border:1px solid #f1f5f9;"></div>
      </div>`;
  }

  private getStats() {
    const all = this.state.pos.length;
    const pending = this.state.pos.filter((p) => p.status === "PENDING").length;
    const completed = this.state.pos.filter(
      (p) => p.status === "COMPLETED",
    ).length;
    const totalValue = this.state.pos.reduce(
      (sum, p) => sum + (p.total_amount || 0),
      0,
    );
    return { all, pending, completed, totalValue };
  }

  private template(): string {
    const stats = this.getStats();

    const statsCards = [
      {
        label: "Tổng phiếu nhập",
        value: stats.all,
        icon: "fa-file-invoice",
        color: "#2a83e9",
        bg: "#eff6ff",
      },
      {
        label: "Chờ duyệt",
        value: stats.pending,
        icon: "fa-hourglass-half",
        color: "#d97706",
        bg: "#fffbeb",
      },
      {
        label: "Đã nhập kho",
        value: stats.completed,
        icon: "fa-circle-check",
        color: "#16a34a",
        bg: "#f0fdf4",
      },
      {
        label: "Tổng giá trị",
        value: stats.totalValue.toLocaleString("vi-VN") + "đ",
        icon: "fa-sack-dollar",
        color: "#7c3aed",
        bg: "#f5f3ff",
      },
    ];

    return `
      <style>
        #po-modal { display:none; }
        #po-modal.modal-visible > div { animation: slideUp 0.2s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        .po-sku-input:focus { border-color: #2a83e9 !important; box-shadow: 0 0 0 3px rgba(42,131,233,0.12); }
      </style>

      <div style="display:flex; flex-direction:column; gap:24px;">

        <!-- Page Header -->
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px;">
          <div>
            <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 4px 0; letter-spacing:-0.5px;">Nhập kho</h1>
            <p style="font-size:13px; color:#64748b; margin:0;">Quản lý phiếu nhập hàng từ nhà cung cấp</p>
          </div>
          <button id="btn-add-po" style="
            display:flex; align-items:center; gap:8px;
            padding:10px 18px; border-radius:10px;
            background:#2a83e9; color:white; border:none;
            font-size:13px; font-weight:700; cursor:pointer;
            transition:all 0.15s; box-shadow:0 4px 12px rgba(42,131,233,0.3);
          " onmouseover="this.style.background='#1d6fd8'" onmouseout="this.style.background='#2a83e9'">
            <i class="fa-solid fa-plus"></i> Tạo phiếu nhập
          </button>
        </div>

        <!-- Stats Cards -->
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
          ${statsCards
            .map(
              (c) => `
            <div style="
              background:white; border-radius:16px; padding:20px 22px;
              border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.04);
              display:flex; align-items:center; gap:16px;
            ">
              <div style="
                width:44px; height:44px; border-radius:12px;
                background:${c.bg}; display:flex; align-items:center; justify-content:center;
                flex-shrink:0;
              ">
                <i class="fa-solid ${c.icon}" style="font-size:18px; color:${c.color};"></i>
              </div>
              <div style="min-width:0;">
                <p style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 4px 0; white-space:nowrap;">${c.label}</p>
                <p style="font-size:20px; font-weight:800; color:#0f172a; margin:0; line-height:1; letter-spacing:-0.5px;">${c.value}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <!-- Table Card -->
        <div style="background:white; border-radius:16px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.04); overflow:hidden;">

          <!-- Table header bar -->
          <div style="padding:18px 24px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <h2 style="font-size:15px; font-weight:800; color:#0f172a; margin:0 0 2px 0;">Lịch sử phiếu nhập</h2>
              <p style="font-size:12px; color:#94a3b8; margin:0;">${this.state.pos.length} phiếu</p>
            </div>
          </div>

          <!-- Table -->
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; min-width:700px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:12px 24px; text-align:left; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; white-space:nowrap;">Mã phiếu</th>
                  <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Nhà cung cấp</th>
                  <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Ngày tạo</th>
                  <th style="padding:12px 20px; text-align:right; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Tổng tiền</th>
                  <th style="padding:12px 20px; text-align:center; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Trạng thái</th>
                  <th style="padding:12px 20px; text-align:center; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${
                  this.state.pos.length === 0
                    ? `
                  <tr>
                    <td colspan="6" style="padding:60px 20px; text-align:center;">
                      <div style="display:flex; flex-direction:column; align-items:center; gap:12px; color:#94a3b8;">
                        <i class="fa-solid fa-boxes-stacked" style="font-size:40px; opacity:0.4;"></i>
                        <p style="font-size:14px; font-weight:600;">Chưa có phiếu nhập kho nào</p>
                        <p style="font-size:13px;">Bấm "Tạo phiếu nhập" để bắt đầu</p>
                      </div>
                    </td>
                  </tr>
                `
                    : this.state.pos
                        .map((po) => {
                          const supplierName = po.supplier_id
                            ? po.supplier_id.name
                            : "N/A";
                          const isCompleted = po.status === "COMPLETED";
                          const date = new Date(
                            po.createdAt || po.create_at || Date.now(),
                          );
                          return `
                    <tr style="border-bottom:1px solid #f8fafc; transition:background 0.1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
                      <td style="padding:16px 24px;">
                        <span style="font-family:monospace; font-weight:800; color:#2a83e9; font-size:13px;">#${po._id || po.id}</span>
                      </td>
                      <td style="padding:16px 20px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                          <div style="width:32px; height:32px; border-radius:8px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i class="fa-solid fa-truck-field" style="font-size:13px; color:#64748b;"></i>
                          </div>
                          <span style="font-size:13px; font-weight:700; color:#0f172a;">${supplierName}</span>
                        </div>
                      </td>
                      <td style="padding:16px 20px;">
                        <span style="font-size:13px; color:#64748b;">${date.toLocaleDateString("vi-VN")}</span>
                        <span style="font-size:11px; color:#94a3b8; display:block; margin-top:1px;">${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td style="padding:16px 20px; text-align:right;">
                        <span style="font-size:14px; font-weight:800; color:#0f172a;">${(po.total_amount || 0).toLocaleString("vi-VN")}<span style="font-size:11px; color:#94a3b8; font-weight:600;">đ</span></span>
                      </td>
                      <td style="padding:16px 20px; text-align:center;">
                        ${
                          isCompleted
                            ? `<span style="display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800; background:#f0fdf4; color:#16a34a;">
                              <i class="fa-solid fa-circle-check"></i> Đã nhập kho
                            </span>`
                            : `<span style="display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800; background:#fffbeb; color:#d97706;">
                              <i class="fa-solid fa-hourglass-half"></i> Chờ duyệt
                            </span>`
                        }
                      </td>
                      <td style="padding:16px 20px; text-align:center; display:flex; justify-content:center; gap:8px;">
                        <button class="btn-detail-po" data-id="${po._id || po.id}" style="
                          display:inline-flex; align-items:center; gap:6px;
                          padding:6px 14px; border-radius:8px;
                          background:#f1f5f9; color:#475569;
                          border:1.5px solid #e2e8f0;
                          font-size:12px; font-weight:700; cursor:pointer;
                          transition:all 0.15s;
                        " onmouseover="this.style.background='#e2e8f0';this.style.color='#0f172a';this.style.borderColor='#cbd5e1';"
                          onmouseout="this.style.background='#f1f5f9';this.style.color='#475569';this.style.borderColor='#e2e8f0';">
                          <i class="fa-solid fa-eye"></i> Chi tiết
                        </button>
                        ${
                          !isCompleted
                            ? `
                          <button class="btn-approve-po" data-id="${po._id || po.id}" data-supplier="${supplierName}" style="
                            display:inline-flex; align-items:center; gap:6px;
                            padding:6px 14px; border-radius:8px;
                            background:#f0fdf4; color:#16a34a;
                            border:1.5px solid #bbf7d0;
                            font-size:12px; font-weight:700; cursor:pointer;
                            transition:all 0.15s;
                          " onmouseover="this.style.background='#16a34a';this.style.color='white';this.style.borderColor='#16a34a';"
                            onmouseout="this.style.background='#f0fdf4';this.style.color='#16a34a';this.style.borderColor='#bbf7d0';">
                            <i class="fa-solid fa-check"></i> Duyệt nhập
                          </button>
                        `
                            : ``
                        }
                      </td>
                    </tr>`;
                        })
                        .join("")
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create PO Modal -->
      <div id="po-modal" style="
        position:fixed; inset:0;
        background:rgba(15,23,42,0.5); backdrop-filter:blur(4px);
        z-index:1000; align-items:center; justify-content:center; padding:20px;
      ">
        <div style="
          background:white; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,0.2);
          width:100%; max-width:720px; display:flex; flex-direction:column; max-height:90vh;
          overflow:hidden;
        ">
          <!-- Modal Header -->
          <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
            <div>
              <h3 style="font-size:16px; font-weight:800; color:#0f172a; margin:0 0 2px 0;">Tạo phiếu nhập kho</h3>
              <p style="font-size:12px; color:#94a3b8; margin:0;">Thêm sản phẩm bằng SKU</p>
            </div>
            <button id="btn-close-modal" style="
              width:32px; height:32px; border-radius:8px; border:none;
              background:#f8fafc; color:#64748b; cursor:pointer;
              display:flex; align-items:center; justify-content:center;
              font-size:16px; transition:all 0.15s;
            " onmouseover="this.style.background='#fee2e2';this.style.color='#ef4444'" onmouseout="this.style.background='#f8fafc';this.style.color='#64748b'">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <form id="po-form" style="flex:1; overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:20px;">

            <!-- Supplier Select -->
            <div>
              <label style="display:block; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                Nhà cung cấp <span style="color:#ef4444;">*</span>
              </label>
              <select id="po-supplier" style="
                width:100%; padding:10px 14px; border-radius:10px;
                border:1.5px solid #e2e8f0; background:#f8fafc;
                font-size:14px; color:#0f172a; outline:none;
                transition:all 0.15s; cursor:pointer; font-weight:500;
              " onfocus="this.style.borderColor='#2a83e9';this.style.background='white'" onblur="this.style.borderColor='#e2e8f0';this.style.background='#f8fafc'" required>
                <option value="">-- Chọn nhà cung cấp --</option>
                ${this.state.suppliers.map((s) => `<option value="${s._id || s.id}">${s.name}</option>`).join("")}
              </select>
            </div>
            <!-- Tab Switcher -->
            <div style="display:flex; gap:8px; padding:4px; background:#f1f5f9; border-radius:10px; align-self:flex-start;">
              <button type="button" id="tab-btn-sku" style="padding:7px 16px; border-radius:8px; border:1.5px solid #2a83e9; font-size:13px; font-weight:700; cursor:pointer; background:#2a83e9; color:white; transition:all 0.15s;">
                <i class="fa-solid fa-barcode"></i> Theo SKU
              </button>
              <button type="button" id="tab-btn-ri" style="padding:7px 16px; border-radius:8px; border:1.5px solid #e2e8f0; font-size:13px; font-weight:700; cursor:pointer; background:white; color:#64748b; transition:all 0.15s;">
                <i class="fa-solid fa-layer-group"></i> Theo RI
              </button>
            </div>

            <!-- SKU Panel -->
            <div id="tab-panel-sku">
            <!-- SKU Scanner -->
            <div style="background:#f8fafc; border-radius:14px; padding:16px; border:1.5px solid #e2e8f0;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <i class="fa-solid fa-barcode" style="color:#2a83e9; font-size:16px;"></i>
                <h4 style="font-size:13px; font-weight:700; color:#0f172a; margin:0;">Thêm sản phẩm</h4>
                <span style="font-size:11px; color:#94a3b8; font-weight:500;">Nhập SKU hoặc quét mã vạch</span>
              </div>
              <div style="display:flex; gap:8px; align-items:flex-end;">
                <div style="flex:2;">
                  <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">SKU</label>
                  <input type="text" id="po-sku" class="po-sku-input" style="
                    width:100%; padding:9px 12px; border-radius:8px;
                    border:1.5px solid #e2e8f0; background:white;
                    font-size:13px; font-family:monospace; font-weight:700;
                    color:#0f172a; outline:none; transition:all 0.15s; box-sizing:border-box;
                  " placeholder="VD: CLT-TRNG-M" onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#e2e8f0'">
                </div>
                <div style="width:80px;">
                  <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">SL nhập</label>
                  <input type="number" id="po-qty" style="
                    width:100%; padding:9px 12px; border-radius:8px;
                    border:1.5px solid #e2e8f0; background:white;
                    font-size:13px; font-weight:700; color:#0f172a;
                    outline:none; transition:all 0.15s; box-sizing:border-box; text-align:center;
                  " value="1" min="1" onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#e2e8f0'">
                </div>
                <div style="width:130px;">
                  <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Giá nhập (đ)</label>
                  <input type="number" id="po-cost" style="
                    width:100%; padding:9px 12px; border-radius:8px;
                    border:1.5px solid #e2e8f0; background:white;
                    font-size:13px; color:#0f172a; outline:none;
                    transition:all 0.15s; box-sizing:border-box;
                  " placeholder="0" min="0" onfocus="this.style.borderColor='#2a83e9'" onblur="this.style.borderColor='#e2e8f0'">
                </div>
                <button type="button" id="btn-add-sku" style="
                  padding:9px 16px; border-radius:8px; border:none;
                  background:#0f172a; color:white; font-size:13px;
                  font-weight:700; cursor:pointer; transition:all 0.15s;
                  display:flex; align-items:center; gap:6px; white-space:nowrap;
                " onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='#0f172a'">
                  <i class="fa-solid fa-plus"></i> Thêm
                </button>
              </div>
              <p id="sku-error" style="display:none; font-size:12px; color:#ef4444; font-weight:600; margin-top:8px;">
                <i class="fa-solid fa-triangle-exclamation"></i> Không tìm thấy SKU
              </p>
            </div>

            <!-- Items List -->
            <div>
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <label style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Danh sách nhập</label>
                  <span id="po-items-count" style="background:#f1f5f9; color:#64748b; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px;">0 sản phẩm</span>
                </div>
                <div style="font-size:13px; font-weight:700; color:#0f172a;">
                  Tổng: <span id="po-items-total" style="color:#2a83e9; font-size:15px;">0đ</span>
                </div>
              </div>
              <div id="po-items-list" style="
                border:1.5px solid #e2e8f0; border-radius:12px;
                padding:0 16px; min-height:120px; max-height:280px;
                overflow-y:auto; background:white;
              ">
                <!-- Rendered dynamically -->
              </div>
            </div>
            </div> <!-- end tab-panel-sku -->

            <!-- RI Panel -->
            <div id="tab-panel-ri" style="display:none;">
              <div style="background:#f8fafc; border-radius:14px; padding:16px; border:1.5px solid #e2e8f0;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                  <i class="fa-solid fa-layer-group" style="color:#7c3aed; font-size:16px;"></i>
                  <h4 style="font-size:13px; font-weight:700; color:#0f172a; margin:0;">Thêm theo RI</h4>
                  <span style="font-size:11px; color:#94a3b8;">1 RI = 1 màu tất cả size, hoặc 1 size tất cả màu</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                  <div>
                    <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Sản phẩm</label>
                    <select id="ri-product" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #e2e8f0; background:white; font-size:13px; color:#0f172a; outline:none; cursor:pointer; box-sizing:border-box;" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'">
                      <option value="">-- Chọn SP --</option>
                      ${this.state.products.map((p) => `<option value="${p._id || p.id}">${p.name}</option>`).join("")}
                    </select>
                  </div>
                  <div>
                    <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Loại RI</label>
                    <select id="ri-type" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #e2e8f0; background:white; font-size:13px; color:#0f172a; outline:none; cursor:pointer; box-sizing:border-box;" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'">
                      <option value="">-- Chọn loại --</option>
                      <option value="COLOR_FULL_SIZE">Theo Màu (1 màu, full size)</option>
                      <option value="SIZE_FULL_COLOR">Theo Size (1 size, full màu)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Thuộc tính</label>
                    <select id="ri-attribute" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #e2e8f0; background:white; font-size:13px; color:#0f172a; outline:none; cursor:pointer; box-sizing:border-box;" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'">
                      <option value="">-- Chọn SP & loại trước --</option>
                    </select>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:end;">
                    <div>
                      <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Số lượng RI</label>
                      <input type="number" id="ri-qty" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #e2e8f0; background:white; font-size:13px; color:#0f172a; outline:none; box-sizing:border-box; text-align:center;" value="1" min="1" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'">
                    </div>
                    <div>
                      <label style="display:block; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Giá RI (đ)</label>
                      <input type="number" id="ri-price" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #e2e8f0; background:white; font-size:13px; color:#0f172a; outline:none; box-sizing:border-box;" placeholder="0" min="0" onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e2e8f0'">
                    </div>
                  </div>
                </div>
                <button type="button" id="btn-add-ri" style="
                  width:100%; padding:9px; border-radius:8px; border:none;
                  background:#7c3aed; color:white; font-size:13px; font-weight:700;
                  cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:8px;
                " onmouseover="this.style.background='#6d28d9'" onmouseout="this.style.background='#7c3aed'">
                  <i class="fa-solid fa-plus"></i> Thêm RI vào phiếu
                </button>
              </div>

              <!-- RI Items List -->
              <div style="margin-top:16px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <label style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Danh sách RI</label>
                    <span id="ri-items-count" style="background:#f5f3ff; color:#7c3aed; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px;">0 RI</span>
                  </div>
                  <div style="font-size:13px; font-weight:700; color:#0f172a;">
                    Tổng giá RI: <span id="ri-items-total" style="color:#7c3aed; font-size:15px;">0đ</span>
                  </div>
                </div>
                <div id="ri-items-list" style="
                  border:1.5px solid #e2e8f0; border-radius:12px;
                  padding:0 16px; min-height:100px; max-height:240px;
                  overflow-y:auto; background:white;
                ">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div> <!-- end tab-panel-ri -->

          </form>

          <!-- Modal Footer -->
          <div style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; flex-shrink:0; background:#f8fafc;">
            <button type="button" id="btn-close-modal-footer" style="
              padding:10px 20px; border-radius:10px; border:1.5px solid #e2e8f0;
              background:white; color:#64748b; font-size:13px; font-weight:700;
              cursor:pointer; transition:all 0.15s;
            " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
              Huỷ
            </button>
            <button type="submit" form="po-form" id="btn-submit-modal" style="
              padding:10px 24px; border-radius:10px; border:none;
              background:#2a83e9; color:white; font-size:13px; font-weight:700;
              cursor:pointer; transition:all 0.15s; display:flex; align-items:center; gap:8px;
              box-shadow:0 4px 12px rgba(42,131,233,0.3);
            " onmouseover="this.style.background='#1d6fd8'" onmouseout="this.style.background='#2a83e9'">
              <i class="fa-solid fa-floppy-disk"></i> Lưu phiếu nhập
            </button>
          </div>
        </div>
      </div>

      <!-- PO Detail Modal -->
      <div id="po-detail-modal" style="
        position:fixed; inset:0; display:none;
        background:rgba(15,23,42,0.5); backdrop-filter:blur(4px);
        z-index:1000; align-items:center; justify-content:center; padding:20px;
        opacity:0; transition:opacity 0.2s;
      ">
        <div style="
          background:white; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,0.2);
          width:100%; max-width:720px; display:flex; flex-direction:column; max-height:90vh;
          overflow:hidden; transform:scale(0.95); transition:transform 0.2s;
        " id="po-detail-modal-content">
          <!-- Header -->
          <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
            <div>
              <h3 style="font-size:16px; font-weight:800; color:#0f172a; margin:0 0 2px 0;">Chi tiết phiếu nhập</h3>
              <p style="font-size:12px; color:#94a3b8; margin:0;" id="po-detail-id">Đang tải...</p>
            </div>
            <button id="btn-close-detail-modal" style="
              width:32px; height:32px; border-radius:8px; border:none;
              background:#f8fafc; color:#64748b; cursor:pointer;
              display:flex; align-items:center; justify-content:center;
              font-size:16px; transition:all 0.15s;
            " onmouseover="this.style.background='#fee2e2';this.style.color='#ef4444'" onmouseout="this.style.background='#f8fafc';this.style.color='#64748b'">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <!-- Body -->
          <div id="po-detail-body" style="flex:1; overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; justify-content:center; padding:40px;">
              <i class="fa-solid fa-spinner fa-spin" style="font-size:32px; color:#cbd5e1;"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPoDetailModal(data: any) {
    const idEl = document.getElementById("po-detail-id");
    const bodyEl = document.getElementById("po-detail-body");

    if (idEl) idEl.textContent = `Mã phiếu: #${data._id || data.id}`;

    if (bodyEl) {
      const supplierName = data.supplier_id
        ? data.supplier_id.name || "N/A"
        : "N/A";
      const date = new Date(data.createdAt || data.create_at || Date.now());
      const isCompleted = data.status === "COMPLETED";

      let itemsHtml = "";
      if (data.items && data.items.length > 0) {
        itemsHtml = data.items
          .map((item: any) => {
            const varObj = item.product_variant_id || {};
            const prodObj = varObj.product_id || {};
            return `
            <div style="display:flex; align-items:center; gap:12px; padding:12px; border-bottom:1px solid #f1f5f9;">
              <div style="flex:1; min-width:0;">
                <p style="font-size:13px; font-weight:700; color:#0f172a; margin:0 0 4px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${prodObj.name || "Sản phẩm không xác định"}
                </p>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-family:monospace; font-size:11px; font-weight:800; color:#2a83e9;">${varObj.sku || "N/A"}</span>
                  ${varObj.color ? `<span style="font-size:10px; padding:2px 6px; background:#f1f5f9; border-radius:4px; font-weight:600;">Màu: ${varObj.color}</span>` : ""}
                  ${varObj.size ? `<span style="font-size:10px; padding:2px 6px; background:#f1f5f9; border-radius:4px; font-weight:600;">Size: ${varObj.size}</span>` : ""}
                </div>
              </div>
              <div style="text-align:right;">
                <p style="font-size:13px; font-weight:800; color:#0f172a; margin:0 0 2px 0;">SL: ${item.quantity || 0}</p>
                <p style="font-size:12px; color:#64748b; margin:0;">${(item.unit_cost || 0).toLocaleString("vi-VN")} đ</p>
              </div>
            </div>
          `;
          })
          .join("");
      } else if (data.ri_details && data.ri_details.length > 0) {
        itemsHtml = data.ri_details
          .map((ri: any) => {
            const prodObj = ri.product_id || {};
            return `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #f1f5f9;">
              <div style="flex:1;">
                <p style="font-size:13px; font-weight:700; color:#0f172a; margin:0 0 4px 0;">${prodObj.name || "Sản phẩm không xác định"}</p>
                <div style="display:flex; gap:6px;">
                  <span style="font-size:10px; padding:2px 6px; background:#f5f3ff; color:#7c3aed; border-radius:4px; font-weight:700;">RI: ${ri.ri_type === "COLOR_FULL_SIZE" ? "Theo màu" : "Theo size"}</span>
                  <span style="font-size:10px; padding:2px 6px; background:#f1f5f9; border-radius:4px; font-weight:600;">${ri.base_attribute || "N/A"}</span>
                </div>
              </div>
              <div style="text-align:right;">
                <p style="font-size:13px; font-weight:800; color:#0f172a; margin:0 0 2px 0;">${ri.ri_quantity || 0} RI</p>
                <p style="font-size:12px; color:#64748b; margin:0;">Giá: ${(ri.price_per_ri || 0).toLocaleString("vi-VN")} đ</p>
              </div>
            </div>
          `;
          })
          .join("");
      } else {
        itemsHtml =
          '<p style="text-align:center; padding:20px; color:#94a3b8; font-size:13px;">Không có chi tiết sản phẩm</p>';
      }

      bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:10px;">
          <div style="background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #f1f5f9;">
            <p style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; margin:0 0 6px 0;">Nhà cung cấp</p>
            <p style="font-size:14px; font-weight:800; color:#0f172a; margin:0;">${supplierName}</p>
          </div>
          <div style="background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #f1f5f9;">
            <p style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; margin:0 0 6px 0;">Ngày tạo</p>
            <p style="font-size:14px; font-weight:800; color:#0f172a; margin:0;">${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div style="background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #f1f5f9;">
            <p style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; margin:0 0 6px 0;">Trạng thái</p>
            <p style="margin:0;">
              ${
                isCompleted
                  ? '<span style="color:#16a34a; font-weight:800; font-size:13px;"><i class="fa-solid fa-circle-check"></i> Đã nhập kho</span>'
                  : '<span style="color:#d97706; font-weight:800; font-size:13px;"><i class="fa-solid fa-hourglass-half"></i> Chờ duyệt</span>'
              }
            </p>
          </div>
          <div style="background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #f1f5f9;">
            <p style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; margin:0 0 6px 0;">Tổng tiền</p>
            <p style="font-size:16px; font-weight:800; color:#2a83e9; margin:0;">${(data.total_amount || 0).toLocaleString("vi-VN")} đ</p>
          </div>
        </div>

        <div>
          <h4 style="font-size:13px; font-weight:800; color:#0f172a; margin:0 0 12px 0; padding-bottom:8px; border-bottom:2px solid #f1f5f9;">Chi tiết sản phẩm</h4>
          <div style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
            ${itemsHtml}
          </div>
        </div>
      `;
    }
  }
}
