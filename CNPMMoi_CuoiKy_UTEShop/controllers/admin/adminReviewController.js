const ProductReview = require('../../models/ProductReview');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class AdminReviewController {
    // GET /api/admin/reviews - Get all reviews with filters
    async getAllReviews(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                status, 
                rating, 
                product_id, 
                user_id 
            } = req.query;

            const { reviews, total } = await ProductReview.getAllForAdmin({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                rating: rating ? parseInt(rating) : null,
                product_id: product_id ? parseInt(product_id) : null,
                user_id: user_id ? parseInt(user_id) : null
            });

            return successResponse(res, {
                reviews,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }, 'Danh sách đánh giá được tải thành công');

        } catch (error) {
            console.error('❌ Admin get all reviews error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy danh sách đánh giá', 500);
        }
    }

    // GET /api/admin/reviews/:id - Get review details
    async getReviewById(req, res) {
        try {
            const { id } = req.params;
            const review = await ProductReview.findById(id);

            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            return successResponse(res, review, 'Chi tiết đánh giá được tải thành công');

        } catch (error) {
            console.error('❌ Admin get review error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy chi tiết đánh giá', 500);
        }
    }

    // PUT /api/admin/reviews/:id/approve - Approve review
    async approveReview(req, res) {
        try {
            const { id } = req.params;

            const review = await ProductReview.findById(id);
            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            if (review.is_approved) {
                return errorResponse(res, 'Đánh giá đã được duyệt trước đó', 400);
            }

            const updatedReview = await ProductReview.approve(id);

            return successResponse(res, updatedReview, 'Đã duyệt đánh giá thành công');

        } catch (error) {
            console.error('❌ Admin approve review error:', error);
            return errorResponse(res, error.message || 'Lỗi duyệt đánh giá', 500);
        }
    }

    // PUT /api/admin/reviews/:id/reject - Reject review
    async rejectReview(req, res) {
        try {
            const { id } = req.params;

            const review = await ProductReview.findById(id);
            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            const updatedReview = await ProductReview.reject(id);

            return successResponse(res, updatedReview, 'Đã từ chối đánh giá');

        } catch (error) {
            console.error('❌ Admin reject review error:', error);
            return errorResponse(res, error.message || 'Lỗi từ chối đánh giá', 500);
        }
    }

    // DELETE /api/admin/reviews/:id - Delete review
    async deleteReview(req, res) {
        try {
            const { id } = req.params;

            const review = await ProductReview.findById(id);
            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            await ProductReview.adminDelete(id);

            return successResponse(res, null, 'Đã xóa đánh giá thành công');

        } catch (error) {
            console.error('❌ Admin delete review error:', error);
            return errorResponse(res, error.message || 'Lỗi xóa đánh giá', 500);
        }
    }

    // GET /api/admin/reviews/stats - Get review statistics
    async getReviewStats(req, res) {
        try {
            const { executeQuery } = require('../../config/database');

            const stats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_reviews,
                    COUNT(CASE WHEN is_approved = TRUE THEN 1 END) as approved_reviews,
                    COUNT(CASE WHEN is_approved = FALSE THEN 1 END) as pending_reviews,
                    AVG(rating) as average_rating,
                    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
                    COUNT(CASE WHEN is_verified_purchase = TRUE THEN 1 END) as verified_purchases
                FROM product_reviews
            `);

            const recentReviews = await executeQuery(`
                SELECT 
                    r.id,
                    r.rating,
                    r.title,
                    r.created_at,
                    r.is_approved,
                    u.full_name as user_name,
                    p.name as product_name
                FROM product_reviews r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                ORDER BY r.created_at DESC
                LIMIT 10
            `);

            return successResponse(res, {
                statistics: stats[0],
                recent_reviews: recentReviews
            }, 'Thống kê đánh giá được tải thành công');

        } catch (error) {
            console.error('❌ Get review stats error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy thống kê đánh giá', 500);
        }
    }
}

module.exports = new AdminReviewController();
