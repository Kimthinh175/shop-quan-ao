const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');
const paginate = require('../../../core/utils/paginate');

const ProductSchema = new mongoose.Schema({
    _id: { type: Number },
    category_id: [{ type: Number, ref: 'Category' }],
    brand_id: { type: Number, ref: 'Brand' },
    season_id: [{ type: Number, ref: 'Season' }],
    gender_id: [{ type: Number, ref: 'Gender' }],
    sport_id: [{ type: Number, ref: 'Sport' }],
    material_id: [{ type: Number, ref: 'Material' }],
    form_id: [{ type: Number, ref: 'Form' }],
    name: { type: String, required: true },
    default_price: { type: Number, default: 0 },
    main_img: { type: String },
    images: [{ type: String }],
    description: { type: String },
    rate: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'DRAFT' }
}, { timestamps: true });

ProductSchema.plugin(autoIncrement, { model: 'product_id' });
ProductSchema.plugin(paginate);

module.exports = mongoose.model('Product', ProductSchema);
