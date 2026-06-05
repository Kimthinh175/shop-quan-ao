const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const ProductVariantSchema = new mongoose.Schema({
    _id: { type: Number },
    product_id: { type: Number, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true },
    quantity: { type: Number, default: 0, min: 0 },
    current_lot: { type: String, default: null },
    current_lot_sold: { type: Number, default: 0, min: 0 },
    lots_history: { type: Array, default: [] },
    sold: { type: Number, default: 0, min: 0 },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cost_price: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

ProductVariantSchema.plugin(autoIncrement, { model: 'product_variant_id' });

module.exports = mongoose.model('ProductVariant', ProductVariantSchema);
