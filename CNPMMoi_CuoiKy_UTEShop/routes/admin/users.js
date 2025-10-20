const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/adminUserController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

// All admin user routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/stats', generalLimiter, adminUserController.getUserStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 * @query   page, limit, search
 */
router.get('/', generalLimiter, adminUserController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with statistics
 * @access  Private (Admin only)
 * @params  id - User ID
 */
router.get('/:id', generalLimiter, adminUserController.getUserById);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 * @body    { email, password, full_name, phone, is_admin, is_verified }
 */
router.post('/', generalLimiter, adminUserController.createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 * @params  id - User ID
 * @body    { email, full_name, phone, is_admin, is_verified }
 */
router.put('/:id', generalLimiter, adminUserController.updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 * @params  id - User ID
 */
router.delete('/:id', generalLimiter, adminUserController.deleteUser);

/**
 * @route   PATCH /api/admin/users/:id/password
 * @desc    Reset user password
 * @access  Private (Admin only)
 * @params  id - User ID
 * @body    { new_password }
 */
router.patch('/:id/password', generalLimiter, adminUserController.resetUserPassword);

/**
 * @route   PATCH /api/admin/users/:id/toggle-admin
 * @desc    Toggle admin status for user
 * @access  Private (Admin only)
 * @params  id - User ID
 */
router.patch('/:id/toggle-admin', generalLimiter, adminUserController.toggleAdminStatus);

module.exports = router;
