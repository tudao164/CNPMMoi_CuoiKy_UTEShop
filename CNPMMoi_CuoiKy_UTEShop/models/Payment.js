const { executeQuery, getOne, insert } = require('../config/database');

class Payment {
    constructor(paymentData) {
        this.id = paymentData.id;
        this.order_id = paymentData.order_id;
        this.payment_method = paymentData.payment_method;
        this.payment_status = paymentData.payment_status;
        this.amount = parseFloat(paymentData.amount || 0);
        this.transaction_id = paymentData.transaction_id;
        this.gateway_response = paymentData.gateway_response;
        this.notes = paymentData.notes;
        this.created_at = paymentData.created_at;
        this.updated_at = paymentData.updated_at;
        this.paid_at = paymentData.paid_at;
        
        // Order details (when joined)
        this.order_total_amount = parseFloat(paymentData.order_total_amount || 0);
        this.order_status = paymentData.order_status;
        this.user_id = paymentData.user_id;
        this.user_name = paymentData.user_name;
        this.user_email = paymentData.user_email;
    }

    // Create new payment record
    static async createPayment(orderData) {
        try {
            const {
                order_id,
                payment_method = 'COD',
                amount,
                notes = null,
                transaction_id = null
            } = orderData;

            // Validate payment method
            if (!['COD', 'E_WALLET'].includes(payment_method)) {
                throw new Error('Phương thức thanh toán không hợp lệ');
            }

            // For COD payments, status starts as pending
            // For E_WALLET payments, status starts as pending until confirmed
            const payment_status = payment_method === 'COD' ? 'pending' : 'pending';

            const result = await executeQuery(`
                INSERT INTO payments (
                    order_id, 
                    payment_method, 
                    payment_status, 
                    amount, 
                    transaction_id, 
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [order_id, payment_method, payment_status, amount, transaction_id, notes]);

            return await Payment.findById(result.insertId);
        } catch (error) {
            console.error('❌ Error creating payment:', error);
            throw new Error(error.message || 'Lỗi tạo thông tin thanh toán');
        }
    }

    // Find payment by ID
    static async findById(paymentId) {
        try {
            const paymentData = await getOne(`
                SELECT 
                    p.*,
                    o.total_amount as order_total_amount,
                    o.status as order_status,
                    o.user_id,
                    u.full_name as user_name,
                    u.email as user_email
                FROM payments p
                LEFT JOIN orders o ON p.order_id = o.id
                LEFT JOIN users u ON o.user_id = u.id
                WHERE p.id = ?
            `, [paymentId]);

            return paymentData ? new Payment(paymentData) : null;
        } catch (error) {
            console.error('❌ Error finding payment:', error);
            throw new Error('Lỗi tìm thông tin thanh toán');
        }
    }

    // Find payment by order ID
    static async findByOrderId(orderId) {
        try {
            const paymentData = await getOne(`
                SELECT 
                    p.*,
                    o.total_amount as order_total_amount,
                    o.status as order_status,
                    o.user_id,
                    u.full_name as user_name,
                    u.email as user_email
                FROM payments p
                LEFT JOIN orders o ON p.order_id = o.id
                LEFT JOIN users u ON o.user_id = u.id
                WHERE p.order_id = ?
                ORDER BY p.created_at DESC
                LIMIT 1
            `, [orderId]);

            return paymentData ? new Payment(paymentData) : null;
        } catch (error) {
            console.error('❌ Error finding payment by order:', error);
            throw new Error('Lỗi tìm thông tin thanh toán theo đơn hàng');
        }
    }

    // Get payments for user
    static async getUserPayments(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                status = null,
                method = null,
                order_by = 'created_at',
                order_dir = 'DESC'
            } = options;

            const offset = (page - 1) * limit;

            let whereConditions = ['o.user_id = ?'];
            let queryParams = [userId];

            if (status) {
                whereConditions.push('p.payment_status = ?');
                queryParams.push(status);
            }

            if (method) {
                whereConditions.push('p.payment_method = ?');
                queryParams.push(method);
            }

            const whereClause = whereConditions.join(' AND ');

            const payments = await executeQuery(`
                SELECT 
                    p.*,
                    o.total_amount as order_total_amount,
                    o.status as order_status,
                    o.user_id,
                    u.full_name as user_name,
                    u.email as user_email
                FROM payments p
                LEFT JOIN orders o ON p.order_id = o.id
                LEFT JOIN users u ON o.user_id = u.id
                WHERE ${whereClause}
                ORDER BY p.${order_by} ${order_dir}
                LIMIT ? OFFSET ?
            `, [...queryParams, limit, offset]);

            // Get total count
            const countResult = await getOne(`
                SELECT COUNT(*) as total
                FROM payments p
                LEFT JOIN orders o ON p.order_id = o.id
                WHERE ${whereClause}
            `, queryParams);

            return {
                payments: payments.map(payment => new Payment(payment)),
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: countResult.total,
                    total_pages: Math.ceil(countResult.total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting user payments:', error);
            throw new Error('Lỗi lấy danh sách thanh toán của người dùng');
        }
    }

    // Update payment status
    static async updateStatus(paymentId, newStatus, options = {}) {
        try {
            const {
                transaction_id = null,
                gateway_response = null,
                notes = null,
                paid_at = null
            } = options;

            // Validate status
            const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Trạng thái thanh toán không hợp lệ');
            }

            let updateFields = ['payment_status = ?', 'updated_at = CURRENT_TIMESTAMP'];
            let updateParams = [newStatus];

            if (transaction_id !== null) {
                updateFields.push('transaction_id = ?');
                updateParams.push(transaction_id);
            }

            if (gateway_response !== null) {
                updateFields.push('gateway_response = ?');
                updateParams.push(JSON.stringify(gateway_response));
            }

            if (notes !== null) {
                updateFields.push('notes = ?');
                updateParams.push(notes);
            }

            if (paid_at !== null || newStatus === 'completed') {
                updateFields.push('paid_at = ?');
                updateParams.push(paid_at || new Date());
            }

            updateParams.push(paymentId);

            await executeQuery(`
                UPDATE payments 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, updateParams);

            return await Payment.findById(paymentId);
        } catch (error) {
            console.error('❌ Error updating payment status:', error);
            throw new Error(error.message || 'Lỗi cập nhật trạng thái thanh toán');
        }
    }

