const express = require('express');
const router = express.Router();
const adminProductController = require('../../controllers/admin/adminProductController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

// All admin product routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/products/stats
 * @desc    Get product statistics
 * @access  Private (Admin only)
 */
router.get('/stats', generalLimiter, adminProductController.getProductStats);

/**
 * @route   GET /api/admin/products
 * @desc    Get all products (including inactive)
 * @access  Private (Admin only)
 * @query   page, limit, category_id, search, is_active, stock_status
 */
router.get('/', generalLimiter, adminProductController.getAllProducts);

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Private (Admin only)
 * @body    { name, description, price, sale_price, stock_quantity, category_id, image_url, images, specifications, is_featured }
 */
router.post('/', generalLimiter, adminProductController.createProduct);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 * @params  id - Product ID
 * @body    { name, description, price, sale_price, stock_quantity, category_id, image_url, images, specifications, is_featured, is_active }
 */
router.put('/:id', generalLimiter, adminProductController.updateProduct);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Admin only)
 * @params  id - Product ID
 */
router.delete('/:id', generalLimiter, adminProductController.deleteProduct);

/**
 * @route   PATCH /api/admin/products/:id/activate
 * @desc    Activate product
 * @access  Private (Admin only)
 * @params  id - Product ID
 */
router.patch('/:id/activate', generalLimiter, adminProductController.activateProduct);

/**
 * @route   PATCH /api/admin/products/:id/stock
 * @desc    Update product stock quantity
 * @access  Private (Admin only)
 * @params  id - Product ID
 * @body    { stock_quantity }
 */
router.patch('/:id/stock', generalLimiter, adminProductController.updateStock);

module.exports = router;
