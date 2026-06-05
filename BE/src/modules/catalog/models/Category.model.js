const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const CategorySchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    parent_id: { type: Number, ref: 'Category', default: null }
}, { timestamps: true, _id: false });

CategorySchema.plugin(autoIncrement, { modelName: 'category_id' });

module.exports = mongoose.model('Category', CategorySchema);
