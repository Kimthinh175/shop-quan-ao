const PurchaseOrder = require('../models/PurchaseOrder.model');
const paginate = require('../../../core/utils/paginate');

class PurchaseOrdersService {
    async getAll({ page = 1, limit = 10, status, sort = '-createdAt' }) {
        const query = {};
        if (status) query.status = status;

        return await paginate(PurchaseOrder, query, { 
            page, 
            limit, 
            sort,
            populate: [
                { path: 'supplier_id', select: 'name' },
                { path: 'user_id', select: 'username' }
            ]
        });
    }

    async create(data) {
        return await PurchaseOrder.create(data);
    }
}

module.exports = new PurchaseOrdersService();
