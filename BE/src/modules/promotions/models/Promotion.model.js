const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const PromotionRewardSchema = new mongoose.Schema({
    reward_type: { 
        type: String, 
        enum: ['DISCOUNT_AMOUNT', 'DISCOUNT_PERCENT', 'GIFT'], 
        required: true 
    },
    discount_amount: { type: Number },
    discount_percent: { type: Number },
    max_discount_amount: { type: Number },
    gift_id: { type: Number, ref: 'Gift' },
    gift_quantity: { type: Number }
}, { _id: false });

const PromotionSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    campaign_type: {
        type: String,
        enum: ['DISCOUNT', 'GIFT'],
        required: true
    },
    applicable_product_ids: [{ type: Number, ref: 'Product' }],
    condition_type: { 
        type: String, 
        enum: ['AMOUNT', 'QUANTITY', 'NONE'], 
        required: true 
    },
    min_amount: { type: Number, default: 0 },
    min_quantity: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    usage_limit: { type: Number, default: 0 }, // 0 = Không giới hạn
    used_count: { type: Number, default: 0 },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    rewards: [PromotionRewardSchema]
}, { timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' } });

PromotionSchema.plugin(autoIncrement, { modelName: 'promotion_id' });

module.exports = mongoose.model('Promotion', PromotionSchema);
