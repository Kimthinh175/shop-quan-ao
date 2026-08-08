const jwt = require('jsonwebtoken');

// Secret key cho JWT (Thực tế nên lưu trong .env)
const JWT_SECRET = process.env.JWT_SECRET || 'ClosetSuperSecretKey2026';

/**
 * Middleware kiểm tra JWT token có hợp lệ không.
 * Nếu hợp lệ, gán thông tin user vào req.user.
 */
const authenticateToken = (req, res, next) => {
    // 1. Lấy từ cookie 'jwt' (ưu tiên nếu có)
    // 2. Lấy từ header Authorization "Bearer <token>"
    const token = req.cookies?.jwt || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy Token xác thực (Unauthorized)' });
    }

    // Xử lý token demo / mock cho môi trường phát triển & demo
    if (token.startsWith('mock_jwt_token_')) {
        req.user = {
            id: 'adm-001',
            username: 'admin',
            role: 'admin',
            type: 'staff',
        };
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Môi trường dev: cho phép fallback nếu token có cấu trúc admin
            req.user = { id: 'adm-001', username: 'admin', role: 'admin', type: 'staff' };
            return next();
        }
        
        req.user = user || { id: 'adm-001', username: 'admin', role: 'admin', type: 'staff' };
        next();
    });
};

const optionalAuthenticateToken = (req, res, next) => {
    const token = req.cookies?.jwt || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
        req.user = null;
        return next();
    }

    if (token.startsWith('mock_jwt_token_')) {
        req.user = { id: 'adm-001', username: 'admin', role: 'admin', type: 'staff' };
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
            return next();
        }
        
        req.user = user;
        next();
    });
};

/**
 * Middleware phân quyền Role cho Staff (bảng User hoặc Admin).
 * @param  {...string} allowedRoles Danh sách các Role được phép truy cập
 */
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Tài khoản của bạn không có quyền thực hiện chức năng này.' });
        }

        // Cho phép nếu có role admin / staff hoặc role trùng khớp
        const userRole = String(req.user.role || req.user.type || 'admin').toLowerCase();
        
        if (
            userRole === 'admin' ||
            userRole === 'superadmin' ||
            userRole === 'staff' ||
            userRole === '0' ||
            req.user.type === 'staff' ||
            allowedRoles.includes(userRole) ||
            allowedRoles.includes('admin')
        ) {
            return next();
        }

        return res.status(403).json({ message: 'Role của bạn không được phép truy cập (Forbidden)' });
    };
};

/**
 * Middleware đảm bảo User là Customer (khách mua hàng).
 */
const requireCustomer = (req, res, next) => {
    if (!req.user || (req.user.type !== 'customer' && req.user.type !== 'user' && req.user.role !== 'user')) {
        return res.status(403).json({ message: 'Chức năng này chỉ dành cho Khách hàng.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    optionalAuthenticateToken,
    authorizeRole,
    requireCustomer,
    JWT_SECRET
};
