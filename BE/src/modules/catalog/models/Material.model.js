const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const MaterialSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });

MaterialSchema.plugin(autoIncrement, { model: 'material_id' });

module.exports = mongoose.model('Material', MaterialSchema);
