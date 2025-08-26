const { body, validationResult } = require('express-validator');
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
const validatePagination = [
    body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Trang phải là số nguyên dương'),
        
    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Giới hạn phải là số nguyên từ 1 đến 100'),
        
    handleValidationErrors
];

// Search validation
const validateSearch = [
    body('q')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Từ khóa tìm kiếm phải từ 1 đến 255 ký tự')
        .trim(),
        
    handleValidationErrors
];

// Email format validation helper
const isValidEmail = (email) => {
    return VALIDATION_PATTERNS.EMAIL.test(email);
};

// Phone format validation helper
const isValidPhone = (phone) => {
    return VALIDATION_PATTERNS.PHONE.test(phone);
};

// Password strength validation helper
const isStrongPassword = (password) => {
    return VALIDATION_PATTERNS.PASSWORD.test(password);
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
    isValidEmail,
    isValidPhone,
    isStrongPassword,
    sanitizeInput,
    validateUniqueEmail
};
