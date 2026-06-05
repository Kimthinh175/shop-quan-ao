const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const GenderSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });

GenderSchema.plugin(autoIncrement, { model: 'gender_id' });

module.exports = mongoose.model('Gender', GenderSchema);
