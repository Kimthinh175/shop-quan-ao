const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

// Lồng (embed) order_item_lot vào trong order_item luôn để dễ truy vấn lợi nhuận
const OrderItemLotSchema = new mongoose.Schema({
    poi_id: { type: Number, required: true }, // ID của PurchaseOrderItem (Lô hàng)
    quantity: { type: Number, required: true }, // Số lượng lấy từ lô này
    cost_price: { type: Number, required: true } // Giá vốn của lô này
}, { _id: false });

const OrderItemSchema = new mongoose.Schema({
    _id: { type: Number },
    order_id: { type: Number, ref: 'Order', required: true },
    
    // Bản sao tĩnh của Product Variant để hóa đơn không bị ảnh hưởng nếu đổi tên
    variant_snapshot: {
        product_variant_id: Number,
        product_id: Number,
        name: String,
        sku: String,
        color: String,
        size: String,
        main_img: String
    },
    
    total_quantity: { type: Number, required: true }, // Tổng số lượng mua
    unit_price: { type: Number, required: true }, // Giá bán ra
    
    // Lưu các lô hàng đã xuất kho cho item này (Phục vụ FIFO)
    lots_deducted: [OrderItemLotSchema]
}, { timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' }, _id: false });

OrderItemSchema.plugin(autoIncrement, { modelName: 'order_item_id' });

module.exports = mongoose.model('OrderItem', OrderItemSchema);
