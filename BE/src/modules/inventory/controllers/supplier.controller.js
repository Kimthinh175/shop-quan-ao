const supplierService = require('../services/supplier.service');

const getSuppliers = async (req, res, next) => {
    try {
        const data = await supplierService.getAll();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const getSupplierById = async (req, res, next) => {
    try {
        const data = await supplierService.getById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Supplier not found' });
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const createSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
};

const updateSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: 'Supplier not found' });
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const deleteSupplier = async (req, res, next) => {
    try {
        const data = await supplierService.delete(req.params.id);
        if (!data) return res.status(404).json({ message: 'Supplier not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
