const express = require('express');
const router = express.Router();
const giftController = require('../controllers/gifts.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Gifts
 *   description: Quản lý kho quà tặng
 */

/**
 * @swagger
 * /api/gifts:
 *   get:
 *     summary: Lấy danh sách quà tặng
 *     tags: [Gifts]
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
 *     summary: Tạo quà tặng mới
 *     tags: [Gifts]
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
 *               description:
 *                 type: string
 *               main_img:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Thành công
 */
router.route('/')
    .get(authenticateToken, authorizeRole('admin', 'cashier'), giftController.getAll)
    .post(authenticateToken, authorizeRole('admin'), giftController.create);

/**
 * @swagger
 * /api/gifts/{id}:
 *   put:
 *     summary: Cập nhật quà tặng
 *     tags: [Gifts]
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
 *     summary: Xóa quà tặng
 *     tags: [Gifts]
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
    .put(authenticateToken, authorizeRole('admin'), giftController.update)
    .delete(authenticateToken, authorizeRole('admin'), giftController.delete);

module.exports = router;
