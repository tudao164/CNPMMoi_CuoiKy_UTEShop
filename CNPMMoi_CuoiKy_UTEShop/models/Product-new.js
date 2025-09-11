const { executeQuery, getOne } = require('../config/database');

class Product {
    constructor(productData) {
        this.id = productData.id;
        this.name = productData.name;
        this.description = productData.description;
        this.price = parseFloat(productData.price);
        this.sale_price = productData.sale_price ? parseFloat(productData.sale_price) : null;
        this.discount_percentage = parseFloat(productData.discount_percentage || 0);
        this.stock_quantity = parseInt(productData.stock_quantity);
        this.category_id = productData.category_id;
        this.category_name = productData.category_name;
        this.image_url = productData.image_url;
        this.images = productData.images ? (typeof productData.images === 'string' ? JSON.parse(productData.images) : productData.images) : [];
        this.specifications = productData.specifications ? (typeof productData.specifications === 'string' ? JSON.parse(productData.specifications) : productData.specifications) : {};
        this.view_count = parseInt(productData.view_count || 0);
        this.sold_count = parseInt(productData.sold_count || 0);
        this.is_featured = Boolean(productData.is_featured);
        this.is_active = Boolean(productData.is_active);
        this.created_at = productData.created_at;
        this.updated_at = productData.updated_at;
    }

