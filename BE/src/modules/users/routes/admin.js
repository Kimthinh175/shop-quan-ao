const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admins.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Quản lý nhân sự nội bộ (Admin, Thu ngân, Kho)
 */

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: Lấy danh sách nhân sự (Yêu cầu quyền Admin)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Đăng ký tài khoản nhân sự mới (Admin)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, cashier, warehouse]
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.route('/')
    .get(authenticateToken, authorizeRole('admin'), adminController.getAll)
    .post(authenticateToken, authorizeRole('admin'), adminController.create);

/**
 * @swagger
 * /api/admins/me:
 *   get:
 *     summary: Lấy thông tin tài khoản đang đăng nhập
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin admin
 */
router.get('/me', authenticateToken, adminController.getMe);

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Lấy chi tiết nhân sự
 *     tags: [Admins]
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
 *   put:
 *     summary: Cập nhật thông tin nhân sự (Admin)
 *     tags: [Admins]
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
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, cashier, warehouse]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa nhân sự (Admin)
 *     tags: [Admins]
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
 *         description: Xóa thành công
 */
router.route('/:id')
    .get(authenticateToken, authorizeRole('admin'), adminController.getById)
    .put(authenticateToken, authorizeRole('admin'), adminController.update)
    .delete(authenticateToken, authorizeRole('admin'), adminController.delete);

module.exports = router;
