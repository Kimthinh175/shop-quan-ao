const customerService = require('../services/customers.service');

class CustomerController {
    // Luồng O2O
    async createOffline(req, res) {
        try {
            const { phone, full_name } = req.body;
            if (!phone || !full_name) {
                return res.status(400).json({ message: 'Vui lòng cung cấp Số điện thoại và Họ tên' });
            }
            const customer = await customerService.createOffline(req.body);
            res.status(201).json(customer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Profile & Quản lý
    async getMe(req, res) {
        try {
            const customer = await customerService.getById(req.user.id);
            res.json(customer);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateMe(req, res) {
        try {
            const customer = await customerService.update(req.user.id, req.body);
            res.json(customer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await customerService.getAll(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const customer = await customerService.getById(req.params.id);
            if (!customer) return res.status(404).json({ message: 'Không tìm thấy Khách hàng' });
            res.json(customer);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateById(req, res) {
        try {
            const customer = await customerService.update(req.params.id, req.body);
            if (!customer) return res.status(404).json({ message: 'Không tìm thấy Khách hàng' });
            res.json(customer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Address
    async getAddresses(req, res) {
        try {
            const customer = await customerService.getById(req.user.id);
            res.json(customer.addresses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async addAddress(req, res) {
        try {
            const addresses = await customerService.addAddress(req.user.id, req.body);
            res.status(201).json(addresses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateAddress(req, res) {
        try {
            const addresses = await customerService.updateAddress(req.user.id, req.params.addressId, req.body);
            res.json(addresses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteAddress(req, res) {
        try {
            const addresses = await customerService.deleteAddress(req.user.id, req.params.addressId);
            res.json(addresses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new CustomerController();
