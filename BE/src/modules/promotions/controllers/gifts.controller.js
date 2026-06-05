const giftService = require('../services/gifts.service');

class GiftController {
    async create(req, res) {
        try {
            const gift = await giftService.create(req.body);
            res.status(201).json(gift);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const gift = await giftService.update(req.params.id, req.body);
            res.json(gift);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await giftService.delete(req.params.id);
            res.json({ message: 'Đã xóa quà tặng' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await giftService.getAll(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new GiftController();
