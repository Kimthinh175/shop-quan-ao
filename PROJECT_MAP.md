# TỔNG QUAN DỰ ÁN SHOP QUẦN ÁO (PROJECT MAP)

> File này được tự động tạo. Hãy dùng file này để hiểu cấu trúc code, tên hàm, và các tham số.

## Backend

### File: `cron/orderExpiration.js`
- **Function**: `restoreInventory(orderItems: any, session: any): any`
- **Function**: `runExpirationJob(): any`
- **Function**: `startCron(): any`

### File: `core/routes/index.js`
- **API Route**: `GET /welcome`

### File: `modules/auth/controllers/auth.controller.js`
- **Class**: `AuthController`
  - Method: `loginAdmin(req: any, res: any): any`
  - Method: `registerUser(req: any, res: any): any`
  - Method: `loginUser(req: any, res: any): any`

### File: `modules/auth/routes/auth.js`
- **API Route**: `POST /admin/login`
- **API Route**: `POST /user/register`
- **API Route**: `POST /user/login`

### File: `modules/catalog/routes/categories.js`
- **API Route**: `GET /`

### File: `modules/catalog/routes/products.js`
- **API Route**: `ROUTE /filter-options`
- **API Route**: `ROUTE /`
- **API Route**: `ROUTE /:id`

### File: `modules/catalog/services/catalog.service.js`
- **Class**: `ProductService`
  - Method: `create(data: any): any`
  - Method: `getAll(params: any): any`
  - Method: `getById(id: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`

### File: `modules/catalog/services/category.service.js`
- **Class**: `CategoryService`
  - Method: `getAllWithCount(): any`

### File: `modules/catalog/services/filter.service.js`
- **Class**: `FilterMetadataService`
  - Method: `getFilterOptions(): any`

### File: `modules/checkout/controllers/orders.controller.js`
- **Class**: `OrderController`
  - Method: `create(req: any, res: any): any`
  - Method: `getShippingFee(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`
  - Method: `getMyOrders(req: any, res: any): any`
  - Method: `getById(req: any, res: any): any`
  - Method: `updateStatus(req: any, res: any): any`
  - Method: `payosWebhook(req: any, res: any): any`
  - Method: `getPayosLink(req: any, res: any): any`
  - Method: `confirmManual(req: any, res: any): any`

### File: `modules/checkout/controllers/returns.controller.js`
- **Class**: `ReturnsController`
  - Method: `requestReturn(req: any, res: any): any`
  - Method: `getMyReturns(req: any, res: any): any`
  - Method: `getAllReturns(req: any, res: any): any`
  - Method: `updateReturnStatus(req: any, res: any): any`

### File: `modules/checkout/routes/cart.js`
- **API Route**: `GET /`

### File: `modules/checkout/routes/orders.js`
- **API Route**: `ROUTE /`
- **API Route**: `POST /payos/webhook`
- **API Route**: `GET /my-orders`
- **API Route**: `GET /:id`
- **API Route**: `PUT /:id/status`
- **API Route**: `GET /:id/payos-link`
- **API Route**: `POST /shipping-fee`
- **API Route**: `PUT /:id/confirm`

### File: `modules/checkout/routes/returns.js`
- **API Route**: `POST /`
- **API Route**: `GET /my-returns`
- **API Route**: `GET /admin`
- **API Route**: `PUT /admin/:id/status`

### File: `modules/checkout/services/checkout.service.js`
- **Class**: `CheckoutService`
  - Method: `getAllWithCount(): any`
  - Method: `processOrder(orderData: any): any`

### File: `modules/checkout/services/ghn.service.js`
- **Class**: `GHNService`
  - Method: `getHeaders(): any`
  - Method: `calculateFee(to_district_id: any, to_ward_code: any, totalItemsCount: any): any`
  - Method: `createOrder(order: any, items: any): any`

### File: `modules/checkout/services/orders.service.js`
- **Class**: `OrderService`
  - Method: `createOrder(customerId: any, orderData: any): any`
  - Method: `getAll(query: any): any`
  - Method: `getByCustomer(customerId: any, query: any): any`
  - Method: `getById(id: any): any`
  - Method: `updateStatus(id: any, status: any): any`

