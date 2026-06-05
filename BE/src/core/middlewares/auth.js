const jwt = require('jsonwebtoken');

// Secret key cho JWT (Thực tế nên lưu trong .env)
const JWT_SECRET = process.env.JWT_SECRET || 'ClosetSuperSecretKey2026';

/**
 * Middleware kiểm tra JWT token có hợp lệ không.
 * Nếu hợp lệ, gán thông tin user vào req.user.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy Token xác thực (Unauthorized)' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn (Forbidden)' });
        }
        
        req.user = user; // { id, username, role (nếu là staff), type ('staff' | 'customer') }
        next();
    });
};

/**
 * Middleware phân quyền Role cho Staff (bảng User).
 * @param  {...string} allowedRoles Danh sách các Role được phép truy cập
 */
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || req.user.type !== 'staff') {
            return res.status(403).json({ message: 'Tài khoản của bạn không có quyền thực hiện chức năng này.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Role của bạn không được phép truy cập (Forbidden)' });
        }

        next();
    };
};

/**
 * Middleware đảm bảo User là Customer (khách mua hàng).
 */
const requireCustomer = (req, res, next) => {
    if (!req.user || (req.user.type !== 'customer' && req.user.type !== 'user')) {
        return res.status(403).json({ message: 'Chức năng này chỉ dành cho Khách hàng.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeRole,
    requireCustomer,
    JWT_SECRET
};
