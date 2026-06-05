const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotions.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Promotions
 *   description: Quản lý chương trình khuyến mãi
 */

/**
 * @swagger
 * /api/promotions/active:
 *   get:
 *     summary: Lấy danh sách khuyến mãi đang diễn ra (dành cho client/khách hàng)
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/active', promotionController.getActivePromotions);

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Lấy danh sách tất cả khuyến mãi (Admin/Cashier)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Tạo khuyến mãi mới (Admin)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               campaign_type:
 *                 type: string
 *                 enum: [DISCOUNT, GIFT]
 *               applicable_product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               condition_type:
 *                 type: string
 *                 enum: [AMOUNT, QUANTITY, NONE]
 *               min_amount:
 *                 type: number
 *               min_quantity:
 *                 type: number
 *               usage_limit:
 *                 type: number
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               rewards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     reward_type:
 *                       type: string
 *                       enum: [DISCOUNT_AMOUNT, DISCOUNT_PERCENT, GIFT]
 *                     discount_amount:
 *                       type: number
 *                     discount_percent:
 *                       type: number
 *                     max_discount_amount:
 *                       type: number
 *                     gift_variant_id:
 *                       type: integer
 *                     gift_quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.route('/')
    .get(authenticateToken, authorizeRole('admin', 'cashier'), promotionController.getAll)
    .post(authenticateToken, authorizeRole('admin'), promotionController.create);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Xem chi tiết khuyến mãi
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *   put:
 *     summary: Cập nhật khuyến mãi (Admin)
 *     tags: [Promotions]
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
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Vô hiệu hóa khuyến mãi (Admin)
 *     tags: [Promotions]
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
    .get(promotionController.getById)
    .put(authenticateToken, authorizeRole('admin'), promotionController.update)
    .delete(authenticateToken, authorizeRole('admin'), promotionController.delete);

module.exports = router;