    // Get latest products
    static async getLatestProducts(limit = 8) {
        try {
            const limitInt = parseInt(limit);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = TRUE 
                 ORDER BY p.created_at DESC 
                 LIMIT ${limitInt}`
            );
            return products.map(product => new Product(product));
        } catch (error) {
            console.error('❌ Error getting latest products:', error);
            throw new Error('Lỗi lấy sản phẩm mới nhất');
        }
    }

    // Get best selling products
    static async getBestSellingProducts(limit = 6) {
        try {
            const limitInt = parseInt(limit);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = TRUE 
                 ORDER BY p.sold_count DESC 
                 LIMIT ${limitInt}`
            );
            return products.map(product => new Product(product));
        } catch (error) {
            console.error('❌ Error getting best selling products:', error);
            throw new Error('Lỗi lấy sản phẩm bán chạy');
        }
    }

    // Get most viewed products
    static async getMostViewedProducts(limit = 8) {
        try {
            const limitInt = parseInt(limit);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = TRUE 
                 ORDER BY p.view_count DESC 
                 LIMIT ${limitInt}`
            );
            return products.map(product => new Product(product));
        } catch (error) {
            console.error('❌ Error getting most viewed products:', error);
            throw new Error('Lỗi lấy sản phẩm được xem nhiều');
        }
    }

    // Get products with highest discount
    static async getHighestDiscountProducts(limit = 4) {
        try {
            const limitInt = parseInt(limit);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = TRUE AND p.sale_price IS NOT NULL AND p.discount_percentage > 0
                 ORDER BY p.discount_percentage DESC 
                 LIMIT ${limitInt}`
            );
            return products.map(product => new Product(product));
        } catch (error) {
            console.error('❌ Error getting highest discount products:', error);
            throw new Error('Lỗi lấy sản phẩm khuyến mãi cao nhất');
        }
    }

    // Get product by ID
    static async findById(id) {
        try {
            const productData = await getOne(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = ? AND p.is_active = TRUE`,
                [id]
            );
            return productData ? new Product(productData) : null;
        } catch (error) {
            console.error('❌ Error finding product by ID:', error);
            throw new Error('Lỗi tìm kiếm sản phẩm');
        }
    }

    // Get all products with pagination and filters
    static async getAllProducts(page = 1, limit = 12, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereConditions = ['p.is_active = TRUE'];
            let params = [];

            // Add filters
            if (filters.category_id) {
                whereConditions.push('p.category_id = ?');
                params.push(filters.category_id);
            }

            if (filters.min_price) {
                whereConditions.push('p.price >= ?');
                params.push(filters.min_price);
            }

            if (filters.max_price) {
                whereConditions.push('p.price <= ?');
                params.push(filters.max_price);
            }

            if (filters.search) {
                whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
                const searchPattern = `%${filters.search}%`;
                params.push(searchPattern, searchPattern);
            }

            if (filters.on_sale) {
                whereConditions.push('p.sale_price IS NOT NULL');
            }

            if (filters.in_stock) {
                whereConditions.push('p.stock_quantity > 0');
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`;
            const countResult = await getOne(countQuery, params);
            const total = countResult.total;

            // Build sort clause
            let sortClause = 'p.created_at DESC';
            if (filters.sort_by === 'price_asc') {
                sortClause = 'p.price ASC';
            } else if (filters.sort_by === 'price_desc') {
                sortClause = 'p.price DESC';
            } else if (filters.sort_by === 'name') {
                sortClause = 'p.name ASC';
            } else if (filters.sort_by === 'popularity') {
                sortClause = 'p.view_count DESC';
            } else if (filters.sort_by === 'best_selling') {
                sortClause = 'p.sold_count DESC';
            }

            // Get products
            const limitInt = parseInt(limit);
            const offsetInt = parseInt(offset);
            const productsQuery = `
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE ${whereClause}
                ORDER BY ${sortClause}
                LIMIT ${limitInt} OFFSET ${offsetInt}
            `;

            const products = await executeQuery(productsQuery, params);

            return {
                products: products.map(product => new Product(product)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting all products:', error);
            throw new Error('Lỗi lấy danh sách sản phẩm');
        }
    }

    // Search products
    static async searchProducts(searchTerm, page = 1, limit = 12) {
        try {
            const offset = (page - 1) * limit;
            const searchPattern = `%${searchTerm}%`;

            // Get total count
            const countResult = await getOne(
                `SELECT COUNT(*) as total 
                 FROM products p 
                 WHERE p.is_active = TRUE AND (p.name LIKE ? OR p.description LIKE ?)`,
                [searchPattern, searchPattern]
            );
            const total = countResult.total;

            // Get products
            const limitInt = parseInt(limit);
            const offsetInt = parseInt(offset);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = TRUE AND (p.name LIKE ? OR p.description LIKE ?)
                 ORDER BY p.view_count DESC, p.created_at DESC 
                 LIMIT ${limitInt} OFFSET ${offsetInt}`,
                [searchPattern, searchPattern]
            );

            return {
                products: products.map(product => new Product(product)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error searching products:', error);
            throw new Error('Lỗi tìm kiếm sản phẩm');
        }
    }

    // Get products by category
    static async getProductsByCategory(categoryId, page = 1, limit = 12) {
        try {
            const offset = (page - 1) * limit;

            // Get total count
            const countResult = await getOne(
                'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = TRUE',
                [categoryId]
            );
            const total = countResult.total;

            // Get products
            const limitInt = parseInt(limit);
            const offsetInt = parseInt(offset);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.category_id = ? AND p.is_active = TRUE
                 ORDER BY p.created_at DESC 
                 LIMIT ${limitInt} OFFSET ${offsetInt}`,
                [categoryId]
            );

            return {
                products: products.map(product => new Product(product)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting products by category:', error);
            throw new Error('Lỗi lấy sản phẩm theo danh mục');
        }
    }

    // Increment view count
    static async incrementViewCount(productId) {
        try {
            await executeQuery(
                'UPDATE products SET view_count = view_count + 1 WHERE id = ?',
                [productId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error incrementing view count:', error);
            return false;
        }
    }

    // Get related products (same category, excluding current product)
    static async getRelatedProducts(productId, categoryId, limit = 4) {
        try {
            const limitInt = parseInt(limit);
            const products = await executeQuery(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.category_id = ? AND p.id != ? AND p.is_active = TRUE
                 ORDER BY p.view_count DESC, p.created_at DESC 
                 LIMIT ${limitInt}`,
                [categoryId, productId]
            );
            return products.map(product => new Product(product));
        } catch (error) {
            console.error('❌ Error getting related products:', error);
            throw new Error('Lỗi lấy sản phẩm liên quan');
        }
    }

    // Calculate effective price (sale price if available, otherwise regular price)
    getEffectivePrice() {
        return this.sale_price || this.price;
    }

    // Calculate savings amount
    getSavingsAmount() {
        if (this.sale_price && this.sale_price < this.price) {
            return this.price - this.sale_price;
        }
        return 0;
    }

    // Check if product is on sale
    isOnSale() {
        return this.sale_price && this.sale_price < this.price;
    }

    // Check if product is in stock
    isInStock() {
        return this.stock_quantity > 0;
    }

    // Get stock status
    getStockStatus() {
        if (this.stock_quantity === 0) {
            return 'out_of_stock';
        } else if (this.stock_quantity <= 5) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            sale_price: this.sale_price,
            discount_percentage: this.discount_percentage,
            effective_price: this.getEffectivePrice(),
            savings_amount: this.getSavingsAmount(),
            stock_quantity: this.stock_quantity,
            stock_status: this.getStockStatus(),
            category_id: this.category_id,
            category_name: this.category_name,
            image_url: this.image_url,
            images: this.images,
            specifications: this.specifications,
            view_count: this.view_count,
            sold_count: this.sold_count,
            is_featured: this.is_featured,
            is_on_sale: this.isOnSale(),
            is_in_stock: this.isInStock(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Product;
