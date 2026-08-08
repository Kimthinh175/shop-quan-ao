const mongoose = require('mongoose');
const autoIncrement = require('../../../core/utils/autoIncrement');

const ArticleSchema = new mongoose.Schema({
    _id: { type: Number },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    thumbnail: { type: String, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    author_id: { type: Number, ref: 'User' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    published_at: { type: Date }
}, { timestamps: true, _id: false });

const paginate = require('../../../core/utils/paginate');

ArticleSchema.plugin(autoIncrement, { modelName: 'article_id' });
ArticleSchema.plugin(paginate);

module.exports = mongoose.model('Article', ArticleSchema);
