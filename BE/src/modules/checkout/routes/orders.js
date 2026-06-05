const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý Đơn hàng và Thanh toán
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng (Admin/Cashier)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng trên 1 trang
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Khách hàng / POS tạo đơn hàng (Chốt đơn)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total_price:
 *                 type: number
 *               total_amount:
 *                 type: number
 *               receiver_name:
 *                 type: string
 *               receiver_phone:
 *                 type: string
 *               receiver_address:
 *                 type: string
 *               note:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 enum: [COD, TRANSFER, POS]
 *                 default: COD
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Đặt hàng thành công
 */
router.route('/')
    .get(authenticateToken, authorizeRole('admin', 'cashier'), orderController.getAll)
    .post(authenticateToken, orderController.create);

/**
 * @swagger
 * /api/orders/payos/webhook:
 *   post:
 *     summary: Webhook nhận trạng thái thanh toán từ PayOS
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/payos/webhook', orderController.payosWebhook);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Xem chi tiết đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id', authenticateToken, orderController.getById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (Admin/Cashier)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id/status', authenticateToken, authorizeRole('admin', 'cashier'), orderController.updateStatus);

/**
 * @swagger
 * /api/orders/{id}/payos-link:
 *   get:
 *     summary: Lấy lại link thanh toán PayOS (QR) cho đơn hàng TRANSFER
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id/payos-link', authenticateToken, orderController.getPayosLink);

/**
 * @swagger
 * /api/orders/shipping-fee:
 *   post:
 *     summary: Tính phí ship GHN (Tính toán giá ship)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to_district_id:
 *                 type: number
 *               to_ward_code:
 *                 type: string
 *               total_items:
 *                 type: number
 *     responses:
 *       200:
 *         description: Trả về phí ship
 */
router.post('/shipping-fee', orderController.getShippingFee);

/**
 * @swagger
 * /api/orders/{id}/confirm:
 *   put:
 *     summary: Xác nhận đơn hàng thủ công (Admin/Cashier)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.put('/:id/confirm', authenticateToken, authorizeRole('admin', 'cashier'), orderController.confirmManual);

module.exports = router;
