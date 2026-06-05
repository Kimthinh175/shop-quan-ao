const Notification = require('../models/Notification.model');
const { emitToUser, emitToAll } = require('../../../core/config/socket');
const paginate = require('../../../core/utils/paginate');
const Customer = require('../../users/models/Customer.model');

class NotificationsService {
    
    // Gửi thông báo cho 1 user cụ thể (Khách hàng hoặc Admin)
    async sendToUser(recipientId, type, title, content, link = '', referenceId = null) {
        const notification = await Notification.create({
            recipient_id: recipientId,
            type,
            title,
            content,
            link,
            reference_id: referenceId
        });
        
        // Bắn Socket Real-time
        emitToUser(recipientId, 'new_notification', notification);
        return notification;
    }

    // Gửi thông báo hàng loạt cho toàn bộ khách hàng (Broadcast Marketing)
    async broadcast(type, title, content, link = '') {
        // Cảnh báo: Với hệ thống lớn, việc insert từng dòng có thể chậm. 
        // Cần dùng insertMany chia chunk (batching).
        // Ở đây đơn giản hóa lấy toàn bộ Customer ID.
        const customers = await Customer.find({}, '_id').lean();
        const docs = customers.map(c => ({
            _id: Date.now() + Math.floor(Math.random() * 1000000), // Hacky auto-increment for insertMany bypass if plugin has issues
            recipient_id: c._id,
            type,
            title,
            content,
            link
        }));
        
        // Remove _id to let autoIncrement handle it (wait, mongoose autoIncrement plugin might not support insertMany well)
        // Lặp qua để tạo (an toàn hơn với plugin auto-increment hiện tại)
        // Tuy nhiên sẽ chậm với số lượng lớn. Dùng vòng lặp for...of tạm thời
        const notifs = [];
        for (const doc of docs) {
            delete doc._id;
            const created = await Notification.create(doc);
            notifs.push(created);
        }
        
        // Bắn Socket cho tất cả user (Có thể frontend tự lọc nếu không phải của mình, 
        // nhưng tốt nhất là broadcast event chung)
        emitToAll('new_broadcast_notification', { type, title, content, link });
        
        return notifs.length;
    }

    // Khách hàng/Admin lấy danh sách thông báo của mình
    async getMyNotifications(recipientId, query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = { recipient_id: recipientId };
        
        const [data, total] = await Promise.all([
            Notification.find(filter)
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            Notification.countDocuments(filter)
        ]);
        
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Đếm số lượng chưa đọc
    async countUnread(recipientId) {
        return await Notification.countDocuments({ recipient_id: recipientId, is_read: false });
    }

    // Đánh dấu 1 thông báo là đã đọc
    async markAsRead(notificationId, recipientId) {
        const notif = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient_id: recipientId },
            { is_read: true },
            { new: true }
        );
        if (!notif) throw new Error('Không tìm thấy thông báo');
        return notif;
    }

    // Đánh dấu tất cả là đã đọc
    async markAllAsRead(recipientId) {
        await Notification.updateMany(
            { recipient_id: recipientId, is_read: false },
            { is_read: true }
        );
        return { success: true };
    }
}

module.exports = new NotificationsService();