### File: `modules/checkout/services/payos.service.js`
- **Class**: `PayosService`
  - Method: `createPaymentLink(orderId: any, amount: any, description: any): any`
  - Method: `getPaymentLink(orderId: any): any`
  - Method: `verifyWebhookData(webhookBody: any): any`

### File: `modules/checkout/services/returns.service.js`
- **Class**: `ReturnsService`
  - Method: `requestReturn(customerId: any, data: any): any`
  - Method: `getMyReturns(customerId: any, query: any): any`
  - Method: `getAllReturns(query: any): any`
  - Method: `updateReturnStatus(returnId: any, status: any, adminNote: any): any`
  - Method: `processRefundEffects(request: any): any`

### File: `modules/content/controllers/post.controller.js`
- **Class**: `ArticleController`
  - Method: `create(req: any, res: any): any`
  - Method: `update(req: any, res: any): any`
  - Method: `delete(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`
  - Method: `getAllAdmin(req: any, res: any): any`
  - Method: `getBySlug(req: any, res: any): any`
  - Method: `getById(req: any, res: any): any`

### File: `modules/content/routes/post.js`
- **API Route**: `ROUTE /`
- **API Route**: `GET /admin`
- **API Route**: `GET /slug/:slug`
- **API Route**: `ROUTE /:id`

### File: `modules/content/services/posts.service.js`
- **Class**: `ArticleService`
  - Method: `_generateSlug(title: any): any`
  - Method: `create(data: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`
  - Method: `getAll(query: any, isAdmin: any): any`
  - Method: `getBySlug(slug: any): any`
  - Method: `getById(id: any): any`

### File: `modules/inventory/routes/purchaseOrders.js`
- **API Route**: `GET /`
- **API Route**: `POST /`

### File: `modules/inventory/routes/purchases.js`
- **API Route**: `ROUTE /`
- **API Route**: `ROUTE /:id`
- **API Route**: `ROUTE /:id/approve`

### File: `modules/inventory/routes/suppliers.js`
- **API Route**: `ROUTE /`
- **API Route**: `ROUTE /:id`

### File: `modules/inventory/services/purchase.service.js`
- **Class**: `PurchaseService`
  - Method: `createPO(data: any): any`
  - Method: `getPOById(id: any): any`
  - Method: `getAllPOs(): any`
  - Method: `approvePO(id: any): any`

### File: `modules/inventory/services/purchaseOrders.service.js`
- **Class**: `PurchaseOrdersService`
  - Method: `getAll({ page = 1, limit = 10, status, sort = '-createdAt' }: any): any`
  - Method: `create(data: any): any`

### File: `modules/inventory/services/supplier.service.js`
- **Class**: `SupplierService`
  - Method: `create(data: any): any`
  - Method: `getAll(): any`
  - Method: `getById(id: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`

### File: `modules/notifications/controllers/notifications.controller.js`
- **Class**: `NotificationsController`
  - Method: `getMyNotifications(req: any, res: any): any`
  - Method: `getUnreadCount(req: any, res: any): any`
  - Method: `markAsRead(req: any, res: any): any`
  - Method: `markAllAsRead(req: any, res: any): any`
  - Method: `broadcast(req: any, res: any): any`

### File: `modules/notifications/routes/notifications.js`
- **API Route**: `GET /`
- **API Route**: `GET /unread-count`
- **API Route**: `PUT /read-all`
- **API Route**: `PUT /:id/read`
- **API Route**: `POST /broadcast`

### File: `modules/notifications/services/notifications.service.js`
- **Class**: `NotificationsService`
  - Method: `sendToUser(recipientId: any, type: any, title: any, content: any, link: any, referenceId: any): any`
  - Method: `broadcast(type: any, title: any, content: any, link: any): any`
  - Method: `getMyNotifications(recipientId: any, query: any): any`
  - Method: `countUnread(recipientId: any): any`
  - Method: `markAsRead(notificationId: any, recipientId: any): any`
  - Method: `markAllAsRead(recipientId: any): any`

