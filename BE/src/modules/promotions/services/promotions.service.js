const Promotion = require('../models/Promotion.model');

class PromotionService {
    _makeCode(name = '') {
        const base = String(name)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase()
            .slice(0, 24);

        return base || `PROMO_${Date.now()}`;
    }

    _toClient(promotion) {
        const doc = promotion.toObject ? promotion.toObject() : promotion;
        const reward = doc.rewards?.[0] || {};
        const type = reward.reward_type === 'DISCOUNT_AMOUNT' ? 'fixed_amount' : 'percentage';
        const value = type === 'fixed_amount' ? reward.discount_amount : reward.discount_percent;

        return {
            ...doc,
            type,
            value: value || 0,
            description: doc.description || doc.code,
            start_date: doc.start_time,
            end_date: doc.end_time,
            status: doc.is_active ? 'active' : 'inactive',
            min_order_value: doc.min_amount || 0
        };
    }

    _normalizePayload(data = {}, existing = null) {
        const type = data.type || (existing ? this._toClient(existing).type : 'percentage');
        const value = Number(data.value ?? (type === 'fixed_amount' ? existing?.rewards?.[0]?.discount_amount : existing?.rewards?.[0]?.discount_percent) ?? 0);
        const start = data.start_date || data.start_time || existing?.start_time;
        const end = data.end_date || data.end_time || existing?.end_time;
        const name = data.name?.trim() || existing?.name;

        if (!name) throw new Error('Tên chương trình khuyến mãi là bắt buộc');
        if (!start || !end) throw new Error('Vui lòng nhập ngày bắt đầu và ngày kết thúc');
        if (value <= 0) throw new Error('Giá trị khuyến mãi phải lớn hơn 0');
        if (type === 'percentage' && value > 100) throw new Error('Phần trăm giảm không được vượt quá 100%');

        const reward = type === 'fixed_amount'
            ? { reward_type: 'DISCOUNT_AMOUNT', discount_amount: value }
            : { reward_type: 'DISCOUNT_PERCENT', discount_percent: value };

        return {
            name,
            code: (data.code || existing?.code || this._makeCode(name)).toUpperCase(),
            campaign_type: 'DISCOUNT',
            applicable_product_ids: Array.isArray(data.applicable_product_ids) ? data.applicable_product_ids : (existing?.applicable_product_ids || []),
            condition_type: Number(data.min_order_value || data.min_amount || existing?.min_amount || 0) > 0 ? 'AMOUNT' : 'NONE',
            min_amount: Number(data.min_order_value || data.min_amount || existing?.min_amount || 0),
            min_quantity: Number(data.min_quantity || existing?.min_quantity || 0),
            is_active: (data.status || (existing?.is_active ? 'active' : 'inactive')) === 'active',
            usage_limit: Number(data.usage_limit || existing?.usage_limit || 0),
            start_time: new Date(start),
            end_time: new Date(end),
            rewards: [reward]
        };
    }

    async _ensureUniqueCode(code, ignoreId = null) {
        let nextCode = code;
        let counter = 1;
        while (await Promotion.findOne({ code: nextCode, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
            nextCode = `${code}_${counter}`;
            counter += 1;
        }
        return nextCode;
    }

    async create(data) {
        const payload = this._normalizePayload(data);
        payload.code = await this._ensureUniqueCode(payload.code);
        const promotion = await Promotion.create(payload);
        return this._toClient(promotion);
    }

    async update(id, data) {
        const existing = await Promotion.findById(id);
        if (!existing) throw new Error('Không tìm thấy chương trình khuyến mãi');

        const payload = this._normalizePayload(data, existing);
        payload.code = await this._ensureUniqueCode(payload.code, id);

        const promotion = await Promotion.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        return this._toClient(promotion);
    }

    async delete(id) {
        const promotion = await Promotion.findByIdAndUpdate(id, { is_active: false }, { new: true });
        if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi');
        return this._toClient(promotion);
    }

    async getAll(query = {}) {
        const page = parseInt(query.page, 10) || 1;
        const limit = Math.min(parseInt(query.limit, 10) || 50, 100);
        const skip = (page - 1) * limit;

        const filter = {};
        if (query.status) filter.is_active = query.status === 'active';
        if (query.is_active !== undefined) filter.is_active = String(query.is_active) === 'true';
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { code: { $regex: query.search, $options: 'i' } }
            ];
        }

        const [docs, total] = await Promise.all([
            Promotion.find(filter).sort('-create_at').skip(skip).limit(limit),
            Promotion.countDocuments(filter)
        ]);

        const data = docs.map((promotion) => this._toClient(promotion));
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

    async getById(id) {
        const promotion = await Promotion.findById(id).populate('rewards.gift_id');
        if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi');
        return this._toClient(promotion);
    }

    async getActivePromotions() {
        const now = new Date();
        const promotions = await Promotion.find({
            is_active: true,
            start_time: { $lte: now },
            end_time: { $gte: now },
            $or: [
                { usage_limit: 0 },
                { $expr: { $lt: ['$used_count', '$usage_limit'] } }
            ]
        }).populate('rewards.gift_id');

        return promotions.map((promotion) => this._toClient(promotion));
    }
}

module.exports = new PromotionService();
