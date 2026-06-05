const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const BrandSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });

BrandSchema.plugin(autoIncrement, { model: 'brand_id' });

module.exports = mongoose.model('Brand', BrandSchema);
