const axios = require('axios');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

async function runNotificationsTest() {
    console.log('--- BẮT ĐẦU TEST MODULE NOTIFICATIONS ---');
    
    // 1. Đăng nhập Admin & Customer
    const adminLogin = await axios.post(`${BASE_URL}/auth/admin/login`, { username: 'superadmin', password: 'admin123' });
    const adminToken = adminLogin.data.token;
    
    const userLogin = await axios.post(`${BASE_URL}/auth/user/login`, { phone: '0988888888', password: 'password' });
    const userToken = userLogin.data.token;
    const userId = userLogin.data.customer_id || userLogin.data.user.customer_id; // tùy payload jwt
    
    // 2. Mở kết nối Socket cho Customer
    console.log('\n[TEST 1] Khách hàng kết nối Socket.IO...');
    const socket = io(SOCKET_URL, {
        auth: { token: userToken }
    });
    
    socket.on('connect', () => {
        console.log(`✅ Khách hàng đã kết nối thành công với Socket ID: ${socket.id}`);
        
        // Chờ Admin bắn Broadcast
        setTimeout(async () => {
            console.log('\n[TEST 2] Admin gửi Broadcast Notification...');
            try {
                const bcRes = await axios.post(`${BASE_URL}/notifications/broadcast`, {
                    type: 'PROMOTION',
                    title: 'Siêu Sale 6/6',
                    content: 'Giảm giá cực mạnh lên đến 50% tất cả sản phẩm',
                    link: '/promotions/6-6'
                }, { headers: { Authorization: `Bearer ${adminToken}` } });
                console.log(bcRes.data.message);
            } catch (e) {
                console.error('Lỗi broadcast:', e.message);
            }
        }, 1000);
    });
    
    socket.on('connect_error', (err) => {
        console.error('❌ Lỗi kết nối Socket:', err.message);
    });

    socket.on('new_broadcast_notification', async (data) => {
        console.log(`\n🔔 [SOCKET BING BONG] Khách hàng nhận được Broadcast:`, data.title);
        console.log(`   Nội dung: ${data.content}`);
        
        // Kiểm tra danh sách Notif
        console.log('\n[TEST 3] Kiểm tra lại DB Notifications của Khách hàng...');
        const notifRes = await axios.get(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${userToken}` } });
        console.log(`- Bạn có ${notifRes.data.total} thông báo.`);
        
        const unreadRes = await axios.get(`${BASE_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${userToken}` } });
        console.log(`- Số lượng chưa đọc: ${unreadRes.data.unread_count}`);
        
        // Lấy cái mới nhất đọc
        if (notifRes.data.data && notifRes.data.data.length > 0) {
            const latestNotif = notifRes.data.data[0];
            console.log(`\n[TEST 4] Đánh dấu đọc thông báo: ${latestNotif.title}...`);
            await axios.put(`${BASE_URL}/notifications/${latestNotif._id}/read`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log('✅ Đã đánh dấu đọc thành công!');
            
            const unreadRes2 = await axios.get(`${BASE_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log(`- Số lượng chưa đọc MỚI: ${unreadRes2.data.unread_count}`);
        }
        
        console.log('\n--- HOÀN TẤT TEST MODULE NOTIFICATIONS ---');
        socket.disconnect();
        process.exit(0);
    });
}

runNotificationsTest();
