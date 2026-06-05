const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');
const paginate = require('../../../core/utils/paginate');

const NotificationSchema = new mongoose.Schema({
    _id: { type: Number },
    recipient_id: { type: Number, required: true }, // Có thể là Customer hoặc Admin ID
    type: { 
        type: String, 
        enum: ['ORDER', 'PROMOTION', 'SYSTEM', 'BLOG', 'RETURN'], 
        required: true 
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    link: { type: String }, // Đường dẫn Frontend (VD: /account/orders/56)
    is_read: { type: Boolean, default: false },
    reference_id: { type: Number }, // Lưu ID của đơn hàng, bài viết...
}, { timestamps: true });

// Tự động xóa (TTL Index) sau 7 ngày = 604800 giây
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

NotificationSchema.plugin(autoIncrement, { model: 'notification_id' });
NotificationSchema.plugin(paginate);

module.exports = mongoose.model('Notification', NotificationSchema);
