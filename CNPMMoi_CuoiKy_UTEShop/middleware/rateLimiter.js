const rateLimit = require('express-rate-limit');
const { tooManyRequestsResponse } = require('../utils/responseHelper');

// General API rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút');
    }
});

// Authentication endpoints rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth requests per windowMs
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu đăng nhập/đăng ký từ IP này, vui lòng thử lại sau 15 phút',
        timestamp: new Date().toISOString()
    },
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu đăng nhập/đăng ký từ IP này, vui lòng thử lại sau 15 phút');
    }
});

// OTP endpoints rate limiter (very strict)
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // limit each IP to 3 OTP requests per 5 minutes
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu gửi OTP từ IP này, vui lòng thử lại sau 5 phút',
        timestamp: new Date().toISOString()
    },
    skipSuccessfulRequests: false, // Count all requests
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu gửi OTP từ IP này, vui lòng thử lại sau 5 phút');
    }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu đặt lại mật khẩu từ IP này, vui lòng thử lại sau 1 giờ',
        timestamp: new Date().toISOString()
    },
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu đặt lại mật khẩu từ IP này, vui lòng thử lại sau 1 giờ');
    }
});

// Registration rate limiter
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 registration attempts per hour
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu đăng ký từ IP này, vui lòng thử lại sau 1 giờ',
        timestamp: new Date().toISOString()
    },
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu đăng ký từ IP này, vui lòng thử lại sau 1 giờ');
    }
});

// Login rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per 15 minutes
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu đăng nhập từ IP này, vui lòng thử lại sau 15 phút',
        timestamp: new Date().toISOString()
    },
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu đăng nhập từ IP này, vui lòng thử lại sau 15 phút');
    }
});

// Email verification rate limiter
const emailVerificationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // limit each IP to 3 email verification attempts per 10 minutes
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu xác thực email từ IP này, vui lòng thử lại sau 10 phút',
        timestamp: new Date().toISOString()
    },
    handler: (req, res) => {
        return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu xác thực email từ IP này, vui lòng thử lại sau 10 phút');
    }
});

// Create custom rate limiter
const createCustomLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message,
            timestamp: new Date().toISOString()
        },
        handler: (req, res) => {
            return tooManyRequestsResponse(res, message);
        }
    });
};

// Rate limiter with custom key generator (e.g., by user ID)
const createUserBasedLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        keyGenerator: (req) => {
            // Use user ID if authenticated, otherwise fall back to IP
            return req.user ? `user:${req.user.id}` : req.ip;
        },
        message: {
            success: false,
            message,
            timestamp: new Date().toISOString()
        },
        handler: (req, res) => {
            return tooManyRequestsResponse(res, message);
        }
    });
};

// Progressive delay rate limiter (increases delay with each request)
const createProgressiveLimiter = (windowMs, max, baseDelayMs = 1000) => {
    return rateLimit({
        windowMs,
        max,
        delayMs: (hits) => baseDelayMs * Math.pow(2, hits - 1), // Exponential backoff
        delayAfter: 1, // Apply delay after first request
        message: {
            success: false,
            message: 'Quá nhiều yêu cầu, thời gian chờ tăng dần',
            timestamp: new Date().toISOString()
        },
        handler: (req, res) => {
            return tooManyRequestsResponse(res, 'Quá nhiều yêu cầu, vui lòng chậm lại');
        }
    });
};

module.exports = {
    generalLimiter,
    authLimiter,
    otpLimiter,
    passwordResetLimiter,
    registrationLimiter,
    loginLimiter,
    emailVerificationLimiter,
    createCustomLimiter,
    createUserBasedLimiter,
    createProgressiveLimiter
};