### File: `modules/promotions/controllers/gifts.controller.js`
- **Class**: `GiftController`
  - Method: `create(req: any, res: any): any`
  - Method: `update(req: any, res: any): any`
  - Method: `delete(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`

### File: `modules/promotions/controllers/promotions.controller.js`
- **Class**: `PromotionController`
  - Method: `create(req: any, res: any): any`
  - Method: `update(req: any, res: any): any`
  - Method: `delete(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`
  - Method: `getById(req: any, res: any): any`
  - Method: `getActivePromotions(req: any, res: any): any`

### File: `modules/promotions/controllers/vouchers.controller.js`
- **Class**: `VoucherController`
  - Method: `create(req: any, res: any): any`
  - Method: `update(req: any, res: any): any`
  - Method: `delete(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`
  - Method: `checkVoucher(req: any, res: any): any`

### File: `modules/promotions/routes/gifts.js`
- **API Route**: `ROUTE /`
- **API Route**: `ROUTE /:id`

### File: `modules/promotions/routes/promotions.js`
- **API Route**: `GET /active`
- **API Route**: `ROUTE /`
- **API Route**: `ROUTE /:id`

### File: `modules/promotions/routes/vouchers.js`
- **API Route**: `POST /check`
- **API Route**: `ROUTE /`
- **API Route**: `ROUTE /:id`

### File: `modules/promotions/services/gifts.service.js`
- **Class**: `GiftService`
  - Method: `create(data: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`
  - Method: `getAll(query: any): any`

### File: `modules/promotions/services/promotions.service.js`
- **Class**: `PromotionService`
  - Method: `create(data: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`
  - Method: `getAll(query: any): any`
  - Method: `getById(id: any): any`
  - Method: `getActivePromotions(): any`

### File: `modules/promotions/services/vouchers.service.js`
- **Class**: `VoucherService`
  - Method: `create(data: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`
  - Method: `getAll(query: any): any`
  - Method: `checkVoucher(code: any, orderValue: any): any`

### File: `modules/reports/controllers/reports.controller.js`
- **Class**: `ReportsController`
  - Method: `getDashboardStats(req: any, res: any): any`

### File: `modules/reports/routes/reports.js`
- **API Route**: `GET /dashboard`

### File: `modules/reports/services/reports.service.js`
- **Class**: `ReportsService`
  - Method: `getDashboardStats(): any`

### File: `modules/reviews/controllers/reviews.controller.js`
- **Class**: `ReviewsController`
  - Method: `create(req: any, res: any): any`
  - Method: `getByProduct(req: any, res: any): any`
  - Method: `getMyReviews(req: any, res: any): any`
  - Method: `getPendingReviews(req: any, res: any): any`

### File: `modules/reviews/models/ProductReview.model.js`
- **Function**: `updateProductRating(productId: any): any`

### File: `modules/reviews/routes/reviews.js`
- **API Route**: `POST /`
- **API Route**: `GET /product/:productId`
- **API Route**: `GET /me`
- **API Route**: `GET /pending`

### File: `modules/reviews/services/reviews.service.js`
- **Class**: `ReviewsService`
  - Method: `createReview(userId: any, data: any): any`
  - Method: `getReviewsByProductId(productId: any, query: any): any`
  - Method: `getMyReviews(userId: any, query: any): any`
  - Method: `getPendingReviews(customerId: any): any`

### File: `modules/seed/routes/seeder.js`
- **API Route**: `GET /`

### File: `modules/settings/controllers/settings.controller.js`
- **Class**: `SettingsController`
  - Method: `getConfig(req: any, res: any): any`
  - Method: `updateConfig(req: any, res: any): any`

### File: `modules/settings/routes/settings.js`
- **API Route**: `GET /`
- **API Route**: `PUT /`

### File: `modules/settings/services/settings.service.js`
- **Class**: `SettingsService`
  - Method: `getConfig(): any`
  - Method: `updateConfig(data: any): any`

