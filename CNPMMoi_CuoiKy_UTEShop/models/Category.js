const { executeQuery, getOne } = require('../config/database');

class Category {
    constructor(categoryData) {
        this.id = categoryData.id;
        this.name = categoryData.name;
        this.description = categoryData.description;
        this.image_url = categoryData.image_url;
        this.is_active = Boolean(categoryData.is_active);
        this.created_at = categoryData.created_at;
        this.updated_at = categoryData.updated_at;
        this.product_count = parseInt(categoryData.product_count || 0);
    }

    // Get all active categories
    static async getAllCategories() {
        try {
            const categories = await executeQuery(
                `SELECT c.*, COUNT(p.id) as product_count
                 FROM categories c
                 LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
                 WHERE c.is_active = TRUE
                 GROUP BY c.id
                 ORDER BY c.name ASC`
            );
            return categories.map(category => new Category(category));
        } catch (error) {
            console.error('❌ Error getting categories:', error);
            throw new Error('Lỗi lấy danh mục sản phẩm');
        }
    }

    // Get category by ID
    static async findById(id) {
        try {
            const categoryData = await getOne(
                `SELECT c.*, COUNT(p.id) as product_count
                 FROM categories c
                 LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
                 WHERE c.id = ? AND c.is_active = TRUE
                 GROUP BY c.id`,
                [id]
            );
            return categoryData ? new Category(categoryData) : null;
        } catch (error) {
            console.error('❌ Error finding category by ID:', error);
            throw new Error('Lỗi tìm kiếm danh mục');
        }
    }

    // Get categories with pagination
    static async getCategoriesWithPagination(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            // Get total count
            const countResult = await getOne('SELECT COUNT(*) as total FROM categories WHERE is_active = TRUE');
            const total = countResult.total;

            // Get categories
            const categories = await executeQuery(
                `SELECT c.*, COUNT(p.id) as product_count
                 FROM categories c
                 LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
                 WHERE c.is_active = TRUE
                 GROUP BY c.id
                 ORDER BY c.name ASC
                 LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
            );

            return {
                categories: categories.map(category => new Category(category)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting categories with pagination:', error);
            throw new Error('Lỗi lấy danh sách danh mục');
        }
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            image_url: this.image_url,
            is_active: this.is_active,
            product_count: this.product_count,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Category;
