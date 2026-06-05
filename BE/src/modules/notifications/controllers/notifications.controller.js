const notificationsService = require('../services/notifications.service');

class NotificationsController {
    
    // User lấy danh sách thông báo
    async getMyNotifications(req, res) {
        try {
            // Dùng id (dành cho Admin) hoặc customer_id (dành cho Khách hàng)
            const recipientId = req.user.customer_id || req.user.id;
            const result = await notificationsService.getMyNotifications(recipientId, req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Đếm số lượng chưa đọc
    async getUnreadCount(req, res) {
        try {
            const recipientId = req.user.customer_id || req.user.id;
            const count = await notificationsService.countUnread(recipientId);
            res.json({ unread_count: count });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Đánh dấu 1 thông báo đã đọc
    async markAsRead(req, res) {
        try {
            const recipientId = req.user.customer_id || req.user.id;
            const result = await notificationsService.markAsRead(req.params.id, recipientId);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Đánh dấu tất cả đã đọc
    async markAllAsRead(req, res) {
        try {
            const recipientId = req.user.customer_id || req.user.id;
            await notificationsService.markAllAsRead(recipientId);
            res.json({ message: 'Đã đánh dấu đọc tất cả' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Admin gửi Broadcast cho toàn bộ Customer
    async broadcast(req, res) {
        try {
            const { type, title, content, link } = req.body;
            if (!title || !content || !type) {
                return res.status(400).json({ message: 'Vui lòng điền đủ title, content, type' });
            }
            
            const count = await notificationsService.broadcast(type, title, content, link);
            res.json({ message: `Đã gửi thông báo đến ${count} khách hàng` });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new NotificationsController();
