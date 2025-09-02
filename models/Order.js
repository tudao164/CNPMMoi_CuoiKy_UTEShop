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
        this.items = orderData.items || [];
        this.user_name = orderData.user_name;
        this.user_email = orderData.user_email;
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
                // Insert order
                const [orderResult] = await connection.execute(
                    'INSERT INTO orders (user_id, total_amount, shipping_address, notes) VALUES (?, ?, ?, ?)',
                    [user_id, total_amount, shipping_address, notes]
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

                // Commit transaction
                await connection.commit();

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

            orderData.items = items;
            return new Order(orderData);
        } catch (error) {
            console.error('❌ Error finding order by ID:', error);
            throw new Error('Lỗi tìm kiếm đơn hàng');
        }
    }

    // Get user's orders
    static async getUserOrders(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            // Get total count
            const countResult = await getOne(
                'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
                [userId]
            );
            const total = countResult.total;

            // Get orders
            const limitInt = parseInt(limit);
            const offsetInt = parseInt(offset);
            const orders = await executeQuery(
                `SELECT o.*, COUNT(oi.id) as item_count
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.user_id = ?
                 GROUP BY o.id
                 ORDER BY o.created_at DESC
                 LIMIT ${limitInt} OFFSET ${offsetInt}`,
                [userId]
            );

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
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting user orders:', error);
            throw new Error('Lỗi lấy đơn hàng của người dùng');
        }
    }

    // Update order status
    static async updateStatus(orderId, status) {
        try {
            await executeQuery(
                'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, orderId]
            );
            return await Order.findById(orderId);
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            throw new Error('Lỗi cập nhật trạng thái đơn hàng');
        }
    }

    // Get order statistics for user
    static async getUserOrderStats(userId) {
        try {
            const stats = await getOne(
                `SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                    SUM(CASE WHEN status = 'shipping' THEN 1 ELSE 0 END) as shipping_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
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

    // Get status text in Vietnamese
    getStatusText() {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return statusMap[this.status] || this.status;
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
            shipping_address: this.shipping_address,
            notes: this.notes,
            items: this.items,
            total_items: this.getTotalItems(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Order;
