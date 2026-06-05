const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Thống kê và báo cáo hệ thống
 */

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Lấy dữ liệu thống kê tổng hợp cho Dashboard (God API)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/dashboard', authenticateToken, authorizeRole('admin'), reportsController.getDashboardStats);

module.exports = router;
