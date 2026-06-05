const express = require('express');
const router = express.Router();
const returnsController = require('../controllers/returns.controller');
const { authenticateToken, authorizeRole } = require('../../../core/middlewares/auth');

// Khách hàng
router.post('/', authenticateToken, returnsController.requestReturn);
router.get('/my-returns', authenticateToken, returnsController.getMyReturns);

// Admin
router.get('/admin', authenticateToken, authorizeRole('superadmin', 'admin', 'manager'), returnsController.getAllReturns);
router.put('/admin/:id/status', authenticateToken, authorizeRole('superadmin', 'admin', 'manager'), returnsController.updateReturnStatus);

module.exports = router;
