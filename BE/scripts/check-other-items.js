const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    const OrderItem = require('../src/modules/checkout/models/OrderItem.model');
    try {
        const items = await OrderItem.find({ order_id: { $in: [58, 59, 60] } });
        console.log("Items for 58, 59, 60:", items.length);
        console.log(JSON.stringify(items, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
