const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    const Order = require('../src/modules/checkout/models/Order.model');
    const OrderItem = require('../src/modules/checkout/models/OrderItem.model');
    try {
        // Find orders that contain the test product
        const items = await OrderItem.find({'variant_snapshot.name': /Sản phẩm test/});
        const orderIds = items.map(i => i.order_id);
        
        // Cancel them
        const res = await Order.updateMany(
            { _id: { $in: orderIds } }, 
            { status: 'CANCELLED', payment_status: 'REFUNDED', note: 'Hủy đơn test' }
        );
        console.log(`Cancelled ${res.modifiedCount} test orders.`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
