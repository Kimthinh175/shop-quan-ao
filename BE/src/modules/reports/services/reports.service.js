const Order = require('../../checkout/models/Order.model');
const OrderItem = require('../../checkout/models/OrderItem.model');
const Customer = require('../../users/models/Customer.model');
const ProductVariant = require('../../catalog/models/ProductVariant.model');
const Category = require('../../catalog/models/Category.model');
const mongoose = require('mongoose');

class ReportsService {
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Compute all metrics in parallel from DB
        const [
            revenueStats,
            orderStats,
            newCustomers,
            cogsStats,
            topProducts,
            lowStock,
            chartData,
            recentOrders,
            categoryStats
        ] = await Promise.all([
            // 1. Total Revenue
            Order.aggregate([
                { $match: { status: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, totalRevenue: { $sum: '$total_amount' } } }
            ]),

            // 2. Total Order Count
            Order.countDocuments({ status: { $ne: 'CANCELLED' } }),

            // 3. New Customers this month
            Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),

            // 4. COGS (Cost of goods sold)
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

            // 5. Top 5 Best Selling Variants
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

            // 6. Low stock items (quantity < 10)
            ProductVariant.aggregate([
                { $match: { quantity: { $lt: 10 } } },
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

            // 7. Revenue 7 Days Chart Data
            Order.aggregate([
                {
                    $match: {
                        status: { $ne: 'CANCELLED' },
                        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                        revenue: { $sum: '$total_amount' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // 8. Recent 5 Orders from Database
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            // 9. Category Breakdown from Database
            Category.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'category_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        name: 1,
                        count: { $size: '$products' }
                    }
                },
                { $limit: 5 }
            ])
        ]);

        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
        const totalCOGS = cogsStats.length > 0 ? cogsStats[0].totalCOGS : 0;
        const totalProfit = totalRevenue - totalCOGS;

        // Color palette for category donut chart
        const colorPalette = ['#4f46e5', '#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899'];
        const formattedCategories = (categoryStats || []).map((cat, idx) => ({
            name: cat.name,
            count: cat.count || 0,
            color: colorPalette[idx % colorPalette.length]
        }));

        return {
            overview: {
                totalRevenue,
                totalProfit,
                totalOrders: orderStats,
                newCustomers
            },
            charts: {
                revenue7Days: chartData,
                categories: formattedCategories
            },
            topProducts,
            lowStock,
            recentOrders
        };
    }
}

module.exports = new ReportsService();