    // Process COD payment (mark as completed when delivered)
    static async processCODPayment(orderId) {
        try {
            const payment = await Payment.findByOrderId(orderId);
            
            if (!payment) {
                throw new Error('Không tìm thấy thông tin thanh toán');
            }

            if (payment.payment_method !== 'COD') {
                throw new Error('Đây không phải đơn hàng COD');
            }

            if (payment.payment_status === 'completed') {
                throw new Error('Thanh toán đã được hoàn thành trước đó');
            }

            return await Payment.updateStatus(payment.id, 'completed', {
                notes: 'Thanh toán COD hoàn thành khi giao hàng',
                paid_at: new Date()
            });
        } catch (error) {
            console.error('❌ Error processing COD payment:', error);
            throw new Error(error.message || 'Lỗi xử lý thanh toán COD');
        }
    }

    // Process E-Wallet payment
    static async processEWalletPayment(orderId, paymentData) {
        try {
            const {
                transaction_id,
                gateway_response,
                status = 'completed'
            } = paymentData;

            const payment = await Payment.findByOrderId(orderId);
            
            if (!payment) {
                throw new Error('Không tìm thấy thông tin thanh toán');
            }

            if (payment.payment_method !== 'E_WALLET') {
                throw new Error('Đây không phải đơn hàng thanh toán điện tử');
            }

            return await Payment.updateStatus(payment.id, status, {
                transaction_id,
                gateway_response,
                notes: 'Thanh toán điện tử qua ví điện tử',
                paid_at: status === 'completed' ? new Date() : null
            });
        } catch (error) {
            console.error('❌ Error processing e-wallet payment:', error);
            throw new Error(error.message || 'Lỗi xử lý thanh toán điện tử');
        }
    }

    // Cancel payment
    static async cancelPayment(paymentId, reason = null) {
        try {
            const payment = await Payment.findById(paymentId);
            
            if (!payment) {
                throw new Error('Không tìm thấy thông tin thanh toán');
            }

            if (payment.payment_status === 'completed') {
                throw new Error('Không thể hủy thanh toán đã hoàn thành');
            }

            if (payment.payment_status === 'cancelled') {
                throw new Error('Thanh toán đã được hủy trước đó');
            }

            return await Payment.updateStatus(paymentId, 'cancelled', {
                notes: reason || 'Thanh toán bị hủy'
            });
        } catch (error) {
            console.error('❌ Error cancelling payment:', error);
            throw new Error(error.message || 'Lỗi hủy thanh toán');
        }
    }

    // Refund payment
    static async refundPayment(paymentId, refundData) {
        try {
            const {
                refund_amount = null,
                refund_reason,
                refund_transaction_id = null
            } = refundData;

            const payment = await Payment.findById(paymentId);
            
            if (!payment) {
                throw new Error('Không tìm thấy thông tin thanh toán');
            }

            if (payment.payment_status !== 'completed') {
                throw new Error('Chỉ có thể hoàn tiền cho thanh toán đã hoàn thành');
            }

            const refund_amount_final = refund_amount || payment.amount;

            if (refund_amount_final > payment.amount) {
                throw new Error('Số tiền hoàn không được vượt quá số tiền đã thanh toán');
            }

            return await Payment.updateStatus(paymentId, 'refunded', {
                notes: `Hoàn tiền: ${refund_amount_final}đ. Lý do: ${refund_reason}`,
                transaction_id: refund_transaction_id || payment.transaction_id
            });
        } catch (error) {
            console.error('❌ Error refunding payment:', error);
            throw new Error(error.message || 'Lỗi hoàn tiền');
        }
    }

