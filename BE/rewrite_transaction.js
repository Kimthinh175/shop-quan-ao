const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/modules/checkout/services/orders.service.js');
let code = fs.readFileSync(filePath, 'utf8');

// The replacement code:
const newCreateOrder = `    async createOrder(customerId, orderData) {
        const mongoose = require('mongoose');
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Validation cơ bản
            if (!orderData.items || orderData.items.length === 0) {
                throw new Error('Đơn hàng phải có ít nhất 1 sản phẩm');
            } 
            for (const item of orderData.items) {
                if (!item.quantity || item.quantity <= 0) {
                    throw new Error('Số lượng sản phẩm không hợp lệ');
                }
            }
            
            // Khởi tạo mảng lưu OrderItems để insert sau
            const orderItemsToSave = [];
            let calculatedTotalPrice = 0;

            // BƯỚC 1: KIỂM TRA TỒN KHO VÀ CHẠY FIFO
            for (const item of orderData.items) {
                const variant = await ProductVariant.findById(item.product_variant_id).session(session);
                if (!variant) throw new Error(\`Không tìm thấy ProductVariant \${item.product_variant_id}\`);
                if (variant.quantity < item.quantity) {
                    throw new Error(\`Sản phẩm \${variant.sku} không đủ tồn kho (Còn \${variant.quantity})\`);
                }

                const product = await Product.findById(variant.product_id).session(session);
                
                let remainingToDeduct = item.quantity;
                const lotsDeducted = [];
                
                // Lặp qua lịch sử lô nhập để trừ kho (FIFO)
                for (let i = 0; i < variant.lots_history.length; i++) {
                    const lot = variant.lots_history[i];
                    if (lot.remaining > 0) {
                        const deductAmount = Math.min(remainingToDeduct, lot.remaining);
                        lot.remaining -= deductAmount;
                        remainingToDeduct -= deductAmount;
                        
                        lotsDeducted.push({
                            poi_id: lot.poi_id,
                            quantity: deductAmount,
                            cost_price: lot.unit_cost
                        });
                        
                        // Cập nhật current_lot_sold (đã bán của lô hiện tại)
                        if (variant.current_lot === lot.poi_id.toString()) {
                            variant.current_lot_sold += deductAmount;
                        }
                        
                        if (remainingToDeduct === 0) break;
                    }
                }
                
                // Cập nhật lại kho của Variant
                variant.quantity -= item.quantity;
                variant.sold += item.quantity;
                variant.markModified('lots_history');
                
                // Xử lý current_lot pointer nếu lô hiện tại đã hết
                if (variant.lots_history.length > 0) {
                    const activeLot = variant.lots_history.find(l => l.remaining > 0);
                    if (activeLot) {
                        variant.current_lot = activeLot.poi_id.toString();
                        variant.current_lot_sold = activeLot.quantity - activeLot.remaining;
                    } else {
                        variant.current_lot = null;
                    }
                }

                await variant.save({ session });

                calculatedTotalPrice += item.quantity * variant.price;

                orderItemsToSave.push({
                    product_variant_id: item.product_variant_id,
                    variant_snapshot: {
                        product_variant_id: variant._id,
                        product_id: variant.product_id,
                        name: product ? product.name : 'Unknown Product',
                        sku: variant.sku,
                        color: variant.color,
                        size: variant.size,
                        main_img: product ? product.main_img : ''
                    },
                    total_quantity: item.quantity,
                    unit_price: variant.price,
                    lots_deducted: lotsDeducted
                });
            }

            // BƯỚC 1.5: XỬ LÝ KHUYẾN MÃI (PROMOTION) NẾU CÓ
            let promotionDiscount = 0;
            let giftSnapshot = null;
            if (orderData.promotion_id) {
                const Promotion = require('../../promotions/models/Promotion.model');
                const promotion = await Promotion.findById(orderData.promotion_id).session(session);
                if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi');
                
                const now = new Date();
                if (!promotion.is_active || now < promotion.start_time || now > promotion.end_time) {
                    throw new Error('Chương trình khuyến mãi đã hết hạn hoặc không hoạt động');
                }
                if (promotion.usage_limit > 0 && promotion.used_count >= promotion.usage_limit) {
                    throw new Error('Mã khuyến mãi đã hết lượt sử dụng');
                }

                const applicableProductIds = promotion.applicable_products.map(id => id.toString());
                let applicableQuantity = 0;
                let applicableAmount = 0;

                if (applicableProductIds.length > 0) {
                    for (const item of orderItemsToSave) {
                        if (applicableProductIds.includes(item.variant_snapshot.product_id.toString())) {
                            applicableQuantity += item.total_quantity;
                            applicableAmount += item.unit_price * item.total_quantity;
                        }
                    }
                } else {
                    applicableQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
                    applicableAmount = calculatedTotalPrice;
                }

                if (applicableProductIds.length > 0 && applicableQuantity === 0) {
                    throw new Error('Giỏ hàng không có sản phẩm nào thuộc chương trình khuyến mãi này');
                }

                if (promotion.condition_type === 'AMOUNT' && applicableAmount < promotion.min_amount) {
                    throw new Error(\`Chưa đạt giá trị tối thiểu \${promotion.min_amount}đ của các sản phẩm được áp dụng\`);
                }
                if (promotion.condition_type === 'QUANTITY' && applicableQuantity < promotion.min_quantity) {
                    throw new Error(\`Cần mua ít nhất \${promotion.min_quantity} sản phẩm được áp dụng\`);
                }

                for (const reward of promotion.rewards) {
                    if (reward.reward_type === 'DISCOUNT_AMOUNT') {
                        promotionDiscount += Math.min(reward.discount_amount || 0, applicableAmount);
                    } else if (reward.reward_type === 'DISCOUNT_PERCENT') {
                        let discount = (applicableAmount * (reward.discount_percent || 0)) / 100;
                        if (reward.max_discount_amount && discount > reward.max_discount_amount) {
                            discount = reward.max_discount_amount;
                        }
                        promotionDiscount += discount;
                    } else if (reward.reward_type === 'GIFT') {
                        const Gift = require('../../promotions/models/Gift.model');
                        const gift = await Gift.findById(reward.gift_id).session(session);
                        if (!gift) {
                            throw new Error('Quà tặng không tồn tại trong hệ thống');
                        }
                        if (gift.quantity < reward.gift_quantity) {
                            throw new Error(\`Rất tiếc, quà tặng \${gift.name} đã hết hàng\`);
                        }
                        
                        gift.quantity -= reward.gift_quantity;
                        await gift.save({ session });

                        giftSnapshot = {
                            gift_id: gift._id,
                            name: gift.name,
                            main_img: gift.main_img,
                            quantity: reward.gift_quantity
                        };
                    }
                }
                
                promotion.used_count += 1;
                await promotion.save({ session });
            }

            // BƯỚC 1.6: XỬ LÝ VOUCHER
            let voucherDiscount = 0;
            if (orderData.voucher_code) {
                const voucherService = require('../../promotions/services/vouchers.service');
                const voucherResult = await voucherService.checkVoucher(orderData.voucher_code, calculatedTotalPrice);
                voucherDiscount = voucherResult.discount;
                orderData.voucher_id = voucherResult.voucher._id;
                
                // Fetch within session
                const Voucher = require('../../promotions/models/Voucher.model');
                const voucher = await Voucher.findById(voucherResult.voucher._id).session(session);
                voucher.used_count += 1;
                await voucher.save({ session });
            }

            // BƯỚC 1.7: TÍCH ĐIỂM & TRỪ ĐIỂM (Loyalty Points)
            let pointsDiscount = 0;
            let pointsEarned = 0;
            
            const User = require('../../users/models/User.model');
            const userRec = await User.findById(customerId).session(session);
            const actualCustomerId = userRec ? userRec.customer_id : customerId;
            
            const Customer = require('../../users/models/Customer.model');
            const customerInfo = await Customer.findById(actualCustomerId).session(session);

            if (orderData.use_points) {
                let usePoints = Number(orderData.use_points) || 0;
                if (usePoints > 20000) usePoints = 20000;
                
                if (customerInfo && customerInfo.points >= usePoints && usePoints > 0) {
                    pointsDiscount = usePoints;
                    orderData.points_used = usePoints;
                    
                    customerInfo.points -= usePoints;
                    await customerInfo.save({ session });
                }
            }
            
            const totalItemsCount = orderData.items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
            pointsEarned = totalItemsCount * 1000;
            orderData.points_earned = pointsEarned;

            // BƯỚC 2: TẠO ORDER
            orderData.total_price = calculatedTotalPrice;
            orderData.discount_amount = promotionDiscount + voucherDiscount + pointsDiscount;
            orderData.total_amount = calculatedTotalPrice - orderData.discount_amount + (orderData.shipping_fee || 0);
            if (orderData.total_amount < 0) orderData.total_amount = 0;
            
            orderData.customer_id = actualCustomerId;
            if (giftSnapshot) orderData.gift_snapshot = giftSnapshot;
            
            if (orderData.payment_method === 'POS') {
                orderData.status = 'COMPLETED';
                orderData.payment_status = 'PAID';
            } else {
                orderData.status = 'PENDING';
                orderData.payment_status = 'UNPAID';
            }

            const orders = await Order.create([orderData], { session });
            const order = orders[0];

            // BƯỚC 3: TẠO ORDER ITEMS
            for (const oi of orderItemsToSave) {
                oi.order_id = order._id;
            }
            await OrderItem.create(orderItemsToSave, { session });

            await session.commitTransaction();
            session.endSession();

            // BƯỚC 4: TÍCH HỢP PAYOS NẾU LÀ TRANSFER (ngoài transaction)
            let payosLinkInfo = null;
            if (order.payment_method === 'TRANSFER') {
                const payosService = require('./payos.service');
                payosLinkInfo = await payosService.createPaymentLink(
                    order._id, 
                    order.total_amount, 
                    \`Thanh toan don hang \${order._id}\`
                );
            }

            const result = await this.getById(order._id);
            if (payosLinkInfo) result.payosData = payosLinkInfo;

            // Bắn thông báo
            try {
                await notificationsService.sendToUser(1, 'ORDER', 'Đơn hàng mới', \`Đơn hàng #\${order._id} vừa được đặt\`, \`/admin/orders\`);
            } catch (e) {
                console.error('Lỗi khi gửi thông báo:', e.message);
            }

            return result;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }`;

// Replace the method in the file
const startIdx = code.indexOf('async createOrder(customerId, orderData) {');
const endIdx = code.indexOf('    async getAll(query = {}) {');

if (startIdx > -1 && endIdx > -1) {
    const updatedCode = code.substring(0, startIdx) + newCreateOrder + '\n\n' + code.substring(endIdx);
    fs.writeFileSync(filePath, updatedCode, 'utf8');
    console.log('Transaction added successfully!');
} else {
    console.log('Could not find createOrder boundaries.');
}
