const ProductReview = require('../models/ProductReview');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class ReviewController {
    // POST /api/reviews - Create new review
    async createReview(req, res) {
        try {
            const { product_id, order_id, rating, title, comment, images } = req.body;
            const user_id = req.user.id;

            // Validate required fields
            if (!product_id || !order_id || !rating) {
                return errorResponse(res, 'Thiếu thông tin bắt buộc: product_id, order_id, rating', 400);
            }

            // Validate rating range
            if (rating < 1 || rating > 5) {
                return errorResponse(res, 'Đánh giá phải từ 1 đến 5 sao', 400);
            }

            // Check if user can review
            const canReview = await ProductReview.canUserReview(user_id, product_id, order_id);
            if (!canReview.can_review) {
                return errorResponse(res, canReview.reason, 400);
            }

            // Create review
            const reviewId = await ProductReview.create({
                product_id,
                user_id,
                order_id,
                rating,
                title: title || '',
                comment: comment || '',
                images: images || []
            });

            const review = await ProductReview.findById(reviewId);

            return successResponse(res, review, 'Đánh giá đã được gửi thành công', 201);

        } catch (error) {
            console.error('❌ Create review error:', error);
            return errorResponse(res, error.message || 'Lỗi tạo đánh giá', 500);
        }
    }

    // GET /api/reviews/product/:productId - Get reviews for product
    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 10, rating = null, sort = 'recent' } = req.query;

            const { reviews, total } = await ProductReview.getByProduct(productId, {
                page: parseInt(page),
                limit: parseInt(limit),
                rating: rating ? parseInt(rating) : null,
                sort
            });

            // Get statistics
            const stats = await ProductReview.getProductStats(productId);

            return successResponse(res, {
                reviews,
                stats,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }, 'Đánh giá được tải thành công');

        } catch (error) {
            console.error('❌ Get product reviews error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy đánh giá', 500);
        }
    }

    // GET /api/reviews/my-reviews - Get current user's reviews
    async getMyReviews(req, res) {
        try {
            const user_id = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            const { reviews, total } = await ProductReview.getByUser(user_id, parseInt(page), parseInt(limit));

            return successResponse(res, {
                reviews,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }, 'Đánh giá của bạn được tải thành công');

        } catch (error) {
            console.error('❌ Get my reviews error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy đánh giá', 500);
        }
    }

    // GET /api/reviews/:id - Get review by ID
    async getReviewById(req, res) {
        try {
            const { id } = req.params;
            const review = await ProductReview.findById(id);

            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            return successResponse(res, review, 'Đánh giá được tải thành công');

        } catch (error) {
            console.error('❌ Get review error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy đánh giá', 500);
        }
    }

    // PUT /api/reviews/:id - Update review
    async updateReview(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const { rating, title, comment, images } = req.body;

            // Validate rating
            if (rating && (rating < 1 || rating > 5)) {
                return errorResponse(res, 'Đánh giá phải từ 1 đến 5 sao', 400);
            }

            // Check ownership
            const existingReview = await ProductReview.findById(id);
            if (!existingReview) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            if (existingReview.user_id !== user_id) {
                return errorResponse(res, 'Bạn không có quyền chỉnh sửa đánh giá này', 403);
            }

            // Update
            const updatedReview = await ProductReview.update(id, user_id, {
                rating: rating || existingReview.rating,
                title: title !== undefined ? title : existingReview.title,
                comment: comment !== undefined ? comment : existingReview.comment,
                images: images !== undefined ? images : JSON.parse(existingReview.images || '[]')
            });

            return successResponse(res, updatedReview, 'Đánh giá đã được cập nhật');

        } catch (error) {
            console.error('❌ Update review error:', error);
            return errorResponse(res, error.message || 'Lỗi cập nhật đánh giá', 500);
        }
    }

    // DELETE /api/reviews/:id - Delete review
    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            // Check ownership
            const review = await ProductReview.findById(id);
            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            if (review.user_id !== user_id) {
                return errorResponse(res, 'Bạn không có quyền xóa đánh giá này', 403);
            }

            await ProductReview.delete(id, user_id);

            return successResponse(res, null, 'Đánh giá đã được xóa');

        } catch (error) {
            console.error('❌ Delete review error:', error);
            return errorResponse(res, error.message || 'Lỗi xóa đánh giá', 500);
        }
    }

    // POST /api/reviews/:id/helpful - Mark review as helpful
    async markHelpful(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            const review = await ProductReview.findById(id);
            if (!review) {
                return errorResponse(res, 'Không tìm thấy đánh giá', 404);
            }

            const result = await ProductReview.markHelpful(id, user_id);

            return successResponse(res, result, 
                result.action === 'added' 
                    ? 'Đã đánh dấu hữu ích' 
                    : 'Đã bỏ đánh dấu hữu ích'
            );

        } catch (error) {
            console.error('❌ Mark helpful error:', error);
            return errorResponse(res, error.message || 'Lỗi đánh dấu hữu ích', 500);
        }
    }

    // GET /api/reviews/can-review/:productId/:orderId - Check if user can review
    async checkCanReview(req, res) {
        try {
            const { productId, orderId } = req.params;
            const user_id = req.user.id;

            const result = await ProductReview.canUserReview(user_id, productId, orderId);

            return successResponse(res, result, 'Kiểm tra quyền đánh giá thành công');

        } catch (error) {
            console.error('❌ Check can review error:', error);
            return errorResponse(res, error.message || 'Lỗi kiểm tra quyền đánh giá', 500);
        }
    }
}

module.exports = new ReviewController();
