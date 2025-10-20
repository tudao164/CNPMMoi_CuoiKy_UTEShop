const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/admin/adminOrderController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

// All admin order routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/orders/stats
 * @desc    Get order statistics
 * @access  Private (Admin only)
 * @query   date_from, date_to
 */
router.get('/stats', generalLimiter, adminOrderController.getOrderStats);

/**
 * @route   GET /api/admin/orders/export
 * @desc    Export orders data
 * @access  Private (Admin only)
 * @query   date_from, date_to, status
 */
router.get('/export', generalLimiter, adminOrderController.exportOrders);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 * @query   page, limit, status, payment_method, payment_status, user_id, date_from, date_to
 */
router.get('/', generalLimiter, adminOrderController.getAllOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order details with full information
 * @access  Private (Admin only)
 * @params  id - Order ID
 */
router.get('/:id', generalLimiter, adminOrderController.getOrderDetails);

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin only)
 * @params  id - Order ID
 * @body    { status, notes }
 */
router.patch('/:id/status', generalLimiter, adminOrderController.updateOrderStatus);

/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete order (only cancelled orders)
 * @access  Private (Admin only)
 * @params  id - Order ID
 */
router.delete('/:id', generalLimiter, adminOrderController.deleteOrder);

module.exports = router;
