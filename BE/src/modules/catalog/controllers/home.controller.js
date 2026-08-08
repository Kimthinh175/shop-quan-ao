const Product = require('../models/Product.model');
const ProductVariant = require('../models/ProductVariant.model');
const Category = require('../models/Category.model');
const Article = require('../../content/models/Article.model');
const Promotion = require('../../promotions/models/Promotion.model');

// In-Memory Cache
let cachedHomeData = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Helper tính giá chuẩn và đính kèm biến thể + phần trăm giảm giá khuyến mãi
async function enrichProducts(productsList, defaultDiscountPercent = 0) {
    if (!productsList || !productsList.length) return [];
    
    const productIds = productsList.map(p => p._id);
    const allVariants = await ProductVariant.find({ product_id: { $in: productIds } })
        .select('product_id price size color')
        .lean();

    return productsList.map(p => {
        const variants = allVariants.filter(v => v.product_id === p._id);
        const basePrice = p.default_price > 0 
            ? p.default_price 
            : (variants[0]?.price > 0 ? variants[0].price : 350000);

        let sale_price = basePrice;
        let original_price = basePrice;
        let discount_percent = defaultDiscountPercent;

        if (defaultDiscountPercent > 0) {
            original_price = Math.round(basePrice * (1 + defaultDiscountPercent / 100));
            sale_price = basePrice;
        } else if (p.sale_price && p.sale_price < basePrice) {
            sale_price = p.sale_price;
            original_price = basePrice;
            discount_percent = Math.round(((original_price - sale_price) / original_price) * 100);
        }

        return {
            ...p,
            variants,
            price: sale_price,
            sale_price,
            original_price,
            discount_percent
        };
    });
}

class HomeController {
    async getHomeData(req, res) {
        try {
            const now = Date.now();
            const forceRefresh = req.query.refresh === 'true';

            if (!forceRefresh && cachedHomeData && (now - cacheTimestamp < CACHE_TTL_MS)) {
                res.setHeader('X-Cache', 'HIT');
                return res.json({
                    success: true,
                    cached: true,
                    data: cachedHomeData
                });
            }

            // Truy vấn song song bằng Promise.all khớp chuẩn 100% MongoDB Schemas
            const [categories, rawProducts, rawPopularProducts, rawMensCollection, flashSalePromotions, articles] = await Promise.all([
                // 1. Categories
                Category.find({}).sort({ name: 1 }).limit(10).lean(),
                
                // 2. New Arrivals (Products)
                Product.find({ status: { $ne: 'INACTIVE' } }).sort({ createdAt: -1 }).limit(8).lean(),

                // 3. Popular Products
                Product.find({ status: { $ne: 'INACTIVE' } }).sort({ review_count: -1, rate: -1, createdAt: -1 }).limit(8).lean(),

                // 4. Men's Collection Products
                Product.find({ status: { $ne: 'INACTIVE' } }).sort({ createdAt: 1 }).limit(6).lean(),

                // 5. Active Flash Sale Promotions
                Promotion.find({ is_active: true, end_time: { $gte: new Date() } }).limit(1).lean(),

                // 6. Fashion Journal Articles (Published)
                Article.find({ $or: [{ status: 'published' }, { is_published: true }] }).sort({ createdAt: -1 }).limit(4).lean()
            ]);

            // Enrich sản phẩm tính toán giá chuẩn và đính kèm biến thể
            const products = await enrichProducts(rawProducts);
            const popularProducts = await enrichProducts(rawPopularProducts);
            const mensCollection = await enrichProducts(rawMensCollection);

            // Xử lý sản phẩm Flash Sale với phần trăm giảm giá (từ Promotion 999 ngày hoặc 30%)
            const activePromo = flashSalePromotions[0] || null;
            let promoDiscount = 30;
            if (activePromo && activePromo.rewards && activePromo.rewards[0]) {
                const r = activePromo.rewards[0];
                if (r.discount_percent) promoDiscount = r.discount_percent;
            }

            // Chọn 4 sản phẩm đa dạng từ các vị trí khác nhau để đảm bảo hình ảnh đa dạng nhất
            const rawFlashProducts = [
                rawProducts[0],
                rawProducts[2] || rawProducts[0],
                rawProducts[4] || rawProducts[1],
                rawProducts[6] || rawProducts[2]
            ].filter(Boolean);

            const flashProducts = await enrichProducts(rawFlashProducts, promoDiscount);

            // Banners mặc định cho Slider
            const banners = [
                {
                    badge: 'Bộ sưu tập Xuân Hè 2026',
                    title: 'Quiet Luxury<br>& Timeless',
                    subtitle: 'Sự kết hợp hoàn hảo giữa đường nét tối giản và chất liệu thượng hạng.',
                    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    link: '/catalog'
                },
                {
                    badge: 'Ưu đãi đặc biệt',
                    title: 'Mid-Season Sale<br>Up to 50%',
                    subtitle: 'Cơ hội sở hữu những thiết kế cao cấp với mức giá ưu đãi nhất mùa.',
                    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    link: '/catalog'
                },
                {
                    badge: 'Bộ sưu tập mới',
                    title: 'Modern Minimalist<br>Collection',
                    subtitle: 'Định hình phong cách hiện đại với tính ứng dụng cao.',
                    image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    link: '/catalog'
                }
            ];

            const homeData = {
                banners,
                categories,
                products,
                popularProducts,
                mensCollection,
                flashSale: {
                    active: true,
                    promotion: activePromo,
                    products: flashProducts
                },
                articles
            };

            // Cập nhật Cache
            cachedHomeData = homeData;
            cacheTimestamp = Date.now();

            res.setHeader('X-Cache', 'MISS');
            res.json({
                success: true,
                cached: false,
                data: homeData
            });
        } catch (error) {
            console.error('Error fetching home aggregated data:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    clearHomeCache() {
        cachedHomeData = null;
        cacheTimestamp = 0;
    }
}

const controller = new HomeController();
module.exports = controller;
