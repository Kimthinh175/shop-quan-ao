const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    const OrderItem = require('../src/modules/checkout/models/OrderItem.model');
    try {
        const res = await OrderItem.aggregate([
            { $unwind: '$lots_deducted' },
            { 
                $group: { 
                    _id: null, 
                    totalCOGS: { 
                        $sum: { $multiply: ['$lots_deducted.quantity', '$lots_deducted.cost_price'] } 
                    } 
                } 
            }
        ]);
        console.log("AGGREGATE RESULT:", JSON.stringify(res));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
