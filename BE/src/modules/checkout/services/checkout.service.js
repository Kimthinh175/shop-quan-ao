const Category = require('../../catalog/models/Category.model');
const Product = require('../../catalog/models/Product.model');

class CheckoutService {
    // Lấy danh mục để hiển thị trong quá trình lọc hoặc checkout
    async getAllWithCount() {
        const categories = await Category.find();
        return await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({ category_id: cat._id });
                return {
                    id: cat._id,
                    name: cat.name,
                    count: count
                };
            })
        );
    }

    // Logic xử lý đặt hàng sẽ thêm ở đây sau
    async processOrder(orderData) {
        // ...
    }
}

module.exports = new CheckoutService();
