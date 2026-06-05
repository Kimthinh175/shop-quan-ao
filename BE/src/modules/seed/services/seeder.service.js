const mongoose = require('mongoose');
const User = require('../../users/models/User.model');
const Customer = require('../../users/models/Customer.model');
const Product = require('../../catalog/models/Product.model');
const Category = require('../../catalog/models/Category.model');
const Supplier = require('../../inventory/models/Supplier.model');
const Inventory = require('../../inventory/models/Inventory.model');
const Voucher = require('../../promotions/models/Voucher.model');
const Order = require('../../checkout/models/Order.model');
const Payment = require('../../checkout/models/Payment.model');
const Article = require('../../content/models/Article.model');
const PurchaseOrder = require('../../inventory/models/PurchaseOrder.model');
const Counter = require('../../../core/models/Counter.model');

const seedData = async () => {
  try {
    console.log('--- Bắt đầu Seeding dữ liệu toàn hệ thống ---');

    // 1. Xóa toàn bộ dữ liệu cũ
    const models = [User, Customer, Product, Category, Supplier, Inventory, Voucher, Order, Payment, Article, PurchaseOrder, Counter];
    for (const model of models) {
      await model.deleteMany({});
    }
    console.log('✅ Đã dọn dẹp Database');

    // 2. Seed Users (Nhân viên)
    const users = await User.insertMany([
      { _id: 1, username: 'admin', password: '123', role: 'admin' },
      { _id: 2, username: 'staff1', password: '123', role: 'cashier' },
      { _id: 3, username: 'staff2', password: '123', role: 'warehouse' }
    ]);
    console.log('✅ Đã tạo Nhân viên');

    // 3. Seed Categories
    const categories = await Category.insertMany([
      { _id: 1, name: 'Suits' },
      { _id: 2, name: 'Outerwear' },
      { _id: 3, name: 'Dresses' },
      { _id: 4, name: 'Trousers' },
      { _id: 5, name: 'Basics' }
    ]);
    console.log('✅ Đã tạo Danh mục');

    // 4. Seed Suppliers
    const suppliers = await Supplier.insertMany([
      { _id: 1, name: 'Xưởng may cao cấp Hà Nội', phone: '0912345678', address: '123 Cầu Giấy, HN' },
      { _id: 2, name: 'Vải lụa Bảo Lộc', phone: '0987654321', address: 'Bảo Lộc, Lâm Đồng' }
    ]);

    // 5. Seed Vouchers
    const vouchers = await Voucher.insertMany([
      { _id: 1, code: 'HELLO2026', name: 'Chào Xuân 2026', discount_type: 'percentage', discount_value: 10, min_order_value: 1000000, status: 'active' },
      { _id: 2, code: 'VIP100', name: 'Giảm 100k cho khách VIP', discount_type: 'fixed_amount', discount_value: 100000, min_order_value: 500000, status: 'active' }
    ]);

    // 6. Seed Customers
    const customers = await Customer.insertMany([
      { 
        _id: 1, 
        full_name: 'Nguyễn Văn A', 
        phone: '0900111222', 
        email: 'a@example.com', 
        points: 50,
        addresses: [{ _id: 1, recipient_name: 'Văn A', phone: '0900111222', street_address: '10 Hai Bà Trưng', province: 'Hà Nội', is_default: true }]
      },
      { 
        _id: 2, 
        full_name: 'Trần Thị B', 
        phone: '0900333444', 
        email: 'b@example.com', 
        points: 120,
        addresses: [{ _id: 2, recipient_name: 'Thị B', phone: '0900333444', street_address: '50 Lê Lợi', province: 'TP HCM', is_default: true }]
      }
    ]);

    // 7. Seed Products & Variants
    const productData = [
      {
        _id: 1,
        name: 'Classic Midnight Suit',
        category_id: 1,
        brand: 'Closet Elite',
        image: 'https://images.unsplash.com/photo-1594932224011-042041c62fed?w=800',
        variants: [
          { _id: 101, sku: 'SUIT-MID-S', size: 'S', color: 'Midnight Blue', price: 12500000, cost_price: 8000000 },
          { _id: 102, sku: 'SUIT-MID-M', size: 'M', color: 'Midnight Blue', price: 12500000, cost_price: 8000000 },
          { _id: 103, sku: 'SUIT-MID-L', size: 'L', color: 'Midnight Blue', price: 12500000, cost_price: 8000000 }
        ]
      },
      {
        _id: 2,
        name: 'Cashmere Overcoat',
        category_id: 2,
        brand: 'Serene Luxury',
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
        variants: [
          { _id: 201, sku: 'COAT-CASH-BE', size: 'M', color: 'Beige', price: 8900000, cost_price: 5500000 },
          { _id: 202, sku: 'COAT-CASH-BK', size: 'M', color: 'Black', price: 8900000, cost_price: 5500000 }
        ]
      },
      {
        _id: 3,
        name: 'Silk Evening Dress',
        category_id: 3,
        brand: 'Luminous',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
        variants: [
          { _id: 301, sku: 'DRESS-SILK-S', size: 'S', color: 'Champagne', price: 15600000, cost_price: 10000000 },
          { _id: 302, sku: 'DRESS-SILK-M', size: 'M', color: 'Champagne', price: 15600000, cost_price: 10000000 }
        ]
      }
    ];

    const products = await Product.insertMany(productData);
    console.log('✅ Đã tạo Sản phẩm & Biến thể');

    // 8. Seed Inventory & Purchase Orders (Mô phỏng nhập kho)
    for (const p of productData) {
      for (const v of p.variants) {
        // Tạo tồn kho
        await Inventory.create({
          product_id: p._id,
          variant_id: v._id,
          quantity: 20 // Mỗi loại nhập 20 cái
        });
      }
    }

    // 9. Seed Orders & Payments (Mô phỏng bán hàng)
    const orders = await Order.insertMany([
      {
        _id: 1,
        customer_id: 1,
        user_id: 2,
        subtotal: 12500000,
        total_amount: 12500000,
        order_status: 'completed',
        items: [
          { sku: 'SUIT-MID-S', product_name: 'Classic Midnight Suit', size: 'S', color: 'Midnight Blue', quantity: 1, unit_price: 12500000 }
        ]
      }
    ]);

    await Payment.create({
      _id: 1,
      order_id: 1,
      payment_method: 'BANK_TRANSFER',
      amount: 12500000,
      status: 'success',
      paid_at: new Date()
    });
    console.log('✅ Đã tạo Đơn hàng & Thanh toán');

    // 10. Seed Articles
    await Article.insertMany([
      {
        _id: 1,
        title: "L'Essentiel Fall/Winter 2026",
        slug: 'winter-collection-2026',
        thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
        content: 'Khám phá bộ sưu tập mới nhất với chất liệu Cashmere thượng hạng...',
        author_id: 1,
        status: 'published'
      },
      {
        _id: 2,
        title: "Nghệ thuật phối đồ Quiet Luxury",
        slug: 'quiet-luxury-style',
        thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
        content: 'Bí quyết để trở nên sang trọng mà không cần phô trương logo...',
        author_id: 1,
        status: 'published'
      }
    ]);
    console.log('✅ Đã tạo Bài viết');

    // 11. Khởi tạo Counters (Quan trọng để các ID tiếp theo đúng số thứ tự)
    const counterNames = ['product_id', 'category_id', 'order_id', 'customer_id', 'user_id', 'inventory_id', 'article_id', 'supplier_id', 'voucher_id', 'payment_id'];
    for (const name of counterNames) {
      await Counter.create({ id: name, seq: 100 }); 
    }

    console.log('🚀 Seeding hoàn tất thành công!');
    return { message: 'Seeding hoàn tất!' };
  } catch (error) {
    console.error('❌ Lỗi Seeding:', error);
    throw error;
  }
};

module.exports = { seedData };
