const reviewsService = require('../services/reviews.service');
const User = require('../../users/models/User.model');

class ReviewsController {
    async create(req, res) {
        try {
            const userId = req.user.id;
            
            // Lấy thông tin User để lấy customer_id (vì Order link với Customer)
            const user = await User.findById(userId);
            if (!user || !user.customer_id) {
                return res.status(403).json({ message: 'Tài khoản của bạn chưa liên kết với hồ sơ khách hàng (Customer)' });
            }

            // Truyền customerId vào data để check quyền sở hữu
            const data = { ...req.body, customer_id: user.customer_id };
            
            // Gọi service (sẽ update lại service để check customer_id)
            const review = await reviewsService.createReview(userId, data);
            res.status(201).json(review);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getByProduct(req, res) {
        try {
            const productId = req.params.productId;
            const result = await reviewsService.getReviewsByProductId(productId, req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMyReviews(req, res) {
        try {
            const userId = req.user.id;
            const result = await reviewsService.getMyReviews(userId, req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPendingReviews(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            if (!user || !user.customer_id) {
                return res.json([]); // Nếu chưa có thông tin mua hàng thì trả về rỗng
            }
            
            const result = await reviewsService.getPendingReviews(user.customer_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ReviewsController();
