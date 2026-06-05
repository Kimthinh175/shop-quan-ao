const returnsService = require('../services/returns.service');

class ReturnsController {
    
    // Khách hàng gửi yêu cầu
    async requestReturn(req, res) {
        try {
            const customerId = req.user.customer_id;
            if (!customerId) return res.status(403).json({ message: 'Bạn chưa có hồ sơ khách hàng' });
            
            const result = await returnsService.requestReturn(customerId, req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    
    // Khách hàng xem lịch sử
    async getMyReturns(req, res) {
        try {
            const customerId = req.user.customer_id;
            if (!customerId) return res.status(403).json({ message: 'Bạn chưa có hồ sơ khách hàng' });
            
            const result = await returnsService.getMyReturns(customerId, req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    // Admin xem danh sách
    async getAllReturns(req, res) {
        try {
            const result = await returnsService.getAllReturns(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    // Admin duyệt / đổi trạng thái
    async updateReturnStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, admin_note } = req.body;
            
            if (!status) return res.status(400).json({ message: 'Vui lòng cung cấp status' });
            
            const result = await returnsService.updateReturnStatus(id, status, admin_note);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new ReturnsController();
