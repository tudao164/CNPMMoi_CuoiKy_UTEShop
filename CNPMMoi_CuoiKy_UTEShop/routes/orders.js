const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { validateCreateOrder, validateCreateOrderFromCart, validateOrderId, validateOrderStatus, validatePagination } = require('../middleware/validation');

// All order routes require authentication
router.use(authenticateToken);

// Create new order
router.post('/', generalLimiter, validateCreateOrder, orderController.createOrder);

// Create order from cart
router.post('/from-cart', generalLimiter, validateCreateOrderFromCart, orderController.createOrderFromCart);

// Get user's orders
router.get('/', generalLimiter, validatePagination, orderController.getUserOrders);

// Get user order statistics
router.get('/stats', generalLimiter, orderController.getUserOrderStats);

// Auto-confirm orders (system endpoint)
router.post('/auto-confirm', generalLimiter, orderController.autoConfirmOrders);

// Get order tracking history
router.get('/:id/tracking', generalLimiter, validateOrderId, orderController.getOrderTracking);

// Get order by ID
router.get('/:id', generalLimiter, validateOrderId, orderController.getOrderById);

// Cancel order (user can only cancel pending orders)
router.patch('/:id/cancel', generalLimiter, validateOrderId, orderController.cancelOrder);

// Update order status (for admin/system use - you might want to add admin middleware)
router.patch('/:id/status', generalLimiter, validateOrderId, validateOrderStatus, orderController.updateOrderStatus);

module.exports = router;
