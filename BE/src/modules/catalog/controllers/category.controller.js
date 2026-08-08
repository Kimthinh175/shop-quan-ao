const categoryService = require('../services/category.service');

const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllWithCount();
        // Send back full objects to the client, including parent_id
        const fullCategories = await require('../models/Category.model').find().lean();
        
        // Merge count data with full categories
        const merged = fullCategories.map(cat => {
            const match = categories.find(c => c.id === cat._id);
            return { ...cat, count: match ? match.count : 0 };
        });

        res.status(200).json(merged);
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.update(req.params.id, req.body);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.delete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        // Return 400 for constraints violations like having products
        if (error.message.includes('Cannot delete')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
