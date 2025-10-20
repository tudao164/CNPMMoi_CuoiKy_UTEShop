const { executeQuery, getOne, insert } = require('../config/database');

class CancelRequest {
    constructor(requestData) {
        this.id = requestData.id;
        this.order_id = requestData.order_id;
        this.user_id = requestData.user_id;
        this.reason = requestData.reason;
        this.status = requestData.status;
        this.admin_response = requestData.admin_response;
        this.processed_by = requestData.processed_by;
        this.created_at = requestData.created_at;
        this.processed_at = requestData.processed_at;
        
        // Order details (when joined)
        this.order_total_amount = parseFloat(requestData.order_total_amount || 0);
        this.order_status = requestData.order_status;
        this.order_created_at = requestData.order_created_at;
        this.shipping_address = requestData.shipping_address;
        
        // User details (when joined)
        this.user_name = requestData.user_name;
        this.user_email = requestData.user_email;
        this.user_phone = requestData.user_phone;
        
        // Processed by details (when joined)
        this.processed_by_name = requestData.processed_by_name;
        this.processed_by_email = requestData.processed_by_email;
    }

    // Create new cancel request
    static async createCancelRequest(requestData) {
        try {
            const {
                order_id,
                user_id,
                reason
            } = requestData;

            // Validate required fields
            if (!order_id || !user_id || !reason) {
                throw new Error('Order ID, User ID và lý do hủy là bắt buộc');
            }

            // Check if order exists and belongs to user
            const order = await getOne(
                'SELECT * FROM orders WHERE id = ? AND user_id = ?',
                [order_id, user_id]
            );

            if (!order) {
                throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền hủy');
            }

            // Check if order can be cancelled
            const cancellableStatuses = ['new', 'confirmed'];
            if (!cancellableStatuses.includes(order.status)) {
                throw new Error('Đơn hàng không thể hủy ở trạng thái hiện tại');
            }

            // Check if there's already a pending cancel request
            const existingRequest = await getOne(
                'SELECT * FROM cancel_requests WHERE order_id = ? AND status = ?',
                [order_id, 'pending']
            );

            if (existingRequest) {
                throw new Error('Đã có yêu cầu hủy đơn đang chờ xử lý');
            }

            // Check time limit (30 minutes for immediate cancellation)
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const orderTime = new Date(order.created_at);
            
            let requestStatus = 'pending';
            let adminNotes = null;

            // If within 30 minutes and order is 'new', auto-approve
            if (order.status === 'new' && orderTime > thirtyMinutesAgo) {
                requestStatus = 'approved';
                adminNotes = 'Tự động chấp thuận - trong thời gian cho phép hủy';
            }

            // Create cancel request
            const result = await executeQuery(
                'INSERT INTO cancel_requests (order_id, user_id, reason, status, admin_response) VALUES (?, ?, ?, ?, ?)',
                [order_id, user_id, reason, requestStatus, adminNotes]
            );

            // If auto-approved, update order status
            if (requestStatus === 'approved') {
                const Order = require('./Order');
                await Order.updateStatus(order_id, 'cancelled', 'Hủy theo yêu cầu của khách hàng', user_id);
            } else {
                // Update order status to cancel_requested
                await executeQuery(
                    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    ['cancel_requested', order_id]
                );

                // Add to order status history
                await executeQuery(
                    'INSERT INTO order_status_history (order_id, to_status, reason, updated_by) VALUES (?, ?, ?, ?)',
                    [order_id, 'cancel_requested', `Khách hàng yêu cầu hủy đơn: ${reason}`, 'user']
                );
            }

            return await CancelRequest.findById(result.insertId);
        } catch (error) {
            console.error('❌ Error creating cancel request:', error);
            throw new Error(error.message || 'Lỗi tạo yêu cầu hủy đơn');
        }
    }

    // Find cancel request by ID
    static async findById(requestId) {
        try {
            const requestData = await getOne(`
                SELECT 
                    cr.*,
                    o.total_amount as order_total_amount,
                    o.status as order_status,
                    o.created_at as order_created_at,
                    o.shipping_address,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    admin.full_name as processed_by_name,
                    admin.email as processed_by_email
                FROM cancel_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                LEFT JOIN users u ON cr.user_id = u.id
                LEFT JOIN users admin ON cr.processed_by = admin.id
                WHERE cr.id = ?
            `, [requestId]);

            return requestData ? new CancelRequest(requestData) : null;
        } catch (error) {
            console.error('❌ Error finding cancel request:', error);
            throw new Error('Lỗi tìm yêu cầu hủy đơn');
        }
    }

