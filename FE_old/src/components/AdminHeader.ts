export class AdminHeader {
  public static render(title: string = 'Tổng quan'): string {
    // Try to get admin info from localStorage at render time
    const adminInfoScript = `
      <script>
        (function() {
          try {
            const info = JSON.parse(localStorage.getItem('admin_info') || '{}');
            const nameEl = document.getElementById('admin-header-name');
            const roleEl = document.getElementById('admin-header-role');
            const avatarEl = document.getElementById('admin-header-avatar');
            if (nameEl && info.name) nameEl.textContent = info.name;
            if (roleEl && info.role) roleEl.textContent = info.role.toUpperCase();
            if (avatarEl && info.name) avatarEl.textContent = info.name.charAt(0).toUpperCase();
          } catch(e) {}
        })();
      </script>
    `;

    return `
      <header style="
        height: 56px;
        background: #ffffff;
        border-bottom: 1px solid #f1f5f9;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        gap: 16px;
      ">
        <!-- Left: Page Title -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <h1 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.2px;">${title}</h1>
        </div>

        <!-- Right: Admin Profile -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- Notification Bell -->
          <button style="
            width: 34px; height: 34px; border-radius: 8px;
            background: #f8fafc; border: 1px solid #e2e8f0;
            display: flex; align-items: center; justify-content: center;
            color: #64748b; cursor: pointer; transition: all 0.15s;
            font-size: 14px;
          " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
            <i class="fa-regular fa-bell"></i>
          </button>

          <!-- Divider -->
          <div style="width: 1px; height: 24px; background: #e2e8f0;"></div>

          <!-- Avatar + Name -->
          <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <div id="admin-header-avatar" style="
              width: 32px; height: 32px; border-radius: 8px;
              background: linear-gradient(135deg, #2a83e9, #6d28d9);
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: 700; font-size: 13px;
            ">A</div>
            <div>
              <p id="admin-header-name" style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0; line-height: 1.2;">Admin</p>
              <p id="admin-header-role" style="font-size: 10px; color: #94a3b8; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">ADMIN</p>
            </div>
          </div>
        </div>
      </header>
      ${adminInfoScript}
    `;
  }
}
