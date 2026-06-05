const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');
const paginate = require('../../../core/utils/paginate');

const GiftSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    description: { type: String },
    main_img: { type: String },
    quantity: { type: Number, default: 0, min: 0 }
}, { timestamps: { createdAt: 'create_at', updatedAt: 'updated_at' } });

GiftSchema.plugin(autoIncrement, { modelName: 'gift_id' });
GiftSchema.plugin(paginate);

module.exports = mongoose.model('Gift', GiftSchema);
