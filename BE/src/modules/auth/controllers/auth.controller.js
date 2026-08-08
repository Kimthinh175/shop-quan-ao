const adminService = require('../../users/services/admins.service');
const userAccountService = require('../../users/services/user_accounts.service');

class AuthController {
    // ---- ADMIN AUTH ----
    async loginAdmin(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
            }
            const ip = req.ip;
            const fingerprint = req.headers['user-agent'] || 'Unknown Device';
            const result = await adminService.login(username, password, { ip, fingerprint });
            
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            // Return token in response body as well for API clients
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    // ---- USER (ONLINE) AUTH ----
    async registerUser(req, res) {
        try {
            const { phone, name, password } = req.body;
            if (!phone || !name || !password) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ SĐT, Tên và Mật khẩu' });
            }
            const fingerprint = req.headers['user-agent'] || 'Unknown Device';
            const result = await userAccountService.registerOnline({ ...req.body, fingerprint });
            
            // Set cookie
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });
            
            // Return token in response body as well
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async loginUser(req, res) {
        try {
            const { phone, password } = req.body;
            if (!phone || !password) {
                return res.status(400).json({ message: 'Vui lòng nhập SĐT và mật khẩu' });
            }
            const fingerprint = req.headers['user-agent'] || 'Unknown Device';
            const result = await userAccountService.login(phone, password, fingerprint);
            
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            // Return token in response body as well for API clients
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async sendOtp(req, res) {
        try {
            const { phone } = req.body;
            if (!phone) return res.status(400).json({ message: 'Vui lòng cung cấp SĐT' });
            
            const otpService = require('../services/otp.service');
            const otp = otpService.sendOtp(phone);
            
            res.json({ message: 'Đã gửi mã OTP', otp });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async verifyOtp(req, res) {
        try {
            const { phone, otp } = req.body;
            if (!phone || !otp) return res.status(400).json({ message: 'Thiếu SĐT hoặc mã OTP' });

            const otpService = require('../services/otp.service');
            otpService.verifyOtp(phone, otp);

            const fingerprint = req.headers['user-agent'] || 'Unknown Device';
            const result = await userAccountService.loginWithOtp(phone, fingerprint);
            
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async googleLogin(req, res) {
        try {
            const { idToken } = req.body;
            if (!idToken) return res.status(400).json({ message: 'Thiếu mã xác thực Google (idToken)' });

            const { OAuth2Client } = require('google-auth-library');
            const clientId = '353464933030-gs4nius9ik1kikb6meq9acigl5kju766.apps.googleusercontent.com';
            const client = new OAuth2Client(clientId);
            
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: clientId,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return res.status(401).json({ message: 'Google OAuth error: Invalid token' });
            }

            const fingerprint = req.headers['user-agent'] || 'Unknown Device';
            const result = await userAccountService.loginWithGoogle(
                payload.email,
                payload.name,
                payload.sub,
                payload.picture,
                fingerprint
            );

            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    // Get current user from cookie
    async getMe(req, res) {
        try {
            if (!req.user) return res.json({ user: null });
            
            if (req.user.type === 'staff') {
                const Admin = require('../../users/models/Admin.model');
                const admin = await Admin.findById(req.user.id).select('-password');
                if (!admin) return res.status(404).json({ message: 'Không tìm thấy admin' });
                return res.json({
                    user: { _id: admin._id, username: admin.username, role: admin.role, name: admin.name, avatar_url: admin.avatar_url }
                });
            }

            const User = require('../../users/models/User.model');
            const user = await User.findById(req.user.id).select('-password');
            if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

            const Customer = require('../../users/models/Customer.model');
            const customer = await Customer.findById(user.customer_id);

            res.json({
                user: { _id: user._id, username: user.username, name: user.name, customer_id: user.customer_id, avatar_url: user.avatar_url },
                customer_profile: customer ? { points: customer.points, full_name: customer.full_name } : null
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async logout(req, res) {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.json({ message: 'Đăng xuất thành công' });
    }
}

module.exports = new AuthController();
