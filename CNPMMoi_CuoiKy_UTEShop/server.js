const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import configurations
const { testConnection } = require('./config/database');
const { testEmailConnection } = require('./config/email');

// Import services
const { startAutoConfirmation } = require('./services/orderAutoConfirmation');

// Import middleware
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payments');
const cancelRequestRoutes = require('./routes/cancel-requests');
const uploadRoutes = require('./routes/upload');

// Import admin routes
const adminProductRoutes = require('./routes/admin/products');
const adminUserRoutes = require('./routes/admin/users');
const adminOrderRoutes = require('./routes/admin/orders');

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
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Serve static files (uploaded images)
app.use('/images', express.static(path.join(__dirname, 'images')));

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
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cancel-requests', cancelRequestRoutes);
app.use('/api/upload', uploadRoutes);

// Admin routes
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

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
            products: '/api/products',
            orders: '/api/orders',
            cart: '/api/cart',
            payments: '/api/payments',
            cancelRequests: '/api/cancel-requests',
            admin: {
                products: '/api/admin/products',
                users: '/api/admin/users',
                orders: '/api/admin/orders'
            },
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
            products: {
                getHomePageData: 'GET /api/products/home',
                getAllProducts: 'GET /api/products',
                getProductById: 'GET /api/products/:id',
                getLatestProducts: 'GET /api/products/latest',
                getBestSellingProducts: 'GET /api/products/best-selling',
                getMostViewedProducts: 'GET /api/products/most-viewed',
                getHighestDiscountProducts: 'GET /api/products/highest-discount',
                searchProducts: 'GET /api/products/search',
                getProductsByCategory: 'GET /api/products/categories/:categoryId/products',
                getRelatedProducts: 'GET /api/products/:id/related',
                getAllCategories: 'GET /api/products/categories',
                getCategoryById: 'GET /api/products/categories/:id'
            },
            orders: {
                createOrder: 'POST /api/orders',
                getUserOrders: 'GET /api/orders',
                getOrderById: 'GET /api/orders/:id',
                getUserOrderStats: 'GET /api/orders/stats',
                getOrderTracking: 'GET /api/orders/:id/tracking',
                cancelOrder: 'PATCH /api/orders/:id/cancel',
                updateOrderStatus: 'PATCH /api/orders/:id/status'
            },
            cart: {
                getCart: 'GET /api/cart',
                getCartSummary: 'GET /api/cart/summary',
                validateCart: 'GET /api/cart/validate',
                addToCart: 'POST /api/cart/add',
                bulkAddToCart: 'POST /api/cart/bulk-add',
                syncCart: 'POST /api/cart/sync',
                updateCartItem: 'PUT /api/cart/:id',
                removeFromCart: 'DELETE /api/cart/:id',
                clearCart: 'DELETE /api/cart'
            },
            payments: {
                getPaymentMethods: 'GET /api/payments/methods',
                getUserPayments: 'GET /api/payments',
                getPaymentStats: 'GET /api/payments/stats',
                getPaymentByOrder: 'GET /api/payments/order/:orderId',
                getPaymentDetails: 'GET /api/payments/:id',
                createPayment: 'POST /api/payments/create',
                processCODPayment: 'POST /api/payments/:id/process-cod',
                processEWalletPayment: 'POST /api/payments/:id/process-ewallet',
                cancelPayment: 'PUT /api/payments/:id/cancel',
                refundPayment: 'POST /api/payments/:id/refund',
                paymentWebhook: 'POST /api/payments/webhook'
            },
            cancelRequests: {
                getUserCancelRequests: 'GET /api/cancel-requests',
                getCancelRequestStats: 'GET /api/cancel-requests/stats',
                getPendingRequests: 'GET /api/cancel-requests/admin/pending',
                getAdminStats: 'GET /api/cancel-requests/admin/stats',
                getCancelRequestByOrder: 'GET /api/cancel-requests/order/:orderId',
                getCancelRequestDetails: 'GET /api/cancel-requests/:id',
                createCancelRequest: 'POST /api/cancel-requests',
                updateCancelRequest: 'PUT /api/cancel-requests/:id',
                processRequest: 'POST /api/cancel-requests/:id/process',
                withdrawCancelRequest: 'DELETE /api/cancel-requests/:id'
            },
            admin: {
                products: {
                    getAllProducts: 'GET /api/admin/products',
                    getProductStats: 'GET /api/admin/products/stats',
                    createProduct: 'POST /api/admin/products',
                    updateProduct: 'PUT /api/admin/products/:id',
                    deleteProduct: 'DELETE /api/admin/products/:id',
                    activateProduct: 'PATCH /api/admin/products/:id/activate',
                    updateStock: 'PATCH /api/admin/products/:id/stock'
                },
                users: {
                    getAllUsers: 'GET /api/admin/users',
                    getUserStats: 'GET /api/admin/users/stats',
                    getUserById: 'GET /api/admin/users/:id',
                    createUser: 'POST /api/admin/users',
                    updateUser: 'PUT /api/admin/users/:id',
                    deleteUser: 'DELETE /api/admin/users/:id',
                    resetPassword: 'PATCH /api/admin/users/:id/password',
                    toggleAdmin: 'PATCH /api/admin/users/:id/toggle-admin'
                },
                orders: {
                    getAllOrders: 'GET /api/admin/orders',
                    getOrderStats: 'GET /api/admin/orders/stats',
                    getOrderDetails: 'GET /api/admin/orders/:id',
                    updateOrderStatus: 'PATCH /api/admin/orders/:id/status',
                    exportOrders: 'GET /api/admin/orders/export',
                    deleteOrder: 'DELETE /api/admin/orders/:id'
                }
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
        
        // Start order auto-confirmation job
        console.log('⏰ Starting order auto-confirmation service...');
        startAutoConfirmation();
        
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
