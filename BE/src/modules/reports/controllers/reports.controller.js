const reportsService = require('../services/reports.service');

class ReportsController {
    async getDashboardStats(req, res) {
        try {
            const stats = await reportsService.getDashboardStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ReportsController();
