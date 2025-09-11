const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { validatePagination, validateProductId, validateCategoryId } = require('../middleware/validation');

// Public routes

// Get home page data (latest, best selling, most viewed, highest discount products)
router.get('/home', generalLimiter, productController.getHomePageData);

// Get latest products
router.get('/latest', generalLimiter, validatePagination, productController.getLatestProducts);

// Get best selling products
router.get('/best-selling', generalLimiter, validatePagination, productController.getBestSellingProducts);

// Get most viewed products
router.get('/most-viewed', generalLimiter, validatePagination, productController.getMostViewedProducts);

// Get highest discount products
router.get('/highest-discount', generalLimiter, validatePagination, productController.getHighestDiscountProducts);

// Get all products with pagination and filters
router.get('/', generalLimiter, validatePagination, productController.getAllProducts);

// Search products
router.get('/search', generalLimiter, validatePagination, productController.searchProducts);

// Get all categories
router.get('/categories', generalLimiter, productController.getAllCategories);

// Get category by ID
router.get('/categories/:id', generalLimiter, validateCategoryId, productController.getCategoryById);

// Get products by category
router.get('/categories/:categoryId/products', 
    generalLimiter, 
    validateCategoryId, 
    validatePagination, 
    productController.getProductsByCategory
);

// Get product by ID (increment view count)
router.get('/:id', generalLimiter, validateProductId, productController.getProductById);

// Get related products
router.get('/:id/related', generalLimiter, validateProductId, productController.getRelatedProducts);

module.exports = router;
