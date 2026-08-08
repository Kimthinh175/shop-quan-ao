const Voucher = require('../models/Voucher.model');

class VoucherService {
    _toClient(voucher) {
        const doc = voucher.toObject ? voucher.toObject() : voucher;
        return {
            ...doc,
            type: doc.discount_type,
            value: doc.discount_value,
            max_uses: doc.usage_limit
        };
    }

    _normalizePayload(data = {}, existing = null) {
        const code = data.code?.trim().toUpperCase() || existing?.code;
        const type = data.type || data.discount_type || existing?.discount_type || 'percentage';
        const value = Number(data.value ?? data.discount_value ?? existing?.discount_value ?? 0);

        if (!code) throw new Error('Mã voucher là bắt buộc');
        if (value <= 0) throw new Error('Giá trị voucher phải lớn hơn 0');
        if (type === 'percentage' && value > 100) throw new Error('Phần trăm giảm không được vượt quá 100%');

        return {
            code,
            name: data.name?.trim() || existing?.name || code,
            discount_type: type,
            discount_value: value,
            min_order_value: Number(data.min_order_value ?? existing?.min_order_value ?? 0),
            max_discount_amount: data.max_discount_amount === null || data.max_discount_amount === ''
                ? undefined
                : Number(data.max_discount_amount ?? existing?.max_discount_amount ?? 0) || undefined,
            usage_limit: data.max_uses === null || data.max_uses === ''
                ? undefined
                : Number(data.max_uses ?? data.usage_limit ?? existing?.usage_limit ?? 0) || undefined,
            status: data.status || existing?.status || 'active',
            start_date: data.start_date ? new Date(data.start_date) : existing?.start_date,
            end_date: data.end_date ? new Date(data.end_date) : existing?.end_date
        };
    }

    async create(data) {
        const payload = this._normalizePayload(data);
        const existing = await Voucher.findOne({ code: payload.code });
        if (existing) throw new Error('Mã Voucher đã tồn tại');

        const voucher = await Voucher.create(payload);
        return this._toClient(voucher);
    }

    async update(id, data) {
        const currentVoucher = await Voucher.findById(id);
        if (!currentVoucher) throw new Error('Không tìm thấy Voucher');

        const payload = this._normalizePayload(data, currentVoucher);
        const existing = await Voucher.findOne({ code: payload.code, _id: { $ne: id } });
        if (existing) throw new Error('Mã Voucher đã tồn tại');

        const voucher = await Voucher.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        return this._toClient(voucher);
    }

    async delete(id) {
        const voucher = await Voucher.findByIdAndDelete(id);
        if (!voucher) throw new Error('Không tìm thấy Voucher');
        return this._toClient(voucher);
    }

    async getAll(query = {}) {
        const page = parseInt(query.page, 10) || 1;
        const limit = Math.min(parseInt(query.limit, 10) || 50, 100);
        const skip = (page - 1) * limit;

        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } }
            ];
        }
        if (query.status) filter.status = query.status;

        const [docs, total] = await Promise.all([
            Voucher.find(filter).sort('-createdAt').skip(skip).limit(limit),
            Voucher.countDocuments(filter)
        ]);

        const data = docs.map((voucher) => this._toClient(voucher));
        return {
            data,
            results: data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async checkVoucher(code, orderValue) {
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });
        if (!voucher) throw new Error('Mã giảm giá không tồn tại');

        if (voucher.status !== 'active') throw new Error('Mã giảm giá đã vô hiệu hóa');

        const now = new Date();
        if (voucher.start_date && now < voucher.start_date) throw new Error('Mã giảm giá chưa đến thời gian áp dụng');
        if (voucher.end_date && now > voucher.end_date) throw new Error('Mã giảm giá đã hết hạn');
        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) throw new Error('Mã giảm giá đã hết lượt sử dụng');
        if (orderValue < voucher.min_order_value) throw new Error(`Đơn hàng phải từ ${voucher.min_order_value}đ để áp dụng mã này`);

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
            voucher: this._toClient(voucher),
            discount
        };
    }
}

module.exports = new VoucherService();
