const Category = require('../models/Category.model');
const Brand = require('../models/Brand.model');
const Season = require('../models/Season.model');
const Gender = require('../models/Gender.model');
const Sport = require('../models/Sport.model');
const Material = require('../models/Material.model');
const Form = require('../models/Form.model');
const ProductVariant = require('../models/ProductVariant.model');
const categoryService = require('./category.service');

class FilterMetadataService {
    async getFilterOptions() {
        // Gọi lại các service/model khác để lấy data
        const [
            categories,
            brands,
            seasons,
            genders,
            sports,
            materials,
            forms,
            sizes,
            colors
        ] = await Promise.all([
            categoryService.getAllWithCount(),
            Brand.find().lean(),
            Season.find().lean(),
            Gender.find().lean(),
            Sport.find().lean(),
            Material.find().lean(),
            Form.find().lean(),
            ProductVariant.distinct('size'),
            ProductVariant.distinct('color')
        ]);

        return {
            categories,
            brands,
            seasons,
            genders,
            sports,
            materials,
            forms,
            sizes: sizes.filter(Boolean),
            colors: colors.filter(Boolean)
        };
    }
}

module.exports = new FilterMetadataService();
