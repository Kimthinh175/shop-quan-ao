const mongoose = require('mongoose');
const path = require('path');

// Models
const Product = require('../src/modules/catalog/models/Product.model');
const ProductVariant = require('../src/modules/catalog/models/ProductVariant.model');
const PurchaseOrder = require('../src/modules/inventory/models/PurchaseOrder.model');
const PurchaseOrderItem = require('../src/modules/inventory/models/PurchaseOrderItem.model');
const OrderItem = require('../src/modules/checkout/models/OrderItem.model');

async function fixTestProduct() {
    try {
        await mongoose.connect('mongodb://localhost:27017/shop');
        console.log('Connected to MongoDB');

        // 1. Find Product
        const product = await Product.findOne({ name: /Sản phẩm test PayOS 2K/i });
        if (!product) {
            console.log('Product not found');
            process.exit(1);
        }

        // 2. Update Retail Price
        product.retail_price = 10000;
        await product.save();
        console.log('Updated product retail_price to 10000');

        // 3. Update Variants
        const variants = await ProductVariant.find({ product_id: product._id });
        let variantId = null;
        for (const v of variants) {
            v.price = 10000;
            v.cost_price = 2000;
            await v.save();
            variantId = v._id;
        }
        console.log('Updated variants price to 10000, cost to 2000');

        if (!variantId) {
            console.log('No variant found for product');
            process.exit(1);
        }

        // 4. Find or Create Purchase Order
        let po = await PurchaseOrder.findOne({ note: /Fix PayOS/ });
        if (!po) {
            po = new PurchaseOrder({
                supplier_id: 1,
                supplier_name: 'Nhà cung cấp test (Fix)',
                total_amount: 2000000,
                status: 'COMPLETED',
                note: 'Fix PayOS Test Product Inventory'
            });
            await po.save();
            console.log('Created PurchaseOrder:', po._id);
        }

        // 5. Create PurchaseOrderItem
        let poi = await PurchaseOrderItem.findOne({ purchase_order_id: po._id, product_variant_id: variantId });
        if (!poi) {
            poi = new PurchaseOrderItem({
                purchase_order_id: po._id,
                product_variant_id: variantId,
                quantity: 1000,
                unit_cost: 2000
            });
            await poi.save();
            console.log('Created PurchaseOrderItem (Lot):', poi._id);
        }

        // 6. Retroactively fix existing OrderItems
        const orderItems = await OrderItem.find({ 'variant_snapshot.product_id': product._id });
        console.log(`Found ${orderItems.length} OrderItems to fix.`);

        for (const item of orderItems) {
            item.unit_price = 10000; // Update selling price just in case
            // Retroactively inject cost price lot deduction so profit is calculated correctly
            item.lots_deducted = [{
                poi_id: poi._id,
                quantity: item.total_quantity,
                cost_price: 2000
            }];
            await item.save();
        }
        console.log('Retroactively fixed OrderItems');

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixTestProduct();
