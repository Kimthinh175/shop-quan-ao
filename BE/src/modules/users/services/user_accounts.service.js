const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../core/middlewares/auth');

class UserAccountService {
    async registerOnline(data) {
        const { phone, name, password, fingerprint } = data;
        
        // 1. Kiểm tra username (phone) trong bảng User xem đã có chưa
        let existingUser = await User.findOne({ username: phone });
        if (existingUser) {
            throw new Error('Số điện thoại này đã tồn tại, vui lòng đăng nhập để xác minh !');
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

        return this._generateAuthResponse(newUser, customer, fingerprint);
    }

    async login(phone, password, fingerprint) {
        const user = await User.findOne({ username: phone });
        if (!user) {
            throw new Error('Tài khoản không tồn tại.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Sai mật khẩu.');
        }

        const customer = await Customer.findById(user.customer_id);

        return this._generateAuthResponse(user, customer, fingerprint);
    }

    async loginWithOtp(phone, fingerprint) {
        let user = await User.findOne({ username: phone });
        let customer;

        if (!user) {
            // Auto register via OTP
            customer = await Customer.findOne({ phone });
            if (!customer) {
                customer = await Customer.create({ phone, full_name: 'Khách hàng ' + phone.slice(-4) });
            }

            // Create User account with random password since they use OTP
            const randomPass = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPass, salt);

            user = await User.create({
                username: phone,
                name: customer.full_name,
                password: hashedPassword,
                customer_id: customer._id
            });
        } else {
            customer = await Customer.findById(user.customer_id);
        }

        return this._generateAuthResponse(user, customer, fingerprint);
    }

    async loginWithGoogle(email, name, googleId, avatarUrl, fingerprint) {
        let user = await User.findOne({ $or: [{ google_id: googleId }, { email: email }] });
        let customer;

        if (!user) {
            // Auto register via Google
            // Since we need phone for Customer, and Google might not provide phone, we will use a dummy phone or email.
            // But username must be unique. Let's use email as username if phone is not available.
            const username = email;
            
            customer = await Customer.create({ phone: 'GG_' + googleId.slice(-8), full_name: name });

            const randomPass = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPass, salt);

            user = await User.create({
                username: username,
                email: email,
                name: name,
                password: hashedPassword,
                google_id: googleId,
                avatar_url: avatarUrl,
                customer_id: customer._id
            });
        } else {
            customer = await Customer.findById(user.customer_id);
            // Update missing google info if necessary
            if (!user.google_id) {
                user.google_id = googleId;
                await user.save();
            }
        }

        return this._generateAuthResponse(user, customer, fingerprint);
    }

    _generateAuthResponse(user, customer, fingerprint) {
        // Token lưu id của User và customer_id
        const token = jwt.sign(
            { id: user._id, customer_id: user.customer_id, type: 'user', fingerprint },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        return {
            user: { _id: user._id, username: user.username, name: user.name, customer_id: user.customer_id, avatar_url: user.avatar_url },
            customer_profile: customer ? { points: customer.points, full_name: customer.full_name } : null,
            token
        };
    }
}

module.exports = new UserAccountService();
