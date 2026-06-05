const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');
const paginate = require('../../../core/utils/paginate');

const VoucherSchema = new mongoose.Schema({
    _id: { type: Number },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    discount_type: { type: String, enum: ['fixed_amount', 'percentage'], required: true },
    discount_value: { type: Number, required: true, min: 0 },
    min_order_value: { type: Number, default: 0, min: 0 },
    max_discount_amount: { type: Number, min: 0 }, // Giới hạn giảm tối đa nếu là %
    start_date: { type: Date },
    end_date: { type: Date },
    usage_limit: { type: Number }, // Tổng số lượt sử dụng tối đa
    used_count: { type: Number, default: 0 }, // Số lượt đã dùng
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' }
}, { timestamps: true, _id: false });

VoucherSchema.plugin(autoIncrement, { modelName: 'voucher_id' });
VoucherSchema.plugin(paginate);

module.exports = mongoose.model('Voucher', VoucherSchema);
