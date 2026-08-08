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
        const domain = process.env.FE_DOMAIN || 'http://localhost:5173';
        
        // Chuyển orderId sang dạng number vì PayOS yêu cầu orderCode phải là kiểu số nguyên
        const numericOrderId = Number(orderId);
        
        const requestData = {
            orderCode: numericOrderId,
            amount: amount,
            description: description.substring(0, 25),
            cancelUrl: `${domain}/checkout/success?orderCode=${orderId}&cancel=true`,
            returnUrl: `${domain}/checkout/success?orderCode=${orderId}`
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
            const numericOrderId = Number(orderId);
            const info = await payos.paymentRequests.get(numericOrderId);
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
