const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions,
  getProductBySku,
  getAdminProducts,
} = require("../controllers/product.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../../core/middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API quản lý sản phẩm
 */

/**
 * @swagger

 * /api/products/filter-options:
 *   get:
 *     summary: Lấy dữ liệu Filter Options (God API Metadata)
 *     description: Trả về toàn bộ danh mục, thương hiệu, size, màu sắc... để Frontend render bộ lọc.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Trả về các lựa chọn lọc
 */
router.route("/filter-options").get(getFilterOptions);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm (God API Lọc)
 *     description: API lấy danh sách sản phẩm, hỗ trợ phân trang keyset và tìm kiếm/lọc toàn diện theo tất cả các tiêu chí.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor để phân trang (Keyset pagination)
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *         description: Hướng phân trang (next hoặc prev)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm trên một trang
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: season_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: gender_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: sport_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: form_id
 *         schema:
 *           type: number
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách sản phẩm
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: number
 *               brand_id:
 *                 type: number
 *               main_img:
 *                 type: string
 *               description:
 *                 type: string
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku:
 *                       type: string
 *                     size:
 *                       type: string
 *                     color:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.route("/admin").get(authenticateToken, authorizeRole("admin"), getAdminProducts);

router
  .route("/")
  .get(getProducts)
  .post(authenticateToken, authorizeRole("admin"), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 *   put:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: number
 *               brand_id:
 *                 type: number
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa sản phẩm (Ngừng bán - Soft Delete)
 *     description: Sản phẩm sẽ bị chuyển trạng thái thành INACTIVE thay vì xóa vĩnh viễn khỏi Database.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.route("/sku/:sku").get(getProductBySku);

router
  .route("/:id")
  .get(getProductById)
  .put(authenticateToken, authorizeRole("admin"), updateProduct)
  .delete(authenticateToken, authorizeRole("admin"), deleteProduct);

module.exports = router;