### File: `modules/users/controllers/admins.controller.js`
- **Class**: `AdminController`
  - Method: `create(req: any, res: any): any`
  - Method: `getMe(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`
  - Method: `getById(req: any, res: any): any`
  - Method: `update(req: any, res: any): any`
  - Method: `delete(req: any, res: any): any`

### File: `modules/users/controllers/customers.controller.js`
- **Class**: `CustomerController`
  - Method: `createOffline(req: any, res: any): any`
  - Method: `getMe(req: any, res: any): any`
  - Method: `updateMe(req: any, res: any): any`
  - Method: `getAll(req: any, res: any): any`
  - Method: `getById(req: any, res: any): any`
  - Method: `updateById(req: any, res: any): any`
  - Method: `getAddresses(req: any, res: any): any`
  - Method: `addAddress(req: any, res: any): any`
  - Method: `updateAddress(req: any, res: any): any`
  - Method: `deleteAddress(req: any, res: any): any`

### File: `modules/users/routes/admin.js`
- **API Route**: `ROUTE /`
- **API Route**: `GET /me`
- **API Route**: `ROUTE /:id`

### File: `modules/users/routes/customers.js`
- **API Route**: `ROUTE /me`
- **API Route**: `ROUTE /me/addresses`
- **API Route**: `ROUTE /me/addresses/:addressId`
- **API Route**: `POST /offline-create`
- **API Route**: `GET /`
- **API Route**: `ROUTE /:id`

