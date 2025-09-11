const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
    authenticateToken, 
    refreshToken, 
    requireVerifiedUser 
} = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validateOTPVerification,
    validateForgotPassword,
    validateResetPassword,
    validateResendOTP
} = require('../middleware/validation');
const {
    registrationLimiter,
    loginLimiter,
    otpLimiter,
    passwordResetLimiter,
    emailVerificationLimiter
} = require('../middleware/rateLimiter');

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email, password, full_name, phone? }
 */
router.post('/register', 
    registrationLimiter,
    validateRegistration,
    authController.register
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for registration
 * @access  Public
 * @body    { email, otp_code }
 */
router.post('/verify-otp',
    emailVerificationLimiter,
    validateOTPVerification,
    authController.verifyRegistrationOTP
);

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 * @body    { email, password }
 */
router.post('/login',
    loginLimiter,
    validateLogin,
    authController.login
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password',
    passwordResetLimiter,
    validateForgotPassword,
    authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 * @body    { email, otp_code, new_password }
 */
router.post('/reset-password',
    passwordResetLimiter,
    validateResetPassword,
    authController.resetPassword
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for registration or password reset
 * @access  Public
 * @body    { email, otp_type }
 */
router.post('/resend-otp',
    otpLimiter,
    validateResendOTP,
    authController.resendOTP
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Public
 * @body    { refresh_token }
 */
router.post('/refresh-token',
    refreshToken,
    authController.refreshToken
);

// Protected routes (authentication required)

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info and check authentication
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/me',
    authenticateToken,
    authController.checkAuth
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.post('/logout',
    authenticateToken,
    authController.logout
);

// Admin/Debug routes (for development and monitoring)

/**
 * @route   GET /api/auth/otp-stats
 * @desc    Get OTP statistics (for debugging/monitoring)
 * @access  Private (Admin only in production)
 * @header  Authorization: Bearer <token>
 */
router.get('/otp-stats',
    authenticateToken,
    // requireAdmin, // Uncomment for admin-only access
    authController.getOTPStats
);

module.exports = router;
