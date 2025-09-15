const { executeQuery, getOne, insert } = require('../config/database');

class OrderStatusHistory {
    constructor(historyData) {
        this.id = historyData.id;
        this.order_id = historyData.order_id;
        this.from_status = historyData.from_status;
        this.to_status = historyData.to_status;
        this.reason = historyData.reason;
        this.updated_by = historyData.updated_by;
        this.created_at = historyData.created_at;
        
        // Order details (when joined)
        this.order_total_amount = parseFloat(historyData.order_total_amount || 0);
        this.order_user_id = historyData.order_user_id;
    }

    // Add status change to history
    static async addStatusChange(orderData) {
        try {
            const {
                order_id,
                from_status = null,
                to_status,
                reason = null,
                updated_by = 'system'
            } = orderData;

            // Validate required fields
            if (!order_id || !to_status) {
                throw new Error('Order ID và trạng thái là bắt buộc');
            }

            // Validate status
            const validStatuses = ['new', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancel_requested'];
            if (!validStatuses.includes(to_status)) {
                throw new Error('Trạng thái không hợp lệ');
            }

            const result = await executeQuery(
                'INSERT INTO order_status_history (order_id, from_status, to_status, reason, updated_by) VALUES (?, ?, ?, ?, ?)',
                [order_id, from_status, to_status, reason, updated_by]
            );

            return await OrderStatusHistory.findById(result.insertId);
        } catch (error) {
            console.error('❌ Error adding status change:', error);
            throw new Error(error.message || 'Lỗi thêm lịch sử thay đổi trạng thái');
        }
    }

    // Find history record by ID
    static async findById(historyId) {
        try {
            const historyData = await getOne(`
                SELECT 
                    osh.*,
                    u.full_name as changed_by_name,
                    u.email as changed_by_email,
                    u.role as changed_by_role,
                    o.total_amount as order_total_amount,
                    o.user_id as order_user_id
                FROM order_status_history osh
                LEFT JOIN users u ON osh.changed_by = u.id
                LEFT JOIN orders o ON osh.order_id = o.id
                WHERE osh.id = ?
            `, [historyId]);

            return historyData ? new OrderStatusHistory(historyData) : null;
        } catch (error) {
            console.error('❌ Error finding status history:', error);
            throw new Error('Lỗi tìm lịch sử trạng thái');
        }
    }

    // Get complete history for an order
    static async getOrderHistory(orderId, userId = null) {
        try {
            // If userId provided, verify order ownership
            if (userId) {
                const order = await getOne(
                    'SELECT user_id FROM orders WHERE id = ?',
                    [orderId]
                );
                
                if (!order || order.user_id !== userId) {
                    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền truy cập');
                }
            }

            const history = await executeQuery(`
                SELECT osh.*
                FROM order_status_history osh
                WHERE osh.order_id = ?
                ORDER BY osh.created_at ASC
            `, [orderId]);

            return history.map(h => new OrderStatusHistory(h));
        } catch (error) {
            console.error('❌ Error getting order history:', error);
            throw new Error(error.message || 'Lỗi lấy lịch sử đơn hàng');
        }
    }

    // Get history with pagination
    static async getHistoryWithPagination(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                order_id = null,
                user_id = null,
                status = null,
                changed_by = null,
                start_date = null,
                end_date = null,
                order_by = 'created_at',
                order_dir = 'DESC'
            } = options;

            const offset = (page - 1) * limit;

            let whereConditions = ['1=1'];
            let queryParams = [];

            if (order_id) {
                whereConditions.push('osh.order_id = ?');
                queryParams.push(order_id);
            }

            if (user_id) {
                whereConditions.push('o.user_id = ?');
                queryParams.push(user_id);
            }

            if (status) {
                whereConditions.push('osh.status = ?');
                queryParams.push(status);
            }

            if (changed_by) {
                whereConditions.push('osh.changed_by = ?');
                queryParams.push(changed_by);
            }

            if (start_date) {
                whereConditions.push('osh.changed_at >= ?');
                queryParams.push(start_date);
            }

            if (end_date) {
                whereConditions.push('osh.changed_at <= ?');
                queryParams.push(end_date);
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countResult = await getOne(`
                SELECT COUNT(*) as total
                FROM order_status_history osh
                LEFT JOIN orders o ON osh.order_id = o.id
                WHERE ${whereClause}
            `, queryParams);

            // Get history records
            const history = await executeQuery(`
                SELECT 
                    osh.*,
                    u.full_name as changed_by_name,
                    u.email as changed_by_email,
                    u.role as changed_by_role,
                    o.total_amount as order_total_amount,
                    o.user_id as order_user_id
                FROM order_status_history osh
                LEFT JOIN users u ON osh.changed_by = u.id
                LEFT JOIN orders o ON osh.order_id = o.id
                WHERE ${whereClause}
                ORDER BY osh.${order_by} ${order_dir}
                LIMIT ? OFFSET ?
            `, [...queryParams, limit, offset]);

            return {
                history: history.map(h => new OrderStatusHistory(h)),
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: countResult.total,
                    total_pages: Math.ceil(countResult.total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting history with pagination:', error);
            throw new Error('Lỗi lấy lịch sử phân trang');
        }
    }

    // Get status statistics
    static async getStatusStats(options = {}) {
        try {
            const {
                start_date = null,
                end_date = null,
                user_id = null
            } = options;

            let whereConditions = ['1=1'];
            let queryParams = [];

            if (start_date) {
                whereConditions.push('osh.changed_at >= ?');
                queryParams.push(start_date);
            }

            if (end_date) {
                whereConditions.push('osh.changed_at <= ?');
                queryParams.push(end_date);
            }

            if (user_id) {
                whereConditions.push('o.user_id = ?');
                queryParams.push(user_id);
            }

            const whereClause = whereConditions.join(' AND ');

            const stats = await getOne(`
                SELECT 
                    COUNT(*) as total_changes,
                    COUNT(DISTINCT osh.order_id) as affected_orders,
                    COUNT(CASE WHEN osh.status = 'new' THEN 1 END) as new_status,
                    COUNT(CASE WHEN osh.status = 'confirmed' THEN 1 END) as confirmed_status,
                    COUNT(CASE WHEN osh.status = 'preparing' THEN 1 END) as preparing_status,
                    COUNT(CASE WHEN osh.status = 'shipping' THEN 1 END) as shipping_status,
                    COUNT(CASE WHEN osh.status = 'delivered' THEN 1 END) as delivered_status,
                    COUNT(CASE WHEN osh.status = 'cancelled' THEN 1 END) as cancelled_status,
                    COUNT(CASE WHEN osh.status = 'cancel_requested' THEN 1 END) as cancel_requested_status
                FROM order_status_history osh
                LEFT JOIN orders o ON osh.order_id = o.id
                WHERE ${whereClause}
            `, queryParams);

            return {
                total_changes: parseInt(stats.total_changes) || 0,
                affected_orders: parseInt(stats.affected_orders) || 0,
                status_breakdown: {
                    new: parseInt(stats.new_status) || 0,
                    confirmed: parseInt(stats.confirmed_status) || 0,
                    preparing: parseInt(stats.preparing_status) || 0,
                    shipping: parseInt(stats.shipping_status) || 0,
                    delivered: parseInt(stats.delivered_status) || 0,
                    cancelled: parseInt(stats.cancelled_status) || 0,
                    cancel_requested: parseInt(stats.cancel_requested_status) || 0
                }
            };
        } catch (error) {
            console.error('❌ Error getting status stats:', error);
            throw new Error('Lỗi lấy thống kê trạng thái');
        }
    }

    // Get recent status changes for dashboard
    static async getRecentChanges(limit = 10, userId = null) {
        try {
            let whereCondition = '1=1';
            let queryParams = [];

            if (userId) {
                whereCondition = 'o.user_id = ?';
                queryParams.push(userId);
            }

            const recent = await executeQuery(`
                SELECT 
                    osh.*,
                    u.full_name as changed_by_name,
                    u.email as changed_by_email,
                    u.role as changed_by_role,
                    o.total_amount as order_total_amount,
                    o.user_id as order_user_id
                FROM order_status_history osh
                LEFT JOIN users u ON osh.changed_by = u.id
                LEFT JOIN orders o ON osh.order_id = o.id
                WHERE ${whereCondition}
                ORDER BY osh.changed_at DESC
                LIMIT ?
            `, [...queryParams, limit]);

            return recent.map(h => new OrderStatusHistory(h));
        } catch (error) {
            console.error('❌ Error getting recent changes:', error);
            throw new Error('Lỗi lấy thay đổi gần đây');
        }
    }

    // Delete old history records (for cleanup)
    static async cleanupOldHistory(daysToKeep = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await executeQuery(
                'DELETE FROM order_status_history WHERE changed_at < ?',
                [cutoffDate]
            );

            return {
                deleted_records: result.affectedRows,
                cutoff_date: cutoffDate
            };
        } catch (error) {
            console.error('❌ Error cleaning up old history:', error);
            throw new Error('Lỗi dọn dẹp lịch sử cũ');
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

    // Get actor name (who made the change)
    getActorName() {
        if (this.changed_by_name) {
            return this.changed_by_name;
        } else if (this.changed_by) {
            return `User #${this.changed_by}`;
        } else {
            return 'Hệ thống';
        }
    }

    // Format time elapsed since change
    getTimeElapsed() {
        const now = new Date();
        const changeTime = new Date(this.changed_at);
        const diffMs = now - changeTime;
        
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays > 0) {
            return `${diffDays} ngày trước`;
        } else if (diffHours > 0) {
            return `${diffHours} giờ trước`;
        } else if (diffMins > 0) {
            return `${diffMins} phút trước`;
        } else {
            return 'Vừa xong';
        }
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            order_id: this.order_id,
            status: this.status,
            status_text: this.getStatusText(),
            status_color: this.getStatusColor(),
            notes: this.notes,
            changed_by: this.changed_by,
            changed_by_name: this.changed_by_name,
            changed_by_email: this.changed_by_email,
            changed_by_role: this.changed_by_role,
            actor_name: this.getActorName(),
            changed_at: this.changed_at,
            time_elapsed: this.getTimeElapsed(),
            // Order info (if needed)
            order_total_amount: this.order_total_amount,
            order_user_id: this.order_user_id
        };
    }
}

module.exports = OrderStatusHistory;