const Article = require('../models/Article.model');
const slugify = require('slugify');

class ArticleService {
    _generateSlug(title) {
        return slugify(title || '', {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }

    _normalizeSlug(slug, title) {
        const source = slug || title;
        return this._generateSlug(source);
    }

    _stripHtml(value = '') {
        return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    _normalizeTags(tags) {
        if (Array.isArray(tags)) {
            return tags.map((tag) => String(tag).trim()).filter(Boolean);
        }

        if (typeof tags === 'string') {
            return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        }

        return [];
    }

    _pickPayload(data = {}, existingArticle = null) {
        const payload = {
            title: data.title?.trim(),
            slug: this._normalizeSlug(data.slug, data.title || existingArticle?.title),
            thumbnail: data.thumbnail?.trim() || '',
            excerpt: data.excerpt?.trim(),
            content: data.content,
            category: data.category?.trim() || '',
            tags: this._normalizeTags(data.tags),
            status: data.status || existingArticle?.status || 'draft',
        };

        if (!payload.excerpt && payload.content) {
            payload.excerpt = this._stripHtml(payload.content).slice(0, 180);
        }

        return payload;
    }

    async _ensureUniqueSlug(slug, ignoreId = null) {
        const baseSlug = slug || 'bai-viet';
        let nextSlug = baseSlug;
        let counter = 1;

        while (await Article.findOne({ slug: nextSlug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
            nextSlug = `${baseSlug}-${counter}`;
            counter += 1;
        }

        return nextSlug;
    }

    async create(data) {
        if (!data.title?.trim()) throw new Error('Tiêu đề bài viết là bắt buộc');
        if (!data.content?.trim()) throw new Error('Nội dung bài viết là bắt buộc');

        const payload = this._pickPayload(data);
        payload.slug = await this._ensureUniqueSlug(payload.slug);

        if (payload.status === 'published') {
            payload.published_at = data.published_at ? new Date(data.published_at) : new Date();
        }

        return Article.create(payload);
    }

    async update(id, data) {
        const currentArticle = await Article.findById(id);
        if (!currentArticle) throw new Error('Không tìm thấy bài viết');

        const payload = this._pickPayload(data, currentArticle);
        payload.slug = await this._ensureUniqueSlug(payload.slug, id);

        if (payload.status === 'published' && !currentArticle.published_at) {
            payload.published_at = new Date();
        }

        if (payload.status !== 'published') {
            payload.published_at = undefined;
        }

        const article = await Article.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });

        return article;
    }

    async delete(id) {
        const article = await Article.findById(id);
        if (!article) throw new Error('Không tìm thấy bài viết');

        // Collect all Cloudinary URLs to delete
        const urls = [];
        if (article.thumbnail && article.thumbnail.includes('res.cloudinary.com')) {
            urls.push(article.thumbnail);
        }
        if (article.content) {
            const imgRegex = /https?:\/\/res\.cloudinary\.com[^\s"'<>)]+/g;
            const matches = article.content.match(imgRegex);
            if (matches) urls.push(...matches);
        }

        // Delete from Cloudinary
        const { cloudinary } = require('../../../core/utils/cloudinary');
        for (const url of urls) {
            try {
                const parts = url.split('/');
                const uploadIdx = parts.findIndex(p => p === 'upload');
                if (uploadIdx === -1) continue;
                let pathParts = parts.slice(uploadIdx + 1);
                if (pathParts[0] && pathParts[0].match(/^v\d+$/)) pathParts.shift();
                const withExt = pathParts.join('/');
                const publicId = withExt.split('.').slice(0, -1).join('.');
                if (publicId) await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.error('Cloudinary delete error:', e.message);
            }
        }

        await Article.findByIdAndDelete(id);
        return article;
    }

    async getAll(query = {}, isAdmin = false) {
        const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
        const sort = query.sort || '-createdAt';
        const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
        const sortDirection = sort.startsWith('-') ? 'desc' : 'asc';

        const filter = {};
        if (!isAdmin) {
            filter.status = 'published';
        } else if (query.status) {
            filter.status = query.status;
        }

        if (query.search) {
            const search = String(query.search).trim();
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        return Article.paginate(filter, {
            limit,
            cursor: query.cursor,
            direction: query.direction,
            sortBy: `${sortField}:${sortDirection}`
        });
    }

    async getBySlug(slug) {
        const article = await Article.findOne({ slug });
        if (!article) throw new Error('Không tìm thấy bài viết');
        return article;
    }

    async getById(id) {
        const article = await Article.findById(id);
        if (!article) throw new Error('Không tìm thấy bài viết');
        return article;
    }
}

module.exports = new ArticleService();
