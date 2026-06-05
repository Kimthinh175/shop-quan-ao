const Article = require('../models/Article.model');
const paginate = require('../../../core/utils/paginate');
const slugify = require('slugify');

class ArticleService {
    // Hàm tạo slug tự động
    _generateSlug(title) {
        return slugify(title, {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }

    async create(data) {
        if (!data.title) throw new Error('Tiêu đề bài viết là bắt buộc');
        if (!data.content) throw new Error('Nội dung bài viết là bắt buộc');

        // Tạo slug nếu không có
        if (!data.slug) {
            data.slug = this._generateSlug(data.title);
        }

        // Đảm bảo slug là duy nhất
        let baseSlug = data.slug;
        let counter = 1;
        while (await Article.findOne({ slug: data.slug })) {
            data.slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Ngày publish
        if (data.status === 'published' && !data.published_at) {
            data.published_at = new Date();
        }

        const article = await Article.create(data);
        return article;
    }

    async update(id, data) {
        if (data.title && !data.slug) {
            data.slug = this._generateSlug(data.title);
        }

        if (data.slug) {
            let baseSlug = data.slug;
            let counter = 1;
            while (await Article.findOne({ slug: data.slug, _id: { $ne: id } })) {
                data.slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        if (data.status === 'published' && !data.published_at) {
            data.published_at = new Date();
        }

        const article = await Article.findByIdAndUpdate(id, data, { new: true });
        if (!article) throw new Error('Không tìm thấy bài viết');
        return article;
    }

    async delete(id) {
        const article = await Article.findByIdAndDelete(id);
        if (!article) throw new Error('Không tìm thấy bài viết');
        return article;
    }

    async getAll(query = {}, isAdmin = false) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const sort = query.sort || '-createdAt';

        const filter = {};
        if (!isAdmin) {
            // Frontend chỉ thấy bài đã publish
            filter.status = 'published';
        } else {
            // Admin có thể filter theo status
            if (query.status) filter.status = query.status;
        }

        if (query.search) {
            filter.title = { $regex: query.search, $options: 'i' };
        }

        const result = await paginate(Article, filter, { page, limit, sort });
        return result;
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
