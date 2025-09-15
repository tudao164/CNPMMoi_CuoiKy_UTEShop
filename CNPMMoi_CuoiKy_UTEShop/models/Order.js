const { executeQuery, getOne, insert } = require('../config/database');

class Order {
    constructor(orderData) {
        this.id = orderData.id;
        this.user_id = orderData.user_id;
        this.total_amount = parseFloat(orderData.total_amount);
        this.status = orderData.status;
        this.shipping_address = orderData.shipping_address;
        this.notes = orderData.notes;
        this.created_at = orderData.created_at;
        this.updated_at = orderData.updated_at;
        this.confirmed_at = orderData.confirmed_at;
        this.delivered_at = orderData.delivered_at;
        this.cancelled_at = orderData.cancelled_at;
        this.items = orderData.items || [];
        this.user_name = orderData.user_name;
        this.user_email = orderData.user_email;
        this.status_history = orderData.status_history || [];
    }

    // Create new order
    static async create(orderData) {
        const { pool } = require('../config/database');
        let connection;
        
        try {
            const { user_id, total_amount, shipping_address, notes, items } = orderData;

            // Get connection for transaction
            connection = await pool.getConnection();
            
            // Start transaction
            await connection.beginTransaction();

            try {
                // Insert order with 'new' status
                const [orderResult] = await connection.execute(
                    'INSERT INTO orders (user_id, total_amount, shipping_address, notes, status) VALUES (?, ?, ?, ?, ?)',
                    [user_id, total_amount, shipping_address, notes, 'new']
                );
                const orderId = orderResult.insertId;

                // Insert order items
                for (const item of items) {
                    await connection.execute(
                        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                        [orderId, item.product_id, item.quantity, item.price]
                    );

                    // Update product sold count and stock
                    await connection.execute(
                        'UPDATE products SET sold_count = sold_count + ?, stock_quantity = stock_quantity - ? WHERE id = ?',
                        [item.quantity, item.quantity, item.product_id]
                    );
                }

                // Add initial status history
                await connection.execute(
                    'INSERT INTO order_status_history (order_id, to_status, reason) VALUES (?, ?, ?)',
                    [orderId, 'new', 'Đơn hàng được tạo']
                );

                // Commit transaction
                await connection.commit();
                console.log(`✅ Order created successfully with ID: ${orderId}`);

                // Return created order
                return await Order.findById(orderId);
            } catch (error) {
                // Rollback transaction
                await connection.rollback();
                throw error;
            }
        } catch (error) {
            console.error('❌ Error creating order:', error);
            throw new Error('Lỗi tạo đơn hàng');
        } finally {
            if (connection) connection.release();
        }
    }

