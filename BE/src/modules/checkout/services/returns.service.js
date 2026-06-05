const ReturnRequest = require('../models/ReturnRequest.model');
const Order = require('../models/Order.model');
const OrderItem = require('../models/OrderItem.model');
const ProductVariant = require('../../catalog/models/ProductVariant.model');
const Customer = require('../../users/models/Customer.model');
const notificationsService = require('../../notifications/services/notifications.service');
const paginate = require('../../../core/utils/paginate');

class ReturnsService {
    
    // 1. Khách hàng tạo yêu cầu trả hàng
    async requestReturn(customerId, data) {
        const { order_id, items, customer_note, images } = data;
        
        if (!items || items.length === 0) throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để trả lại');
        
        const order = await Order.findOne({ _id: order_id, customer_id: customerId });
        if (!order) throw new Error('Không tìm thấy đơn hàng');
        if (order.status !== 'COMPLETED') throw new Error('Chỉ có thể trả lại đơn hàng đã hoàn thành');
        
        let totalRefundAmount = 0;
        let totalItemsToReturn = 0;
        const returnItemsToSave = [];
        
        for (const reqItem of items) {
            const orderItem = await OrderItem.findOne({ _id: reqItem.order_item_id, order_id: order_id });
            if (!orderItem) throw new Error(`Không tìm thấy sản phẩm ${reqItem.order_item_id} trong đơn hàng`);
            
            if (reqItem.quantity <= 0 || reqItem.quantity > orderItem.total_quantity) {
                throw new Error(`Số lượng trả lại cho sản phẩm ${reqItem.order_item_id} không hợp lệ`);
            }
            
            // Note: Trong thực tế cần check xem sản phẩm này đã được trả lại trong 1 request khác chưa
            // Ở đây tạm đơn giản hóa, giả định mỗi item chỉ được tạo request 1 lần
            
            const itemTotal = orderItem.unit_price * reqItem.quantity;
            totalRefundAmount += itemTotal;
            totalItemsToReturn += reqItem.quantity;
            
            returnItemsToSave.push({
                order_item_id: reqItem.order_item_id,
                product_variant_id: orderItem.variant_snapshot.product_variant_id,
                quantity: reqItem.quantity,
                reason: reqItem.reason,
                condition: reqItem.condition
            });
        }
        
        // Trừ tỉ lệ discount (Promotion + Voucher + Points used)
        // Nếu hóa đơn có discount, ta trừ phần tiền hoàn lại theo đúng tỉ lệ discount
        if (order.discount_amount > 0 && order.total_price > 0) {
            const discountRatio = order.discount_amount / order.total_price;
            totalRefundAmount = totalRefundAmount * (1 - discountRatio);
        }
        
        // Tính toán điểm clawback (truy thu)
        // Mỗi sản phẩm lúc mua đc +1000 điểm. Trả bao nhiêu sp thì thu hồi bấy nhiêu x 1000
        const pointsClawback = totalItemsToReturn * 1000;
        
        const newRequest = await ReturnRequest.create({
            order_id,
            customer_id: customerId,
            items: returnItemsToSave,
            refund_amount: Math.round(totalRefundAmount),
            refund_points_clawback: pointsClawback,
            images: images || [],
            customer_note
        });
        
        return newRequest;
    }
    
    // 2. Lịch sử trả hàng của Khách
    async getMyReturns(customerId, query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = { customer_id: customerId };
        
        const [data, total] = await Promise.all([
            ReturnRequest.find(filter).sort('-createdAt').skip(skip).limit(limit),
            ReturnRequest.countDocuments(filter)
        ]);
        
        return { data, pagination: { total, page, limit, totalPages: Math.ceil(total/limit) } };
    }
    
    // 3. Danh sách yêu cầu cho Admin
    async getAllReturns(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.status) filter.status = query.status;
        if (query.order_id) filter.order_id = query.order_id;
        
        const [data, total] = await Promise.all([
            ReturnRequest.find(filter).populate('customer_id').sort('-createdAt').skip(skip).limit(limit),
            ReturnRequest.countDocuments(filter)
        ]);
        
