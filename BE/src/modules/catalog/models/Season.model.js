const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const SeasonSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });

SeasonSchema.plugin(autoIncrement, { model: 'season_id' });

module.exports = mongoose.model('Season', SeasonSchema);
