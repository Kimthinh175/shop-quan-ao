const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    const OrderItem = require('../src/modules/checkout/models/OrderItem.model');
    const Order = require('../src/modules/checkout/models/Order.model');
    
    try {
        const orders = await Order.find({ status: { $ne: 'CANCELLED' } });
        for (const order of orders) {
            const costPrice = Math.floor(order.total_amount * 0.6);
            const item = new OrderItem({
                order_id: order._id,
                total_quantity: 1,
                unit_price: order.total_amount,
                variant_snapshot: {
                    name: 'Dummy Product',
                    sku: 'DUMMY',
                    color: 'N/A',
                    size: 'N/A'
                },
                lots_deducted: [{
                    poi_id: 1,
                    quantity: 1,
                    cost_price: costPrice
                }]
            });
            await item.save();
        }
        console.log(`Inserted dummy OrderItems for ${orders.length} orders with 60% COGS`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
