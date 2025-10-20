const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
    unauthorizedResponse, 
    forbiddenResponse 
} = require('../utils/responseHelper');
const { ERROR_MESSAGES } = require('../utils/constants');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return unauthorizedResponse(res, ERROR_MESSAGES.TOKEN_REQUIRED);
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.user_id);
        if (!user) {
            return unauthorizedResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return unauthorizedResponse(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        
        if (error.name === 'TokenExpiredError') {
            return unauthorizedResponse(res, ERROR_MESSAGES.TOKEN_EXPIRED);
        }
        
        return unauthorizedResponse(res, ERROR_MESSAGES.INVALID_TOKEN);
    }
};

// Middleware to check if user is verified
const requireVerifiedUser = (req, res, next) => {
    if (!req.user.is_verified) {
        return forbiddenResponse(res, ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED);
    }
    next();
};

// Middleware to generate JWT token
const generateToken = (userId) => {
    try {
        const payload = {
            user_id: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        };

        return jwt.sign(payload, process.env.JWT_SECRET);
    } catch (error) {
        console.error('❌ Error generating token:', error);
        throw new Error('Lỗi tạo token');
    }
};

// Middleware to refresh JWT token
const refreshToken = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return unauthorizedResponse(res, 'Refresh token is required');
        }

        // Verify refresh token
        const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return unauthorizedResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Generate new access token
        const newToken = generateToken(user.id);

        req.newToken = newToken;
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Refresh token error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return unauthorizedResponse(res, 'Invalid refresh token');
        }
        
        if (error.name === 'TokenExpiredError') {
            return unauthorizedResponse(res, 'Refresh token expired');
        }
        
        return unauthorizedResponse(res, 'Invalid refresh token');
    }
};

// Optional authentication (user can be authenticated or not)
const optionalAuthentication = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId);
        req.user = user || null;
        
        next();
    } catch (error) {
        // If token is invalid, continue without user
        req.user = null;
        next();
    }
};

// Check if user owns the resource
const checkResourceOwnership = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        
        if (req.user.id != resourceUserId) {
            return forbiddenResponse(res, 'Bạn không có quyền truy cập tài nguyên này');
        }
        
        next();
    };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return unauthorizedResponse(res, ERROR_MESSAGES.TOKEN_REQUIRED);
    }
    
    if (!req.user.is_admin) {
        return forbiddenResponse(res, 'Chỉ admin mới có thể truy cập chức năng này');
    }
    
    next();
};

module.exports = {
    authenticateToken,
    requireVerifiedUser,
    generateToken,
    refreshToken,
    optionalAuthentication,
    optionalAuth: optionalAuthentication, // alias for easier import
    checkResourceOwnership,
    requireAdmin
};
