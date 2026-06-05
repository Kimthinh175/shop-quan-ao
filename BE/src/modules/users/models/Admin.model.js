const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const AdminSchema = new mongoose.Schema({
    _id: { type: Number },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    raw_password: { type: String }, // Lưu password chưa hash theo yêu cầu (Chỉ dùng cho Debug/Dev)
    name: { type: String },
    avatar_url: { type: String },
    log: { type: String },
    role: { type: String, enum: ['admin', 'cashier', 'warehouse'], default: 'cashier' }
}, { timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' }, _id: false });

AdminSchema.plugin(autoIncrement, { modelName: 'admin_id' });

module.exports = mongoose.model('Admin', AdminSchema);
