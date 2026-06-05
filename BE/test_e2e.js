const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        console.log('--- STARTING E2E TEST ---');

        // 1. Tìm kiếm / Hiển thị sản phẩm
        console.log('\n1. Tìm kiếm sản phẩm (keyword: áo)');
        const searchRes = await axios.get(`${BASE_URL}/products?search=áo`);
        const products = searchRes.data.results || [];
        console.log(`Tìm thấy ${products.length} sản phẩm.`);
        
        if (products.length === 0) {
            console.log('Không có sản phẩm nào, dừng test.');
            return;
        }
        
        const firstProduct = products[0];
        console.log(`- Sản phẩm chọn mua: ${firstProduct.name} (ID: ${firstProduct._id})`);
        
        // 2. Lấy danh sách ProductVariant của Sản phẩm đó
        console.log(`\n2. Lấy biến thể sản phẩm cho ${firstProduct.name}...`);
        // Vì trong route có lấy chi tiết bằng ID
        const detailRes = await axios.get(`${BASE_URL}/products/${firstProduct._id}`);
        const productDetail = detailRes.data;
        const variant = productDetail.variants[0]; // Chọn biến thể đầu tiên
        if (!variant) {
            console.log('Sản phẩm không có biến thể nào.');
            return;
        }
        console.log(`- Biến thể: SKU ${variant.sku}, ID ${variant._id}, Giá: ${firstProduct.base_price}đ`);

        // 3. Đăng nhập User
        console.log('\n3. Đăng nhập User...');
        const loginRes = await axios.post(`${BASE_URL}/auth/user/login`, {
            phone: '0988888888',
            password: 'password'
        });
        const userToken = loginRes.data.token;
        console.log('- Đăng nhập thành công, Token:', userToken.substring(0, 20) + '...');

        // 4. Tạo Hóa Đơn (Order)
        console.log('\n4. Đặt hàng...');
        const orderPayload = {
            receiver_name: 'Khách Test E2E',
            receiver_phone: '0909090909',
            receiver_address: '123 Test Street',
            to_district_id: 1442,
            to_ward_code: '20109',
            payment_method: 'COD',
            items: [
                {
                    product_variant_id: variant._id,
                    quantity: 1
                }
            ]
        };
        
        const orderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const order = orderRes.data.order;
        console.log(`- Đặt hàng thành công! Mã Đơn Hàng: ${order._id}`);
        console.log(`- Tình trạng đơn: ${order.status}`);
        console.log(`- Điểm sẽ nhận: ${order.points_earned}`);

        // 5. Admin đăng nhập và Xác nhận / Hoàn thành đơn hàng
        console.log('\n5. Đăng nhập Admin và Giao hàng thành công...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/admin/login`, {
            username: 'superadmin',
            password: 'admin123'
        });
        const adminToken = adminLogin.data.token;
        
        const completeRes = await axios.put(`${BASE_URL}/orders/${order._id}/status`, {
            status: 'COMPLETED'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`- Đơn hàng chuyển sang trạng thái: ${completeRes.data.status}`);
        console.log(`- Trạng thái trả điểm: ${completeRes.data.points_awarded}`);

        // 6. Đánh giá sản phẩm
        console.log('\n6. Đánh giá sản phẩm (Review)...');
        const items = orderRes.data.items;
        const orderItemId = items[0]._id;
        const reviewPayload = {
            order_item_id: orderItemId,
            rating: 5,
            content: 'Sản phẩm tuyệt vời, mặc rất mát!'
        };
        const reviewRes = await axios.post(`${BASE_URL}/reviews`, reviewPayload, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('- Đánh giá thành công!');
        console.log(`- Lời bình: ${reviewRes.data.content}`);

        console.log('\n--- E2E TEST SUCCESSFUL! ---');
    } catch (error) {
        console.error('\n!!! E2E TEST FAILED !!!');
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTest();
