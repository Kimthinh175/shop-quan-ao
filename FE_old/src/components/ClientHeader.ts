export class ClientHeader {
  public static render(): string {
    // Detect current season by month (Vietnam climate)
    const month = new Date().getMonth() + 1; // 1-12
    // Xuân (Spring): 2–4 | Hè (Summer): 5–8 | Thu (Autumn): 9–10 | Đông (Winter): 11–1
    type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';
    const seasonKey: SeasonKey =
      month >= 5 && month <= 8  ? 'summer'  :
      month >= 9 && month <= 10 ? 'autumn'  :
      month >= 11 || month === 1 ? 'winter'  : 'spring';

    const seasonMeta: Record<SeasonKey, { label: string; icon: string; icon2: string; color: string; href: string; accentColor: string; seasonId: number; sectionTitle: string; badge: string }> = {
      spring: { label: 'Mùa Xuân', icon: 'fa-seedling', icon2: '🌸', color: 'hover:text-emerald-500', accentColor: 'text-emerald-500', href: '/products?season_id=1', seasonId: 1, sectionTitle: 'Xuân', badge: 'Xuân' },
      summer: { label: 'Mùa Hè',   icon: 'fa-sun',      icon2: '☀️', color: 'hover:text-amber-500',   accentColor: 'text-amber-500',   href: '/products?season_id=1', seasonId: 1, sectionTitle: 'Hè',   badge: 'Hè' },
      autumn: { label: 'Mùa Thu',  icon: 'fa-leaf',     icon2: '🍂', color: 'hover:text-orange-500',  accentColor: 'text-orange-500',  href: '/products?season_id=2', seasonId: 2, sectionTitle: 'Thu',  badge: 'Thu' },
      winter: { label: 'Mùa Đông', icon: 'fa-snowflake', icon2: '❄️', color: 'hover:text-sky-500',   accentColor: 'text-sky-500',    href: '/products?season_id=2', seasonId: 2, sectionTitle: 'Đông', badge: 'Đông' },
    };
    const curSeason = seasonMeta[seasonKey];

    const tabs = [
      {
        label: "Nam",
        icon: "fa-person",
        href: "/products?gender_id=1",
        color: "hover:text-[#2a83e9]",
        mega: [
          { section: "Áo", links: [{ label: "Áo Thun", href: "/products?gender_id=1&category_id=1" }, { label: "Áo Polo", href: "/products?gender_id=1&category_id=1" }, { label: "Áo Khoác", href: "/products?gender_id=1&category_id=2" }] },
          { section: "Quần", links: [{ label: "Quần Short", href: "/products?gender_id=1&category_id=3" }, { label: "Quần Dài", href: "/products?gender_id=1&category_id=4" }, { label: "Quần Jogger", href: "/products?gender_id=1&category_id=4" }] },
          { section: "Phụ Kiện", links: [{ label: "Đồ Lót Nam", href: "/products?gender_id=1&category_id=5" }, { label: "Vớ & Tất", href: "/products?gender_id=1" }, { label: "Túi xách", href: "/products?gender_id=1" }] },
        ],
      },
      {
        label: "Nữ",
        icon: "fa-person-dress",
        href: "/products?gender_id=2",
        color: "hover:text-pink-500",
        mega: [
          { section: "Áo", links: [{ label: "Áo Thun Nữ", href: "/products?gender_id=2&category_id=1" }, { label: "Áo Croptop", href: "/products?gender_id=2&category_id=1" }, { label: "Áo Khoác Nữ", href: "/products?gender_id=2&category_id=2" }] },
          { section: "Quần & Váy", links: [{ label: "Quần Short Nữ", href: "/products?gender_id=2&category_id=3" }, { label: "Quần Legging", href: "/products?gender_id=2&category_id=4" }, { label: "Váy Dạo Phố", href: "/products?gender_id=2" }] },
          { section: "Đồ Lót", links: [{ label: "Áo Lót", href: "/products?gender_id=2&category_id=5" }, { label: "Quần Lót", href: "/products?gender_id=2&category_id=5" }, { label: "Bộ Lót Set", href: "/products?gender_id=2&category_id=5" }] },
        ],
      },
      {
        label: "Thể Thao",
        icon: "fa-dumbbell",
        href: "/products?sport_id=2",
        color: "hover:text-emerald-600",
        mega: [
          { section: "Chạy Bộ", links: [{ label: "Áo Running", href: "/products?sport_id=1" }, { label: "Quần Running", href: "/products?sport_id=1&category_id=3" }, { label: "Phụ Kiện Chạy", href: "/products?sport_id=1" }] },
          { section: "Gym & Training", links: [{ label: "Áo Gym", href: "/products?sport_id=2&category_id=1" }, { label: "Quần Tập", href: "/products?sport_id=2&category_id=3" }, { label: "Bộ Tập", href: "/products?sport_id=2" }] },
          { section: "Bóng Đá", links: [{ label: "Áo Đá Banh", href: "/products?sport_id=3&category_id=1" }, { label: "Quần Đá Banh", href: "/products?sport_id=3&category_id=3" }, { label: "Tất Bóng Đá", href: "/products?sport_id=3" }] },
        ],
      },
      {
        label: curSeason.label,
        icon: curSeason.icon,
        href: curSeason.href,
        color: curSeason.color,
        isSeason: true,
        mega: [
          { section: `${curSeason.sectionTitle} ${new Date().getFullYear()}`, links: [
            { label: `Áo ${curSeason.sectionTitle}`, href: `/products?season_id=${curSeason.seasonId}&category_id=1` },
            { label: `Quần ${curSeason.sectionTitle}`, href: `/products?season_id=${curSeason.seasonId}&category_id=3` },
            { label: `BST ${curSeason.sectionTitle}`, href: `/products?season_id=${curSeason.seasonId}` },
          ]},
          { section: 'Chất Liệu Phù Hợp', links: [
            { label: 'Vải Cotton Compact', href: '/products?material_id=1' },
            { label: 'Vải Excool', href: '/products?material_id=4' },
            { label: 'Vải Linen', href: '/products?material_id=3' },
          ]},
          { section: 'Gợi Ý Phối Đồ', links: [
            { label: 'Phong Cách Casual', href: `/products?season_id=${curSeason.seasonId}` },
            { label: 'Phong Cách Thể Thao', href: `/products?season_id=${curSeason.seasonId}&sport_id=4` },
            { label: 'Phong Cách Công Sở', href: `/products?season_id=${curSeason.seasonId}` },
          ]},
        ],
      },
      {
        label: "Unisex",
        icon: "fa-venus-mars",
        href: "/products?gender_id=3",
        color: "hover:text-violet-600",
        mega: null,
        badge: "",
      },
      {
        label: "Sale",
        icon: "fa-bolt",
        href: "/products?sale=true",
        color: "text-red-500 hover:text-red-600",
        mega: null,
        badge: "HOT",
      },
      {
        label: "Journal",
        icon: "fa-newspaper",
        href: "/blog",
        color: "hover:text-[#2a83e9]",
        mega: null,
      },
    ] as Array<{
      label: string;
      icon: string;
      href: string;
      color: string;
      badge?: string;
      mega: null | Array<{ section: string; links: Array<{ label: string; href: string }> }>;
    }>;

    const megaHtml = (tab: typeof tabs[0]): string => {
      if (!tab.mega) return "";
      return `
        <div class="mega-menu absolute top-full left-0 w-[580px] bg-white shadow-2xl rounded-2xl border border-slate-100 mt-0 p-7 grid grid-cols-3 gap-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[200]">
          <div class="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45"></div>
          ${tab.mega.map((col) => `
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 pb-2 border-b border-slate-100">${col.section}</p>
              <ul class="space-y-2">
                ${col.links.map((l) => `
                  <li>
                    <a href="javascript:void(0)" onclick="window.setFilterAndNav('${l.href}')" class="text-[13px] font-semibold text-slate-600 hover:text-[#2a83e9] transition-colors flex items-center gap-2 group/link">
                      <i class="fa-solid fa-chevron-right text-[8px] text-slate-300 group-hover/link:text-[#2a83e9] transition-colors"></i>
                      ${l.label}
                    </a>
                  </li>
                `).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      `;
    };

    const mobileTabsHtml = tabs.map((tab) => `
      <a
        href="javascript:void(0)" onclick="window.setFilterAndNav('${tab.href}')"
        class="flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wide whitespace-nowrap text-slate-600 ${tab.color} transition-colors border-b-2 border-transparent hover:border-current"
      >
        ${tab.icon ? `<i class="fa-solid ${tab.icon} text-[10px]"></i>` : ""}
        <span>${tab.label}</span>
        ${tab.badge ? `<span class="ml-0.5 inline-flex items-center px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded leading-none">${tab.badge}</span>` : ""}
      </a>
    `).join("");

    const desktopTabsHtml = tabs.map((tab, i) => `
      <li class="group relative" data-tab-i="${i}">
        <a
          href="javascript:void(0)" onclick="window.setFilterAndNav('${tab.href}')"
          class="cat-nav-tab flex items-center gap-1.5 px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.1em] text-slate-700 ${tab.color} transition-colors relative whitespace-nowrap"
        >
          ${tab.icon ? `<i class="fa-solid ${tab.icon} text-[10px] opacity-70"></i>` : ""}
          ${tab.label}
          ${tab.badge ? `<span class="ml-1 inline-flex items-center px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded leading-none animate-pulse">${tab.badge}</span>` : ""}
          ${tab.mega ? `<i class="fa-solid fa-chevron-down text-[8px] opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-200 ml-0.5"></i>` : ""}
        </a>
        ${megaHtml(tab)}
      </li>
    `).join("");

    return `
      <style>
        .mega-menu { pointer-events: none; }
        li.group:hover .mega-menu { pointer-events: auto; }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        li.group:hover .mega-menu { animation: fadeSlideDown 0.18s ease; }
        .nav-tab-indicator {
          position: absolute;
          bottom: 0;
          height: 2px;
          background: #2a83e9;
          border-radius: 2px 2px 0 0;
          transition: left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.2s;
          pointer-events: none;
        }
        #cat-nav-list { overflow: visible !important; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      </style>

      <!-- WP Admin Bar -->
      <div id="client-admin-bar"></div>

      <!-- Topbar Banner -->
      <div class="bg-[#2a83e9] text-white text-[11px] font-bold py-2 px-4 text-center tracking-wide">
        <div class="container mx-auto flex justify-between items-center">
          <span class="hidden md:inline"><i class="fa-solid fa-truck-fast mr-1"></i> Freeship toàn quốc từ 200k</span>
          <span class="hidden md:inline"><i class="fa-solid fa-rotate-left mr-1"></i> Đổi trả miễn phí 60 ngày</span>
          <span><i class="fa-solid fa-phone mr-1"></i> Hotline: 1900 1234</span>
        </div>
      </div>

      <!-- Main Header -->
      <nav id="main-nav" class="sticky top-0 w-full z-[100] bg-white shadow-sm transition-all duration-300">
        <!-- Top row: Logo + Search + Icons -->
        <div class="border-b border-slate-100">
          <div class="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-8">
            <!-- Logo -->
            <a href="/" class="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
              <div class="w-40 h-10 md:w-56 md:h-14 overflow-hidden flex items-center justify-center relative bg-[#01172D] rounded-lg">
                <picture class="w-full h-full flex items-center justify-center scale-[3.5]">
                  <source srcset="/src/assets/images/closet_logo_text.avif" type="image/avif">
                  <source srcset="/src/assets/images/closet_logo_text.webp" type="image/webp">
                  <img src="/src/assets/images/closet_logo_text.webp" alt="CLOSET." class="w-full h-full object-contain">
                </picture>
              </div>
            </a>

            <!-- Search Bar (Desktop) -->
            <div class="hidden md:flex flex-1 max-w-lg relative">
              <input type="text" placeholder="Tìm kiếm áo thun, quần đùi, thể thao..." class="w-full bg-slate-100 border border-transparent focus:border-[#2a83e9]/60 focus:bg-white text-sm rounded-xl py-2.5 pl-4 pr-10 outline-none transition-all">
              <button class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a83e9]">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
              </button>
            </div>

            <!-- Icons -->
            <div class="flex items-center gap-5 text-slate-700 flex-shrink-0">
              <button class="md:hidden text-xl hover:text-[#2a83e9] transition-colors"><i class="fa-solid fa-magnifying-glass"></i></button>
              <a href="javascript:void(0)" onclick="if(localStorage.getItem('token')){ window.location.href='/account/profile' } else { window.showAuthModal() }" class="text-xl hover:text-[#2a83e9] transition-colors flex flex-col items-center gap-0.5 group" id="header-account-btn">
                <i class="fa-regular fa-user"></i>
                <span class="text-[9px] font-black uppercase hidden md:block text-slate-500 group-hover:text-[#2a83e9] tracking-wide">Tài khoản</span>
              </a>
              <a href="/cart" class="relative text-xl hover:text-[#2a83e9] transition-colors flex flex-col items-center gap-0.5 group">
                <i class="fa-solid fa-cart-shopping"></i>
                <span class="text-[9px] font-black uppercase hidden md:block text-slate-500 group-hover:text-[#2a83e9] tracking-wide">Giỏ hàng</span>
                <span class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black leading-none">0</span>
              </a>
            </div>
          </div>
        </div>

        <!-- ===== BOTTOM CATEGORY NAV (Desktop ≥ xl) ===== -->
        <div class="hidden xl:block bg-white border-b border-slate-100">
          <div class="container mx-auto px-4 lg:px-8">
            <ul class="flex items-center justify-center relative" id="cat-nav-list">
              ${desktopTabsHtml}
              <!-- Sliding underline indicator -->
              <div id="cat-nav-indicator" class="nav-tab-indicator opacity-0" style="left:0;width:0"></div>
            </ul>
          </div>
        </div>

        <!-- ===== MOBILE HORIZONTAL SCROLL TABS (< xl) ===== -->
        <div class="xl:hidden bg-white border-b border-slate-100 overflow-x-auto scrollbar-none">
          <div class="flex items-center justify-center px-2 py-0.5 min-w-max">
            ${mobileTabsHtml}
          </div>
        </div>
      </nav>

    `;
  }

  public static afterRender(): void {
    // Admin Bar Logic
    const adminToken = localStorage.getItem('admin_token');
    const adminBar = document.getElementById('client-admin-bar');
    if (adminToken && adminBar) {
      const adminInfoStr = localStorage.getItem('admin_info');
      let adminName = 'Admin';
      if (adminInfoStr) {
        try {
          const adminInfo = JSON.parse(adminInfoStr);
          adminName = adminInfo.username || 'Admin';
        } catch (e) {}
      }
      
      adminBar.innerHTML = `
        <div class="bg-[#1d2327] text-[#f0f0f1] h-[32px] text-[13px] flex items-center justify-between px-4 z-[9999] relative font-sans">
          <div class="flex items-center gap-4 h-full">
            <a href="/admin" class="hover:text-[#72aee6] transition-colors flex items-center gap-2 h-full"><i class="fa-solid fa-shirt"></i> <span class="font-semibold">CLOSET Admin</span></a>
            <a href="/admin/dashboard" class="hover:text-[#72aee6] transition-colors flex items-center gap-1.5 h-full"><i class="fa-solid fa-gauge-high text-[11px]"></i> Bảng điều khiển</a>
            <a href="/admin/products" class="hover:text-[#72aee6] transition-colors flex items-center gap-1.5 h-full"><i class="fa-solid fa-plus text-[11px]"></i> Thêm Sản Phẩm</a>
            <a href="/admin/orders" class="hover:text-[#72aee6] transition-colors flex items-center gap-1.5 h-full"><i class="fa-solid fa-receipt text-[11px]"></i> Đơn Hàng</a>
          </div>
          <div class="flex items-center h-full">
            <span class="hover:text-[#72aee6] cursor-pointer transition-colors flex items-center gap-2 h-full">Xin chào, ${adminName} <div class="w-5 h-5 rounded bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white">${adminName.charAt(0).toUpperCase()}</div></span>
          </div>
        </div>
      `;
    }

    // Nav indicator logic
    const list = document.getElementById('cat-nav-list');
    const indicator = document.getElementById('cat-nav-indicator');
    if (list && indicator) {
      const tabs = Array.from(list.querySelectorAll('.cat-nav-tab'));

      function moveTo(el: any) {
        const listRect = list!.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        indicator!.style.left = (r.left - listRect.left) + 'px';
        indicator!.style.width = r.width + 'px';
        indicator!.style.opacity = '1';
      }

      tabs.forEach(function(tab) {
        tab.addEventListener('mouseenter', function() { moveTo(tab); });
      });

      list.addEventListener('mouseleave', function() {
        indicator!.style.opacity = '0';
      });
    }

    // Load user info for header avatar
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/customers/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(res => res.ok ? res.json() : null)
      .then(customer => {
        if (customer) {
          const btn = document.getElementById('header-account-btn');
          if (btn) {
            const displayName = customer.full_name && customer.full_name.trim() !== '' ? customer.full_name : customer.phone;
            const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
            
            btn.innerHTML = `
              <div class="w-[22px] h-[22px] bg-slate-100 text-[#2a83e9] rounded-full flex items-center justify-center text-[10px] font-black uppercase">${initial}</div>
              <span class="text-[9px] font-black uppercase hidden md:block text-[#2a83e9] tracking-wide truncate max-w-[60px]">${displayName}</span>
            `;
          }
        }
      })
      .catch(err => console.error(err));
    }

    // Global navigation filter method
    if (!(window as any).setFilterAndNav) {
      (window as any).setFilterAndNav = function (href: string) {
        if (!href.startsWith("/products")) {
          window.location.href = href;
          return;
        }
        // Example href: /products?gender_id=1&category_id=1
        if (href.includes('?')) {
          const queryStr = href.split('?')[1];
          const params = new URLSearchParams(queryStr);
          const filters: any = {};
          params.forEach((value, key) => {
            filters[key] = value;
          });
          sessionStorage.setItem('productFilters', JSON.stringify(filters));
        } else {
          // If no query string, maybe clear filters
          sessionStorage.removeItem('productFilters');
        }

        if (window.location.pathname === '/products' && typeof (window as any).catalogReloadFilters === 'function') {
          (window as any).catalogReloadFilters();
        } else {
          window.location.href = '/products';
        }
      };
    }
  }
}
