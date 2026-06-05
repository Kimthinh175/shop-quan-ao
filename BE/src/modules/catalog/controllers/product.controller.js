const catalogService = require('../services/catalog.service');

const getProducts = async (req, res, next) => {
    try {
        const { cursor, direction, limit, category_id, brand_id, season_id, gender_id, sport_id, material_id, form_id, sort, keyword, min_price, max_price, size, color } = req.query;
        const products = await catalogService.getAll({ 
            cursor,
            direction,
            limit: parseInt(limit) || 10, 
            category_id, 
            brand_id,
            season_id,
            gender_id,
            sport_id,
            material_id,
            form_id,
            sort,
            keyword,
            min_price,
            max_price,
            size,
            color
        });
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

const filterService = require('../services/filter.service');

const getFilterOptions = async (req, res, next) => {
    try {
        const data = await filterService.getFilterOptions();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await catalogService.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const product = await catalogService.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await catalogService.update(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await catalogService.delete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFilterOptions
};
