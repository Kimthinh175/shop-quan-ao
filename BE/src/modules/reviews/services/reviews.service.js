const ProductReview = require('../models/ProductReview.model');
const Order = require('../../checkout/models/Order.model');
const OrderItem = require('../../checkout/models/OrderItem.model');
const mongoose = require('mongoose');
const paginate = require('../../../core/utils/paginate');

class ReviewsService {
    async createReview(userId, data) {
        const { order_item_id, rating, content, images } = data;

        // 1. Kiểm tra OrderItem có tồn tại không
        const orderItem = await OrderItem.findById(order_item_id);
        if (!orderItem) throw new Error('Không tìm thấy sản phẩm trong đơn hàng này');

        // 2. Kiểm tra Đơn hàng (Order) có thuộc về user hiện tại không
        const order = await Order.findById(orderItem.order_id);
        if (!order) throw new Error('Không tìm thấy đơn hàng');
        
        if (order.customer_id !== data.customer_id) {
            throw new Error('Bạn không có quyền đánh giá sản phẩm của người khác');
        }
        
        // Kiểm tra xem đơn hàng đã COMPLETED chưa
        if (order.status !== 'COMPLETED') {
            throw new Error('Chỉ có thể đánh giá khi đơn hàng đã hoàn thành (COMPLETED)');
        }

        // 3. Kiểm tra xem đã review chưa (chống spam)
        const existingReview = await ProductReview.findOne({ order_item_id });
        if (existingReview) {
            throw new Error('Bạn đã đánh giá sản phẩm này rồi');
        }

        // 4. Lấy product_id từ ProductVariant
        const variantSnapshot = orderItem.variant_snapshot;
        if (!variantSnapshot || !variantSnapshot.product_id) {
            throw new Error('Lỗi dữ liệu: Không tìm thấy product_id trong chi tiết đơn hàng');
        }

        // 5. Tạo review
        const review = await ProductReview.create({
            product_id: variantSnapshot.product_id,
            user_id: userId,
            order_item_id: order_item_id,
            rating,
            content,
            images: images ? images.slice(0, 5) : [] // Tối đa 5 ảnh
        });

        return review;
    }

    async getReviewsByProductId(productId, query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const rating = query.rating;

        const filter = { product_id: productId };
        if (rating) filter.rating = rating;

        return await paginate(ProductReview, filter, {
            page,
            limit,
            sort: '-createdAt',
            populate: [
                { path: 'user_id', select: 'name avatar_url username' }
            ]
        });
    }

    async getMyReviews(userId, query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;

        return await paginate(ProductReview, { user_id: userId }, {
            page,
            limit,
            sort: '-createdAt',
            populate: [
                { path: 'product_id', select: 'name main_img' }
            ]
        });
    }

    async getPendingReviews(customerId) {
        // Tìm tất cả order của customer này có status = COMPLETED
        const completedOrders = await Order.find({ customer_id: customerId, status: 'COMPLETED' }).select('_id');
        const orderIds = completedOrders.map(o => o._id);

        if (orderIds.length === 0) return [];

        // Tìm tất cả OrderItems thuộc các order này
        const itemsToReview = await OrderItem.find({ order_id: { $in: orderIds } });

        // Tìm tất cả review đã viết bởi khách hàng này
        const reviewedItemIds = await ProductReview.find({ order_item_id: { $in: itemsToReview.map(i => i._id) } })
            .distinct('order_item_id');

        // Lọc ra các item chưa được review
        const pendingItems = itemsToReview.filter(item => !reviewedItemIds.includes(item._id));

        return pendingItems;
    }
}

module.exports = new ReviewsService();
