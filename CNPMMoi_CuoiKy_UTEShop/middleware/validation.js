const { body, param, query, validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/responseHelper');
const { VALIDATION_PATTERNS, ERROR_MESSAGES } = require('../utils/constants');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));
        return validationErrorResponse(res, errorMessages);
    }
    next();
};

// Registration validation
const validateRegistration = [
    body('email')
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email không được quá 255 ký tự'),
        
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(ERROR_MESSAGES.WEAK_PASSWORD),
        
    body('full_name')
        .notEmpty()
        .withMessage('Họ tên là bắt buộc')
        .isLength({ min: 2, max: 255 })
        .withMessage('Họ tên phải từ 2 đến 255 ký tự')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Họ tên chỉ được chứa chữ cái và khoảng trắng'),
        
    body('phone')
        .optional()
        .matches(VALIDATION_PATTERNS.PHONE)
        .withMessage(ERROR_MESSAGES.INVALID_PHONE),
        
    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .normalizeEmail(),
        
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc'),
        
    handleValidationErrors
];

// OTP verification validation
const validateOTPVerification = [
    body('email')
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .normalizeEmail(),
        
    body('otp_code')
        .isLength({ min: 6, max: 6 })
        .withMessage('Mã OTP phải có 6 ký tự')
        .isNumeric()
        .withMessage('Mã OTP chỉ được chứa số'),
        
    handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .normalizeEmail(),
        
    handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
    body('email')
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .normalizeEmail(),
        
    body('otp_code')
        .isLength({ min: 6, max: 6 })
        .withMessage('Mã OTP phải có 6 ký tự')
        .isNumeric()
        .withMessage('Mã OTP chỉ được chứa số'),
        
    body('new_password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(ERROR_MESSAGES.WEAK_PASSWORD),
        
    handleValidationErrors
];

// Update profile validation
const validateUpdateProfile = [
    body('full_name')
        .optional()
        .isLength({ min: 2, max: 255 })
        .withMessage('Họ tên phải từ 2 đến 255 ký tự')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Họ tên chỉ được chứa chữ cái và khoảng trắng'),
        
    body('phone')
        .optional()
        .matches(VALIDATION_PATTERNS.PHONE)
        .withMessage(ERROR_MESSAGES.INVALID_PHONE),

    body('avatar_url')
        .optional()
        .isURL()
        .withMessage('URL avatar không hợp lệ')
        .isLength({ max: 500 })
        .withMessage('URL avatar không được quá 500 ký tự'),
        
    handleValidationErrors
];

// Change password validation
const validateChangePassword = [
    body('current_password')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại là bắt buộc'),
        
    body('new_password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(ERROR_MESSAGES.WEAK_PASSWORD),
        
    body('confirm_password')
        .custom((value, { req }) => {
            if (value !== req.body.new_password) {
                throw new Error('Xác nhận mật khẩu không khớp');
            }
            return true;
        }),
        
    handleValidationErrors
];

// Resend OTP validation
const validateResendOTP = [
    body('email')
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .normalizeEmail(),
        
    body('otp_type')
        .isIn(['register', 'reset_password'])
        .withMessage('Loại OTP không hợp lệ'),
        
    handleValidationErrors
];

// Pagination validation
const validatePagination = (req, res, next) => {
    next(); // Simplified - just pass through for now
};

// Search validation
const validateSearch = (req, res, next) => {
    next(); // Simplified - just pass through for now
};

// Product ID validation
const validateProductId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID sản phẩm không hợp lệ'
        });
    }
    next();
};

// Category ID validation
const validateCategoryId = (req, res, next) => {
    const id = parseInt(req.params.id || req.params.categoryId);
    if (id && id < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID danh mục không hợp lệ'
        });
    }
    next();
};

// Order ID validation
const validateOrderId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID đơn hàng không hợp lệ'
        });
    }
    next();
};

// Create order validation
const validateCreateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
        
    body('items.*.product_id')
        .isInt({ min: 1 })
        .withMessage('ID sản phẩm phải là số nguyên dương'),
        
    body('items.*.quantity')
        .isInt({ min: 1, max: 999 })
        .withMessage('Số lượng phải từ 1 đến 999'),
        
    body('shipping_address')
        .notEmpty()
        .withMessage('Địa chỉ giao hàng là bắt buộc')
        .isLength({ min: 10, max: 500 })
        .withMessage('Địa chỉ giao hàng phải từ 10 đến 500 ký tự'),
        
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Ghi chú không được quá 500 ký tự'),
        
    handleValidationErrors
];

