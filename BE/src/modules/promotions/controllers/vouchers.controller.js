const voucherService = require('../services/vouchers.service');

class VoucherController {
    async create(req, res) {
        try {
            const voucher = await voucherService.create(req.body);
            res.status(201).json(voucher);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const voucher = await voucherService.update(req.params.id, req.body);
            res.json(voucher);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await voucherService.delete(req.params.id);
            res.json({ message: 'Đã xóa mã giảm giá' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await voucherService.getAll(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async checkVoucher(req, res) {
        try {
            const { code, order_value } = req.body;
            if (!code || order_value === undefined) {
                return res.status(400).json({ message: 'Vui lòng cung cấp mã giảm giá và tổng giá trị đơn hàng' });
            }
            const result = await voucherService.checkVoucher(code, Number(order_value));
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new VoucherController();
