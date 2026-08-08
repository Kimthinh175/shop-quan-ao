const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    const OrderItem = require('../src/modules/checkout/models/OrderItem.model');
    const Order = require('../src/modules/checkout/models/Order.model');
    
    try {
        // Find cancelled orders
        const cancelledOrders = await Order.find({ status: 'CANCELLED' });
        const cancelledOrderIds = cancelledOrders.map(o => o._id);
        
        // Remove lots_deducted from their items
        const res = await OrderItem.updateMany(
            { order_id: { $in: cancelledOrderIds } },
            { $set: { lots_deducted: [] } }
        );
        console.log(`Cleared lots_deducted for ${res.modifiedCount} items of cancelled orders.`);
        
        // Fix dashboard aggregation to ALSO filter out cancelled orders just in case
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
