const orderService = require('../services/orders.service');

class OrderController {
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập' });
            }
            const customerId = req.body.is_pos ? null : (req.user.customer_id || req.user.id);
            const order = await orderService.createOrder(customerId, req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getShippingFee(req, res) {
        try {
            const { to_district_id, to_ward_code, total_items } = req.body;
            if (!to_district_id || !to_ward_code) {
                return res.status(400).json({ message: 'Vui lòng cung cấp to_district_id và to_ward_code' });
            }
            const ghnService = require('../services/ghn.service');
            const fee = await ghnService.calculateFee(to_district_id, to_ward_code, total_items);
            res.json({ fee });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await orderService.getAll(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMyOrders(req, res) {
        try {
            if (!req.user || !req.user.customer_id) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập để xem đơn hàng' });
            }
            const result = await orderService.getByCustomer(req.user.customer_id, req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await orderService.getById(req.params.id);
            
            // Fix IDOR: Nếu là khách hàng, chỉ được xem đơn của chính mình
            if (req.user && req.user.type === 'user' && req.user.customer_id) {
                const orderCustomerId = result.order ? result.order.customer_id : result.customer_id;
                if (orderCustomerId && orderCustomerId.toString() !== req.user.customer_id.toString()) {
                    return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này (IDOR Protected)' });
                }
            }

            res.json(result);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ message: 'Vui lòng cung cấp status' });
            }
            const order = await orderService.updateStatus(req.params.id, status);
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async payosWebhook(req, res) {
        try {
            const payosService = require('../services/payos.service');
            const webhookData = payosService.verifyWebhookData(req.body);
            
            if (!webhookData) {
                return res.status(400).json({ success: false, message: 'Invalid webhook data' });
            }

            const orderId = webhookData.orderCode;
            const Order = require('../models/Order.model');
            const order = await Order.findById(orderId);
            
            if (order) {
                if (webhookData.code === '00' && webhookData.success === true) {
                    // Thanh toán thành công -> Đổi status đơn hàng
                    if (order.status === 'CANCELLED') {
                        // Nếu đơn đã bị hủy (do quá hạn) nhưng tiền vẫn vào -> Ghi chú CẦN HOÀN TIỀN
                        order.admin_note = (order.admin_note ? order.admin_note + ' | ' : '') + 'KHÁCH THANH TOÁN TRỄ - CẦN HOÀN TIỀN';
                        order.payment_status = 'PAID';
                        await order.save();
                        console.error(`[PAYOS] Đơn hàng #${orderId} đã HỦY nhưng vừa nhận được tiền. Yêu cầu hoàn tiền thủ công.`);
                    } else {
                        order.payment_status = 'PAID';
                        order.status = order.is_pos ? 'COMPLETED' : 'CONFIRMED';
                        await order.save();
                    }
                } else {
                    // Thanh toán thất bại hoặc khách hủy
                    if (order.status !== 'COMPLETED' && order.status !== 'SHIPPING') {
                        order.status = 'CANCELLED';
                        await order.save();
                    }
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPayosLink(req, res) {
        try {
            const Order = require('../models/Order.model');
            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            if (order.payment_method !== 'TRANSFER') {
                return res.status(400).json({ message: 'Đơn hàng này không dùng phương thức chuyển khoản' });
            }
            if (order.payment_status === 'PAID') {
                return res.status(400).json({ message: 'Đơn hàng đã thanh toán' });
            }

            const payosService = require('../services/payos.service');
            // Thử tạo link mới (Nếu orderId chưa từng gửi lên PayOS, hoặc đơn vừa được update)
            try {
                const checkoutUrl = await payosService.createPaymentLink(
                    order._id, 
                    order.total_amount, 
                    `Thanh toan don hang ${order._id}`
                );
                return res.json({ checkoutUrl });
            } catch (error) {
                // Nếu PayOS báo trùng orderCode (đã tạo rồi), ta lấy thông tin link cũ
                try {
                    const info = await payosService.getPaymentLink(order._id);
                    if (info && info.id) {
                        info.checkoutUrl = `https://pay.payos.vn/web/${info.id}`;
                    }
                    return res.json({ info, message: 'Đã lấy thông tin Payment Link' });
                } catch (getInfoError) {
                    return res.status(500).json({ message: 'Không thể lấy thông tin thanh toán' });
                }
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async confirmManual(req, res) {
        try {
            const Order = require('../models/Order.model');
            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            
            order.status = 'CONFIRMED';
            
            // Tích hợp GHN
            if (order.to_district_id && order.to_ward_code && !order.shipping_code) {
                try {
                    const ghnService = require('../services/ghn.service');
                    const OrderItem = require('../models/OrderItem.model');
                    const items = await OrderItem.find({ order_id: order._id });
                    
                    const shippingCode = await ghnService.createOrder(order, items);
                    order.shipping_code = shippingCode;
                    order.status = 'SHIPPING'; // Đã đẩy qua GHN thành công
                } catch (err) {
                    console.error('Lỗi khi bắn đơn GHN:', err.message);
                    order.note = (order.note ? order.note + '\n' : '') + 'GHN Error: ' + err.message;
                }
            }

            await order.save();
            
            res.json({ message: 'Xác nhận đơn hàng thành công', order });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
