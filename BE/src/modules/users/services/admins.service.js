const Admin = require('../models/Admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../core/middlewares/auth');

class AdminService {
    async login(username, password) {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            throw new Error('Sai tài khoản hoặc mật khẩu');
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new Error('Sai tài khoản hoặc mật khẩu');
        }

        // Tạo token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role, type: 'staff' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            admin: { _id: admin._id, username: admin.username, role: admin.role, name: admin.name, avatar_url: admin.avatar_url },
            token
        };
    }

    async register(data) {
        const existingAdmin = await Admin.findOne({ username: data.username });
        if (existingAdmin) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const newAdmin = await Admin.create({
            ...data,
            raw_password: data.password, // Lưu lại pass nguyên thủy
            password: hashedPassword
        });

        return { _id: newAdmin._id, username: newAdmin.username, role: newAdmin.role, name: newAdmin.name, raw_password: newAdmin.raw_password };
    }

    async getAll() {
        return Admin.find().select('-password').sort('-_id');
    }

    async getById(id) {
        return Admin.findById(id).select('-password');
    }

    async update(id, data) {
        if (data.password) {
            data.raw_password = data.password; // Cập nhật pass nguyên thủy
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return Admin.findByIdAndUpdate(id, data, { new: true }).select('-password');
    }

    async delete(id) {
        return Admin.findByIdAndDelete(id);
    }
}

module.exports = new AdminService();
