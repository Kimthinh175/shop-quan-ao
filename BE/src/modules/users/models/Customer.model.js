const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const AddressSchema = new mongoose.Schema({
    _id: { type: Number },
    recipient_name: { type: String, required: true },
    phone: { type: String, required: true },
    street_address: { type: String, required: true },
    ward: { type: String },
    district: { type: String },
    province: { type: String },
    is_default: { type: Boolean, default: false }
});

const CustomerSchema = new mongoose.Schema({
    _id: { type: Number },
    full_name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    points: { type: Number, default: 0 },
    addresses: [AddressSchema],
    created_at: { type: Date, default: Date.now }
}, { timestamps: true, _id: false });

CustomerSchema.plugin(autoIncrement, { modelName: 'customer_id' });

module.exports = mongoose.model('Customer', CustomerSchema);
