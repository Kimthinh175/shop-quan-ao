const fs = require('fs');

function replaceFile(path, regex, replacement) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace(regex, replacement);
        fs.writeFileSync(path, content);
        console.log('Updated ' + path);
    }
}

// ApiClient
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/api/ApiClient.ts', /data: any/g, 'data: unknown');

// ProductCard
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/components/ProductCard.ts', /\(p as any\)/g, '(p as import("../shared/models/IProduct").IProduct & { main_img?: string })');

// BaseView
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/core/BaseView.ts', /data\?: any/g, 'data?: unknown');

// AdminDashboard
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/admin/dashboard/AdminDashboardModule.ts', /ApiClient\.get<any>/g, 'ApiClient.get<import("../../../shared/interfaces/ITypes").IPaginationResponse<import("../../../shared/models/IProduct").IProduct>>');

// AdminOrder
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/admin/orders/AdminOrderModule.ts', /orders: \[\] as any\[\]/g, 'orders: [] as unknown[]');
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/admin/orders/AdminOrderModule.ts', /ApiClient\.get<any>/g, 'ApiClient.get<import("../../../shared/interfaces/ITypes").IPaginationResponse<unknown>>');

// AdminPOS
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/admin/pos/AdminPOSModule.ts', /ApiClient\.get<any>/g, 'ApiClient.get<import("../../../shared/interfaces/ITypes").IPaginationResponse<import("../../../shared/models/IProduct").IProduct>>');

// AdminInventory
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/admin/products/AdminInventoryModule.ts', /ApiClient\.get<any>/g, 'ApiClient.get<import("../../../shared/interfaces/ITypes").IPaginationResponse<import("../../../shared/models/IProduct").IProduct>>');
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/admin/products/AdminInventoryModule.ts', /v: any/g, 'v: import("../../../shared/interfaces/ITypes").IProductVariant');

// HomeModule
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/home/HomeModule.ts', /ApiClient\.get<any>\("\/products/g, 'ApiClient.get<import("../../shared/interfaces/ITypes").IPaginationResponse<IProduct>>("/products');
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/home/HomeModule.ts', /ApiClient\.get<any>\("\/posts/g, 'ApiClient.get<import("../../shared/interfaces/ITypes").IPaginationResponse<IPost>>("/posts');

// ProductDetail
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/product-detail/ProductDetailModule.ts', /ApiClient\.get<any>/g, 'ApiClient.get<import("../../shared/models/IProduct").IProduct>');
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/modules/product-detail/ProductDetailModule.ts', /v: any/g, 'v: import("../../shared/interfaces/ITypes").IProductVariant');

// CatalogModule
let catPath = 'c:/xampp/htdocs/shop-quan-ao/FE/src/modules/products/CatalogModule.ts';
if (fs.existsSync(catPath)) {
    let cat = fs.readFileSync(catPath, 'utf8');
    cat = cat.replace(/categories: \[\] as any\[\],/g, 'categories: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/seasons: \[\] as any\[\],/g, 'seasons: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/genders: \[\] as any\[\],/g, 'genders: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/brands: \[\] as any\[\],/g, 'brands: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/materials: \[\] as any\[\],/g, 'materials: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/forms: \[\] as any\[\],/g, 'forms: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/sports: \[\] as any\[\],/g, 'sports: [] as import("../../shared/interfaces/ITypes").IFilterOption[],');
    cat = cat.replace(/pagination: {} as any,/g, 'pagination: { currentPage: 1, totalPages: 1 } as { currentPage: number, totalPages: number },');
    cat = cat.replace(/ApiClient\.get<any>\("\/products\/filter-options"\)/g, 'ApiClient.get<import("../../shared/interfaces/ITypes").IFilterOptionsResponse>("/products/filter-options")');
    cat = cat.replace(/ApiClient\.get<any>\(url\)/g, 'ApiClient.get<import("../../shared/interfaces/ITypes").IPaginationResponse<IProduct>>(url)');
    cat = cat.replace(/items: any\[\]/g, 'items: import("../../shared/interfaces/ITypes").IFilterOption[]');
    cat = cat.replace(/\(this\.state\.filters as any\)\[type\]/g, '(this.state.filters as Record<string, unknown>)[type]');
    fs.writeFileSync(catPath, cat);
    console.log('Updated CatalogModule.ts');
}

// ProductService
replaceFile('c:/xampp/htdocs/shop-quan-ao/FE/src/shared/services/ProductService.ts', /Promise<any>/g, 'Promise<import("../interfaces/ITypes").IPaginationResponse<import("../models/IProduct").IProduct>>');

console.log('All replacements complete.');
