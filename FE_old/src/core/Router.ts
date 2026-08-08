import { ClientHeader } from "../components/ClientHeader";
import { ClientFooter } from "../components/ClientFooter";
import { AdminHeader } from "../components/AdminHeader";
import { AdminSidebar } from "../components/AdminSidebar";

interface Route {
  pathPattern: RegExp;
  requiresAuth?: boolean;
  loadController: (params: string[]) => Promise<void>;
}

export class Router {
  private routes: Route[] = [];
  private currentLayout: 'client' | 'admin' | 'none' = 'none';

  constructor() {
    this.init();
  }

  public matchRoute(path: string): Route | undefined {
    return this.routes.find(r => r.pathPattern.test(path));
  }

  // Khai báo các Routes thực tế
  private init(): void {
    this.routes = [
      // === CLIENT ROUTES ===
      {
        pathPattern: /^\/$/,
        loadController: async () => {
          const { HomeModule } = await import("../modules/home/HomeModule");
          const module = new HomeModule();
          module.render();
        }
      },
      {
        pathPattern: /^\/(products|catalog)$/,
        loadController: async () => {
          const { CatalogModule } = await import("../modules/products/CatalogModule");
          const module = new CatalogModule();
          module.render();
        }
      },
      {
        pathPattern: /^\/promotions$/,
        loadController: async () => {
          const { PromotionModule } = await import("../modules/promotion/PromotionModule");
          const module = new PromotionModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/(blog|posts)$/,
        loadController: async () => {
          const { PostListModule } = await import("../modules/posts/PostListModule");
          const module = new PostListModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/posts\/([^/]+)$/,
        loadController: async (matches) => {
          const slug = matches[0];
          const { PostDetailModule } = await import("../modules/posts/PostDetailModule");
          const module = new PostDetailModule();
          await module.render(slug);
        }
      },
      {
        pathPattern: /^\/cart$/,
        loadController: async () => {
          const { CartModule } = await import("../modules/cart/CartModule");
          const module = new CartModule();
          module.render();
        }
      },
      {
        pathPattern: /^\/checkout$/,
        requiresAuth: true,
        loadController: async () => {
          const { CheckoutModule } = await import("../modules/checkout/CheckoutModule");
          const module = new CheckoutModule();
          module.render();
        }
      },
      {
        pathPattern: /^\/checkout\/success$/,
        requiresAuth: true,
        loadController: async () => {
          const { SuccessModule } = await import("../modules/checkout/SuccessModule");
          const module = new SuccessModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/account\/login$/,
        loadController: async () => {
          const { AccountLoginModule } = await import("../modules/account/AccountLoginModule");
          const module = new AccountLoginModule();
          module.render();
        }
      },
      {
        pathPattern: /^\/account\/profile$/,

        requiresAuth: true,
        loadController: async () => {
          const { ProfileModule } = await import("../modules/account/ProfileModule");
          const module = new ProfileModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/account\/orders$/,
        requiresAuth: true,
        loadController: async () => {
          const { OrderHistoryModule } = await import("../modules/account/OrderHistoryModule");
          const module = new OrderHistoryModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/products\/(\d+)$/,
        loadController: async (matches) => {
          const productId = matches[0];
          const { ProductDetailModule } = await import("../modules/product-detail/ProductDetailModule");
          const module = new ProductDetailModule();
          module.render(productId);
        }
      },

      // === ADMIN ROUTES ===
      {
        pathPattern: /^\/admin\/login$/,
        loadController: async () => {
          const { AdminLoginModule } = await import("../modules/admin/login/AdminLoginModule");
          const module = new AdminLoginModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin$/,
        loadController: async () => {
          const { AdminDashboardModule } = await import("../modules/admin/dashboard/AdminDashboardModule");
          const module = new AdminDashboardModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/products$/,
        loadController: async () => {
          const { AdminInventoryModule } = await import("../modules/admin/products/AdminInventoryModule");
          const module = new AdminInventoryModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/inventory\/products$/,
        loadController: async () => {
          const { AdminInventoryProductsModule } = await import("../modules/admin/inventory/AdminInventoryProductsModule");
          const module = new AdminInventoryProductsModule();
          await module.render();
        }
      },

      {
        pathPattern: /^\/admin\/inventory\/products\/(.+)\/edit$/,
        loadController: async () => {
          const { AdminEditProductModule } = await import("../modules/admin/inventory/AdminEditProductModule");
          const module = new AdminEditProductModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/inventory\/categories$/,
        loadController: async () => {
          const { AdminInventoryCategoriesModule } = await import("../modules/admin/inventory/AdminInventoryCategoriesModule");
          const module = new AdminInventoryCategoriesModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/inventory\/suppliers$/,
        loadController: async () => {
          const { AdminSuppliersModule } = await import("../modules/admin/inventory/AdminSuppliersModule");
          const module = new AdminSuppliersModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/inventory\/purchase-orders$/,
        loadController: async () => {
          const { AdminPurchaseOrdersModule } = await import("../modules/admin/inventory/AdminPurchaseOrdersModule");
          const module = new AdminPurchaseOrdersModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/pos$/,
        loadController: async () => {
          const { AdminPOSModule } = await import("../modules/admin/pos/AdminPOSModule");
          const module = new AdminPOSModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/orders$/,
        loadController: async () => {
          const { AdminOrderModule } = await import("../modules/admin/orders/AdminOrderModule");
          const module = new AdminOrderModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/promotions$/,
        loadController: async () => {
          const { AdminPromotionsModule } = await import("../modules/admin/promotions/AdminPromotionsModule");
          const module = new AdminPromotionsModule();
          await module.render();
        }
      },
      {
        pathPattern: /^\/admin\/posts$/,
        loadController: async () => {
          const { AdminPostsModule } = await import("../modules/admin/posts/AdminPostsModule");
          const module = new AdminPostsModule();
          await module.render();
        }
      }
    ];
  }

  // Xử lý khi URL thay đổi
  public async handleRoute(): Promise<void> {
    const currentPath = window.location.pathname;

    for (const route of this.routes) {
      const match = currentPath.match(route.pathPattern);
      
      if (match) {
        if (route.requiresAuth && !localStorage.getItem("token")) {
          window.location.href = "/";
          return;
        }

        const isClient = !route.pathPattern.source.startsWith("^\\/admin");
        const isAdminAuth = route.pathPattern.source === "^\\/admin\\/login$";
        let requiredLayout = 'client';
        if (!isClient) {
            requiredLayout = isAdminAuth ? 'admin_auth' : 'admin';
        }

        // Admin Protection
        if (requiredLayout === 'admin' && !localStorage.getItem("admin_token")) {
            window.location.href = "/admin/login";
            return;
        }

        if (this.currentLayout !== requiredLayout) {
          const appDiv = document.getElementById("app");
          if (appDiv) {
            if (requiredLayout === 'client') {
              appDiv.innerHTML = `
                <div class="min-h-screen bg-[#f9f9f7] flex flex-col">
                  <div id="app-header">${ClientHeader.render()}</div>
                  <main id="app-main" class="flex-1 min-h-[80vh] relative">
                    <!-- Global Loading State -->
                    <div id="global-loader" class="absolute inset-0 z-50 bg-[#f9f9f7] hidden items-center justify-center">
                        <i class="fa-solid fa-spinner fa-spin text-4xl text-[#2a83e9]"></i>
                    </div>
                  </main>
                  <div id="app-footer">${ClientFooter.render()}</div>
                </div>
              `;
              ClientHeader.afterRender();
            } else if (requiredLayout === 'admin') {
              // Determine active page from path for sidebar highlighting
              const p = window.location.pathname;
              let activePage = 'dashboard';
              if (p === '/admin') activePage = 'dashboard';
              else if (p === '/admin/pos') activePage = 'pos';
              else if (p === '/admin/orders') activePage = 'orders';
              else if (p === '/admin/inventory/products' || p.startsWith('/admin/inventory/products/')) activePage = 'inventory-products';
              else if (p === '/admin/inventory/categories') activePage = 'inventory-categories';
              else if (p === '/admin/inventory/suppliers') activePage = 'inventory-suppliers';
              else if (p === '/admin/inventory/purchase-orders') activePage = 'inventory-purchase-orders';
              else if (p === '/admin/products') activePage = 'inventory-products';
              else if (p === '/admin/posts') activePage = 'posts';

              appDiv.innerHTML = `
                <div style="display: flex; height: 100vh; background: #f8fafc; overflow: hidden;">
                  <div id="admin-sidebar-container" style="height: 100%; flex-shrink: 0;">
                    ${AdminSidebar.render(activePage)}
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;">
                    ${AdminHeader.render()}
                    <main id="app-main" style="flex: 1; overflow-x: hidden; overflow-y: auto; padding: 28px 32px; background: #f8fafc;"></main>
                  </div>
                </div>
              `;
              AdminSidebar.afterRender();
            } else if (requiredLayout === 'admin_auth') {
              appDiv.innerHTML = `<main id="app-main" class="w-full h-full"></main>`;
            }
            this.currentLayout = requiredLayout as any;
          } else {
            // Layout didn't change, but we might need to update sidebar active state
            if (requiredLayout === 'admin') {
              const p = window.location.pathname;
              let activePage = 'dashboard';
              if (p === '/admin') activePage = 'dashboard';
              else if (p === '/admin/pos') activePage = 'pos';
              else if (p === '/admin/orders') activePage = 'orders';
              else if (p === '/admin/inventory/products' || p.startsWith('/admin/inventory/products/')) activePage = 'inventory-products';
              else if (p === '/admin/inventory/categories') activePage = 'inventory-categories';
              else if (p === '/admin/inventory/suppliers') activePage = 'inventory-suppliers';
              else if (p === '/admin/inventory/purchase-orders') activePage = 'inventory-purchase-orders';
              else if (p === '/admin/products') activePage = 'inventory-products';
              else if (p === '/admin/posts') activePage = 'posts';

              // We no longer re-render the entire sidebar via innerHTML 
              // to preserve event listeners (e.g. accordion toggle).
              // The highlight is updated dynamically below.
            }
          }
        }

        const params = match.slice(1);
        await route.loadController(params);
        
        window.scrollTo(0, 0);

        // Update Admin Sidebar Highlight dynamically via DOM
        if (this.currentLayout === 'admin') {
          const path = window.location.pathname;
          document.querySelectorAll('#admin-sidebar-container .admin-sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
              if (href === '/admin' ? path === '/admin' : path.startsWith(href)) {
                link.classList.add('sidebar-active');
              } else {
                link.classList.remove('sidebar-active');
              }
            }
          });
        }

        return;
      }
    }

    const appDiv = document.getElementById("app");
    if (appDiv) {
      // Setup minimal client layout for 404 if needed
      if (this.currentLayout !== 'client') {
        appDiv.innerHTML = `
          <div class="min-h-screen bg-[#f9f9f7] flex flex-col">
            <div id="app-header">${ClientHeader.render()}</div>
            <main id="app-main" class="flex-1 min-h-[80vh]"></main>
            <div id="app-footer">${ClientFooter.render()}</div>
          </div>
        `;
        ClientHeader.afterRender();
        this.currentLayout = 'client';
      }
      import("../modules/errors/NotFoundModule").then(({ NotFoundModule }) => {
        new NotFoundModule().render();
      });
    }
  }
}
