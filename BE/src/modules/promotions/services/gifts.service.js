const Gift = require('../models/Gift.model');

class GiftService {
    async create(data) {
        if (!data.name) throw new Error('Tên quà tặng là bắt buộc');
        const gift = await Gift.create(data);
        return gift;
    }

    async update(id, data) {
        const gift = await Gift.findByIdAndUpdate(id, data, { new: true });
        if (!gift) throw new Error('Không tìm thấy quà tặng');
        return gift;
    }

    async delete(id) {
        const gift = await Gift.findByIdAndDelete(id);
        if (!gift) throw new Error('Không tìm thấy quà tặng');
        return gift;
    }

    async getAll(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }

        const [data, total] = await Promise.all([
            Gift.find(filter).sort('-create_at').skip(skip).limit(limit),
            Gift.countDocuments(filter)
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
}

module.exports = new GiftService();
