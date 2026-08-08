export class AdminSidebar {
  public static render(activePage: string = 'dashboard'): string {
    const path = window.location.pathname;
    let actualActive = activePage;
    if (path === '/admin') actualActive = 'dashboard';
    else if (path === '/admin/pos') actualActive = 'pos';
    else if (path === '/admin/orders') actualActive = 'orders';
    else if (path.startsWith('/admin/inventory/products')) actualActive = 'inventory-products';
    else if (path.startsWith('/admin/inventory/categories')) actualActive = 'inventory-categories';
    else if (path.startsWith('/admin/inventory/suppliers')) actualActive = 'inventory-suppliers';
    else if (path.startsWith('/admin/inventory/purchase-orders')) actualActive = 'inventory-purchase-orders';
    else if (path.startsWith('/admin/promotions')) actualActive = 'promotions';
    else if (path.startsWith('/admin/posts')) actualActive = 'posts';

    // Determine which inventory subtab is active
    const isInventoryActive = actualActive.startsWith('inventory-');

    const mainNav = [
      { id: 'dashboard', href: '/admin', label: 'Tổng quan', icon: 'fa-chart-pie' },
      { id: 'pos', href: '/admin/pos', label: 'Bán hàng (POS)', icon: 'fa-cash-register' },
      { id: 'orders', href: '/admin/orders', label: 'Đơn hàng', icon: 'fa-receipt' },
      { id: 'promotions', href: '/admin/promotions', label: 'Khuyến mãi', icon: 'fa-tag' },
      { id: 'posts', href: '/admin/posts', label: 'Bài viết', icon: 'fa-newspaper' },
    ];

    const inventorySubnav = [
      { id: 'inventory-products', href: '/admin/inventory/products', label: 'Sản phẩm', icon: 'fa-shirt' },
      { id: 'inventory-categories', href: '/admin/inventory/categories', label: 'Danh mục', icon: 'fa-layer-group' },
      { id: 'inventory-suppliers', href: '/admin/inventory/suppliers', label: 'Nhà cung cấp', icon: 'fa-truck-field' },
      { id: 'inventory-purchase-orders', href: '/admin/inventory/purchase-orders', label: 'Nhập kho (PO)', icon: 'fa-boxes-stacked' },
    ];

    const renderItem = (p: { id: string; href: string; label: string; icon: string }, indent = false) => `
      <a href="${p.href}" class="admin-sidebar-link ${indent ? 'indent' : ''}" data-id="${p.id}" style="
        display: flex; align-items: center; gap: 10px;
        padding: ${indent ? '8px 10px 8px 28px' : '9px 10px'};
        border-radius: 9px;
        text-decoration: none;
        font-size: ${indent ? '12px' : '13px'}; font-weight: 600;
        transition: all 0.15s;
        position: relative;
      ">
        <i class="fa-solid ${p.icon}" style="font-size: ${indent ? '12px' : '13px'}; width: 16px; text-align: center; flex-shrink: 0;"></i>
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.label}</span>
        ${actualActive === p.id && !indent ? '<div class="active-dot" style="width: 5px; height: 5px; border-radius: 50%; background: #2a83e9; margin-left: auto; flex-shrink: 0;"></div>' : ''}
      </a>`;

    return `
      <aside style="
        width: 220px;
        background: #0f172a;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px 10px;
        flex-shrink: 0;
        border-right: 1px solid rgba(255,255,255,0.05);
        overflow-y: auto;
      ">
        <!-- Logo -->
        <a href="/" style="display: flex; align-items: center; text-decoration: none; margin-bottom: 24px; width: 100%;">
          <div style="width: 100%; height: 44px; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; background: #01172D; border-radius: 8px;">
            <picture style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform: scale(3.5);">
              <source srcset="/src/assets/images/closet_logo_text.avif" type="image/avif">
              <source srcset="/src/assets/images/closet_logo_text.webp" type="image/webp">
              <img src="/src/assets/images/closet_logo_text.webp" alt="CLOSET." style="width: 100%; height: 100%; object-fit: contain;">
            </picture>
          </div>
        </a>

        <!-- Main Nav -->
        <nav style="display: flex; flex-direction: column; gap: 2px; flex: 1;">
          <p style="font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.8px; padding: 0 10px; margin: 0 0 6px 0;">Menu chính</p>

          ${mainNav.map(p => renderItem(p)).join('')}

          <!-- Inventory Accordion -->
          <div style="margin-top: 2px;">
            <button id="inventory-toggle" style="
              display: flex; align-items: center; gap: 10px; width: 100%;
              padding: 9px 10px; border-radius: 9px; border: none; cursor: pointer;
              background: ${isInventoryActive ? 'rgba(42,131,233,0.15)' : 'transparent'};
              color: ${isInventoryActive ? '#60a5fa' : '#64748b'};
              font-size: 13px; font-weight: 600; text-align: left;
              transition: all 0.15s;
            "
            onmouseover="this.style.background='${isInventoryActive ? 'rgba(42,131,233,0.2)' : 'rgba(255,255,255,0.06)'}'; this.style.color='${isInventoryActive ? '#93c5fd' : '#e2e8f0'}';"
            onmouseout="this.style.background='${isInventoryActive ? 'rgba(42,131,233,0.15)' : 'transparent'}'; this.style.color='${isInventoryActive ? '#60a5fa' : '#64748b'}';"
            "
            >
              <i class="fa-solid fa-boxes-stacked" style="font-size: 13px; width: 16px; text-align: center; flex-shrink: 0;"></i>
              <span style="flex: 1; white-space: nowrap;">Quản lý tồn kho</span>
              <i id="inventory-chevron" class="fa-solid fa-chevron-${isInventoryActive ? 'down' : 'right'}" style="font-size: 10px; flex-shrink: 0; transition: transform 0.2s;"></i>
            </button>

            <div id="inventory-submenu" style="
              overflow: hidden;
              max-height: ${isInventoryActive ? '300px' : '0px'};
              transition: max-height 0.25s ease;
              display: flex; flex-direction: column; gap: 1px;
              padding-top: ${isInventoryActive ? '2px' : '0'};
            ">
              ${inventorySubnav.map(p => renderItem(p, true)).join('')}
            </div>
          </div>
        </nav>

        <!-- Bottom -->
        <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 2px;">
          <a href="/" style="
            display: flex; align-items: center; gap: 10px;
            padding: 9px 10px; border-radius: 9px;
            text-decoration: none; font-size: 13px; font-weight: 600; color: #475569;
          "
          onmouseover="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#e2e8f0';"
          onmouseout="this.style.background='transparent'; this.style.color='#475569';"
          >
            <i class="fa-solid fa-house" style="font-size: 12px; width: 16px; text-align: center; flex-shrink: 0;"></i>
            <span>Trang chủ</span>
          </a>
          <a href="#" id="admin-sidebar-logout" style="
            display: flex; align-items: center; gap: 10px;
            padding: 9px 10px; border-radius: 9px;
            text-decoration: none; font-size: 13px; font-weight: 600; color: #475569;
          "
          onmouseover="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#f87171';"
          onmouseout="this.style.background='transparent'; this.style.color='#475569';"
          >
            <i class="fa-solid fa-right-from-bracket" style="font-size: 12px; width: 16px; text-align: center; flex-shrink: 0;"></i>
            <span>Đăng xuất</span>
          </a>
        </div>
      </aside>
    `;
  }

  public static afterRender(): void {
    // Logout
    const logoutBtn = document.getElementById('admin-sidebar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        window.location.href = '/admin/login';
      });
    }

    // Inventory accordion toggle
    const toggle = document.getElementById('inventory-toggle');
    const submenu = document.getElementById('inventory-submenu');
    const chevron = document.getElementById('inventory-chevron');
    if (toggle && submenu && chevron) {
      toggle.addEventListener('click', function() {
        const isOpen = submenu.style.maxHeight !== '0px';
        submenu.style.maxHeight = isOpen ? '0px' : '300px';
        submenu.style.paddingTop = isOpen ? '0' : '2px';
        chevron.className = isOpen ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down';
        chevron.style.fontSize = '10px';
      });
    }
  }
}
