const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customers.controller');
const { authenticateToken, authorizeRole, requireCustomer } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Quản lý Khách hàng (Mua sắm Online/Offline, Điểm, Địa chỉ)
 */

// ================= LUỒNG ONLINE =================

/**
 * @swagger
 * /api/customers/me:
 *   get:
 *     summary: Lấy Profile khách hàng đang đăng nhập
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.route('/me')
    .get(authenticateToken, requireCustomer, customerController.getMe)
    .put(authenticateToken, requireCustomer, customerController.updateMe);

/**
 * @swagger
 * /api/customers/me/addresses:
 *   get:
 *     summary: Lấy danh sách địa chỉ nhận hàng
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: Thêm địa chỉ mới
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               street_address:
 *                 type: string
 *               ward:
 *                 type: string
 *               district:
 *                 type: string
 *               province:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.route('/me/addresses')
    .get(authenticateToken, requireCustomer, customerController.getAddresses)
    .post(authenticateToken, requireCustomer, customerController.addAddress);

/**
 * @swagger
 * /api/customers/me/addresses/{addressId}:
 *   put:
 *     summary: Cập nhật địa chỉ (Set default...)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               street_address:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Thành công
 *   delete:
 *     summary: Xóa địa chỉ
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.route('/me/addresses/:addressId')
    .put(authenticateToken, requireCustomer, customerController.updateAddress)
    .delete(authenticateToken, requireCustomer, customerController.deleteAddress);


// ================= LUỒNG QUẢN TRỊ (ADMIN/CASHIER) =================

/**
 * @swagger
 * /api/customers/offline-create:
 *   post:
 *     summary: Tạo Customer tại quầy (Không cần Password)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/offline-create', authenticateToken, authorizeRole('admin', 'cashier'), customerController.createOffline);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Lấy danh sách toàn bộ khách hàng (Admin/Cashier)
 *     tags: [Customers]
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
 */
router.get('/', authenticateToken, authorizeRole('admin', 'cashier'), customerController.getAll);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Xem chi tiết Khách hàng
 *     tags: [Customers]
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
 *     summary: Cập nhật thông tin Khách hàng (Admin điều chỉnh Điểm)
 *     tags: [Customers]
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
 *               full_name:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.route('/:id')
    .get(authenticateToken, authorizeRole('admin', 'cashier'), customerController.getById)
    .put(authenticateToken, authorizeRole('admin', 'cashier'), customerController.updateById);

module.exports = router;
