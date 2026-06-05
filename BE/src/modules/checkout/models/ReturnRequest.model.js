const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');
const paginate = require('../../../core/utils/paginate');

const ReturnItemSchema = new mongoose.Schema({
    order_item_id: { type: Number, ref: 'OrderItem', required: true },
    product_variant_id: { type: Number, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    condition: { type: String, enum: ['NEW', 'DEFECTIVE'], required: true }
}, { _id: false });

const ReturnRequestSchema = new mongoose.Schema({
    _id: { type: Number },
    order_id: { type: Number, ref: 'Order', required: true },
    customer_id: { type: Number, ref: 'Customer', required: true },
    
    items: [ReturnItemSchema],
    
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED'],
        default: 'PENDING'
    },
    
    refund_amount: { type: Number, default: 0 },
    refund_points_clawback: { type: Number, default: 0 }, // Điểm bị trừ (thu hồi)
    refund_points_returned: { type: Number, default: 0 }, // Điểm trả lại ví (nếu khách mua bằng điểm)
    
    images: [{ type: String }], // Link hình ảnh
    customer_note: { type: String },
    admin_note: { type: String }
}, { timestamps: true });

ReturnRequestSchema.plugin(autoIncrement, { model: 'return_request_id' });
ReturnRequestSchema.plugin(paginate);

module.exports = mongoose.model('ReturnRequest', ReturnRequestSchema);
