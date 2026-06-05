const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews.controller');
const { authenticateToken, requireCustomer } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Đánh giá sản phẩm
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Gửi đánh giá cho sản phẩm đã mua (Customer)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_item_id:
 *                 type: number
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Đánh giá thành công
 */
router.post('/', authenticateToken, requireCustomer, reviewsController.create);

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Xem danh sách đánh giá của một sản phẩm (Công khai)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: rating
 *         description: Lọc theo số sao
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/product/:productId', reviewsController.getByProduct);

/**
 * @swagger
 * /api/reviews/me:
 *   get:
 *     summary: Xem danh sách các đánh giá tôi đã viết (Customer)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/me', authenticateToken, requireCustomer, reviewsController.getMyReviews);

/**
 * @swagger
 * /api/reviews/pending:
 *   get:
 *     summary: Xem danh sách các sản phẩm chờ đánh giá (Customer)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/pending', authenticateToken, requireCustomer, reviewsController.getPendingReviews);

module.exports = router;
