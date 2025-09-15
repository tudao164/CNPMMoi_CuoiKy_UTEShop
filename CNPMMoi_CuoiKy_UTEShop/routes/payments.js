const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { 
    validateCreatePayment, 
    validateCartItemId 
} = require('../middleware/validation');

// Apply authentication to most payment routes
router.use(authenticateToken);

/**
 * @route   GET /api/payments/methods
 * @desc    Lấy danh sách phương thức thanh toán có sẵn
 * @access  Private
 */
router.get('/methods', PaymentController.getPaymentMethods);

/**
 * @route   GET /api/payments
 * @desc    Lấy danh sách thanh toán của user hiện tại
 * @access  Private
 * @query   page, limit, status, method, order_by, order_dir
 */
router.get('/', PaymentController.getUserPayments);

/**
 * @route   GET /api/payments/stats
 * @desc    Lấy thống kê thanh toán của user
 * @access  Private
 * @query   start_date, end_date
 */
router.get('/stats', PaymentController.getPaymentStats);

/**
 * @route   GET /api/payments/order/:orderId
 * @desc    Lấy thông tin thanh toán theo đơn hàng
 * @access  Private
 * @params  orderId - Order ID
 */
router.get('/order/:orderId', PaymentController.getPaymentByOrder);

/**
 * @route   GET /api/payments/:id
 * @desc    Lấy chi tiết thanh toán
 * @access  Private
 * @params  id - Payment ID
 */
router.get('/:id', PaymentController.getPaymentDetails);

/**
 * @route   POST /api/payments/create
 * @desc    Tạo thanh toán cho đơn hàng
 * @access  Private
 * @body    { order_id: number, payment_method: string, notes?: string }
 */
router.post('/create', validateCreatePayment, PaymentController.createPayment);

/**
 * @route   POST /api/payments/:id/process-cod
 * @desc    Xử lý thanh toán COD (khi giao hàng thành công)
 * @access  Private
 * @params  id - Payment ID
 */
router.post('/:id/process-cod', PaymentController.processCODPayment);

/**
 * @route   POST /api/payments/:id/process-ewallet
 * @desc    Xử lý thanh toán ví điện tử
 * @access  Private
 * @params  id - Payment ID
 * @body    { transaction_id: string, gateway_response?: object, status?: string }
 */
router.post('/:id/process-ewallet', PaymentController.processEWalletPayment);

/**
 * @route   PUT /api/payments/:id/cancel
 * @desc    Hủy thanh toán
 * @access  Private
 * @params  id - Payment ID
 * @body    { reason?: string }
 */
router.put('/:id/cancel', PaymentController.cancelPayment);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Hoàn tiền (chỉ admin)
 * @access  Private (Admin only)
 * @params  id - Payment ID
 * @body    { refund_amount?: number, refund_reason: string, refund_transaction_id?: string }
 */
router.post('/:id/refund', PaymentController.refundPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Webhook cho các gateway thanh toán bên ngoài
 * @access  Public (but should be secured with signature verification)
 * @body    { transaction_id: string, order_id: number, status: string, amount: number, gateway_response?: object }
 */
router.post('/webhook', (req, res, next) => {
    // Skip authentication for webhook
    next();
}, PaymentController.handlePaymentWebhook);

module.exports = router;