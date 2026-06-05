const axios = require('axios');

class GHNService {
    constructor() {
        this.token = process.env.GHN_TOKEN || 'd32ad384-5f5e-11f1-a973-aee5264794df';
        this.shopId = process.env.GHN_SHOP_ID || '200543';
        this.baseURL = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2';
        
        // Mặc định kho hàng của shop ở TPHCM (Quận 1)
        this.from_district_id = 1442;
        this.from_ward_code = "20109";
    }

    getHeaders() {
        return {
            'Token': this.token,
            'ShopId': this.shopId,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Tính phí vận chuyển GHN
     */
    async calculateFee(to_district_id, to_ward_code, totalItemsCount) {
        try {
            // Cân nặng mặc định mỗi áo/quần là 200g
            const weight = (totalItemsCount || 1) * 200; 
            
            const response = await axios.post(`${this.baseURL}/shipping-order/fee`, {
                from_district_id: this.from_district_id,
                from_ward_code: this.from_ward_code,
                service_type_id: 2, // 2: E-commerce (Giao chuẩn)
                to_district_id: Number(to_district_id),
                to_ward_code: to_ward_code,
                weight: weight,
                length: 20,
                width: 20,
                height: 10
            }, {
                headers: this.getHeaders()
            });

            if (response.data.code === 200) {
                return response.data.data.total; // Tiền ship
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error('GHN Fee Error:', error.response?.data || error.message);
            // Default 30k nếu lỗi để khỏi sập luồng đặt hàng
            return 30000;
        }
    }

    /**
     * Tạo đơn hàng trên GHN
     */
    async createOrder(order, items) {
        try {
            // Cân nặng tổng
            const totalWeight = items.reduce((sum, item) => sum + (item.total_quantity * 200), 0) || 200;

            const ghnItems = items.map(item => ({
                name: item.variant_snapshot.name || 'Sản phẩm thời trang',
                code: item.variant_snapshot.sku,
                quantity: item.total_quantity,
                price: item.unit_price,
                length: 20,
                width: 20,
                height: 10,
                weight: 200
            }));

            // Nếu có quà tặng, nhét vào luôn
            if (order.gift_snapshot && order.gift_snapshot.name) {
                ghnItems.push({
                    name: `(QUÀ TẶNG) ${order.gift_snapshot.name}`,
                    code: 'GIFT',
                    quantity: order.gift_snapshot.quantity || 1,
                    price: 0,
                    length: 10,
                    width: 10,
                    height: 5,
                    weight: 50
                });
            }

            const codAmount = order.payment_method === 'COD' ? order.total_amount : 0;
            const paymentTypeId = 1; // 1: Người gửi trả cước (Shop trả) hoặc 2: Người nhận trả cước

            const payload = {
                payment_type_id: paymentTypeId,
                note: order.note || 'Khách đặt hàng tại CLOSET',
                required_note: 'CHOXEMHANGKHONGTHU',
                from_name: 'CLOSET Shop',
                from_phone: '0988888888',
                from_address: '123 Đường Số 1, Quận 1',
                from_ward_name: 'Phường Bến Nghé',
                from_district_name: 'Quận 1',
                from_province_name: 'HCM',
                to_name: order.receiver_name,
                to_phone: order.receiver_phone,
                to_address: order.receiver_address,
                to_ward_code: order.to_ward_code,
                to_district_id: Number(order.to_district_id),
                cod_amount: codAmount,
                content: `Đơn hàng ${order._id}`,
                weight: totalWeight,
                length: 20,
                width: 20,
                height: 10,
                service_type_id: 2,
                items: ghnItems
            };

            const response = await axios.post(`${this.baseURL}/shipping-order/create`, payload, {
                headers: this.getHeaders()
            });

            if (response.data.code === 200) {
                return response.data.data.order_code; // Mã vận đơn GHN
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error('GHN Create Order Error:', error.response?.data || error.message);
            throw new Error('Lỗi đồng bộ Giao Hàng Nhanh: ' + (error.response?.data?.message || error.message));
        }
    }
}

module.exports = new GHNService();
