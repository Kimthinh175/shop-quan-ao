const Promotion = require('../models/Promotion.model');

class PromotionService {
    async create(data) {
        // Validate
        if (!data.name || !data.code || !data.start_time || !data.end_time) {
            throw new Error('Vui lòng nhập đầy đủ tên, mã, thời gian bắt đầu và kết thúc');
        }
        if (!data.applicable_product_ids || data.applicable_product_ids.length === 0) {
            throw new Error('Không được phép áp dụng khuyến mãi cho toàn shop. Vui lòng chọn ít nhất 1 sản phẩm áp dụng.');
        }
        
        // Đảm bảo code là uppercase
        data.code = data.code.toUpperCase();
        
        const existing = await Promotion.findOne({ code: data.code });
        if (existing) {
            throw new Error(`Mã khuyến mãi ${data.code} đã tồn tại`);
        }

        const promotion = await Promotion.create(data);
        return promotion;
    }

    async update(id, data) {
        if (data.applicable_product_ids && data.applicable_product_ids.length === 0) {
            throw new Error('Không được phép áp dụng khuyến mãi cho toàn shop. Vui lòng chọn ít nhất 1 sản phẩm áp dụng.');
        }
        if (data.code) {
            data.code = data.code.toUpperCase();
            const existing = await Promotion.findOne({ code: data.code, _id: { $ne: id } });
            if (existing) {
                throw new Error(`Mã khuyến mãi ${data.code} đã tồn tại ở chiến dịch khác`);
            }
        }
        
        const promotion = await Promotion.findByIdAndUpdate(id, data, { new: true });
        if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi');
        
        return promotion;
    }

    async delete(id) {
        // Thay vì xóa cứng, ta set is_active = false
        const promotion = await Promotion.findByIdAndUpdate(id, { is_active: false }, { new: true });
        if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi');
        return promotion;
    }

    async getAll(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (query.is_active !== undefined) filter.is_active = query.is_active;
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } }
            ];
        }

        const [data, total] = await Promise.all([
            Promotion.find(filter)
                .sort('-create_at')
                .skip(skip)
                .limit(limit),
            Promotion.countDocuments(filter)
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

    async getById(id) {
        const promotion = await Promotion.findById(id).populate('rewards.gift_variant_id');
        if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi');
        return promotion;
    }

    async getActivePromotions() {
        const now = new Date();
        return await Promotion.find({
            is_active: true,
            start_time: { $lte: now },
            end_time: { $gte: now },
            $or: [
                { usage_limit: 0 },
                { $expr: { $lt: ["$used_count", "$usage_limit"] } }
            ]
        }).populate('rewards.gift_variant_id');
    }
}

module.exports = new PromotionService();
