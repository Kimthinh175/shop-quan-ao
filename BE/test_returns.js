const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runReturnsTest() {
    console.log('--- BẮT ĐẦU TEST MODULE RETURNS ---');
    
    // 1. Đăng nhập Admin và Customer
    const adminLogin = await axios.post(`${BASE_URL}/auth/admin/login`, { username: 'superadmin', password: 'admin123' });
    const adminToken = adminLogin.data.token;
    
    const userLogin = await axios.post(`${BASE_URL}/auth/user/login`, { phone: '0988888888', password: 'password' });
    const userToken = userLogin.data.token;
    
    // 2. Tìm đơn hàng COMPLETED của User
    console.log('\nTìm đơn hàng COMPLETED để test...');
    const ordersRes = await axios.get(`${BASE_URL}/orders`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const completedOrders = ordersRes.data.data.filter(o => o.status === 'COMPLETED');
    
    if (completedOrders.length === 0) {
        console.error('❌ Không tìm thấy đơn hàng nào ở trạng thái COMPLETED. Vui lòng chạy e2e test trước.');
        return;
    }
    
    const targetOrderShort = completedOrders[0];
    
    const orderDetailRes = await axios.get(`${BASE_URL}/orders/${targetOrderShort._id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const targetOrder = orderDetailRes.data.order;
    const targetItems = orderDetailRes.data.items;
    console.log(`Đã chọn Order ID: ${targetOrder._id}, Total Price: ${targetOrder.total_price}`);
    
    const firstItem = targetItems[0];
    
    // 3. User Yêu cầu trả hàng
    console.log('\n[TEST 1] Khách hàng yêu cầu trả 1 sản phẩm...');
    let returnRequestId;
    try {
        const returnReq = await axios.post(`${BASE_URL}/returns`, {
            order_id: targetOrder._id,
            items: [
                {
                    order_item_id: firstItem._id,
                    quantity: 1,
                    reason: 'Không vừa size',
                    condition: 'NEW' // Khách báo hàng nguyên vẹn
                }
            ],
            customer_note: 'Cho mình trả lại hàng nhé'
        }, { headers: { Authorization: `Bearer ${userToken}` } });
        
        returnRequestId = returnReq.data._id;
        console.log(`✅ Tạo yêu cầu thành công! Return ID: ${returnRequestId}`);
        console.log(`- Số tiền sẽ được hoàn lại: ${returnReq.data.refund_amount}đ`);
        console.log(`- Điểm Loyalty sẽ truy thu: ${returnReq.data.refund_points_clawback}`);
    } catch (e) {
        console.error('❌ Lỗi tạo Return Request:', e.response?.data?.message || e.message);
        return;
    }
    
    // 4. Admin duyệt trạng thái
    console.log('\n[TEST 2] Admin duyệt yêu cầu (APPROVED)...');
    await axios.put(`${BASE_URL}/returns/admin/${returnRequestId}/status`, { status: 'APPROVED', admin_note: 'Đã duyệt, khách gửi hàng về kho' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('✅ Chuyển trạng thái APPROVED thành công!');
    
    console.log('\n[TEST 3] Admin xác nhận đã nhận hàng (RECEIVED)...');
    await axios.put(`${BASE_URL}/returns/admin/${returnRequestId}/status`, { status: 'RECEIVED' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('✅ Chuyển trạng thái RECEIVED thành công!');
    
    console.log('\n[TEST 4] Admin hoàn tất và hoàn tiền (REFUNDED)...');
    await axios.put(`${BASE_URL}/returns/admin/${returnRequestId}/status`, { status: 'REFUNDED', admin_note: 'Đã hoàn tiền, cộng lại kho' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('✅ Chuyển trạng thái REFUNDED thành công!');
    
    // 5. Kiểm tra Tồn kho và Order Status
    console.log('\n[TEST 5] Kiểm tra tồn kho và trạng thái đơn hàng...');
    const orderCheck = await axios.get(`${BASE_URL}/orders/${targetOrder._id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log(`- Trạng thái đơn hàng sau Refund: ${orderCheck.data.status}`);
    
    const productCheck = await axios.get(`${BASE_URL}/products/${firstItem.variant_snapshot.product_id}`);
    const variant = productCheck.data.variants.find(v => v._id === firstItem.variant_snapshot.product_variant_id);
    console.log(`- Tồn kho sản phẩm hiện tại: ${variant.quantity} (Đã được cộng lại 1)`);
    
    console.log('\n--- HOÀN TẤT TEST MODULE RETURNS ---');
}

runReturnsTest();
