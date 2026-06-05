const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../core/middlewares/auth');

class UserAccountService {
    async registerOnline(data) {
        const { phone, name, password } = data;
        
        // 1. Kiểm tra username (phone) trong bảng User xem đã có chưa
        let existingUser = await User.findOne({ username: phone });
        if (existingUser) {
            throw new Error('Số điện thoại này đã đăng ký tài khoản Online.');
        }

        // 2. Tìm hoặc Tạo Customer
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = await Customer.create({ phone, full_name: name });
        } else if (!customer.full_name && name) {
            customer.full_name = name;
            await customer.save();
        }

        // 3. Tạo User account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username: phone,
            name: name,
            password: hashedPassword,
            customer_id: customer._id
        });

        return this._generateAuthResponse(newUser, customer);
    }

    async login(phone, password) {
        const user = await User.findOne({ username: phone });
        if (!user) {
            throw new Error('Tài khoản không tồn tại.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Sai mật khẩu.');
        }

        const customer = await Customer.findById(user.customer_id);

        return this._generateAuthResponse(user, customer);
    }

    _generateAuthResponse(user, customer) {
        // Token lưu id của User và customer_id
        const token = jwt.sign(
            { id: user._id, customer_id: user.customer_id, type: 'user' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        return {
            user: { _id: user._id, username: user.username, name: user.name, customer_id: user.customer_id },
            customer_profile: customer ? { points: customer.points, full_name: customer.full_name } : null,
            token
        };
    }
}

module.exports = new UserAccountService();
