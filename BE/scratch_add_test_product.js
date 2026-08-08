const mongoose = require('mongoose');
const Product = require('./src/modules/catalog/models/Product.model');
const ProductVariant = require('./src/modules/catalog/models/ProductVariant.model');

// Kết nối DB
mongoose.connect('mongodb://localhost:27017/shop').then(async () => {
    console.log('Connected to DB');

    // Xóa sản phẩm test cũ (dù là ObjectId hay Number)
    await Product.deleteMany({ name: "Sản phẩm test PayOS 2K" });
    
    // Xóa variants rác
    await ProductVariant.deleteMany({ sku: "TEST-2K-M" });

    // Tạo sản phẩm mới qua model của dự án để ăn autoIncrement
    const testProduct = new Product({
        name: "Sản phẩm test PayOS 2K",
        category_id: 1, // Quần áo nam
        brand_id: 1, // Closet
        main_img: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800",
        description: "Sản phẩm này được tạo tự động để test tính năng thanh toán PayOS. Giá 2000 VND.",
        status: 'ACTIVE'
    });

    await testProduct.save();

    // Tạo variant
    const variant = new ProductVariant({
        product_id: testProduct._id,
        sku: "TEST-2K-M",
        size: "M",
        color: "Xanh Đen",
        price: 2000,
        quantity: 100
    });

    await variant.save();

    console.log('Tạo thành công sản phẩm test: ', testProduct.name, ' - ID:', testProduct._id, ' - Giá: 2000đ');

    mongoose.disconnect();
}).catch(err => {
    console.error(err);
    mongoose.disconnect();
});
