const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Đăng nhập và Đăng ký hệ thống (Admin & User)
 */

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Đăng nhập dành cho nhân sự (Admin, Cashier, Warehouse)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 default: "superadmin"
 *               password:
 *                 type: string
 *                 default: "admin123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token
 */
router.post('/admin/login', authController.loginAdmin);

/**
 * @swagger
 * /api/auth/user/register:
 *   post:
 *     summary: Đăng ký tài khoản Online Khách hàng
 *     description: Tự động liên kết tài khoản nếu SĐT đã mua hàng tại quầy.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công, trả về token
 */
router.post('/user/register', authController.registerUser);

/**
 * @swagger
 * /api/auth/user/login:
 *   post:
 *     summary: Đăng nhập Khách hàng Online
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token
 */
router.post('/user/login', authController.loginUser);

module.exports = router;
