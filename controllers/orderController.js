const Order = require('../models/Order');
const Product = require('../models/Product');
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
            const { items, shipping_address, notes } = req.body;

            // Validate items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return errorResponse(res, 'Đơn hàng phải có ít nhất 1 sản phẩm', 400);
            }

            // Validate and calculate total
            let total_amount = 0;
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

                total_amount += price * item.quantity;
            }

            // Create order
            const order = await Order.create({
                user_id: userId,
                total_amount,
                shipping_address,
                notes,
                items: validatedItems
            });

            return createdResponse(res, {
                order: order.toJSON()
            }, 'Đơn hàng đã được tạo thành công');

        } catch (error) {
            console.error('❌ Create order error:', error);
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
}

module.exports = new OrderController();
