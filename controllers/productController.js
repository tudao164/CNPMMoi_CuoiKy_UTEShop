const Product = require('../models/Product');
const Category = require('../models/Category');
const {
    successResponse,
    errorResponse,
    notFoundResponse,
    paginationResponse
} = require('../utils/responseHelper');
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../utils/constants');

class ProductController {
    // Get home page data (latest, best selling, most viewed, highest discount products)
    async getHomePageData(req, res) {
        try {
            const [
                latestProducts,
                bestSellingProducts,
                mostViewedProducts,
                highestDiscountProducts,
                categories
            ] = await Promise.all([
                Product.getLatestProducts(8),
                Product.getBestSellingProducts(6),
                Product.getMostViewedProducts(8),
                Product.getHighestDiscountProducts(4),
                Category.getAllCategories()
            ]);

            return successResponse(res, {
                latest_products: latestProducts.map(product => product.toJSON()),
                best_selling_products: bestSellingProducts.map(product => product.toJSON()),
                most_viewed_products: mostViewedProducts.map(product => product.toJSON()),
                highest_discount_products: highestDiscountProducts.map(product => product.toJSON()),
                categories: categories.map(category => category.toJSON())
            }, 'Dữ liệu trang chủ được tải thành công');

        } catch (error) {
            console.error('❌ Get home page data error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get latest products
    async getLatestProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const products = await Product.getLatestProducts(limit);

            return successResponse(res, {
                products: products.map(product => product.toJSON()),
                total: products.length
            }, 'Sản phẩm mới nhất được tải thành công');

        } catch (error) {
            console.error('❌ Get latest products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get best selling products
    async getBestSellingProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const products = await Product.getBestSellingProducts(limit);

            return successResponse(res, {
                products: products.map(product => product.toJSON()),
                total: products.length
            }, 'Sản phẩm bán chạy được tải thành công');

        } catch (error) {
            console.error('❌ Get best selling products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get most viewed products
    async getMostViewedProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const products = await Product.getMostViewedProducts(limit);

            return successResponse(res, {
                products: products.map(product => product.toJSON()),
                total: products.length
            }, 'Sản phẩm được xem nhiều nhất được tải thành công');

        } catch (error) {
            console.error('❌ Get most viewed products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get highest discount products
    async getHighestDiscountProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 4;
            const products = await Product.getHighestDiscountProducts(limit);

            return successResponse(res, {
                products: products.map(product => product.toJSON()),
                total: products.length
            }, 'Sản phẩm khuyến mãi cao nhất được tải thành công');

        } catch (error) {
            console.error('❌ Get highest discount products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get all products with pagination and filters
    async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            const filters = {
                category_id: req.query.category_id,
                min_price: req.query.min_price,
                max_price: req.query.max_price,
                search: req.query.search,
                sort_by: req.query.sort_by,
                on_sale: req.query.on_sale === 'true',
                in_stock: req.query.in_stock === 'true'
            };

            const result = await Product.getAllProducts(page, limit, filters);

            return paginationResponse(
                res,
                result.products.map(product => product.toJSON()),
                result.pagination,
                'Danh sách sản phẩm được tải thành công'
            );

        } catch (error) {
            console.error('❌ Get all products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get product by ID
    async getProductById(req, res) {
        try {
            const productId = req.params.id;

            const product = await Product.findById(productId);
            if (!product) {
                return notFoundResponse(res, 'Sản phẩm không tồn tại');
            }

            // Increment view count
            await Product.incrementViewCount(productId);

            // Get related products
            const relatedProducts = await Product.getRelatedProducts(
                productId,
                product.category_id,
                4
            );

            // Get category info
            const category = await Category.findById(product.category_id);

            return successResponse(res, {
                product: product.toJSON(),
                related_products: relatedProducts.map(p => p.toJSON()),
                category: category ? category.toJSON() : null
            }, 'Chi tiết sản phẩm được tải thành công');

        } catch (error) {
            console.error('❌ Get product by ID error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Search products
    async searchProducts(req, res) {
        try {
            const searchTerm = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            if (!searchTerm.trim()) {
                return errorResponse(res, 'Từ khóa tìm kiếm không được để trống', 400);
            }

            const result = await Product.searchProducts(searchTerm, page, limit);

            return paginationResponse(
                res,
                result.products.map(product => product.toJSON()),
                result.pagination,
                `Tìm thấy ${result.pagination.total} sản phẩm`
            );

        } catch (error) {
            console.error('❌ Search products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get products by category
    async getProductsByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            // Check if category exists
            const category = await Category.findById(categoryId);
            if (!category) {
                return notFoundResponse(res, 'Danh mục không tồn tại');
            }

            const result = await Product.getProductsByCategory(categoryId, page, limit);

            return paginationResponse(
                res,
                result.products.map(product => product.toJSON()),
                result.pagination,
                `Sản phẩm trong danh mục ${category.name}`
            );

        } catch (error) {
            console.error('❌ Get products by category error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get all categories
    async getAllCategories(req, res) {
        try {
            const categories = await Category.getAllCategories();

            return successResponse(res, {
                categories: categories.map(category => category.toJSON()),
                total: categories.length
            }, 'Danh sách danh mục được tải thành công');

        } catch (error) {
            console.error('❌ Get all categories error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get category by ID
    async getCategoryById(req, res) {
        try {
            const categoryId = req.params.id;

            const category = await Category.findById(categoryId);
            if (!category) {
                return notFoundResponse(res, 'Danh mục không tồn tại');
            }

            return successResponse(res, {
                category: category.toJSON()
            }, 'Chi tiết danh mục được tải thành công');

        } catch (error) {
            console.error('❌ Get category by ID error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get related products
    async getRelatedProducts(req, res) {
        try {
            const productId = req.params.id;
            const limit = parseInt(req.query.limit) || 4;

            // Get product to find its category
            const product = await Product.findById(productId);
            if (!product) {
                return notFoundResponse(res, 'Sản phẩm không tồn tại');
            }

            const relatedProducts = await Product.getRelatedProducts(
                productId,
                product.category_id,
                limit
            );

            return successResponse(res, {
                products: relatedProducts.map(product => product.toJSON()),
                total: relatedProducts.length
            }, 'Sản phẩm liên quan được tải thành công');

        } catch (error) {
            console.error('❌ Get related products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new ProductController();
