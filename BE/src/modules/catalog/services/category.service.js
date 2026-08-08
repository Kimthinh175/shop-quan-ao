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
                    parent_id: cat.parent_id,
                    count: count
                };
            })
        );
    }
    async create(data) {
        return await Category.create(data);
    }

    async update(id, data) {
        return await Category.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        // Option 1: Prevent deletion if products exist
        const count = await Product.countDocuments({ category_id: id });
        if (count > 0) throw new Error('Cannot delete category with associated products');
        
        // Also check if it has child categories
        const children = await Category.countDocuments({ parent_id: id });
        if (children > 0) throw new Error('Cannot delete category with child categories');

        return await Category.findByIdAndDelete(id);
    }
}

module.exports = new CategoryService();