// Create order from cart validation
const validateCreateOrderFromCart = [
    body('shipping_address')
        .notEmpty()
        .withMessage('Địa chỉ giao hàng là bắt buộc')
        .isLength({ min: 10, max: 500 })
        .withMessage('Địa chỉ giao hàng phải từ 10 đến 500 ký tự'),
        
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Ghi chú không được quá 500 ký tự'),
        
    body('payment_method')
        .optional()
        .isIn(['COD', 'E_WALLET', 'BANK_TRANSFER', 'CREDIT_CARD'])
        .withMessage('Phương thức thanh toán phải là COD, E_WALLET, BANK_TRANSFER hoặc CREDIT_CARD'),
        
    handleValidationErrors
];

// Order status validation
const validateOrderStatus = [
    body('status')
        .isIn(['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'])
        .withMessage('Trạng thái đơn hàng không hợp lệ'),
        
    handleValidationErrors
];

// Product filters validation
const validateProductFilters = (req, res, next) => {
    next(); // Simplified - just pass through for now
};

// Email format validation helper
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Phone format validation helper
const isValidPhone = (phone) => {
    return /^[0-9]{10,11}$/.test(phone);
};

// Password strength validation helper
const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

// Sanitize input helper
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Custom validation for unique email
const validateUniqueEmail = (excludeUserId = null) => {
    return body('email').custom(async (email) => {
        const User = require('../models/User');
        const exists = await User.emailExists(email, excludeUserId);
        if (exists) {
            throw new Error(ERROR_MESSAGES.EMAIL_EXISTS);
        }
        return true;
    });
};

// Cart validation - Add to cart
const validateAddToCart = [
    body('product_id')
        .isInt({ min: 1 })
        .withMessage('ID sản phẩm phải là số nguyên dương'),
        
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 999 })
        .withMessage('Số lượng phải từ 1 đến 999'),
        
    handleValidationErrors
];

// Cart validation - Update cart item
const validateUpdateCart = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID sản phẩm trong giỏ hàng không hợp lệ'),
        
    body('quantity')
        .isInt({ min: 0, max: 999 })
        .withMessage('Số lượng phải từ 0 đến 999'),
        
    handleValidationErrors
];

// Cart validation - Cart item ID
const validateCartItemId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID sản phẩm trong giỏ hàng không hợp lệ'
        });
    }
    next();
};

// Payment validation - Create payment
const validateCreatePayment = [
    body('order_id')
        .isInt({ min: 1 })
        .withMessage('ID đơn hàng phải là số nguyên dương'),
        
    body('payment_method')
        .isIn(['COD', 'E_WALLET'])
        .withMessage('Phương thức thanh toán phải là COD hoặc E_WALLET'),
        
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Số tiền thanh toán phải lớn hơn 0'),
        
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Ghi chú không được quá 500 ký tự'),
        
    handleValidationErrors
];

// Cancel request validation
const validateCancelRequest = [
    body('order_id')
        .isInt({ min: 1 })
        .withMessage('ID đơn hàng phải là số nguyên dương'),
        
    body('reason')
        .notEmpty()
        .withMessage('Lý do hủy đơn là bắt buộc')
        .isLength({ min: 10, max: 500 })
        .withMessage('Lý do hủy đơn phải từ 10 đến 500 ký tự'),
        
    handleValidationErrors
];

// Cancel request ID validation
const validateCancelRequestId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID yêu cầu hủy đơn không hợp lệ'
        });
    }
    next();
};

module.exports = {
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validateOTPVerification,
    validateForgotPassword,
    validateResetPassword,
    validateUpdateProfile,
    validateChangePassword,
    validateResendOTP,
    validatePagination,
    validateSearch,
    validateProductId,
    validateCategoryId,
    validateOrderId,
    validateCreateOrder,
    validateCreateOrderFromCart,
    validateOrderStatus,
    validateProductFilters,
    validateAddToCart,
    validateUpdateCart,
    validateCartItemId,
    validateCreatePayment,
    validateCancelRequest,
    validateCancelRequestId,
    isValidEmail,
    isValidPhone,
    isStrongPassword,
    sanitizeInput,
    validateUniqueEmail
};
