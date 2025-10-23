const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const {
    successResponse,
    errorResponse,
    notFoundResponse,
    createdResponse,
    paginationResponse
} = require('../utils/responseHelper');
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../utils/constants');

class OrderController {
    // Create new order
    async createOrder(req, res) {
        try {
            const userId = req.user.id;
            const { items, shipping_address, notes, coupon_code } = req.body;

            // Validate items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return errorResponse(res, 'Đơn hàng phải có ít nhất 1 sản phẩm', 400);
            }

            // Validate and calculate total
            let subtotal_amount = 0;
            const validatedItems = [];

            for (const item of items) {
                const product = await Product.findById(item.product_id);
                if (!product) {
                    return errorResponse(res, `Sản phẩm ID ${item.product_id} không tồn tại`, 400);
                }

                if (!product.isInStock()) {
                    return errorResponse(res, `Sản phẩm "${product.name}" đã hết hàng`, 400);
                }

                if (item.quantity > product.stock_quantity) {
                    return errorResponse(res, `Sản phẩm "${product.name}" chỉ còn ${product.stock_quantity} trong kho`, 400);
                }

                const price = product.getEffectivePrice();
                validatedItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: price
                });

                subtotal_amount += price * item.quantity;
            }

            // Handle coupon if provided
            let coupon_id = null;
            let discount_amount = 0;
            let total_amount = subtotal_amount;

            if (coupon_code) {
                const couponValidation = await Coupon.validate(coupon_code, userId, { items: validatedItems });
                
                if (!couponValidation.valid) {
                    return errorResponse(res, couponValidation.message, 400);
                }

                coupon_id = couponValidation.coupon_id;
                discount_amount = couponValidation.discount_amount;
                total_amount = couponValidation.final_amount;
            }

            // Create order
            const order = await Order.create({
                user_id: userId,
                total_amount,
                subtotal_amount,
                discount_amount,
                coupon_id,
                coupon_code: coupon_code ? coupon_code.toUpperCase() : null,
                shipping_address,
                notes,
                items: validatedItems
            });

            // Record coupon usage if coupon was applied
            if (coupon_id) {
                await Coupon.recordUsage(coupon_id, userId, order.id, discount_amount);
            }

            return createdResponse(res, {
                order: order.toJSON(),
                applied_coupon: coupon_code ? {
                    code: coupon_code.toUpperCase(),
                    discount_amount,
                    subtotal_amount,
                    total_amount
                } : null
            }, 'Đơn hàng đã được tạo thành công');

        } catch (error) {
            console.error('❌ Create order error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Create order from cart
    async createOrderFromCart(req, res) {
        try {
            const userId = req.user.id;
            const { shipping_address, notes, payment_method, coupon_code } = req.body;

            // Validate cart
            const cartValidation = await Cart.validateCart(userId);
            if (!cartValidation.is_valid) {
                return errorResponse(res, 'Giỏ hàng có sản phẩm không hợp lệ. Vui lòng kiểm tra lại.', 400, {
                    invalid_items: cartValidation.invalid_items
                });
            }

            // Get cart items and convert to order format
            const cartItems = await Cart.getOrderItems(userId);
            if (cartItems.length === 0) {
                return errorResponse(res, 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.', 400);
            }

            // Calculate subtotal amount
            let subtotal_amount = 0;
            for (const item of cartItems) {
                subtotal_amount += item.price * item.quantity;
            }

            // Handle coupon if provided
            let coupon_id = null;
            let discount_amount = 0;
            let total_amount = subtotal_amount;

            if (coupon_code) {
                const couponValidation = await Coupon.validate(coupon_code, userId, { items: cartItems });
                
                if (!couponValidation.valid) {
                    return errorResponse(res, couponValidation.message, 400);
                }

                coupon_id = couponValidation.coupon_id;
                discount_amount = couponValidation.discount_amount;
                total_amount = couponValidation.final_amount;
            }

            // Create order
            const order = await Order.create({
                user_id: userId,
                total_amount,
                subtotal_amount,
                discount_amount,
                coupon_id,
                coupon_code: coupon_code ? coupon_code.toUpperCase() : null,
                shipping_address,
                notes,
                payment_method: payment_method || 'COD',
                items: cartItems
            });

            // Record coupon usage if coupon was applied
            if (coupon_id) {
                await Coupon.recordUsage(coupon_id, userId, order.id, discount_amount);
            }

            // Clear cart after successful order creation
            await Cart.clearCart(userId);

            return createdResponse(res, {
                order: order.toJSON(),
                cart_cleared: true,
                applied_coupon: coupon_code ? {
                    code: coupon_code.toUpperCase(),
                    discount_amount,
                    subtotal_amount,
                    total_amount
                } : null
            }, 'Đơn hàng đã được tạo thành công từ giỏ hàng');

        } catch (error) {
            console.error('❌ Create order from cart error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get user's orders
    async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await Order.getUserOrders(userId, page, limit);

            return paginationResponse(
                res,
                result.orders.map(order => order.toJSON()),
                result.pagination,
                'Danh sách đơn hàng được tải thành công'
            );

        } catch (error) {
            console.error('❌ Get user orders error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get order by ID
    async getOrderById(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            // Check if order belongs to user
            if (order.user_id !== userId) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            return successResponse(res, {
                order: order.toJSON()
            }, 'Chi tiết đơn hàng được tải thành công');

        } catch (error) {
            console.error('❌ Get order by ID error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Update order status (for admin or system use)
    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return errorResponse(res, 'Trạng thái đơn hàng không hợp lệ', 400);
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            const updatedOrder = await Order.updateStatus(orderId, status);

            return successResponse(res, {
                order: updatedOrder.toJSON()
            }, 'Trạng thái đơn hàng đã được cập nhật');

        } catch (error) {
            console.error('❌ Update order status error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Cancel order (only for pending orders)
    async cancelOrder(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            // Check if order belongs to user
            if (order.user_id !== userId) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            // Check if order can be cancelled
            if (order.status !== 'pending') {
                return errorResponse(res, 'Chỉ có thể hủy đơn hàng đang chờ xác nhận', 400);
            }

            const updatedOrder = await Order.updateStatus(orderId, 'cancelled');

            // TODO: Restore stock quantity for cancelled orders

            return successResponse(res, {
                order: updatedOrder.toJSON()
            }, 'Đơn hàng đã được hủy thành công');

        } catch (error) {
            console.error('❌ Cancel order error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get user order statistics
    async getUserOrderStats(req, res) {
        try {
            const userId = req.user.id;

            const stats = await Order.getUserOrderStats(userId);

            return successResponse(res, {
                stats: {
                    total_orders: parseInt(stats.total_orders) || 0,
                    pending_orders: parseInt(stats.pending_orders) || 0,
                    confirmed_orders: parseInt(stats.confirmed_orders) || 0,
                    shipping_orders: parseInt(stats.shipping_orders) || 0,
                    delivered_orders: parseInt(stats.delivered_orders) || 0,
                    cancelled_orders: parseInt(stats.cancelled_orders) || 0,
                    total_spent: parseFloat(stats.total_spent) || 0
                }
            }, 'Thống kê đơn hàng được tải thành công');

        } catch (error) {
            console.error('❌ Get user order stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get order tracking history
    async getOrderTracking(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.user.id;

            // Get order and verify ownership
            const order = await Order.findById(orderId);
            if (!order) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            if (order.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền xem thông tin này', 403);
            }

            // Get tracking history
            const tracking = await Order.getOrderTracking(orderId, userId);

            return successResponse(res, {
                order: order.toJSON(),
                tracking: tracking,
                message: 'Lấy thông tin theo dõi đơn hàng thành công'
            });

        } catch (error) {
            console.error('❌ Get order tracking error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Update order status (Enhanced)
    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status, notes } = req.body;
            const userId = req.user.id;

            // Note: In real implementation, add admin/staff role check here
            // For now, allowing any authenticated user for testing

            const updatedOrder = await Order.updateStatus(orderId, status, notes, userId);

            if (!updatedOrder) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            return successResponse(res, {
                order: updatedOrder.toJSON(),
                message: 'Cập nhật trạng thái đơn hàng thành công'
            });

        } catch (error) {
            console.error('❌ Update order status error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Auto-confirm orders (to be called by scheduled job)
    async autoConfirmOrders(req, res) {
        try {
            // Note: This endpoint should be secured and only accessible by system/admin
            const results = await Order.autoConfirmOrders();

            return successResponse(res, {
                results,
                total_processed: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                message: 'Tự động xác nhận đơn hàng hoàn thành'
            });

        } catch (error) {
            console.error('❌ Auto confirm orders error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new OrderController();
