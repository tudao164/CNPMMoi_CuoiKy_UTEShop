const Order = require('../../models/Order');
const { executeQuery } = require('../../config/database');
const {
    successResponse,
    errorResponse,
    notFoundResponse,
    paginationResponse
} = require('../../utils/responseHelper');
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../../utils/constants');

class AdminOrderController {
    // GET /api/admin/orders - Get all orders
    async getAllOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const filters = {
                status: req.query.status,
                payment_method: req.query.payment_method,
                payment_status: req.query.payment_status,
                user_id: req.query.user_id,
                date_from: req.query.date_from,
                date_to: req.query.date_to
            };

            let whereConditions = [];
            let params = [];

            if (filters.status) {
                whereConditions.push('o.status = ?');
                params.push(filters.status);
            }

            if (filters.payment_method) {
                whereConditions.push('o.payment_method = ?');
                params.push(filters.payment_method);
            }

            if (filters.payment_status) {
                whereConditions.push('p.payment_status = ?');
                params.push(filters.payment_status);
            }

            if (filters.user_id) {
                whereConditions.push('o.user_id = ?');
                params.push(filters.user_id);
            }

            if (filters.date_from) {
                whereConditions.push('DATE(o.created_at) >= ?');
                params.push(filters.date_from);
            }

            if (filters.date_to) {
                whereConditions.push('DATE(o.created_at) <= ?');
                params.push(filters.date_to);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(DISTINCT o.id) as total 
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                ${whereClause}
            `;
            const countResult = await executeQuery(countQuery, params);
            const total = countResult[0].total;

            // Get orders with user and payment info - Use string interpolation for LIMIT/OFFSET
            const ordersQuery = `
                SELECT 
                    o.*,
                    u.email as user_email,
                    u.full_name as user_name,
                    p.payment_status,
                    p.payment_method as payment_method_detail,
                    COUNT(oi.id) as total_items
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN payments p ON o.id = p.order_id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                ${whereClause}
                GROUP BY o.id, u.email, u.full_name, p.payment_status, p.payment_method
                ORDER BY o.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const orders = await executeQuery(ordersQuery, params);

            return paginationResponse(
                res,
                orders,
                {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                'Danh sách đơn hàng được tải thành công'
            );

        } catch (error) {
            console.error('❌ Admin get all orders error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // GET /api/admin/orders/:id - Get order details
    async getOrderDetails(req, res) {
        try {
            const orderId = req.params.id;

            // Get order with all details
            const [orderData] = await executeQuery(`
                SELECT 
                    o.*,
                    u.email as user_email,
                    u.full_name as user_name,
                    u.phone as user_phone,
                    p.payment_status,
                    p.payment_method as payment_method_detail,
                    p.transaction_id,
                    p.paid_at
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN payments p ON o.id = p.order_id
                WHERE o.id = ?
            `, [orderId]);

            if (!orderData) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            // Get order items
            const items = await executeQuery(`
                SELECT 
                    oi.*,
                    p.name as product_name,
                    p.image_url as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [orderId]);

            // Get order history
            const history = await executeQuery(`
                SELECT 
                    osh.id,
                    osh.order_id,
                    osh.from_status,
                    osh.to_status,
                    osh.reason,
                    osh.updated_by,
                    osh.created_at
                FROM order_status_history osh
                WHERE osh.order_id = ?
                ORDER BY osh.created_at ASC
            `, [orderId]);

            return successResponse(res, {
                order: orderData,
                items: items,
                history: history
            }, 'Chi tiết đơn hàng được tải thành công');

        } catch (error) {
            console.error('❌ Admin get order details error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PATCH /api/admin/orders/:id/status - Update order status
    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status, notes } = req.body;
            const adminId = req.user.id;

            const validStatuses = ['new', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancel_requested'];
            if (!validStatuses.includes(status)) {
                return errorResponse(res, 'Trạng thái đơn hàng không hợp lệ', 400);
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            // Validate status transition
            const validTransitions = {
                'new': ['confirmed', 'cancelled'],
                'confirmed': ['preparing', 'cancelled'],
                'preparing': ['shipping', 'cancelled'],
                'shipping': ['delivered', 'cancelled'],
                'delivered': [],
                'cancelled': [],
                'cancel_requested': ['cancelled', 'confirmed']
            };

            if (!validTransitions[order.status].includes(status)) {
                return errorResponse(res, 
                    `Không thể chuyển từ trạng thái "${order.status}" sang "${status}"`, 
                    400
                );
            }

            const updatedOrder = await Order.updateStatus(orderId, status, notes, adminId);

            return successResponse(res, {
                order: updatedOrder.toJSON()
            }, 'Trạng thái đơn hàng đã được cập nhật');

        } catch (error) {
            console.error('❌ Admin update order status error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // GET /api/admin/orders/stats - Get order statistics
    async getOrderStats(req, res) {
        try {
            const { date_from, date_to } = req.query;

            let dateFilter = '';
            const params = [];

            if (date_from) {
                dateFilter += ' AND DATE(created_at) >= ?';
                params.push(date_from);
            }

            if (date_to) {
                dateFilter += ' AND DATE(created_at) <= ?';
                params.push(date_to);
            }

            const [stats] = await executeQuery(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_orders,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                    SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
                    SUM(CASE WHEN status = 'shipping' THEN 1 ELSE 0 END) as shipping_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                    SUM(CASE WHEN status = 'cancel_requested' THEN 1 ELSE 0 END) as cancel_requested_orders,
                    COALESCE(SUM(total_amount), 0) as total_revenue,
                    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as completed_revenue,
                    COALESCE(AVG(total_amount), 0) as average_order_value
                FROM orders
                WHERE 1=1 ${dateFilter}
            `, params);

            // Get today's stats
            const [todayStats] = await executeQuery(`
                SELECT 
                    COUNT(*) as orders_today,
                    COALESCE(SUM(total_amount), 0) as revenue_today
                FROM orders
                WHERE DATE(created_at) = CURDATE()
            `);

            // Get payment method breakdown
            const paymentStats = await executeQuery(`
                SELECT 
                    payment_method,
                    COUNT(*) as count,
                    COALESCE(SUM(total_amount), 0) as total_amount
                FROM orders
                WHERE 1=1 ${dateFilter}
                GROUP BY payment_method
            `, params);

            return successResponse(res, {
                stats: {
                    ...stats,
                    ...todayStats,
                    payment_breakdown: paymentStats
                }
            }, 'Thống kê đơn hàng được tải thành công');

        } catch (error) {
            console.error('❌ Admin get order stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // GET /api/admin/orders/export - Export orders to CSV
    async exportOrders(req, res) {
        try {
            const { date_from, date_to, status } = req.query;

            let whereConditions = [];
            let params = [];

            if (status) {
                whereConditions.push('o.status = ?');
                params.push(status);
            }

            if (date_from) {
                whereConditions.push('DATE(o.created_at) >= ?');
                params.push(date_from);
            }

            if (date_to) {
                whereConditions.push('DATE(o.created_at) <= ?');
                params.push(date_to);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            const orders = await executeQuery(`
                SELECT 
                    o.id,
                    o.user_id,
                    u.full_name as user_name,
                    u.email as user_email,
                    o.total_amount,
                    o.status,
                    o.payment_method,
                    p.payment_status,
                    o.shipping_address,
                    o.created_at,
                    o.updated_at
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN payments p ON o.id = p.order_id
                ${whereClause}
                ORDER BY o.created_at DESC
            `, params);

            return successResponse(res, {
                orders: orders
            }, 'Dữ liệu đơn hàng được xuất thành công');

        } catch (error) {
            console.error('❌ Admin export orders error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // DELETE /api/admin/orders/:id - Delete order (only for test/cancelled orders)
    async deleteOrder(req, res) {
        try {
            const orderId = req.params.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return notFoundResponse(res, 'Đơn hàng không tồn tại');
            }

            // Only allow deletion of cancelled orders
            if (order.status !== 'cancelled') {
                return errorResponse(res, 'Chỉ có thể xóa đơn hàng đã hủy', 400);
            }

            // Delete order items first
            await executeQuery('DELETE FROM order_items WHERE order_id = ?', [orderId]);
            
            // Delete order status history
            await executeQuery('DELETE FROM order_status_history WHERE order_id = ?', [orderId]);
            
            // Delete payments
            await executeQuery('DELETE FROM payments WHERE order_id = ?', [orderId]);
            
            // Delete order
            await executeQuery('DELETE FROM orders WHERE id = ?', [orderId]);

            return successResponse(res, null, 'Đơn hàng đã được xóa thành công');

        } catch (error) {
            console.error('❌ Admin delete order error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new AdminOrderController();
