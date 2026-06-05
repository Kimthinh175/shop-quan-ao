const Order = require('../../checkout/models/Order.model');
const OrderItem = require('../../checkout/models/OrderItem.model');
const Customer = require('../../users/models/Customer.model');
const ProductVariant = require('../../catalog/models/ProductVariant.model');
const mongoose = require('mongoose');

class ReportsService {
    async getDashboardStats() {
        // Lấy ngày đầu tháng hiện tại
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Tính toán các metric tổng quan song song
        const [
            revenueStats,
            orderStats,
            newCustomers,
            cogsStats,
            topProducts,
            lowStock,
            chartData
        ] = await Promise.all([
            // 1. Tổng doanh thu (Chỉ tính đơn đã thanh toán hoặc COD đã hoàn thành, ở đây tính đơn ko bị Cancel)
            Order.aggregate([
                { $match: { status: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, totalRevenue: { $sum: '$total_amount' } } }
            ]),

            // 2. Tổng số đơn hàng
            Order.countDocuments({ status: { $ne: 'CANCELLED' } }),

            // 3. Số khách hàng mới trong tháng
            Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),

            // 4. Tổng giá vốn (COGS) để tính Lợi nhuận
            OrderItem.aggregate([
                { $unwind: '$lots_deducted' },
                { 
                    $group: { 
                        _id: null, 
                        totalCOGS: { 
                            $sum: { $multiply: ['$lots_deducted.quantity', '$lots_deducted.cost_price'] } 
                        } 
                    } 
                }
            ]),

            // 5. Top 5 sản phẩm bán chạy
            ProductVariant.aggregate([
                { $sort: { sold: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        _id: 1,
                        sku: 1,
                        name: '$product.name',
                        sold: 1,
                        quantity: 1,
                        main_img: '$product.main_img',
                        price: 1
                    }
                }
            ]),

            // 6. Sản phẩm sắp hết hàng (Tồn kho < 10)
            ProductVariant.aggregate([
                { $match: { quantity: { $lt: 10, $gt: 0 } } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        _id: 1,
                        sku: 1,
                        name: '$product.name',
                        quantity: 1,
                        main_img: '$product.main_img'
                    }
                }
            ]),

            // 7. Biểu đồ doanh thu 7 ngày gần nhất
            Order.aggregate([
                {
                    $match: {
                        status: { $ne: 'CANCELLED' },
                        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: '$total_amount' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
        const totalCOGS = cogsStats.length > 0 ? cogsStats[0].totalCOGS : 0;
        const totalProfit = totalRevenue - totalCOGS;

        return {
            overview: {
                totalRevenue,
                totalProfit,
                totalOrders: orderStats,
                newCustomers
            },
            charts: {
                revenue7Days: chartData
            },
            topProducts,
            lowStock
        };
    }
}

module.exports = new ReportsService();
