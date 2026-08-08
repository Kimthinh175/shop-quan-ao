const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");
const {
  authenticateToken,
  optionalAuthenticateToken,
} = require("../../../core/middlewares/auth");

// Rate limiting for Auth to prevent brute force (5 requests / 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 5 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window`
  message: {
    message: "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 5s.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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
router.post("/admin/login", authLimiter, authController.loginAdmin);

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
router.post("/user/register", authLimiter, authController.registerUser);

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
router.post("/user/login", authLimiter, authController.loginUser);

/**
 * @swagger
 * /api/auth/otp/send:
 *   post:
 *     summary: Gửi mã OTP xác thực
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
 *     responses:
 *       200:
 *         description: Gửi thành công, trả về mã OTP
 */
router.post("/otp/send", authLimiter, authController.sendOtp);

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     summary: Xác thực mã OTP và đăng nhập/đăng ký
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
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xác thực thành công, trả về token
 */
router.post("/otp/verify", authLimiter, authController.verifyOtp);

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token
 */
router.post("/google-login", authLimiter, authController.googleLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Trả về thông tin user
 */
router.get("/me", optionalAuthenticateToken, authController.getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post("/logout", authController.logout);

module.exports = router;
