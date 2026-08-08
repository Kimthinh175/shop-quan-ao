const express = require("express");
const router = express.Router();
const adminRoutes = require("../../modules/users/routes/admin");
const productRoutes = require("../../modules/catalog/routes/products");
const categoriesRoutes = require("../../modules/catalog/routes/categories");
const homeRoutes = require("../../modules/catalog/routes/home");
const postRoutes = require("../../modules/content/routes/post");
const ordersRoutes = require("../../modules/checkout/routes/orders");
const returnsRoutes = require("../../modules/checkout/routes/returns");
const seederRoutes = require("../../modules/seed/routes/seeder");
const customersRoutes = require("../../modules/users/routes/customers");
const purchasesRoutes = require("../../modules/inventory/routes/purchases");
const suppliersRoutes = require("../../modules/inventory/routes/suppliers");
const reportsRoutes = require("../../modules/reports/routes/reports");
const reviewsRoutes = require("../../modules/reviews/routes/reviews");
const promotionsRoutes = require("../../modules/promotions/routes/promotions");
const giftsRoutes = require("../../modules/promotions/routes/gifts");
const vouchersRoutes = require("../../modules/promotions/routes/vouchers");
const notificationsRoutes = require("../../modules/notifications/routes/notifications");
const settingsRoutes = require("../../modules/settings/routes/settings");
const uploadRoutes = require("../../modules/upload/routes/upload");

const authRoutes = require("../../modules/auth/routes/auth");

router.get("/welcome", (req, res) => {
  res.json({ message: "Welcome to the Lab Node.js API!" });
});

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

router.use("/auth", authRoutes);
router.use("/home", homeRoutes);
router.use("/admins", adminRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoriesRoutes);
router.use("/posts", postRoutes);
router.use("/orders", ordersRoutes);
router.use("/returns", returnsRoutes);
router.use("/customers", customersRoutes);
router.use("/reports", reportsRoutes);
router.use("/reviews", reviewsRoutes);

const { authenticateToken, authorizeRole } = require("../middlewares/auth");

router.use(
  "/purchases",
  authenticateToken,
  authorizeRole("admin"),
  purchasesRoutes,
);
router.use(
  "/suppliers",
  authenticateToken,
  authorizeRole("admin"),
  suppliersRoutes,
);
router.use("/promotions", promotionsRoutes);
router.use("/gifts", giftsRoutes);
router.use("/vouchers", vouchersRoutes);
router.use("/notifications", authenticateToken, notificationsRoutes);
router.use("/settings", settingsRoutes);
router.use("/seed", seederRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
