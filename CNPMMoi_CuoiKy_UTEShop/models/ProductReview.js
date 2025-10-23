const { executeQuery } = require('../config/database');

class ProductReview {
    // Create new review
    static async create(reviewData) {
        const { product_id, user_id, order_id, rating, title, comment, images } = reviewData;
        
        // Check if user has purchased this product
        const purchaseCheck = await executeQuery(`
            SELECT oi.id 
            FROM order_items oi
            INNER JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = ? 
            AND oi.product_id = ? 
            AND o.id = ?
            AND o.status = 'delivered'
        `, [user_id, product_id, order_id]);

        const is_verified_purchase = purchaseCheck.length > 0;

        const result = await executeQuery(`
            INSERT INTO product_reviews 
            (product_id, user_id, order_id, rating, title, comment, images, is_verified_purchase)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [product_id, user_id, order_id, rating, title, comment, JSON.stringify(images || []), is_verified_purchase]);

        return result.insertId;
    }

    // Get review by ID
    static async findById(id) {
        const result = await executeQuery(`
            SELECT 
                r.*,
                u.full_name as user_name,
                u.avatar_url as user_avatar,
                p.name as product_name,
                p.image_url as product_image
            FROM product_reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.id = ?
        `, [id]);

        if (result.length === 0) return null;

        const review = result[0];
        if (review.images) {
            review.images = JSON.parse(review.images);
        }
        return review;
    }

    // Get reviews by product ID
    static async getByProduct(productId, options = {}) {
        const { 
            page = 1, 
            limit = 10, 
            rating = null,
            sort = 'recent' // recent, helpful, rating_high, rating_low
        } = options;

        const offset = (page - 1) * limit;
        let whereConditions = ['r.product_id = ?', 'r.is_approved = TRUE'];
        const params = [productId];

        if (rating) {
            whereConditions.push('r.rating = ?');
            params.push(rating);
        }

        let orderBy = 'r.created_at DESC';
        switch (sort) {
            case 'helpful':
                orderBy = 'r.helpful_count DESC, r.created_at DESC';
                break;
            case 'rating_high':
                orderBy = 'r.rating DESC, r.created_at DESC';
                break;
            case 'rating_low':
                orderBy = 'r.rating ASC, r.created_at DESC';
                break;
            default:
                orderBy = 'r.created_at DESC';
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const countResult = await executeQuery(`
            SELECT COUNT(*) as total
            FROM product_reviews r
            WHERE ${whereClause}
        `, params);

        const total = countResult[0].total;

        // Get reviews
        const reviews = await executeQuery(`
            SELECT 
                r.*,
                u.full_name as user_name,
                u.avatar_url as user_avatar
            FROM product_reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ${limit} OFFSET ${offset}
        `, params);

        // Parse JSON images
        reviews.forEach(review => {
            if (review.images) {
                review.images = JSON.parse(review.images);
            }
        });

        return { reviews, total };
    }

    // Get reviews by user ID
    static async getByUser(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const countResult = await executeQuery(`
            SELECT COUNT(*) as total
            FROM product_reviews
            WHERE user_id = ?
        `, [userId]);

        const total = countResult[0].total;

        const reviews = await executeQuery(`
            SELECT 
                r.*,
                p.name as product_name,
                p.image_url as product_image
            FROM product_reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `, [userId]);

        reviews.forEach(review => {
            if (review.images) {
                review.images = JSON.parse(review.images);
            }
        });

        return { reviews, total };
    }

    // Update review
    static async update(id, userId, updateData) {
        const { rating, title, comment, images } = updateData;
        
        await executeQuery(`
            UPDATE product_reviews
            SET rating = ?, title = ?, comment = ?, images = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        `, [rating, title, comment, JSON.stringify(images || []), id, userId]);

        return this.findById(id);
    }

    // Delete review
    static async delete(id, userId) {
        const result = await executeQuery(`
            DELETE FROM product_reviews
            WHERE id = ? AND user_id = ?
        `, [id, userId]);

        return result.affectedRows > 0;
    }

    // Admin: Delete any review
    static async adminDelete(id) {
        const result = await executeQuery(`
            DELETE FROM product_reviews
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }

    // Approve review (admin)
    static async approve(id) {
        await executeQuery(`
            UPDATE product_reviews
            SET is_approved = TRUE, updated_at = NOW()
            WHERE id = ?
        `, [id]);

        return this.findById(id);
    }

    // Reject review (admin)
    static async reject(id) {
        await executeQuery(`
            UPDATE product_reviews
            SET is_approved = FALSE, updated_at = NOW()
            WHERE id = ?
        `, [id]);

        return this.findById(id);
    }

    // Mark review as helpful
    static async markHelpful(reviewId, userId) {
        // Check if already marked
        const existing = await executeQuery(`
            SELECT id FROM review_helpful
            WHERE review_id = ? AND user_id = ?
        `, [reviewId, userId]);

        if (existing.length > 0) {
            // Remove helpful mark
            await executeQuery(`
                DELETE FROM review_helpful
                WHERE review_id = ? AND user_id = ?
            `, [reviewId, userId]);

            await executeQuery(`
                UPDATE product_reviews
                SET helpful_count = helpful_count - 1
                WHERE id = ?
            `, [reviewId]);

            return { action: 'removed' };
        } else {
            // Add helpful mark
            await executeQuery(`
                INSERT INTO review_helpful (review_id, user_id)
                VALUES (?, ?)
            `, [reviewId, userId]);

            await executeQuery(`
                UPDATE product_reviews
                SET helpful_count = helpful_count + 1
                WHERE id = ?
            `, [reviewId]);

            return { action: 'added' };
        }
    }

    // Get review statistics for product
    static async getProductStats(productId) {
        const stats = await executeQuery(`
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star,
                SUM(CASE WHEN is_verified_purchase = TRUE THEN 1 ELSE 0 END) as verified_purchases
            FROM product_reviews
            WHERE product_id = ? AND is_approved = TRUE
        `, [productId]);

        return stats[0];
    }

    // Admin: Get all reviews with filters
    static async getAllForAdmin(options = {}) {
        const {
            page = 1,
            limit = 20,
            status = null, // approved, pending
            rating = null,
            product_id = null,
            user_id = null
        } = options;

        const offset = (page - 1) * limit;
        let whereConditions = ['1=1'];
        const params = [];

        if (status === 'approved') {
            whereConditions.push('r.is_approved = TRUE');
        } else if (status === 'pending') {
            whereConditions.push('r.is_approved = FALSE');
        }

        if (rating) {
            whereConditions.push('r.rating = ?');
            params.push(rating);
        }

        if (product_id) {
            whereConditions.push('r.product_id = ?');
            params.push(product_id);
        }

        if (user_id) {
            whereConditions.push('r.user_id = ?');
            params.push(user_id);
        }

        const whereClause = whereConditions.join(' AND ');

        const countResult = await executeQuery(`
            SELECT COUNT(*) as total
            FROM product_reviews r
            WHERE ${whereClause}
        `, params);

        const total = countResult[0].total;

        const reviews = await executeQuery(`
            SELECT 
                r.*,
                u.full_name as user_name,
                u.email as user_email,
                p.name as product_name,
                p.image_url as product_image
            FROM product_reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            WHERE ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params);

        reviews.forEach(review => {
            if (review.images) {
                review.images = JSON.parse(review.images);
            }
        });

        return { reviews, total };
    }

    // Check if user can review product
    static async canUserReview(userId, productId, orderId) {
        // Check if order exists and is delivered
        const orderCheck = await executeQuery(`
            SELECT o.id
            FROM orders o
            INNER JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
            AND oi.product_id = ?
            AND o.id = ?
            AND o.status = 'delivered'
        `, [userId, productId, orderId]);

        if (orderCheck.length === 0) {
            return { can_review: false, reason: 'Bạn chưa mua hoặc đơn hàng chưa được giao' };
        }

        // Check if already reviewed
        const existingReview = await executeQuery(`
            SELECT id FROM product_reviews
            WHERE user_id = ? AND product_id = ? AND order_id = ?
        `, [userId, productId, orderId]);

        if (existingReview.length > 0) {
            return { can_review: false, reason: 'Bạn đã đánh giá sản phẩm này rồi' };
        }

        return { can_review: true };
    }
}

module.exports = ProductReview;
