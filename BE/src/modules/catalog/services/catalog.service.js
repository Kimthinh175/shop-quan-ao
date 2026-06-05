const Product = require('../models/Product.model');
const ProductVariant = require('../models/ProductVariant.model');
const Category = require('../models/Category.model');
const Brand = require('../models/Brand.model');
require('../models/Season.model');
require('../models/Gender.model');
require('../models/Sport.model');
require('../models/Material.model');
require('../models/Form.model');
const paginate = require('../../../core/utils/paginate');

class ProductService {
    async create(data) {
        const { variants, ...productData } = data;
        const newProduct = await Product.create(productData);

        let createdVariants = [];
        if (variants && Array.isArray(variants) && variants.length > 0) {
            const variantPromises = variants.map(v => {
                return ProductVariant.create({
                    ...v,
                    product_id: newProduct._id
                });
            });
            createdVariants = await Promise.all(variantPromises);
        }

        return {
            ...newProduct.toObject(),
            variants: createdVariants
        };
    }

    async getAll(params) {
        const { cursor, direction, limit = 10, category_id, brand_id, season_id, gender_id, sport_id, material_id, form_id, sort = '-_id', keyword, min_price, max_price, size, color } = params;
        const query = { status: { $ne: 'INACTIVE' } };
        
        if (category_id) query.category_id = category_id;
        if (brand_id) query.brand_id = brand_id;
        if (season_id) query.season_id = season_id;
        if (gender_id) query.gender_id = gender_id;
        if (sport_id) query.sport_id = sport_id;
        if (material_id) query.material_id = material_id;
        if (form_id) query.form_id = form_id;

        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        // Handle variant filters
        const variantQuery = {};
        if (min_price || max_price) {
            variantQuery.price = {};
            if (min_price) variantQuery.price.$gte = Number(min_price);
            if (max_price) variantQuery.price.$lte = Number(max_price);
        }
        if (size) variantQuery.size = size;
        if (color) variantQuery.color = color;

        // If there's any variant filter, find matching product_ids first
        if (Object.keys(variantQuery).length > 0) {
            const matchingVariants = await ProductVariant.find(variantQuery).select('product_id').lean();
            const matchedProductIds = matchingVariants.map(v => v.product_id);
            query._id = { $in: matchedProductIds };
        }

        const result = await Product.paginate(query, { 
            cursor, 
            direction,
            limit, 
            sortBy: sort,
            select: '-createdAt -updatedAt -__v'
        });
        
        const productIds = result.results.map(p => p._id);
        const allVariants = await ProductVariant.find({ product_id: { $in: productIds } })
            .select('-cost_price -lots_history -current_lot -current_lot_sold -createdAt -updatedAt -__v')
            .lean();

        result.results = result.results.map(p => {
            const productObj = p.toObject();
            productObj.variants = allVariants.filter(v => v.product_id === productObj._id);
            return productObj;
        });

        return result;
    }

    async getById(id) {
        const product = await Product.findOne({ _id: id, status: { $ne: 'INACTIVE' } }).populate('category_id brand_id season_id gender_id sport_id material_id form_id');
        if (!product) return null;

        const variants = await ProductVariant.find({ product_id: id });
        
        return {
            ...product.toObject(),
            variants
        };
    }

    async update(id, data) {
        const { variants, ...productData } = data;
        
        const updatedProduct = await Product.findOneAndUpdate({ _id: id, status: { $ne: 'INACTIVE' } }, productData, { new: true });
        if (!updatedProduct) return null;

        if (variants && Array.isArray(variants)) {
            const variantIds = variants.filter(v => v._id).map(v => v._id);
            await ProductVariant.deleteMany({ product_id: id, _id: { $nin: variantIds } });

            for (const v of variants) {
                if (v._id) {
                    await ProductVariant.findByIdAndUpdate(v._id, v);
                } else {
                    await ProductVariant.create({ ...v, product_id: id });
                }
            }
        }

        return this.getById(id);
    }

    async delete(id) {
        const product = await Product.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
        if (!product) return null;

        // Optionally, we can also deactivate variants, but hiding the product is usually enough
        return product;
    }
}

module.exports = new ProductService();
