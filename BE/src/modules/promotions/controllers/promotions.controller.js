const promotionService = require('../services/promotions.service');

class PromotionController {
    async create(req, res) {
        try {
            const promotion = await promotionService.create(req.body);
            res.status(201).json(promotion);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const promotion = await promotionService.update(req.params.id, req.body);
            res.json(promotion);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const promotion = await promotionService.delete(req.params.id);
            res.json({ message: 'Đã vô hiệu hóa khuyến mãi', promotion });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await promotionService.getAll(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const promotion = await promotionService.getById(req.params.id);
            res.json(promotion);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getActivePromotions(req, res) {
        try {
            const promotions = await promotionService.getActivePromotions();
            res.json(promotions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new PromotionController();