        return { data, pagination: { total, page, limit, totalPages: Math.ceil(total/limit) } };
    }
    
    // 4. Admin xử lý trạng thái
    async updateReturnStatus(returnId, status, adminNote = '') {
        const request = await ReturnRequest.findById(returnId);
        if (!request) throw new Error('Không tìm thấy yêu cầu trả hàng');
        
        // Allowed transitions: PENDING -> APPROVED/REJECTED -> RECEIVED -> REFUNDED
        request.status = status;
        if (adminNote) request.admin_note = adminNote;
        
        if (status === 'REFUNDED') {
            await this.processRefundEffects(request);
        }
        
        await request.save();
        
        // Bắn thông báo cho Customer
        try {
            let msg = '';
            if (status === 'APPROVED') msg = 'Yêu cầu trả hàng của bạn đã được duyệt. Vui lòng gửi hàng về kho.';
            if (status === 'REJECTED') msg = 'Yêu cầu trả hàng của bạn đã bị từ chối.';
            if (status === 'RECEIVED') msg = 'Chúng tôi đã nhận được hàng hoàn trả của bạn.';
            if (status === 'REFUNDED') msg = `Đã hoàn tiền ${request.refund_amount}đ cho yêu cầu trả hàng của bạn.`;
            
            if (msg) {
                await notificationsService.sendToUser(request.customer_id, 'RETURN', 'Cập nhật trả hàng', msg, `/account/returns`);
            }
        } catch (e) {
            console.error('Lỗi khi gửi thông báo RMA:', e.message);
        }
        
        return request;
    }
    
    // Hàm phụ trợ xử lý hiệu ứng sau khi hoàn tiền
    async processRefundEffects(request) {
        // 1. Cập nhật Tồn Kho (Chỉ cộng kho nếu condition === 'NEW')
        for (const item of request.items) {
            if (item.condition === 'NEW') {
                const variant = await ProductVariant.findById(item.product_variant_id);
                if (variant) {
                    variant.quantity += item.quantity;
                    variant.sold = Math.max(0, variant.sold - item.quantity);
                    
                    // Tìm giá vốn từ OrderItem
                    const orderItem = await OrderItem.findById(item.order_item_id);
                    let costPrice = 0;
                    if (orderItem && orderItem.lots_deducted && orderItem.lots_deducted.length > 0) {
                        costPrice = orderItem.lots_deducted[0].cost_price; // Tạm lấy giá vốn lô đầu tiên
                    }
                    
                    // Bơm lại vào lots_history một pseudo-lot để cân bằng FIFO
                    variant.lots_history.push({
                        poi_id: -request._id, // Dùng ID âm để biết là lot sinh ra từ Return
                        unit_cost: costPrice,
                        remaining: item.quantity,
                        note: 'Hàng trả lại từ đơn ' + request.order_id
                    });
                    
                    variant.markModified('lots_history');
                    await variant.save();
                }
            }
        }
        
        // 2. Truy thu điểm thưởng
        const customer = await Customer.findById(request.customer_id);
        if (customer && request.refund_points_clawback > 0) {
            let actualClawback = Math.min(customer.points, request.refund_points_clawback);
            let missingPoints = request.refund_points_clawback - actualClawback;
            
            customer.points -= actualClawback;
            
            // Nếu điểm không đủ truy thu (khách đã tiêu), cấn trừ vào tiền mặt hoàn lại (1 điểm = 1đ)
            if (missingPoints > 0) {
                request.refund_amount = Math.max(0, request.refund_amount - missingPoints);
            }
            
            await customer.save();
        }
        
        // 3. Cập nhật trạng thái Đơn hàng thành PARTIAL_RETURNED hoặc RETURNED
        const order = await Order.findById(request.order_id);
        if (order) {
            // Đơn giản hóa: Cứ có Refund là đánh dấu PARTIAL_RETURNED,
            // Nếu muốn chính xác RETURNED thì phải check tổng số lượng item trả so với lúc mua
            order.status = 'PARTIAL_RETURNED';
            await order.save();
        }
    }
}

module.exports = new ReturnsService();
