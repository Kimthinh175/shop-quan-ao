const settingsService = require('../services/settings.service');

class SettingsController {
    
    // Public API: Lấy cấu hình hệ thống
    async getConfig(req, res) {
        try {
            const config = await settingsService.getConfig();
            res.json(config);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    // Admin API: Cập nhật cấu hình
    async updateConfig(req, res) {
        try {
            const updatedConfig = await settingsService.updateConfig(req.body);
            res.json({ message: 'Cập nhật cấu hình thành công', config: updatedConfig });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new SettingsController();
