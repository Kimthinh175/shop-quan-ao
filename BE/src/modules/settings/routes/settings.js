const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

// Lấy cấu hình (Public)
router.get('/', settingsController.getConfig);

// Cập nhật cấu hình (Admin/Manager)
router.put('/', authenticateToken, authorizeRole('superadmin', 'admin', 'manager'), settingsController.updateConfig);

module.exports = router;
