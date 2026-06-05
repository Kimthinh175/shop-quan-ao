const mongoose = require('mongoose');
const ProductService = require('../src/modules/catalog/services/catalog.service');
const Category = require('../src/modules/catalog/models/Category.model');
const Brand = require('../src/modules/catalog/models/Brand.model');

// Connect to DB
mongoose.connect('mongodb://localhost/shop').then(async () => {
    console.log('DB Connected');
    
    // Seed some basic categories and brands first if they don't exist
    let category = await Category.findOne();
    if (!category) {
        category = await Category.create({ name: "Áo Quần Nam", code: "MEN_CLOTHING" });
    }
    
    let brand = await Brand.findOne();
    if (!brand) {
        brand = await Brand.create({ name: "CLOSET", code: "CLOSET" });
    }

    const products = [
        {
            name: "Áo Thun Oversize Local Brand",
            description: "Áo thun form rộng thoải mái, chất liệu cotton 100% thoáng mát.",
            main_img: "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "TS-OV-BLK-M", size: "M", color: "Black", price: 250000, quantity: 100 },
                { sku: "TS-OV-BLK-L", size: "L", color: "Black", price: 250000, quantity: 120 },
                { sku: "TS-OV-WHT-M", size: "M", color: "White", price: 250000, quantity: 90 },
            ]
        },
        {
            name: "Quần Jeans Slimfit Nam",
            description: "Quần jeans nam dáng slimfit ôm vừa phải, chất denim co giãn.",
            main_img: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "JN-SL-BLU-29", size: "29", color: "Blue", price: 450000, quantity: 50 },
                { sku: "JN-SL-BLU-30", size: "30", color: "Blue", price: 450000, quantity: 70 },
                { sku: "JN-SL-BLK-30", size: "30", color: "Black", price: 450000, quantity: 45 },
                { sku: "JN-SL-BLK-31", size: "31", color: "Black", price: 450000, quantity: 30 },
            ]
        },
        {
            name: "Áo Polo Nam Cổ Bẻ Trơn",
            description: "Áo polo lịch lãm, phù hợp mặc đi làm và đi chơi.",
            main_img: "https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "PL-TR-NAV-M", size: "M", color: "Navy", price: 320000, quantity: 200 },
                { sku: "PL-TR-NAV-L", size: "L", color: "Navy", price: 320000, quantity: 150 },
            ]
        },
        {
            name: "Áo Khoác Bomber Chống Nước",
            description: "Áo khoác bomber vải dù chống nước nhẹ, lót lụa bên trong.",
            main_img: "https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "JK-BM-GRN-L", size: "L", color: "Olive Green", price: 650000, quantity: 30 },
                { sku: "JK-BM-GRN-XL", size: "XL", color: "Olive Green", price: 650000, quantity: 25 },
                { sku: "JK-BM-BLK-L", size: "L", color: "Black", price: 650000, quantity: 40 },
            ]
        },
        {
            name: "Giày Sneaker Thể Thao Phản Quang",
            description: "Giày sneaker đế cao su đúc, có viền phản quang cá tính.",
            main_img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "SN-PQ-WHT-40", size: "40", color: "White", price: 850000, quantity: 15 },
                { sku: "SN-PQ-WHT-41", size: "41", color: "White", price: 850000, quantity: 20 },
                { sku: "SN-PQ-WHT-42", size: "42", color: "White", price: 850000, quantity: 12 },
                { sku: "SN-PQ-BLK-41", size: "41", color: "Black", price: 850000, quantity: 18 },
            ]
        },
        {
            name: "Mũ Lưỡi Trai Thêu Logo",
            description: "Mũ cap thêu logo nổi, khoá cài kim loại.",
            main_img: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "CP-LG-BLK-F", size: "Free Size", color: "Black", price: 150000, quantity: 300 },
                { sku: "CP-LG-BEI-F", size: "Free Size", color: "Beige", price: 150000, quantity: 250 },
            ]
        },
        {
            name: "Quần Short Kaki Nam",
            description: "Quần short ngang gối, chất kaki dày dặn đứng form.",
            main_img: "https://images.pexels.com/photos/8188190/pexels-photo-8188190.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "SH-KK-BEI-30", size: "30", color: "Beige", price: 290000, quantity: 60 },
                { sku: "SH-KK-BEI-32", size: "32", color: "Beige", price: 290000, quantity: 80 },
                { sku: "SH-KK-NAV-30", size: "30", color: "Navy", price: 290000, quantity: 45 },
            ]
        },
        {
            name: "Áo Sơ Mi Trắng Tay Dài",
            description: "Sơ mi Oxford tay dài cơ bản, must-have item cho mọi chàng trai.",
            main_img: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "SM-OX-WHT-M", size: "M", color: "White", price: 350000, quantity: 150 },
                { sku: "SM-OX-WHT-L", size: "L", color: "White", price: 350000, quantity: 180 },
                { sku: "SM-OX-WHT-XL", size: "XL", color: "White", price: 350000, quantity: 120 },
            ]
        },
        {
            name: "Balo Vải Canvas Chống Nước",
            description: "Balo sức chứa 20L, vừa laptop 15.6 inch, thiết kế retro.",
            main_img: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "BP-CV-BLK-F", size: "Free Size", color: "Black", price: 490000, quantity: 80 },
                { sku: "BP-CV-GRY-F", size: "Free Size", color: "Grey", price: 490000, quantity: 65 },
            ]
        },
        {
            name: "Tất Vớ Cotton Cổ Thấp (Set 3 đôi)",
            description: "Tất vớ cotton thấm hút mồ hôi, co giãn 4 chiều.",
            main_img: "https://images.pexels.com/photos/3382817/pexels-photo-3382817.jpeg",
            category_id: category._id,
            brand_id: brand._id,
            variants: [
                { sku: "SK-CT-MIX-F", size: "Free Size", color: "Mixed", price: 90000, quantity: 500 },
                { sku: "SK-CT-WHT-F", size: "Free Size", color: "White", price: 90000, quantity: 400 },
            ]
        }
    ];

    try {
        for (const prod of products) {
            await ProductService.create(prod);
            console.log(`Đã tạo: ${prod.name}`);
        }
        console.log('Import hoàn tất!');
    } catch (err) {
        console.error('Lỗi khi import:', err);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error('Lỗi kết nối DB:', err);
});
