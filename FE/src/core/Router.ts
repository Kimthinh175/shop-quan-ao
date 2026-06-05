interface Route {
  pathPattern: RegExp;
  loadController: (params: string[]) => Promise<void>;
}

export class Router {
  private routes: Route[] = [];

  constructor() {
    this.init();
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
        pathPattern: /^\/products$/,
        loadController: async () => {
          const { CatalogModule } = await import("../modules/catalog/CatalogModule");
          const module = new CatalogModule();
          module.render();
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
      }
    ];
  }

  // Xử lý khi URL thay đổi
  public async handleRoute(): Promise<void> {
    const currentPath = window.location.pathname;

    for (const route of this.routes) {
      const match = currentPath.match(route.pathPattern);
      
      if (match) {
        const params = match.slice(1);
        await route.loadController(params);
        return;
      }
    }

    const appDiv = document.getElementById("app");
    if (appDiv) appDiv.innerHTML = "<h1>404 - Not Found</h1><a href='/'>Home</a>";
  }
}
