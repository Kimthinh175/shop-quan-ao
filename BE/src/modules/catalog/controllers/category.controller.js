const categoryService = require('../services/category.service');

const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllWithCount();
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories
};