### File: `modules/users/services/admins.service.js`
- **Class**: `AdminService`
  - Method: `login(username: any, password: any, { ip, fingerprint }: any): any`
  - Method: `register(data: any): any`
  - Method: `getAll(): any`
  - Method: `getById(id: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `delete(id: any): any`

### File: `modules/users/services/customers.service.js`
- **Class**: `CustomerService`
  - Method: `createOffline(data: any): any`
  - Method: `registerOnline(data: any): any`
  - Method: `login(phone: any, password: any): any`
  - Method: `_generateAuthResponse(customer: any): any`
  - Method: `getById(id: any): any`
  - Method: `update(id: any, data: any): any`
  - Method: `getAll(query: any): any`
  - Method: `addAddress(customerId: any, addressData: any): any`
  - Method: `updateAddress(customerId: any, addressId: any, addressData: any): any`
  - Method: `deleteAddress(customerId: any, addressId: any): any`

### File: `modules/users/services/user_accounts.service.js`
- **Class**: `UserAccountService`
  - Method: `registerOnline(data: any): any`
  - Method: `login(phone: any, password: any, fingerprint: any): any`
  - Method: `_generateAuthResponse(user: any, customer: any, fingerprint: any): any`

## Frontend

### File: `app.ts`
- **Function**: `export navigateTo(url: string): void`

### File: `api/ApiClient.ts`
- **Class**: `export ApiClient`
  - Method: `get(endpoint: string): Promise<T>`
  - Method: `post(endpoint: string, data: any): Promise<T>`

### File: `components/AdminHeader.ts`
- **Class**: `export AdminHeader`
  - Method: `render(title: string): string`

### File: `components/AdminSidebar.ts`
- **Class**: `export AdminSidebar`
  - Method: `render(activePage: string): string`

### File: `components/ClientFooter.ts`
- **Class**: `export ClientFooter`
  - Method: `render(): string`

### File: `components/ClientHeader.ts`
- **Class**: `export ClientHeader`
  - Method: `render(): string`

### File: `components/ProductCard.ts`
- **Class**: `export ProductCard`
  - Method: `render(p: IProduct): string`
  - Method: `renderSkeleton(): string`

### File: `core/BaseView.ts`
- **Class**: `export BaseView`
  - Method: `render(data: any): string`

### File: `core/Router.ts`
- **Class**: `export Router`
  - Method: `init(): void`
  - Method: `handleRoute(): Promise<void>`
- **Interface**: `Route`

### File: `modules/home/HomeModule.ts`
- **Class**: `export HomeModule`
  - Method: `render(): Promise<void>`
  - Method: `renderProductGrid(products: IProduct[]): string`
  - Method: `renderPromotions(promotions: IPromotion[]): string`
  - Method: `template(products: IProduct[], posts: IPost[], promotions: IPromotion[]): string`
- **Interface**: `IPromotion`

### File: `modules/product-detail/ProductDetailModule.ts`
- **Class**: `export ProductDetailModule`
  - Method: `render(id: string): Promise<void>`
  - Method: `initEvents(): any`
  - Method: `template(p: IProduct): string`
  - Method: `templateSkeleton(): string`

### File: `modules/products/CatalogModule.ts`
- **Class**: `export CatalogModule`
  - Method: `render(): Promise<void>`
  - Method: `fetchFilterOptions(): any`
  - Method: `fetchProducts(): any`
  - Method: `renderSidebar(): any`
  - Method: `renderSortBar(): any`
  - Method: `updateProductList(): any`
  - Method: `renderPagination(): any`
  - Method: `template(): string`

### File: `modules/posts/PostListModule.ts`
- **Class**: `export PostListModule`
  - Method: `render(): Promise<void>`
  - Method: `loadPosts(isInitial: boolean): Promise<void>`
  - Method: `bindEvents(): void`
  - Method: `renderPostCard(post: IArticle): string`
  - Method: `template(): string`
  - Method: `templateSkeleton(): string`

### File: `modules/posts/PostDetailModule.ts`
- **Class**: `export PostDetailModule`
  - Method: `render(slug: string): Promise<void>`
  - Method: `renderRelatedCard(post: IArticle): string`
  - Method: `template(article: IArticle, related: IArticle[]): string`
  - Method: `templateSkeleton(): string`

### File: `shared/interfaces/IPost.ts`
- **Interface**: `IArticle`
- **Type**: `ArticleStatus`
- **Type**: `IPost` (alias of IArticle)

### File: `shared/models/IProduct.ts`
- **Interface**: `IProduct`

### File: `shared/models/ProductModel.ts`
- **Class**: `export ProductModel`
  - Method: `setProducts(data: IProduct[]): void`
  - Method: `getProducts(): IProduct[]`
  - Method: `getProductById(id: number): IProduct | undefined`

### File: `shared/services/PostService.ts`
- **Class**: `export PostService`
  - Method: `fetchPosts(params: FetchPostsParams): Promise<IPaginationResponse<IArticle>>`
  - Method: `fetchPostBySlug(slug: string): Promise<IArticle | null>`
- **Function**: `formatArticleDate(article: IArticle): string`
- **Function**: `articleThumbnail(article: IArticle): string`

### File: `shared/services/ProductService.ts`
- **Class**: `export ProductService`
  - Method: `fetchProducts(page: number, limit: number): Promise<any>`
  - Method: `fetchProductById(id: number): Promise<IProduct | null>`

### File: `modules/admin/dashboard/AdminDashboardModule.ts`
- **Class**: `export AdminDashboardModule`
  - Method: `render(): Promise<void>`
  - Method: `template(stats: { productCount: number; orderCount: number; totalRevenue: number }): string`
  - Method: `templateSkeleton(): string`

### File: `modules/admin/orders/AdminOrderModule.ts`
- **Class**: `export AdminOrderModule`
  - Method: `render(): Promise<void>`
  - Method: `fetchOrders(): any`
  - Method: `template(): string`
  - Method: `templateSkeleton(): string`

### File: `modules/admin/pos/AdminPOSModule.ts`
- **Class**: `export AdminPOSModule`
  - Method: `render(): Promise<void>`
  - Method: `fetchProducts(): any`
  - Method: `initEvents(): any`
  - Method: `addToCart(product: IProduct): any`
  - Method: `updateCartUI(): any`
  - Method: `updateTotals(): any`
  - Method: `template(): string`
  - Method: `templateSkeleton(): string`

### File: `modules/admin/products/AdminInventoryModule.ts`
- **Class**: `export AdminInventoryModule`
  - Method: `render(): Promise<void>`
  - Method: `fetchProducts(): any`
  - Method: `template(): string`
  - Method: `templateSkeleton(): string`

