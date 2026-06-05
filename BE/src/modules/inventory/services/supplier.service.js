const Supplier = require('../models/Supplier.model');

class SupplierService {
    async create(data) {
        return Supplier.create(data);
    }

    async getAll() {
        return Supplier.find().sort('-_id');
    }

    async getById(id) {
        return Supplier.findById(id);
    }

    async update(id, data) {
        return Supplier.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return Supplier.findByIdAndDelete(id);
    }
}

module.exports = new SupplierService();
