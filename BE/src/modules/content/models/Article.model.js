const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const ArticleSchema = new mongoose.Schema({
    _id: { type: Number },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String },
    content: { type: String, required: true },
    author_id: { type: Number, ref: 'User' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    published_at: { type: Date }
}, { timestamps: true, _id: false });

ArticleSchema.plugin(autoIncrement, { modelName: 'article_id' });

module.exports = mongoose.model('Article', ArticleSchema);