    // Find cancel request by order ID
    static async findByOrderId(orderId) {
        try {
            const requestData = await getOne(`
                SELECT 
                    cr.*,
                    o.total_amount as order_total_amount,
                    o.status as order_status,
                    o.created_at as order_created_at,
                    o.shipping_address,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    admin.full_name as processed_by_name,
                    admin.email as processed_by_email
                FROM cancel_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                LEFT JOIN users u ON cr.user_id = u.id
                LEFT JOIN users admin ON cr.processed_by = admin.id
                WHERE cr.order_id = ?
                ORDER BY cr.created_at DESC
                LIMIT 1
            `, [orderId]);

            return requestData ? new CancelRequest(requestData) : null;
        } catch (error) {
            console.error('❌ Error finding cancel request by order:', error);
            throw new Error('Lỗi tìm yêu cầu hủy đơn theo đơn hàng');
        }
    }

    // Get cancel requests with pagination
    static async getCancelRequests(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                user_id = null,
                status = null,
                order_by = 'created_at',
                order_dir = 'DESC'
            } = options;

            const offset = (page - 1) * limit;

            let whereConditions = ['1=1'];
            let queryParams = [];

            if (user_id) {
                whereConditions.push('cr.user_id = ?');
                queryParams.push(user_id);
            }

