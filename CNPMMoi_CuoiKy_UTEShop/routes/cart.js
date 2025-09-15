const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');
const { validateAddToCart, validateUpdateCart } = require('../middleware/validation');

// Apply authentication to all cart routes
router.use(authenticateToken);

/**
 * @route   GET /api/cart
 * @desc    Lấy giỏ hàng của user hiện tại
 * @access  Private
 */
router.get('/', CartController.getCart);

/**
 * @route   GET /api/cart/summary
 * @desc    Lấy tổng quan giỏ hàng (số lượng, tổng tiền)
 * @access  Private
 */
router.get('/summary', CartController.getCartSummary);

/**
 * @route   GET /api/cart/validate
 * @desc    Kiểm tra tính hợp lệ của giỏ hàng
 * @access  Private
 */
router.get('/validate', CartController.validateCart);

/**
 * @route   POST /api/cart/add
 * @desc    Thêm sản phẩm vào giỏ hàng
 * @access  Private
 * @body    { product_id: number, quantity: number }
 */
router.post('/add', validateAddToCart, CartController.addToCart);

/**
 * @route   POST /api/cart/bulk-add
 * @desc    Thêm nhiều sản phẩm vào giỏ hàng cùng lúc
 * @access  Private
 * @body    { items: [{ product_id: number, quantity: number }] }
 */
router.post('/bulk-add', CartController.bulkAddToCart);

/**
 * @route   POST /api/cart/sync
 * @desc    Đồng bộ giỏ hàng (thay thế toàn bộ giỏ hàng hiện tại)
 * @access  Private
 * @body    { items: [{ product_id: number, quantity: number }] }
 */
router.post('/sync', CartController.syncCart);

/**
 * @route   PUT /api/cart/:id
 * @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
 * @access  Private
 * @params  id - Cart item ID
 * @body    { quantity: number }
 */
router.put('/:id', validateUpdateCart, CartController.updateCartItem);

/**
 * @route   DELETE /api/cart/:id
 * @desc    Xóa sản phẩm khỏi giỏ hàng
 * @access  Private
 * @params  id - Cart item ID
 */
router.delete('/:id', CartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Xóa toàn bộ giỏ hàng
 * @access  Private
 */
router.delete('/', CartController.clearCart);

module.exports = router;