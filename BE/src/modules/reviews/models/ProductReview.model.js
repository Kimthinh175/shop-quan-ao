const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');
const paginate = require('../../../core/utils/paginate');

const ProductReviewSchema = new mongoose.Schema({
    _id: { type: Number },
    product_id: { type: Number, ref: 'Product', required: true },
    user_id: { type: Number, ref: 'User', required: true }, // Tài khoản khách hàng online
    order_item_id: { type: Number, ref: 'OrderItem', required: true, unique: true }, // 1 item chỉ được review 1 lần
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    images: [{ type: String }], // Max 5 ảnh
}, { timestamps: true });

ProductReviewSchema.plugin(autoIncrement, { model: 'product_review_id' });
ProductReviewSchema.plugin(paginate);

// Cập nhật điểm đánh giá cho Product sau khi thêm/sửa review
ProductReviewSchema.post('save', async function() {
    await updateProductRating(this.product_id);
});

ProductReviewSchema.post('remove', async function() {
    await updateProductRating(this.product_id);
});

async function updateProductRating(productId) {
    const Product = mongoose.model('Product');
    const ProductReview = mongoose.model('ProductReview');

    const result = await ProductReview.aggregate([
        { $match: { product_id: productId } },
        { 
            $group: { 
                _id: '$product_id', 
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            } 
        }
    ]);

    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rate: Number(result[0].avgRating.toFixed(1)),
            review_count: result[0].reviewCount
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rate: 0,
            review_count: 0
        });
    }
}

module.exports = mongoose.model('ProductReview', ProductReviewSchema);
