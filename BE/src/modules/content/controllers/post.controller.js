const articleService = require('../services/posts.service');

class ArticleController {
    async create(req, res) {
        try {
            const data = req.body;
            // Gán tác giả là Admin đang đăng nhập
            if (req.user && req.user.id) {
                data.author_id = req.user.id;
            } else {
                data.author_id = 1; // Default
            }

            const article = await articleService.create(data);
            res.status(201).json(article);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const article = await articleService.update(req.params.id, req.body);
            res.json(article);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await articleService.delete(req.params.id);
            res.json({ message: 'Đã xóa bài viết' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await articleService.getAll(req.query, false);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllAdmin(req, res) {
        try {
            const result = await articleService.getAll(req.query, true);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const article = await articleService.getBySlug(req.params.slug);
            res.json(article);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const article = await articleService.getById(req.params.id);
            res.json(article);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new ArticleController();
