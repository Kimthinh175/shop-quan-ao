const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const purchaseOrderItemSchema = new mongoose.Schema({
    _id: { type: Number },
    purchase_order_id: {
        type: Number,
        ref: 'PurchaseOrder',
        required: true
    },
    product_variant_id: {
        type: Number,
        ref: 'ProductVariant',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    remaining_quantity: {
        type: Number,
        default: 0
    },
    unit_cost: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'RECEIVED', 'CANCELLED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

purchaseOrderItemSchema.plugin(autoIncrement, { modelName: 'PurchaseOrderItem' });

module.exports = mongoose.model('PurchaseOrderItem', purchaseOrderItemSchema);
