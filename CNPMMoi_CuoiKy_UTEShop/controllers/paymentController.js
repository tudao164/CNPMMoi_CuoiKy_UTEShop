const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class PaymentController {
    // GET /api/payments - Lấy danh sách thanh toán của user
    static async getUserPayments(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 10,
                status,
                method,
                order_by = 'created_at',
                order_dir = 'DESC'
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                method,
                order_by,
                order_dir
            };

            const result = await Payment.getUserPayments(userId, options);

            return successResponse(res, {
                payments: result.payments.map(payment => payment.toJSON()),
                pagination: result.pagination,
                message: 'Lấy danh sách thanh toán thành công'
            });

        } catch (error) {
            console.error('❌ Get user payments error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/payments/:id - Lấy chi tiết thanh toán
    static async getPaymentDetails(req, res) {
        try {
            const paymentId = req.params.id;
            const userId = req.user.id;

            const payment = await Payment.findById(paymentId);

            if (!payment) {
                return errorResponse(res, 'Không tìm thấy thông tin thanh toán', 404);
            }

            // Check if user owns this payment
            if (payment.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền xem thông tin này', 403);
            }

            return successResponse(res, {
                payment: payment.toJSON(),
                message: 'Lấy chi tiết thanh toán thành công'
            });

        } catch (error) {
            console.error('❌ Get payment details error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/payments/order/:orderId - Lấy thanh toán theo đơn hàng
    static async getPaymentByOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.id;

            // Check if user owns this order
            const order = await Order.findById(orderId);
            if (!order || order.user_id !== userId) {
                return errorResponse(res, 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập', 404);
            }

            const payment = await Payment.findByOrderId(orderId);

            if (!payment) {
                return errorResponse(res, 'Không tìm thấy thông tin thanh toán cho đơn hàng này', 404);
            }

            return successResponse(res, {
                payment: payment.toJSON(),
                message: 'Lấy thông tin thanh toán theo đơn hàng thành công'
            });

        } catch (error) {
            console.error('❌ Get payment by order error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/payments/create - Tạo thanh toán cho đơn hàng
    static async createPayment(req, res) {
        try {
            const userId = req.user.id;
            const {
                order_id,
                payment_method = 'COD',
                notes
            } = req.body;

            // Validate order exists and belongs to user
            const order = await Order.findById(order_id);
            if (!order) {
                return errorResponse(res, 'Đơn hàng không tồn tại', 404);
            }

            if (order.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền tạo thanh toán cho đơn hàng này', 403);
            }

            // Check if payment already exists
            const existingPayment = await Payment.findByOrderId(order_id);
            if (existingPayment) {
                return errorResponse(res, 'Đơn hàng này đã có thông tin thanh toán', 400);
            }

            // Check order status
            if (order.status === 'cancelled') {
                return errorResponse(res, 'Không thể tạo thanh toán cho đơn hàng đã hủy', 400);
            }

            // Create payment
            const payment = await Payment.createPayment({
                order_id,
                payment_method,
                amount: order.total_amount,
                notes
            });

            return successResponse(res, {
                payment: payment.toJSON(),
                message: 'Tạo thông tin thanh toán thành công'
            }, 201);

        } catch (error) {
            console.error('❌ Create payment error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/payments/:id/process-cod - Xử lý thanh toán COD
    static async processCODPayment(req, res) {
        try {
            const paymentId = req.params.id;
            const userId = req.user.id;

            // Get payment details
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                return errorResponse(res, 'Không tìm thấy thông tin thanh toán', 404);
            }

            // Check ownership (for admin, this check might be different)
            if (payment.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền xử lý thanh toán này', 403);
            }

            const processedPayment = await Payment.processCODPayment(payment.order_id);

            return successResponse(res, {
                payment: processedPayment.toJSON(),
                message: 'Xử lý thanh toán COD thành công'
            });

        } catch (error) {
            console.error('❌ Process COD payment error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/payments/:id/process-ewallet - Xử lý thanh toán ví điện tử
    static async processEWalletPayment(req, res) {
        try {
            const paymentId = req.params.id;
            const userId = req.user.id;
            const {
                transaction_id,
                gateway_response,
                status = 'completed'
            } = req.body;

            // Get payment details
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                return errorResponse(res, 'Không tìm thấy thông tin thanh toán', 404);
            }

            // Check ownership
            if (payment.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền xử lý thanh toán này', 403);
            }

            const processedPayment = await Payment.processEWalletPayment(payment.order_id, {
                transaction_id,
                gateway_response,
                status
            });

            return successResponse(res, {
                payment: processedPayment.toJSON(),
                message: 'Xử lý thanh toán ví điện tử thành công'
            });

        } catch (error) {
            console.error('❌ Process e-wallet payment error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // PUT /api/payments/:id/cancel - Hủy thanh toán
    static async cancelPayment(req, res) {
        try {
            const paymentId = req.params.id;
            const userId = req.user.id;
            const { reason } = req.body;

            // Get payment details
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                return errorResponse(res, 'Không tìm thấy thông tin thanh toán', 404);
            }

            // Check ownership
            if (payment.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền hủy thanh toán này', 403);
            }

            const cancelledPayment = await Payment.cancelPayment(paymentId, reason);

            return successResponse(res, {
                payment: cancelledPayment.toJSON(),
                message: 'Hủy thanh toán thành công'
            });

        } catch (error) {
            console.error('❌ Cancel payment error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/payments/:id/refund - Hoàn tiền (chỉ admin)
    static async refundPayment(req, res) {
        try {
            const paymentId = req.params.id;
            const {
                refund_amount,
                refund_reason,
                refund_transaction_id
            } = req.body;

            // Note: In real implementation, add admin check here
            // if (req.user.role !== 'admin') {
            //     return errorResponse(res, 'Chỉ admin mới có quyền hoàn tiền', 403);
            // }

            if (!refund_reason) {
                return errorResponse(res, 'Lý do hoàn tiền là bắt buộc', 400);
            }

            const refundedPayment = await Payment.refundPayment(paymentId, {
                refund_amount,
                refund_reason,
                refund_transaction_id
            });

            return successResponse(res, {
                payment: refundedPayment.toJSON(),
                message: 'Hoàn tiền thành công'
            });

        } catch (error) {
            console.error('❌ Refund payment error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/payments/stats - Thống kê thanh toán
    static async getPaymentStats(req, res) {
        try {
            const userId = req.user.id;
            const {
                start_date,
                end_date
            } = req.query;

            const stats = await Payment.getPaymentStats({
                start_date,
                end_date,
                user_id: userId
            });

            return successResponse(res, {
                stats,
                message: 'Lấy thống kê thanh toán thành công'
            });

        } catch (error) {
            console.error('❌ Get payment stats error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/payments/webhook - Webhook cho các gateway thanh toán
    static async handlePaymentWebhook(req, res) {
        try {
            const {
                transaction_id,
                order_id,
                status,
                amount,
                gateway_response
            } = req.body;

            // Validate webhook (in real implementation, verify signature)
            if (!transaction_id || !order_id || !status) {
                return errorResponse(res, 'Dữ liệu webhook không hợp lệ', 400);
            }

            // Find payment by order
            const payment = await Payment.findByOrderId(order_id);
            if (!payment) {
                return errorResponse(res, 'Không tìm thấy thông tin thanh toán', 404);
            }

            // Update payment status based on webhook
            const updatedPayment = await Payment.updateStatus(payment.id, status, {
                transaction_id,
                gateway_response,
                paid_at: status === 'completed' ? new Date() : null
            });

            // If payment completed, update order status
            if (status === 'completed') {
                await Order.updateStatus(order_id, 'confirmed', 'Thanh toán hoàn thành');
            } else if (status === 'failed') {
                await Order.updateStatus(order_id, 'cancelled', 'Thanh toán thất bại');
            }

            return successResponse(res, {
                payment: updatedPayment.toJSON(),
                message: 'Xử lý webhook thành công'
            });

        } catch (error) {
            console.error('❌ Payment webhook error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/payments/methods - Lấy danh sách phương thức thanh toán có sẵn
    static async getPaymentMethods(req, res) {
        try {
            const methods = [
                {
                    code: 'COD',
                    name: 'Thanh toán khi nhận hàng',
                    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
                    is_available: true,
                    icon: 'cash',
                    fees: 0
                },
                {
                    code: 'E_WALLET',
                    name: 'Ví điện tử',
                    description: 'Thanh toán qua ví điện tử (MoMo, ZaloPay, v.v.)',
                    is_available: true,
                    icon: 'wallet',
                    fees: 0
                }
            ];

            return successResponse(res, {
                methods,
                message: 'Lấy danh sách phương thức thanh toán thành công'
            });

        } catch (error) {
            console.error('❌ Get payment methods error:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = PaymentController;