    // Get payment statistics
    static async getPaymentStats(options = {}) {
        try {
            const {
                start_date = null,
                end_date = null,
                user_id = null
            } = options;

            let whereConditions = ['1=1'];
            let queryParams = [];

            if (start_date) {
                whereConditions.push('p.created_at >= ?');
                queryParams.push(start_date);
            }

            if (end_date) {
                whereConditions.push('p.created_at <= ?');
                queryParams.push(end_date);
            }

            if (user_id) {
                whereConditions.push('o.user_id = ?');
                queryParams.push(user_id);
            }

            const whereClause = whereConditions.join(' AND ');

            const stats = await getOne(`
                SELECT 
                    COUNT(*) as total_payments,
                    COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as completed_payments,
                    COUNT(CASE WHEN p.payment_status = 'pending' THEN 1 END) as pending_payments,
                    COUNT(CASE WHEN p.payment_status = 'failed' THEN 1 END) as failed_payments,
                    COUNT(CASE WHEN p.payment_status = 'cancelled' THEN 1 END) as cancelled_payments,
                    COUNT(CASE WHEN p.payment_method = 'COD' THEN 1 END) as cod_payments,
                    COUNT(CASE WHEN p.payment_method = 'E_WALLET' THEN 1 END) as ewallet_payments,
                    SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount ELSE 0 END) as total_revenue,
                    AVG(CASE WHEN p.payment_status = 'completed' THEN p.amount ELSE NULL END) as avg_payment_amount
                FROM payments p
                LEFT JOIN orders o ON p.order_id = o.id
                WHERE ${whereClause}
            `, queryParams);

            return {
                total_payments: parseInt(stats.total_payments) || 0,
                completed_payments: parseInt(stats.completed_payments) || 0,
                pending_payments: parseInt(stats.pending_payments) || 0,
                failed_payments: parseInt(stats.failed_payments) || 0,
                cancelled_payments: parseInt(stats.cancelled_payments) || 0,
                cod_payments: parseInt(stats.cod_payments) || 0,
                ewallet_payments: parseInt(stats.ewallet_payments) || 0,
                total_revenue: parseFloat(stats.total_revenue) || 0,
                avg_payment_amount: parseFloat(stats.avg_payment_amount) || 0,
                success_rate: stats.total_payments > 0 
                    ? (stats.completed_payments / stats.total_payments * 100).toFixed(2)
                    : 0
            };
        } catch (error) {
            console.error('❌ Error getting payment stats:', error);
            throw new Error('Lỗi lấy thống kê thanh toán');
        }
    }

    // Check if payment is editable
    isEditable() {
        return ['pending'].includes(this.payment_status);
    }

    // Check if payment can be cancelled
    isCancellable() {
        return ['pending'].includes(this.payment_status);
    }

    // Check if payment can be refunded
    isRefundable() {
        return this.payment_status === 'completed';
    }

    // Get payment status in Vietnamese
    getStatusText() {
        const statusMap = {
            'pending': 'Đang chờ',
            'completed': 'Hoàn thành',
            'failed': 'Thất bại',
            'cancelled': 'Đã hủy',
            'refunded': 'Đã hoàn tiền'
        };
        return statusMap[this.payment_status] || 'Không xác định';
    }

    // Get payment method in Vietnamese
    getMethodText() {
        const methodMap = {
            'COD': 'Thanh toán khi nhận hàng',
            'E_WALLET': 'Ví điện tử'
        };
        return methodMap[this.payment_method] || 'Không xác định';
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            order_id: this.order_id,
            payment_method: this.payment_method,
            payment_method_text: this.getMethodText(),
            payment_status: this.payment_status,
            payment_status_text: this.getStatusText(),
            amount: this.amount,
            transaction_id: this.transaction_id,
            notes: this.notes,
            created_at: this.created_at,
            updated_at: this.updated_at,
            paid_at: this.paid_at,
            is_editable: this.isEditable(),
            is_cancellable: this.isCancellable(),
            is_refundable: this.isRefundable(),
            // Order info (if joined)
            order_total_amount: this.order_total_amount,
            order_status: this.order_status,
            user_name: this.user_name,
            user_email: this.user_email
        };
    }
}

module.exports = Payment;