const { PayOS } = require('@payos/node');
require('dotenv').config();

const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

class PayosService {
    /**
     * Tạo Payment Link
     */
    async createPaymentLink(orderId, amount, description) {
        const domain = 'http://localhost:8080';
        
        const requestData = {
            orderCode: orderId,
            amount: amount,
            description: description.substring(0, 25),
            returnUrl: `${domain}/checkout-success.html`,
            cancelUrl: `${domain}/checkout-cancel.html`
        };

        try {
            const paymentLink = await payos.paymentRequests.create(requestData);
            return paymentLink;
        } catch (error) {
            console.error('Lỗi tạo link PayOS:', error);
            throw new Error('Không thể tạo link thanh toán PayOS');
        }
    }

    /**
     * Lấy thông tin Payment Link hiện có (Hoặc QR)
     */
    async getPaymentLink(orderId) {
        try {
            const info = await payos.paymentRequests.get(orderId);
            return info; // object chứa status, amountPaid, amountRemaining...
        } catch (error) {
            console.error('Lỗi lấy thông tin PayOS:', error);
            throw new Error('Không tìm thấy thông tin thanh toán PayOS cho đơn hàng này');
        }
    }

    /**
     * Xác thực Webhook Data
     */
    verifyWebhookData(webhookBody) {
        try {
            const data = payos.webhooks.verifyPaymentWebhookData(webhookBody);
            return data;
        } catch (error) {
            console.error('Lỗi xác thực webhook:', error);
            return null;
        }
    }
}

module.exports = new PayosService();
