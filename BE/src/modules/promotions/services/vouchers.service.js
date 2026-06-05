const Voucher = require('../models/Voucher.model');
const paginate = require('../../../core/utils/paginate');

class VoucherService {
    async create(data) {
        if (!data.code || !data.name || !data.discount_type || !data.discount_value) {
            throw new Error('Vui lòng nhập đầy đủ các trường bắt buộc');
        }
        if (data.discount_type === 'percentage' && data.discount_value > 100) {
            throw new Error('Phần trăm giảm không được vượt quá 100%');
        }
        data.code = data.code.toUpperCase();
        
        const existing = await Voucher.findOne({ code: data.code });
        if (existing) throw new Error('Mã Voucher đã tồn tại');

        const voucher = await Voucher.create(data);
        return voucher;
    }

    async update(id, data) {
        if (data.code) {
            data.code = data.code.toUpperCase();
            const existing = await Voucher.findOne({ code: data.code, _id: { $ne: id } });
            if (existing) throw new Error('Mã Voucher đã tồn tại');
        }

        const voucher = await Voucher.findByIdAndUpdate(id, data, { new: true });
        if (!voucher) throw new Error('Không tìm thấy Voucher');
        return voucher;
    }

    async delete(id) {
        const voucher = await Voucher.findByIdAndDelete(id);
        if (!voucher) throw new Error('Không tìm thấy Voucher');
        return voucher;
    }

    async getAll(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } }
            ];
        }
        if (query.status) {
            filter.status = query.status;
        }

        const [data, total] = await Promise.all([
            Voucher.find(filter).sort('-createdAt').skip(skip).limit(limit),
            Voucher.countDocuments(filter)
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

    // Frontend gọi để validate
    async checkVoucher(code, orderValue) {
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });
        if (!voucher) throw new Error('Mã giảm giá không tồn tại');
        
        if (voucher.status !== 'active') {
            throw new Error('Mã giảm giá đã vô hiệu hóa');
        }

        const now = new Date();
        if (voucher.start_date && now < voucher.start_date) {
            throw new Error('Mã giảm giá chưa đến thời gian áp dụng');
        }
        if (voucher.end_date && now > voucher.end_date) {
            throw new Error('Mã giảm giá đã hết hạn');
        }

        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
            throw new Error('Mã giảm giá đã hết lượt sử dụng');
        }

        if (orderValue < voucher.min_order_value) {
            throw new Error(`Đơn hàng phải từ ${voucher.min_order_value}đ để áp dụng mã này`);
        }

        let discount = 0;
        if (voucher.discount_type === 'fixed_amount') {
            discount = voucher.discount_value;
        } else if (voucher.discount_type === 'percentage') {
            discount = (orderValue * voucher.discount_value) / 100;
            if (voucher.max_discount_amount && discount > voucher.max_discount_amount) {
                discount = voucher.max_discount_amount;
            }
        }

        return {
            voucher,
            discount
        };
    }
}

module.exports = new VoucherService();
