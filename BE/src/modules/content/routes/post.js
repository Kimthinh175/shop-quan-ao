const express = require('express');
const router = express.Router();
const articleController = require('../controllers/post.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Quản lý bài viết Blog/Tin tức
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lấy danh sách bài viết đã xuất bản (Dành cho Khách)
 *     tags: [Articles]
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
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Tạo bài viết mới (Admin)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *                 description: Để trống sẽ tự sinh từ title
 *               thumbnail:
 *                 type: string
 *               content:
 *                 type: string
 *                 description: Nội dung HTML
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       201:
 *         description: Thành công
 */
router.route('/')
    .get(articleController.getAll)
    .post(authenticateToken, authorizeRole('admin'), articleController.create);

/**
 * @swagger
 * /api/posts/admin:
 *   get:
 *     summary: Lấy danh sách bài viết cho Admin (Kể cả bản nháp)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/admin', authenticateToken, authorizeRole('admin'), articleController.getAllAdmin);

/**
 * @swagger
 * /api/posts/slug/{slug}:
 *   get:
 *     summary: Xem chi tiết bài viết theo Slug (Cho Khách)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/slug/:slug', articleController.getBySlug);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Xem chi tiết bài viết theo ID (Admin)
 *     tags: [Articles]
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
 *     summary: Sửa bài viết (Admin)
 *     tags: [Articles]
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
 *     summary: Xóa bài viết (Admin)
 *     tags: [Articles]
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
 *         description: Đã xóa thành công
 */
router.route('/:id')
    .get(authenticateToken, authorizeRole('admin'), articleController.getById)
    .put(authenticateToken, authorizeRole('admin'), articleController.update)
    .delete(authenticateToken, authorizeRole('admin'), articleController.delete);

module.exports = router;
