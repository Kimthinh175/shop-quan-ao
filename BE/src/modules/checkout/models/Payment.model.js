const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const PaymentSchema = new mongoose.Schema({
    _id: { type: Number },
    order_id: { type: Number, ref: 'Order', required: true },
    payment_method: { 
        type: String, 
        enum: ['CASH', 'COD', 'PAYOS_QR', 'BANK_TRANSFER'], 
        required: true 
    },
    transaction_id: { type: String }, // Mã giao dịch từ ngân hàng/cổng thanh toán
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed', 'refunded'], 
        default: 'pending' 
    },
    paid_at: { type: Date }
}, { timestamps: true, _id: false });

PaymentSchema.plugin(autoIncrement, { modelName: 'payment_id' });

module.exports = mongoose.model('Payment', PaymentSchema);