            if (status) {
                whereConditions.push('cr.status = ?');
                queryParams.push(status);
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countResult = await getOne(`
                SELECT COUNT(*) as total
                FROM cancel_requests cr
                WHERE ${whereClause}
            `, queryParams);

            // Get cancel requests - Use string interpolation for LIMIT/OFFSET
            const requests = await executeQuery(`
                SELECT 
                    cr.*,
                    o.total_amount as order_total_amount,
                    o.status as order_status,
                    o.created_at as order_created_at,
                    o.shipping_address,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    admin.full_name as processed_by_name,
                    admin.email as processed_by_email
                FROM cancel_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                LEFT JOIN users u ON cr.user_id = u.id
                LEFT JOIN users admin ON cr.processed_by = admin.id
                WHERE ${whereClause}
                ORDER BY cr.${order_by} ${order_dir}
                LIMIT ${limit} OFFSET ${offset}
            `, queryParams);

            return {
                requests: requests.map(req => new CancelRequest(req)),
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: countResult.total,
                    total_pages: Math.ceil(countResult.total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting cancel requests:', error);
            throw new Error('Lỗi lấy danh sách yêu cầu hủy đơn');
        }
    }

    // Process cancel request (approve/reject)
    static async processRequest(requestId, processData) {
        try {
            const {
                status, // 'approved' or 'rejected'
                admin_response,
                processed_by
            } = processData;

            // Validate status
            if (!['approved', 'rejected'].includes(status)) {
                throw new Error('Trạng thái xử lý không hợp lệ');
            }

            // Get cancel request
            const cancelRequest = await CancelRequest.findById(requestId);
            if (!cancelRequest) {
                throw new Error('Yêu cầu hủy đơn không tồn tại');
            }

            if (cancelRequest.status !== 'pending') {
                throw new Error('Yêu cầu hủy đơn đã được xử lý');
            }

            // Update cancel request
            await executeQuery(
                'UPDATE cancel_requests SET status = ?, admin_response = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, admin_response, processed_by, requestId]
            );

            // Update order status based on decision
            const Order = require('./Order');
            if (status === 'approved') {
                await Order.updateStatus(
                    cancelRequest.order_id, 
                    'cancelled', 
                    `Chấp thuận yêu cầu hủy: ${admin_response || 'Không có ghi chú'}`,
                    processed_by
                );
            } else {
                // If rejected, restore order to confirmed status
                await Order.updateStatus(
                    cancelRequest.order_id, 
                    'confirmed', 
                    `Từ chối yêu cầu hủy: ${admin_response || 'Không có ghi chú'}`,
                    processed_by
                );
            }

            return await CancelRequest.findById(requestId);
        } catch (error) {
            console.error('❌ Error processing cancel request:', error);
            throw new Error(error.message || 'Lỗi xử lý yêu cầu hủy đơn');
        }
    }

    // Get cancel request statistics
    static async getCancelStats(options = {}) {
        try {
            const {
                start_date = null,
                end_date = null,
                user_id = null
            } = options;

            let whereConditions = ['1=1'];
            let queryParams = [];

            if (start_date) {
                whereConditions.push('cr.created_at >= ?');
                queryParams.push(start_date);
            }

            if (end_date) {
                whereConditions.push('cr.created_at <= ?');
                queryParams.push(end_date);
            }

            if (user_id) {
                whereConditions.push('cr.user_id = ?');
                queryParams.push(user_id);
            }

            const whereClause = whereConditions.join(' AND ');

            const stats = await getOne(`
                SELECT 
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_requests,
                    COUNT(CASE WHEN cr.status = 'approved' THEN 1 END) as approved_requests,
                    COUNT(CASE WHEN cr.status = 'rejected' THEN 1 END) as rejected_requests,
                    SUM(CASE WHEN cr.status = 'approved' THEN o.total_amount ELSE 0 END) as total_cancelled_amount,
                    AVG(CASE WHEN cr.status IN ('approved', 'rejected') THEN 
                        TIMESTAMPDIFF(HOUR, cr.created_at, cr.processed_at) 
                        ELSE NULL END) as avg_processing_hours
                FROM cancel_requests cr
                LEFT JOIN orders o ON cr.order_id = o.id
                WHERE ${whereClause}
            `, queryParams);

            return {
                total_requests: parseInt(stats.total_requests) || 0,
                pending_requests: parseInt(stats.pending_requests) || 0,
                approved_requests: parseInt(stats.approved_requests) || 0,
                rejected_requests: parseInt(stats.rejected_requests) || 0,
                total_cancelled_amount: parseFloat(stats.total_cancelled_amount) || 0,
                avg_processing_hours: parseFloat(stats.avg_processing_hours) || 0,
                approval_rate: stats.total_requests > 0 
                    ? ((stats.approved_requests / stats.total_requests) * 100).toFixed(2)
                    : 0
            };
        } catch (error) {
            console.error('❌ Error getting cancel stats:', error);
            throw new Error('Lỗi lấy thống kê yêu cầu hủy đơn');
        }
    }

    // Check if cancel request is editable (only pending requests)
    isEditable() {
        return this.status === 'pending';
    }

    // Check if cancel request can be withdrawn
    canBeWithdrawn() {
        return this.status === 'pending';
    }

    // Get status text in Vietnamese
    getStatusText() {
        const statusMap = {
            'pending': 'Đang chờ xử lý',
            'approved': 'Đã chấp thuận',
            'rejected': 'Đã từ chối'
        };
        return statusMap[this.status] || this.status;
    }

    // Get status color for UI
    getStatusColor() {
        const colorMap = {
            'pending': 'yellow',
            'approved': 'green',
            'rejected': 'red'
        };
        return colorMap[this.status] || 'gray';
    }

    // Check if request is urgent (order created < 2 hours ago)
    isUrgent() {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const orderTime = new Date(this.order_created_at);
        return orderTime > twoHoursAgo;
    }

    // Get processing time in hours
    getProcessingTimeHours() {
        if (!this.processed_at) return null;
        
        const created = new Date(this.created_at);
        const processed = new Date(this.processed_at);
        return Math.round((processed - created) / (1000 * 60 * 60));
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            order_id: this.order_id,
            user_id: this.user_id,
            reason: this.reason,
            status: this.status,
            status_text: this.getStatusText(),
            status_color: this.getStatusColor(),
            admin_response: this.admin_response,
            processed_by: this.processed_by,
            processed_by_name: this.processed_by_name,
            created_at: this.created_at,
            processed_at: this.processed_at,
            is_editable: this.isEditable(),
            can_be_withdrawn: this.canBeWithdrawn(),
            is_urgent: this.isUrgent(),
            processing_time_hours: this.getProcessingTimeHours(),
            // Order info
            order_total_amount: this.order_total_amount,
            order_status: this.order_status,
            order_created_at: this.order_created_at,
            shipping_address: this.shipping_address,
            // User info
            user_name: this.user_name,
            user_email: this.user_email,
            user_phone: this.user_phone
        };
    }
}

module.exports = CancelRequest;