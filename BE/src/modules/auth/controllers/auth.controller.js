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
            const result = await adminService.login(username, password);
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
            const result = await userAccountService.registerOnline(req.body);
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
            const result = await userAccountService.login(phone, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();
