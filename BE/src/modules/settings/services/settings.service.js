const SystemConfig = require('../models/SystemConfig.model');

class SettingsService {
    
    // Lấy cấu hình hệ thống (ID luôn là 1)
    async getConfig() {
        let config = await SystemConfig.findById(1);
        
        // Tự động khởi tạo nếu chưa có
        if (!config) {
            config = await SystemConfig.create({ _id: 1 });
        }
        
        return config;
    }
    
    // Cập nhật cấu hình hệ thống
    async updateConfig(data) {
        // Lấy hoặc tạo config
        await this.getConfig();
        
        // Loại bỏ _id khỏi data để tránh lỗi
        if (data._id) delete data._id;
        
        const updatedConfig = await SystemConfig.findByIdAndUpdate(
            1, 
            { $set: data }, 
            { new: true, runValidators: true }
        );
        
        return updatedConfig;
    }
}

module.exports = new SettingsService();
