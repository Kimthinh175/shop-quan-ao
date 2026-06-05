const Customer = require('../models/Customer.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../core/middlewares/auth');

class CustomerService {
    // 1. Tạo Customer Offline (Tại quầy)
    async createOffline(data) {
        const { phone, full_name } = data;
        let customer = await Customer.findOne({ phone });
        
        if (customer) {
            return customer; // Đã tồn tại thì trả về luôn để POS dùng tích điểm
        }

        // Tạo mới (không có password)
        customer = await Customer.create({ phone, full_name });
        return customer;
    }

    // 2. Đăng ký Customer Online
    async registerOnline(data) {
        const { phone, full_name, password, email } = data;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let customer = await Customer.findOne({ phone });
        
        if (customer) {
            // Nếu đã tồn tại nhưng có password rồi -> Đã tạo acc online
            if (customer.password) {
                throw new Error('Số điện thoại này đã được đăng ký tài khoản Online.');
            }
            // Nếu có sdt nhưng chưa có password -> Từng mua Offline, giờ Claim Account
            customer.password = hashedPassword;
            if (email) customer.email = email;
            if (full_name) customer.full_name = full_name;
            await customer.save();
        } else {
            // Khách mới hoàn toàn
            customer = await Customer.create({
                phone,
                full_name,
                email,
                password: hashedPassword
            });
        }

        return this._generateAuthResponse(customer);
    }

    // 3. Login Online
    async login(phone, password) {
        const customer = await Customer.findOne({ phone });
        if (!customer || !customer.password) {
            throw new Error('Tài khoản không tồn tại hoặc chưa đăng ký mật khẩu (Mua Offline).');
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            throw new Error('Sai mật khẩu.');
        }

        return this._generateAuthResponse(customer);
    }

    _generateAuthResponse(customer) {
        const token = jwt.sign(
            { id: customer._id, phone: customer.phone, type: 'customer' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        return {
            customer: { _id: customer._id, phone: customer.phone, full_name: customer.full_name, points: customer.points },
            token
        };
    }

    // 4. CRUD Profile & Admin
    async getById(id) {
        return Customer.findById(id).select('-password');
    }

    async update(id, data) {
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return Customer.findByIdAndUpdate(id, data, { new: true }).select('-password');
    }

    async getAll(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Customer.find()
                .select('-password')
                .sort('-_id')
                .skip(skip)
                .limit(limit),
            Customer.countDocuments()
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // 5. Quản lý địa chỉ (Address)
    async addAddress(customerId, addressData) {
        const customer = await Customer.findById(customerId);
        if (!customer) throw new Error('Customer không tồn tại');

        // Tạo ID tăng tự động cho address
        const nextId = customer.addresses.length > 0 
            ? Math.max(...customer.addresses.map(a => a._id || 0)) + 1 
            : 1;
        
        addressData._id = nextId;

        // Nếu là địa chỉ đầu tiên hoặc set default -> Xóa default cũ
        if (addressData.is_default || customer.addresses.length === 0) {
            addressData.is_default = true;
            customer.addresses.forEach(a => a.is_default = false);
        }

        customer.addresses.push(addressData);
        await customer.save();
        return customer.addresses;
    }

    async updateAddress(customerId, addressId, addressData) {
        const customer = await Customer.findById(customerId);
        if (!customer) throw new Error('Customer không tồn tại');

        const address = customer.addresses.id(addressId);
        if (!address) throw new Error('Địa chỉ không tồn tại');

        if (addressData.is_default) {
            customer.addresses.forEach(a => a.is_default = false);
        }

        Object.assign(address, addressData);
        await customer.save();
        return customer.addresses;
    }

    async deleteAddress(customerId, addressId) {
        const customer = await Customer.findById(customerId);
        if (!customer) throw new Error('Customer không tồn tại');

        customer.addresses.pull(addressId);
        await customer.save();
        return customer.addresses;
    }
}

module.exports = new CustomerService();
