const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const FormSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
}, { timestamps: true });

FormSchema.plugin(autoIncrement, { model: 'form_id' });

module.exports = mongoose.model('Form', FormSchema);
