const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

// Lấy danh sách thông báo của user hiện tại (Customer hoặc Admin)
router.get('/', authenticateToken, notificationsController.getMyNotifications);
router.get('/unread-count', authenticateToken, notificationsController.getUnreadCount);

// Đánh dấu đọc
router.put('/read-all', authenticateToken, notificationsController.markAllAsRead);
router.put('/:id/read', authenticateToken, notificationsController.markAsRead);

// Admin Broadcast
router.post('/broadcast', authenticateToken, authorizeRole('superadmin', 'admin', 'manager'), notificationsController.broadcast);

module.exports = router;
