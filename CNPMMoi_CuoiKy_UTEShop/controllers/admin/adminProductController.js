const Product = require('../../models/Product');
const Category = require('../../models/Category');
const { executeQuery, insert } = require('../../config/database');
const {
    successResponse,
    errorResponse,
    notFoundResponse,
    createdResponse,
    paginationResponse
} = require('../../utils/responseHelper');
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../../utils/constants');

class AdminProductController {
    // GET /api/admin/products - Get all products with admin view (includes inactive)
    async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const filters = {
                category_id: req.query.category_id,
                search: req.query.search,
                is_active: req.query.is_active,
                stock_status: req.query.stock_status
            };

            let whereConditions = [];
            let params = [];

            if (filters.category_id) {
                whereConditions.push('p.category_id = ?');
                params.push(filters.category_id);
            }

            if (filters.search) {
                whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
                const searchPattern = `%${filters.search}%`;
                params.push(searchPattern, searchPattern);
            }

            if (filters.is_active !== undefined) {
                whereConditions.push('p.is_active = ?');
                params.push(filters.is_active === 'true' ? 1 : 0);
            }

            if (filters.stock_status === 'out_of_stock') {
                whereConditions.push('p.stock_quantity = 0');
            } else if (filters.stock_status === 'low_stock') {
                whereConditions.push('p.stock_quantity > 0 AND p.stock_quantity <= 5');
            } else if (filters.stock_status === 'in_stock') {
                whereConditions.push('p.stock_quantity > 5');
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
            const countResult = await executeQuery(countQuery, params);
            const total = countResult[0].total;

            // Get products - Use string interpolation for LIMIT/OFFSET to avoid prepared statement issues
            const productsQuery = `
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ${whereClause}
                ORDER BY p.created_at DESC 
                LIMIT ${limit} OFFSET ${offset}
            `;

            const products = await executeQuery(productsQuery, params);

            return paginationResponse(
                res,
                products.map(product => new Product(product).toJSON()),
                {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                'Danh sách sản phẩm được tải thành công'
            );

        } catch (error) {
            console.error('❌ Admin get all products error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // POST /api/admin/products - Create new product
    async createProduct(req, res) {
        try {
            const {
                name,
                description,
                price,
                sale_price,
                stock_quantity,
                category_id,
                image_url,
                images,
                specifications,
                is_featured
            } = req.body;

            // Validate required fields
            if (!name || !price || !stock_quantity || !category_id) {
                return errorResponse(res, 'Tên, giá, số lượng và danh mục là bắt buộc', 400);
            }

            // Check if category exists
            const category = await Category.findById(category_id);
            if (!category) {
                return errorResponse(res, 'Danh mục không tồn tại', 400);
            }

            // Calculate discount percentage
            let discount_percentage = 0;
            if (sale_price && sale_price < price) {
                discount_percentage = ((price - sale_price) / price * 100).toFixed(2);
            }

            // Insert product
            const productId = await insert(
                `INSERT INTO products 
                (name, description, price, sale_price, discount_percentage, stock_quantity, 
                category_id, image_url, images, specifications, is_featured, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
                [
                    name,
                    description || '',
                    price,
                    sale_price || null,
                    discount_percentage,
                    stock_quantity,
                    category_id,
                    image_url || '/images/default-product.jpg',
                    JSON.stringify(images || []),
                    JSON.stringify(specifications || {}),
                    is_featured || false
                ]
            );

            const product = await Product.findById(productId);

            return createdResponse(res, {
                product: product.toJSON()
            }, 'Sản phẩm đã được tạo thành công');

        } catch (error) {
            console.error('❌ Admin create product error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PUT /api/admin/products/:id - Update product
    async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            const {
                name,
                description,
                price,
                sale_price,
                stock_quantity,
                category_id,
                image_url,
                images,
                specifications,
                is_featured,
                is_active
            } = req.body;

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return notFoundResponse(res, 'Sản phẩm không tồn tại');
            }

            // Check if category exists if changed
            if (category_id) {
                const category = await Category.findById(category_id);
                if (!category) {
                    return errorResponse(res, 'Danh mục không tồn tại', 400);
                }
            }

            // Calculate discount percentage
            let discount_percentage = product.discount_percentage;
            const finalPrice = price !== undefined ? price : product.price;
            const finalSalePrice = sale_price !== undefined ? sale_price : product.sale_price;

            if (finalSalePrice && finalSalePrice < finalPrice) {
                discount_percentage = ((finalPrice - finalSalePrice) / finalPrice * 100).toFixed(2);
            } else {
                discount_percentage = 0;
            }

            // Build update query dynamically
            const updates = [];
            const params = [];

            if (name !== undefined) {
                updates.push('name = ?');
                params.push(name);
            }
            if (description !== undefined) {
                updates.push('description = ?');
                params.push(description);
            }
            if (price !== undefined) {
                updates.push('price = ?');
                params.push(price);
            }
            if (sale_price !== undefined) {
                updates.push('sale_price = ?');
                params.push(sale_price);
            }
            updates.push('discount_percentage = ?');
            params.push(discount_percentage);

            if (stock_quantity !== undefined) {
                updates.push('stock_quantity = ?');
                params.push(stock_quantity);
            }
            if (category_id !== undefined) {
                updates.push('category_id = ?');
                params.push(category_id);
            }
            if (image_url !== undefined) {
                updates.push('image_url = ?');
                params.push(image_url);
            }
            if (images !== undefined) {
                updates.push('images = ?');
                params.push(JSON.stringify(images));
            }
            if (specifications !== undefined) {
                updates.push('specifications = ?');
                params.push(JSON.stringify(specifications));
            }
            if (is_featured !== undefined) {
                updates.push('is_featured = ?');
                params.push(is_featured);
            }
            if (is_active !== undefined) {
                updates.push('is_active = ?');
                params.push(is_active);
            }

            if (updates.length === 0) {
                return errorResponse(res, 'Không có thông tin nào để cập nhật', 400);
            }

            params.push(productId);

            await executeQuery(
                `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                params
            );

            const updatedProduct = await Product.findById(productId);

            return successResponse(res, {
                product: updatedProduct.toJSON()
            }, 'Sản phẩm đã được cập nhật thành công');

        } catch (error) {
            console.error('❌ Admin update product error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // DELETE /api/admin/products/:id - Delete product (soft delete)
    async deleteProduct(req, res) {
        try {
            const productId = req.params.id;

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return notFoundResponse(res, 'Sản phẩm không tồn tại');
            }

            // Soft delete by setting is_active to FALSE
            await executeQuery(
                'UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [productId]
            );

            return successResponse(res, null, 'Sản phẩm đã được xóa thành công');

        } catch (error) {
            console.error('❌ Admin delete product error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PATCH /api/admin/products/:id/activate - Activate product
    async activateProduct(req, res) {
        try {
            const productId = req.params.id;

            await executeQuery(
                'UPDATE products SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [productId]
            );

            const product = await Product.findById(productId);
            if (!product) {
                return notFoundResponse(res, 'Sản phẩm không tồn tại');
            }

            return successResponse(res, {
                product: product.toJSON()
            }, 'Sản phẩm đã được kích hoạt');

        } catch (error) {
            console.error('❌ Admin activate product error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // GET /api/admin/products/stats - Get product statistics
    async getProductStats(req, res) {
        try {
            const stats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_products,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_products,
                    SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_products,
                    SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
                    SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 ELSE 0 END) as low_stock,
                    SUM(CASE WHEN stock_quantity > 5 THEN 1 ELSE 0 END) as in_stock,
                    SUM(CASE WHEN sale_price IS NOT NULL AND sale_price < price THEN 1 ELSE 0 END) as on_sale,
                    SUM(sold_count) as total_sold,
                    SUM(view_count) as total_views
                FROM products
            `);

            return successResponse(res, {
                stats: stats[0]
            }, 'Thống kê sản phẩm được tải thành công');

        } catch (error) {
            console.error('❌ Admin get product stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PATCH /api/admin/products/:id/stock - Update stock quantity
    async updateStock(req, res) {
        try {
            const productId = req.params.id;
            const { stock_quantity } = req.body;

            if (stock_quantity === undefined || stock_quantity < 0) {
                return errorResponse(res, 'Số lượng tồn kho không hợp lệ', 400);
            }

            const product = await Product.findById(productId);
            if (!product) {
                return notFoundResponse(res, 'Sản phẩm không tồn tại');
            }

            await executeQuery(
                'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [stock_quantity, productId]
            );

            const updatedProduct = await Product.findById(productId);

            return successResponse(res, {
                product: updatedProduct.toJSON()
            }, 'Số lượng tồn kho đã được cập nhật');

        } catch (error) {
            console.error('❌ Admin update stock error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new AdminProductController();
