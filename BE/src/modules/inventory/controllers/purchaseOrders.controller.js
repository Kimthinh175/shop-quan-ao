const purchaseOrdersService = require('../services/purchaseOrders.service');

const getPurchaseOrders = async (req, res, next) => {
    try {
        const { page, limit, status, sort } = req.query;
        const result = await purchaseOrdersService.getAll({ 
            page: parseInt(page) || 1, 
            limit: parseInt(limit) || 10, 
            status, 
            sort 
        });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const createPurchaseOrder = async (req, res, next) => {
    try {
        const order = await purchaseOrdersService.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPurchaseOrders,
    createPurchaseOrder
};
