const adminService = require('../services/admins.service');

class AdminController {
    async create(req, res) {
        try {
            const admin = await adminService.register(req.body);
            res.status(201).json(admin);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMe(req, res) {
        try {
            const admin = await adminService.getById(req.user.id);
            res.json(admin);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const admins = await adminService.getAll();
            res.json(admins);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const admin = await adminService.getById(req.params.id);
            if (!admin) return res.status(404).json({ message: 'Không tìm thấy Admin' });
            res.json(admin);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const admin = await adminService.update(req.params.id, req.body);
            if (!admin) return res.status(404).json({ message: 'Không tìm thấy Admin' });
            res.json(admin);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const admin = await adminService.delete(req.params.id);
            if (!admin) return res.status(404).json({ message: 'Không tìm thấy Admin' });
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new AdminController();
