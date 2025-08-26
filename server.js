const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import configurations
const { testConnection } = require('./config/database');
const { testEmailConnection } = require('./config/email');

// Import middleware
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Import utilities
const { errorResponse } = require('./utils/responseHelper');
const { ERROR_MESSAGES } = require('./utils/constants');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'UTEShop API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to UTEShop API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            health: '/health'
        },
        timestamp: new Date().toISOString()
    });
});

// API documentation endpoint (basic)
app.get('/api/docs', (req, res) => {
    res.json({
        success: true,
        message: 'UTEShop API Documentation',
        version: '1.0.0',
        endpoints: {
            authentication: {
                register: 'POST /api/auth/register',
                verifyOTP: 'POST /api/auth/verify-otp',
                login: 'POST /api/auth/login',
                forgotPassword: 'POST /api/auth/forgot-password',
                resetPassword: 'POST /api/auth/reset-password',
                resendOTP: 'POST /api/auth/resend-otp',
                refreshToken: 'POST /api/auth/refresh-token',
                checkAuth: 'GET /api/auth/me',
                logout: 'POST /api/auth/logout'
            },
            user: {
                getProfile: 'GET /api/user/profile',
                updateProfile: 'PUT /api/user/profile',
                changePassword: 'POST /api/user/change-password',
                getUserStats: 'GET /api/user/stats',
                getUserOTPs: 'GET /api/user/otps',
                deleteAccount: 'DELETE /api/user/account',
                updateEmail: 'POST /api/user/update-email'
            },
            utilities: {
                health: 'GET /health',
                docs: 'GET /api/docs'
            }
        },
        authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>'
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    return errorResponse(res, 'Endpoint không tìm thấy', 404);
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Global error handler:', error);
    
    // Handle specific error types
    if (error.type === 'entity.parse.failed') {
        return errorResponse(res, 'Invalid JSON format', 400);
    }
    
    if (error.type === 'entity.too.large') {
        return errorResponse(res, 'Request entity too large', 413);
    }
    
    // Default error response
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Start server function
const startServer = async () => {
    try {
        console.log('🚀 Starting UTEShop API Server...');
        
        // Test database connection
        console.log('📊 Testing database connection...');
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Database connection failed. Please check your database configuration.');
            process.exit(1);
        }
        
        // Test email connection
        console.log('📧 Testing email connection...');
        const emailConnected = await testEmailConnection();
        if (!emailConnected) {
            console.warn('⚠️  Email connection failed. Email features may not work properly.');
        }
        
        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`✅ UTEShop API Server is running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🔗 Base URL: http://localhost:${PORT}`);
            console.log('─'.repeat(50));
        });
        
        // Store server reference for graceful shutdown
        global.server = server;
        
        return server;
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;