    // Get order by ID
    static async findById(id) {
        try {
            const orderData = await getOne(
                `SELECT o.*, u.full_name as user_name, u.email as user_email
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 WHERE o.id = ?`,
                [id]
            );

            if (!orderData) return null;

            // Get order items
            const items = await executeQuery(
                `SELECT oi.*, p.name as product_name, p.image_url as product_image
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [id]
            );

            // Get status history
            const statusHistory = await executeQuery(
                `SELECT * FROM order_status_history 
                 WHERE order_id = ? 
                 ORDER BY created_at ASC`,
                [id]
            );

            orderData.items = items;
            orderData.status_history = statusHistory;
            return new Order(orderData);
        } catch (error) {
            console.error('❌ Error finding order by ID:', error);
            throw new Error('Lỗi tìm kiếm đơn hàng');
        }
    }

    // Get user's orders with enhanced filtering
    static async getUserOrders(userId, page = 1, limit = 10, status = null) {
        try {
            // Ensure parameters are proper integers
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const offset = (pageNum - 1) * limitNum;

            // Get total count first
            let countSql = `SELECT COUNT(DISTINCT o.id) as total FROM orders o WHERE o.user_id = ?`;
            let countParams = [userId];
            
            if (status) {
                countSql += ` AND o.status = ?`;
                countParams.push(status);
            }
            
            const countResult = await executeQuery(countSql, countParams);
            const total = countResult[0].total;

            // Get orders with proper parameter handling
            let sql = `SELECT o.*, COUNT(oi.id) as item_count
                       FROM orders o
                       LEFT JOIN order_items oi ON o.id = oi.order_id
                       WHERE o.user_id = ?`;
            
            let params = [userId];
            
            if (status) {
                sql += ` AND o.status = ?`;
                params.push(status);
            }
            
            sql += ` GROUP BY o.id
                     ORDER BY o.created_at DESC
                     LIMIT ${limitNum} OFFSET ${offset}`;

            console.log('📊 Debug getUserOrders params (without LIMIT/OFFSET):', params);
            console.log('📊 Debug SQL:', sql);
            const orders = await executeQuery(sql, params);

            // Get items for each order
            for (let order of orders) {
                const items = await executeQuery(
                    `SELECT oi.*, p.name as product_name, p.image_url as product_image
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.id
                     WHERE oi.order_id = ?`,
                    [order.id]
                );
                order.items = items;
            }

            return {
                orders: orders.map(order => new Order(order)),
                pagination: {
                    current_page: pageNum,
                    per_page: limitNum,
                    total,
                    total_pages: Math.ceil(total / limitNum)
                }
            };
        } catch (error) {
            console.error('❌ Error getting user orders:', error);
            throw new Error('Lỗi lấy đơn hàng của người dùng');
        }
    }

    // Update order status with history tracking
    static async updateStatus(orderId, status, notes = null, userId = null) {
        const { pool } = require('../config/database');
        let connection;

        try {
            // Validate status
            const validStatuses = ['new', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancel_requested'];
            if (!validStatuses.includes(status)) {
                throw new Error('Trạng thái đơn hàng không hợp lệ');
            }

            connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Get current order
                const [currentOrder] = await connection.execute(
                    'SELECT * FROM orders WHERE id = ?',
                    [orderId]
                );

                if (!currentOrder.length) {
                    throw new Error('Đơn hàng không tồn tại');
                }

                const order = currentOrder[0];

                // Validate status transition
                const canTransition = Order.canTransitionTo(order.status, status);
                if (!canTransition) {
                    throw new Error(`Không thể chuyển từ trạng thái "${order.status}" sang "${status}"`);
                }

                // Update order status and timestamps
                let updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
                let updateParams = [status];

                if (status === 'confirmed') {
                    updateFields.push('confirmed_at = CURRENT_TIMESTAMP');
                } else if (status === 'delivered') {
                    updateFields.push('delivered_at = CURRENT_TIMESTAMP');
                } else if (status === 'cancelled') {
                    updateFields.push('cancelled_at = CURRENT_TIMESTAMP');
                }

                updateParams.push(orderId);

                await connection.execute(
                    `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateParams
                );

                // Add status history
                await connection.execute(
                    'INSERT INTO order_status_history (order_id, from_status, to_status, reason, updated_by) VALUES (?, ?, ?, ?, ?)',
                    [orderId, null, status, notes || `Chuyển sang trạng thái ${status}`, 'system']
                );

                await connection.commit();

                return await Order.findById(orderId);
            } catch (error) {
                await connection.rollback();
                throw error;
            }
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            throw new Error(error.message || 'Lỗi cập nhật trạng thái đơn hàng');
        } finally {
            if (connection) connection.release();
        }
    }

    // Check if status transition is valid
    static canTransitionTo(currentStatus, newStatus) {
        const transitions = {
            'new': ['confirmed', 'cancelled', 'cancel_requested'],
            'confirmed': ['preparing', 'cancelled', 'cancel_requested'],
            'preparing': ['shipping', 'cancelled'],
            'shipping': ['delivered', 'cancelled'],
            'delivered': [], // Final state
            'cancelled': [], // Final state
            'cancel_requested': ['cancelled', 'confirmed'] // Can be approved or rejected
        };

        return transitions[currentStatus]?.includes(newStatus) || false;
    }

    // Get orders that need auto-confirmation (created > 30 minutes ago, still 'new')
    static async getOrdersForAutoConfirmation() {
        try {
            const orders = await executeQuery(
                `SELECT id FROM orders 
                 WHERE status = 'new' 
                 AND created_at <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
                []
            );

            return orders.map(order => order.id);
        } catch (error) {
            console.error('❌ Error getting orders for auto-confirmation:', error);
            throw new Error('Lỗi lấy đơn hàng cần tự động xác nhận');
        }
    }

    // Auto-confirm orders (to be called by scheduled job)
    static async autoConfirmOrders() {
        try {
            const orderIds = await Order.getOrdersForAutoConfirmation();
            const results = [];

            for (const orderId of orderIds) {
                try {
                    const updatedOrder = await Order.updateStatus(
                        orderId, 
                        'confirmed', 
                        'Tự động xác nhận sau 30 phút'
                    );
                    results.push({ orderId, success: true, order: updatedOrder });
                } catch (error) {
                    results.push({ orderId, success: false, error: error.message });
                }
            }

            return results;
        } catch (error) {
            console.error('❌ Error auto-confirming orders:', error);
            throw new Error('Lỗi tự động xác nhận đơn hàng');
        }
    }

    // Check if order can be cancelled by user
    canBeCancelledByUser() {
        // Users can request cancellation within 30 minutes for 'new' and 'confirmed' orders
        const cancellableStatuses = ['new', 'confirmed'];
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const orderTime = new Date(this.created_at);

        return cancellableStatuses.includes(this.status) && orderTime > thirtyMinutesAgo;
    }

    // Check if order can be cancelled immediately (within cancellation window)
    canBeCancelledImmediately() {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const orderTime = new Date(this.created_at);

        return this.status === 'new' && orderTime > thirtyMinutesAgo;
    }

    // Get order statistics for user
    static async getUserOrderStats(userId) {
        try {
            const stats = await getOne(
                `SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_orders,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                    SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
                    SUM(CASE WHEN status = 'shipping' THEN 1 ELSE 0 END) as shipping_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                    SUM(CASE WHEN status = 'cancel_requested' THEN 1 ELSE 0 END) as cancel_requested_orders,
                    SUM(total_amount) as total_spent
                 FROM orders 
                 WHERE user_id = ?`,
                [userId]
            );
            return stats;
        } catch (error) {
            console.error('❌ Error getting user order stats:', error);
            throw new Error('Lỗi lấy thống kê đơn hàng');
        }
    }

    // Track order status history
    static async getOrderTracking(orderId, userId = null) {
        try {
            // If userId provided, verify ownership
            if (userId) {
                const order = await getOne(
                    'SELECT user_id FROM orders WHERE id = ?',
                    [orderId]
                );
                
                if (!order || order.user_id !== userId) {
                    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền truy cập');
                }
            }

            const tracking = await executeQuery(
                `SELECT osh.*
                 FROM order_status_history osh
                 WHERE osh.order_id = ?
                 ORDER BY osh.created_at ASC`,
                [orderId]
            );

            return tracking;
        } catch (error) {
            console.error('❌ Error getting order tracking:', error);
            throw new Error(error.message || 'Lỗi lấy thông tin theo dõi đơn hàng');
        }
    }

    // Get status text in Vietnamese
    getStatusText() {
        const statusMap = {
            'new': 'Đơn hàng mới',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy',
            'cancel_requested': 'Yêu cầu hủy'
        };
        return statusMap[this.status] || this.status;
    }

    // Get status color for UI
    getStatusColor() {
        const colorMap = {
            'new': 'blue',
            'confirmed': 'green',
            'preparing': 'yellow',
            'shipping': 'purple',
            'delivered': 'green',
            'cancelled': 'red',
            'cancel_requested': 'orange'
        };
        return colorMap[this.status] || 'gray';
    }

    // Calculate total items
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            user_name: this.user_name,
            user_email: this.user_email,
            total_amount: this.total_amount,
            status: this.status,
            status_text: this.getStatusText(),
            status_color: this.getStatusColor(),
            shipping_address: this.shipping_address,
            notes: this.notes,
            items: this.items,
            total_items: this.getTotalItems(),
            status_history: this.status_history,
            can_be_cancelled_by_user: this.canBeCancelledByUser(),
            can_be_cancelled_immediately: this.canBeCancelledImmediately(),
            created_at: this.created_at,
            updated_at: this.updated_at,
            confirmed_at: this.confirmed_at,
            delivered_at: this.delivered_at,
            cancelled_at: this.cancelled_at
        };
    }
}

module.exports = Order;
