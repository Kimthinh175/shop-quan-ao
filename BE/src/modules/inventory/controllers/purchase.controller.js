const purchaseService = require('../services/purchase.service');

const getAllPOs = async (req, res, next) => {
    try {
        const data = await purchaseService.getAllPOs();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const getPOById = async (req, res, next) => {
    try {
        const data = await purchaseService.getPOById(req.params.id);
        if (!data) return res.status(404).json({ message: 'PO not found' });
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const createPO = async (req, res, next) => {
    try {
        const data = await purchaseService.createPO(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
};

const approvePO = async (req, res, next) => {
    try {
        const data = await purchaseService.approvePO(req.params.id);
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getAllPOs,
    getPOById,
    createPO,
    approvePO
};
