const express = require('express');
const router = express.Router();
const CancelRequestController = require('../controllers/cancelRequestController');
const { authenticateToken } = require('../middleware/auth');
const { 
    validateCancelRequest, 
    validateCancelRequestId 
} = require('../middleware/validation');

// Apply authentication to all cancel request routes
router.use(authenticateToken);

/**
 * @route   GET /api/cancel-requests
 * @desc    Lấy danh sách yêu cầu hủy đơn của user hiện tại
 * @access  Private
 * @query   page, limit, status, order_by, order_dir
 */
router.get('/', CancelRequestController.getUserCancelRequests);

/**
 * @route   GET /api/cancel-requests/stats
 * @desc    Lấy thống kê yêu cầu hủy đơn của user
 * @access  Private
 * @query   start_date, end_date
 */
router.get('/stats', CancelRequestController.getCancelRequestStats);

/**
 * @route   GET /api/cancel-requests/admin/pending
 * @desc    Lấy danh sách yêu cầu hủy đơn chờ xử lý (Admin only)
 * @access  Private (Admin)
 * @query   page, limit, order_by, order_dir
 */
router.get('/admin/pending', CancelRequestController.getPendingRequests);

/**
 * @route   GET /api/cancel-requests/admin/stats
 * @desc    Lấy thống kê yêu cầu hủy đơn toàn hệ thống (Admin only)
 * @access  Private (Admin)
 * @query   start_date, end_date
 */
router.get('/admin/stats', CancelRequestController.getAdminStats);

/**
 * @route   GET /api/cancel-requests/order/:orderId
 * @desc    Lấy yêu cầu hủy đơn theo đơn hàng
 * @access  Private
 * @params  orderId - Order ID
 */
router.get('/order/:orderId', CancelRequestController.getCancelRequestByOrder);

/**
 * @route   GET /api/cancel-requests/:id
 * @desc    Lấy chi tiết yêu cầu hủy đơn
 * @access  Private
 * @params  id - Cancel Request ID
 */
router.get('/:id', validateCancelRequestId, CancelRequestController.getCancelRequestDetails);

/**
 * @route   POST /api/cancel-requests
 * @desc    Tạo yêu cầu hủy đơn hàng
 * @access  Private
 * @body    { order_id: number, reason: string }
 */
router.post('/', validateCancelRequest, CancelRequestController.createCancelRequest);

/**
 * @route   PUT /api/cancel-requests/:id
 * @desc    Cập nhật yêu cầu hủy đơn (chỉ khi status = pending)
 * @access  Private
 * @params  id - Cancel Request ID
 * @body    { reason: string }
 */
router.put('/:id', validateCancelRequestId, CancelRequestController.updateCancelRequest);

/**
 * @route   POST /api/cancel-requests/:id/process
 * @desc    Xử lý yêu cầu hủy đơn - chấp thuận hoặc từ chối (Admin only)
 * @access  Private (Admin)
 * @params  id - Cancel Request ID
 * @body    { status: "approved" | "rejected", admin_notes: string }
 */
router.post('/:id/process', validateCancelRequestId, CancelRequestController.processRequest);

/**
 * @route   DELETE /api/cancel-requests/:id
 * @desc    Rút lại yêu cầu hủy đơn (chỉ khi status = pending)
 * @access  Private
 * @params  id - Cancel Request ID
 */
router.delete('/:id', validateCancelRequestId, CancelRequestController.withdrawCancelRequest);

module.exports = router;