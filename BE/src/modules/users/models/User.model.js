const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const UserSchema = new mongoose.Schema({
    _id: { type: Number },
    customer_id: { type: Number, ref: 'Customer' },
    username: { type: String, required: true, unique: true }, // Dùng SĐT làm username
    password: { type: String, required: true },
    name: { type: String },
    avatar_url: { type: String },
    google_id: { type: String }
}, { timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' }, _id: false });

UserSchema.plugin(autoIncrement, { modelName: 'user_account_id' });

module.exports = mongoose.model('User', UserSchema);
