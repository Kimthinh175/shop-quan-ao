const mongoose = require('mongoose');
const Order = require('../modules/checkout/models/Order.model');
const ProductVariant = require('../modules/catalog/models/ProductVariant.model');
const Customer = require('../modules/users/models/Customer.model');

// Hàm hoàn trả lại kho (ngược lại của FIFO khi tạo)
async function restoreInventory(orderItems, session) {
    for (const item of orderItems) {
        if (!item.lots_deducted || item.lots_deducted.length === 0) continue;
        
        const variant = await ProductVariant.findById(item.product_variant_id).session(session);
        if (!variant) continue;
        
        // Cộng lại số lượng tổng
        variant.quantity += item.total_quantity;
        variant.sold -= item.total_quantity;
        if (variant.sold < 0) variant.sold = 0;
        
        // Cộng lại từng lô
        for (const deductedLot of item.lots_deducted) {
            const lot = variant.lots_history.find(l => l.poi_id.toString() === deductedLot.poi_id.toString());
            if (lot) {
                lot.remaining += deductedLot.quantity;
                if (variant.current_lot === lot.poi_id.toString()) {
                    variant.current_lot_sold -= deductedLot.quantity;
                    if (variant.current_lot_sold < 0) variant.current_lot_sold = 0;
                }
            }
        }
        
        variant.markModified('lots_history');
        
        // Lùi pointer current_lot về lô cũ nhất còn hàng (trong trường hợp đã nhảy sang lô mới)
        const oldestAvailableLot = variant.lots_history.find(l => l.remaining > 0);
        if (oldestAvailableLot) {
            variant.current_lot = oldestAvailableLot.poi_id.toString();
            variant.current_lot_sold = oldestAvailableLot.quantity - oldestAvailableLot.remaining;
        }
        
        await variant.save({ session });
    }
}

// Job chạy mỗi phút để dọn dẹp các đơn PENDING (TRANSFER) quá 15 phút
async function runExpirationJob() {
    try {
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        
        // Tìm các đơn hàng PENDING, phương thức TRANSFER, và được tạo trước 15 phút
        const expiredOrders = await Order.find({
            status: 'PENDING',
            payment_method: 'TRANSFER',
            createdAt: { $lt: fifteenMinsAgo }
        });
        
        if (expiredOrders.length === 0) return;
        
        console.log(`[CRON] Phát hiện ${expiredOrders.length} đơn hàng hết hạn thanh toán (quá 15p). Đang hủy...`);
        
        const OrderItem = require('../modules/checkout/models/OrderItem.model');
        const notificationsService = require('../modules/notifications/services/notifications.service');
        
        for (const order of expiredOrders) {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // Đổi trạng thái
                order.status = 'CANCELLED';
                order.admin_note = 'Hết hạn thời gian thanh toán (15 phút)';
                await order.save({ session });
                
                // Lấy items để hoàn kho
                const items = await OrderItem.find({ order_id: order._id }).session(session);
                await restoreInventory(items, session);
                
                // Hoàn điểm thưởng đã dùng
                if (order.points_used > 0 && order.customer_id) {
                    const customer = await Customer.findById(order.customer_id).session(session);
                    if (customer) {
                        customer.points += order.points_used;
                        await customer.save({ session });
                    }
                }
                
                // Hoàn mã Khuyến mãi
                if (order.promotion_id) {
                    const Promotion = require('../modules/promotions/models/Promotion.model');
                    const promo = await Promotion.findById(order.promotion_id).session(session);
                    if (promo && promo.used_count > 0) {
                        promo.used_count -= 1;
                        await promo.save({ session });
                    }
                }
                
                // Hoàn mã Voucher
                if (order.voucher_id) {
                    const Voucher = require('../modules/promotions/models/Voucher.model');
                    const voucher = await Voucher.findById(order.voucher_id).session(session);
                    if (voucher && voucher.used_count > 0) {
                        voucher.used_count -= 1;
                        await voucher.save({ session });
                    }
                }
                
                await session.commitTransaction();
                session.endSession();
                
                // Bắn thông báo cho khách hàng
                if (order.customer_id) {
                    try {
                        await notificationsService.sendToUser(
                            order.customer_id, 
                            'ORDER', 
                            'Đơn hàng đã bị hủy', 
                            `Đơn hàng #${order._id} của bạn đã bị hủy do quá thời gian thanh toán.`, 
                            `/account/orders/${order._id}`
                        );
                    } catch (e) {}
                }
                
                console.log(`[CRON] Đã hủy thành công đơn hàng #${order._id} và nhả tồn kho.`);
            } catch (err) {
                await session.abortTransaction();
                session.endSession();
                console.error(`[CRON] Lỗi khi hủy đơn hàng #${order._id}:`, err.message);
            }
        }
    } catch (error) {
        console.error('[CRON] Lỗi chung của Order Expiration Job:', error.message);
    }
}

// Bắt đầu chạy background (dùng setInterval mỗi 1 phút = 60000ms)
function startCron() {
    console.log('[CRON] Khởi động Job kiểm tra đơn hàng hết hạn (Mỗi 1 phút)');
    // Chạy ngay lần đầu tiên
    runExpirationJob();
    setInterval(runExpirationJob, 60000);
}

module.exports = { startCron, runExpirationJob };
