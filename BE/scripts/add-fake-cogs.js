const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    const Order = require('../src/modules/checkout/models/Order.model');
    const OrderItem = require('../src/modules/checkout/models/OrderItem.model');
    
    try {
        const orders = await Order.find({ status: { $ne: 'CANCELLED' } });
        for (const order of orders) {
            const items = await OrderItem.find({ order_id: order._id });
            for (const item of items) {
                // Set cost price to 60% of unit price to make profit realistic
                const costPrice = Math.floor(item.unit_price * 0.6);
                item.lots_deducted = [{
                    poi_id: 1, // Fake lot ID
                    quantity: item.total_quantity,
                    cost_price: costPrice
                }];
                await item.save();
            }
        }
        console.log(`Added fake cost price to ${orders.length} remaining orders`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
