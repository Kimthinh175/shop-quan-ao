const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const purchaseOrderSchema = new mongoose.Schema({
    _id: { type: Number },
    supplier_id: {
        type: Number,
        ref: 'Supplier',
        required: true
    },
    total_amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    import_type: {
        type: String,
        enum: ['VARIANT_LEVEL', 'RI_LEVEL'],
        default: 'VARIANT_LEVEL'
    },
    ri_details: [{
        product_id: { type: Number, ref: 'Product' },
        ri_type: { type: String, enum: ['SIZE_FULL_COLOR', 'COLOR_FULL_SIZE'] },
        base_attribute: { type: String },
        ri_quantity: { type: Number },
        price_per_ri: { type: Number }
    }]
}, {
    timestamps: true
});

purchaseOrderSchema.plugin(autoIncrement, { modelName: 'PurchaseOrder' });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
