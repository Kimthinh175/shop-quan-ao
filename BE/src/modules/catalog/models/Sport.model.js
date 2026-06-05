const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const SportSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });

SportSchema.plugin(autoIncrement, { model: 'sport_id' });

module.exports = mongoose.model('Sport', SportSchema);
