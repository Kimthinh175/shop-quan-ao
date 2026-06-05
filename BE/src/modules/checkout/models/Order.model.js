const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const OrderSchema = new mongoose.Schema({
    _id: { type: Number },
    customer_id: { type: Number, ref: 'Customer' }, // Có thể null nếu khách lẻ
    promotion_id: { type: Number, ref: 'Promotion' },
    voucher_id: { type: String, ref: 'Voucher' },
    
    // Snapshot thông tin khách tại thời điểm mua (Phòng khi đổi tên/SĐT)
    customer_info: {
        full_name: String,
        phone: String,
        email: String
    },
    
    // Giao hàng
    receiver_name: String,
    receiver_phone: String,
    receiver_address: String,
    to_district_id: Number,
    to_ward_code: String,
    shipping_code: String, // Mã vận đơn GHN
    shipping_fee: { type: Number, default: 0 },
    
    // Tiền nong
    total_price: { type: Number, required: true }, // Tiền hàng chưa giảm
    note: { type: String }, // Ghi chú đơn hàng
    discount_amount: { type: Number, default: 0 }, // Tiền giảm
    total_amount: { type: Number, required: true }, // Khách phải trả
    
    // Tích điểm
    points_used: { type: Number, default: 0 },
    points_earned: { type: Number, default: 0 },
    points_awarded: { type: Boolean, default: false },
    
    // Quà tặng
    gift_snapshot: { type: mongoose.Schema.Types.Mixed },
    
    // Trạng thái
    status: { 
        type: String, 
        enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'PARTIAL_RETURNED', 'RETURNED'], 
        default: 'PENDING' 
    },
    payment_method: { 
        type: String, 
        enum: ['CASH', 'COD', 'TRANSFER'], 
        default: 'COD' 
    },
    payment_status: { 
        type: String, 
        enum: ['UNPAID', 'PAID', 'REFUNDED'], 
        default: 'UNPAID' 
    }
}, { timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' }, _id: false });

OrderSchema.plugin(autoIncrement, { modelName: 'order_id' });

module.exports = mongoose.model('Order', OrderSchema);
