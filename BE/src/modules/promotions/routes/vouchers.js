const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/vouchers.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Quản lý mã giảm giá nhập tay
 */

/**
 * @swagger
 * /api/vouchers/check:
 *   post:
 *     summary: Kiểm tra mã giảm giá (Dành cho Khách)
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               order_value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Trả về thông tin mã và số tiền được giảm
 */
router.post('/check', voucherController.checkVoucher);

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Lấy danh sách Voucher (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Tạo Voucher mới (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [fixed_amount, percentage]
 *               discount_value:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *               max_discount_amount:
 *                 type: number
 *               usage_limit:
 *                 type: number
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thành công
 */
router.route('/')
    .get(authenticateToken, authorizeRole('admin', 'cashier'), voucherController.getAll)
    .post(authenticateToken, authorizeRole('admin'), voucherController.create);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   put:
 *     summary: Sửa Voucher (Admin)
 *     tags: [Vouchers]
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
 *     responses:
 *       200:
 *         description: Thành công
 *   delete:
 *     summary: Xóa Voucher (Admin)
 *     tags: [Vouchers]
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
router.route('/:id')
    .put(authenticateToken, authorizeRole('admin'), voucherController.update)
    .delete(authenticateToken, authorizeRole('admin'), voucherController.delete);

module.exports = router;
