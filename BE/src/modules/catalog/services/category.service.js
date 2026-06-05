const Category = require('../models/Category.model');
const Product = require('../models/Product.model');

class CategoryService {
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
}

module.exports = new CategoryService();
