const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runEdgeCases() {
    console.log('--- BẮT ĐẦU TEST EDGE CASES ---');
    
    // 1. Đăng nhập
    const loginRes = await axios.post(`${BASE_URL}/auth/user/login`, {
        phone: '0988888888',
        password: 'password'
    });
    const userToken = loginRes.data.token;
    
    const adminLogin = await axios.post(`${BASE_URL}/auth/admin/login`, {
        username: 'superadmin',
        password: 'admin123'
    });
    const adminToken = adminLogin.data.token;

    // --- TEST 1: Đặt hàng số lượng âm ---
    console.log('\n[TEST 1] Đặt hàng với quantity âm (-5)');
    try {
        await axios.post(`${BASE_URL}/orders`, {
            receiver_name: 'Test',
            receiver_phone: '0909090909',
            receiver_address: '123 Test Street',
            to_district_id: 1442,
            to_ward_code: '20109',
            payment_method: 'COD',
            items: [{ product_variant_id: 26, quantity: -5 }]
        }, { headers: { Authorization: `Bearer ${userToken}` } });
        console.error('❌ LỖI NGHIÊM TRỌNG: API cho phép đặt quantity âm!');
    } catch (e) {
        console.log('✅ PASS: API chặn được số lượng âm. Msg:', e.response?.data?.message);
    }

    // --- TEST 2: Tạo Voucher rỗng / Âm ---
    console.log('\n[TEST 2] Tạo Voucher có giá trị giảm âm (-100k)');
    try {
        await axios.post(`${BASE_URL}/vouchers`, {
            code: 'TESTAM',
            name: 'Voucher Âm',
            discount_type: 'fixed_amount',
            discount_value: -100000
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.error('❌ LỖI NGHIÊM TRỌNG: API cho phép tạo Voucher âm!');
    } catch (e) {
        console.log('✅ PASS: API chặn được Voucher âm. Msg:', e.response?.data?.message);
    }

    // --- TEST 3: Phần trăm giảm lớn hơn 100% ---
    console.log('\n[TEST 3] Tạo Voucher giảm 150%');
    try {
        await axios.post(`${BASE_URL}/vouchers`, {
            code: 'TEST150',
            name: 'Voucher 150%',
            discount_type: 'percentage',
            discount_value: 150
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.error('❌ LỖI NGHIÊM TRỌNG: API cho phép tạo Voucher > 100%!');
    } catch (e) {
        console.log('✅ PASS: API chặn được Voucher > 100%. Msg:', e.response?.data?.message);
    }

    // --- TEST 4: Đánh giá trống / Rating vượt ngưỡng ---
    console.log('\n[TEST 4] Gửi Review với rating = 10');
    try {
        await axios.post(`${BASE_URL}/reviews`, {
            order_item_id: 9999, // dummy
            rating: 10,
            content: 'Test'
        }, { headers: { Authorization: `Bearer ${userToken}` } });
        console.error('❌ LỖI NGHIÊM TRỌNG: API cho phép rating = 10!');
    } catch (e) {
        console.log('✅ PASS: API chặn được rating = 10. Msg:', e.response?.data?.message);
    }

    console.log('\n--- HOÀN TẤT TEST EDGE CASES ---');
}

runEdgeCases();
