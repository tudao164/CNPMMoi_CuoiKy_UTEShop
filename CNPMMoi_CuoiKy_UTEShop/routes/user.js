const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
    authenticateToken, 
    requireVerifiedUser,
    requireAdmin,
    checkResourceOwnership 
} = require('../middleware/auth');
const {
    validateUpdateProfile,
    validateChangePassword
} = require('../middleware/validation');
const { generalLimiter } = require('../middleware/rateLimiter');

// All user routes require authentication
router.use(authenticateToken);

// Personal profile routes

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/profile',
    userController.getProfile
);

/**
 * @route   PUT /api/user/profile
 * @desc    Update current user profile
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { full_name?, phone? }
 */
router.put('/profile',
    validateUpdateProfile,
    userController.updateProfile
);

/**
 * @route   POST /api/user/change-password
 * @desc    Change user password
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { current_password, new_password, confirm_password }
 */
router.post('/change-password',
    validateChangePassword,
    userController.changePassword
);

/**
 * @route   GET /api/user/stats
 * @desc    Get user personal statistics
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/stats',
    userController.getUserStats
);

/**
 * @route   GET /api/user/otps
 * @desc    Get user's recent OTP history
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @query   { limit? }
 */
router.get('/otps',
    userController.getUserOTPs
);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account (requires password confirmation)
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { password }
 */
router.delete('/account',
    generalLimiter,
    userController.deleteAccount
);

/**
 * @route   POST /api/user/update-email
 * @desc    Update user email (requires verification)
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { new_email, password }
 */
router.post('/update-email',
    generalLimiter,
    userController.updateEmail
);

// Admin routes - Now active with requireAdmin middleware

/**
 * @route   GET /api/user/all
 * @desc    Get all users (admin only)
 * @access  Private (Admin only)
 * @header  Authorization: Bearer <token>
 * @query   { page?, limit? }
 */
router.get('/all',
    requireAdmin,
    userController.getAllUsers
);

/**
 * @route   GET /api/user/search
 * @desc    Search users (admin only)
 * @access  Private (Admin only)
 * @header  Authorization: Bearer <token>
 * @query   { q, page?, limit? }
 */
router.get('/search',
    requireAdmin,
    userController.searchUsers
);

/**
 * @route   GET /api/user/system-stats
 * @desc    Get system user statistics (admin only)
 * @access  Private (Admin only)
 * @header  Authorization: Bearer <token>
 */
router.get('/system-stats',
    requireAdmin,
    userController.getSystemUserStats
);

module.exports = router;
