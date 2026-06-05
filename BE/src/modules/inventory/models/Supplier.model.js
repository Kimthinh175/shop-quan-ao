const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const supplierSchema = new mongoose.Schema({
    _id: { type: Number },
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên nhà cung cấp'],
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

supplierSchema.plugin(autoIncrement, { modelName: 'Supplier' });

module.exports = mongoose.model('Supplier', supplierSchema);
