const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const InventorySchema = new mongoose.Schema({
    _id: { type: Number },
    variant_id: { type: Number, required: true, unique: true }, // _id của biến thể trong Product
    product_id: { type: Number, ref: 'Product' },
    quantity: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now }
}, { timestamps: true, _id: false });

InventorySchema.plugin(autoIncrement, { modelName: 'inventory_id' });

module.exports = mongoose.model('Inventory', InventorySchema);
