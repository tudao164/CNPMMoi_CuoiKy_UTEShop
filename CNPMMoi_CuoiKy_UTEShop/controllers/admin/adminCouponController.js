const Coupon = require('../../models/Coupon');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class AdminCouponController {
    // POST /api/admin/coupons - Create new coupon
    async createCoupon(req, res) {
        try {
            const {
                code,
                description,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount_amount,
                usage_limit,
                per_user_limit,
                start_date,
                end_date,
                is_active,
                applies_to,
                applies_to_ids
            } = req.body;

            // Validate required fields
            if (!code || !discount_type || !discount_value || !start_date || !end_date) {
                return errorResponse(res, 'Thiếu thông tin bắt buộc', 400);
            }

            // Validate discount type
            if (!['percentage', 'fixed_amount'].includes(discount_type)) {
                return errorResponse(res, 'Loại giảm giá không hợp lệ', 400);
            }

            // Validate discount value
            if (discount_value <= 0) {
                return errorResponse(res, 'Giá trị giảm giá phải lớn hơn 0', 400);
            }

            if (discount_type === 'percentage' && discount_value > 100) {
                return errorResponse(res, 'Giảm giá theo phần trăm không được vượt quá 100%', 400);
            }

            // Validate dates
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (endDate <= startDate) {
                return errorResponse(res, 'Ngày kết thúc phải sau ngày bắt đầu', 400);
            }

            // Check if code already exists
            const existingCoupon = await Coupon.findByCode(code);
            if (existingCoupon) {
                return errorResponse(res, 'Mã giảm giá đã tồn tại', 400);
            }

            const couponId = await Coupon.create({
                code,
                description,
                discount_type,
                discount_value,
                min_order_amount: min_order_amount || 0,
                max_discount_amount,
                usage_limit,
                per_user_limit: per_user_limit || 1,
                start_date,
                end_date,
                is_active: is_active !== undefined ? is_active : true,
                applies_to: applies_to || 'all',
                applies_to_ids,
                created_by: req.user.id
            });

            const coupon = await Coupon.findById(couponId);

            return successResponse(res, coupon, 'Tạo mã giảm giá thành công', 201);

        } catch (error) {
            console.error('❌ Create coupon error:', error);
            return errorResponse(res, error.message || 'Lỗi tạo mã giảm giá', 500);
        }
    }

    // GET /api/admin/coupons - Get all coupons
    async getAllCoupons(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                is_active,
                discount_type,
                search
            } = req.query;

            const { coupons, total } = await Coupon.getAll({
                page: parseInt(page),
                limit: parseInt(limit),
                is_active: is_active !== undefined ? is_active === 'true' : null,
                discount_type,
                search
            });

            return successResponse(res, {
                coupons,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }, 'Danh sách mã giảm giá');

        } catch (error) {
            console.error('❌ Get all coupons error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy danh sách mã giảm giá', 500);
        }
    }

    // GET /api/admin/coupons/:id - Get coupon by ID
    async getCouponById(req, res) {
        try {
            const { id } = req.params;
            const coupon = await Coupon.findById(id);

            if (!coupon) {
                return errorResponse(res, 'Không tìm thấy mã giảm giá', 404);
            }

            return successResponse(res, coupon, 'Chi tiết mã giảm giá');

        } catch (error) {
            console.error('❌ Get coupon error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy thông tin mã giảm giá', 500);
        }
    }

    // PUT /api/admin/coupons/:id - Update coupon
    async updateCoupon(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const coupon = await Coupon.findById(id);
            if (!coupon) {
                return errorResponse(res, 'Không tìm thấy mã giảm giá', 404);
            }

            // Validate discount type if provided
            if (updateData.discount_type && !['percentage', 'fixed_amount'].includes(updateData.discount_type)) {
                return errorResponse(res, 'Loại giảm giá không hợp lệ', 400);
            }

            // Validate discount value if provided
            if (updateData.discount_value !== undefined) {
                if (updateData.discount_value <= 0) {
                    return errorResponse(res, 'Giá trị giảm giá phải lớn hơn 0', 400);
                }

                const type = updateData.discount_type || coupon.discount_type;
                if (type === 'percentage' && updateData.discount_value > 100) {
                    return errorResponse(res, 'Giảm giá theo phần trăm không được vượt quá 100%', 400);
                }
            }

            // Validate dates if provided
            if (updateData.start_date && updateData.end_date) {
                const startDate = new Date(updateData.start_date);
                const endDate = new Date(updateData.end_date);

                if (endDate <= startDate) {
                    return errorResponse(res, 'Ngày kết thúc phải sau ngày bắt đầu', 400);
                }
            }

            const updatedCoupon = await Coupon.update(id, updateData);

            return successResponse(res, updatedCoupon, 'Cập nhật mã giảm giá thành công');

        } catch (error) {
            console.error('❌ Update coupon error:', error);
            return errorResponse(res, error.message || 'Lỗi cập nhật mã giảm giá', 500);
        }
    }

    // DELETE /api/admin/coupons/:id - Delete coupon
    async deleteCoupon(req, res) {
        try {
            const { id } = req.params;

            const coupon = await Coupon.findById(id);
            if (!coupon) {
                return errorResponse(res, 'Không tìm thấy mã giảm giá', 404);
            }

            // Check if coupon has been used
            const { executeQuery } = require('../../config/database');
            const usageResult = await executeQuery(`
                SELECT COUNT(*) as usage_count
                FROM coupon_usage
                WHERE coupon_id = ?
            `, [id]);

            if (usageResult[0].usage_count > 0) {
                return errorResponse(res, 'Không thể xóa mã giảm giá đã được sử dụng. Vui lòng vô hiệu hóa thay vì xóa.', 400);
            }

            await Coupon.delete(id);

            return successResponse(res, null, 'Xóa mã giảm giá thành công');

        } catch (error) {
            console.error('❌ Delete coupon error:', error);
            return errorResponse(res, error.message || 'Lỗi xóa mã giảm giá', 500);
        }
    }

    // GET /api/admin/coupons/:id/stats - Get coupon usage statistics
    async getCouponStats(req, res) {
        try {
            const { id } = req.params;

            const coupon = await Coupon.findById(id);
            if (!coupon) {
                return errorResponse(res, 'Không tìm thấy mã giảm giá', 404);
            }

            const stats = await Coupon.getUsageStats(id);

            // Get recent usage
            const { executeQuery } = require('../../config/database');
            const recentUsage = await executeQuery(`
                SELECT 
                    cu.*,
                    u.full_name as user_name,
                    u.email as user_email,
                    o.total_amount as order_total
                FROM coupon_usage cu
                LEFT JOIN users u ON cu.user_id = u.id
                LEFT JOIN orders o ON cu.order_id = o.id
                WHERE cu.coupon_id = ?
                ORDER BY cu.created_at DESC
                LIMIT 10
            `, [id]);

            return successResponse(res, {
                coupon,
                statistics: stats,
                recent_usage: recentUsage
            }, 'Thống kê mã giảm giá');

        } catch (error) {
            console.error('❌ Get coupon stats error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy thống kê mã giảm giá', 500);
        }
    }

    // GET /api/admin/coupons/statistics/overview - Get overall coupon statistics
    async getOverviewStats(req, res) {
        try {
            const { executeQuery } = require('../../config/database');

            const stats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_coupons,
                    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_coupons,
                    COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_coupons,
                    COUNT(CASE WHEN discount_type = 'percentage' THEN 1 END) as percentage_coupons,
                    COUNT(CASE WHEN discount_type = 'fixed_amount' THEN 1 END) as fixed_coupons,
                    COALESCE(SUM(usage_count), 0) as total_usage,
                    COUNT(CASE WHEN end_date < NOW() THEN 1 END) as expired_coupons
                FROM coupons
            `);

            const usageStats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_redemptions,
                    COALESCE(SUM(discount_amount), 0) as total_discount_given,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT coupon_id) as used_coupons
                FROM coupon_usage
            `);

            const topCoupons = await executeQuery(`
                SELECT 
                    c.code,
                    c.description,
                    c.discount_type,
                    c.discount_value,
                    c.usage_count,
                    COALESCE(SUM(cu.discount_amount), 0) as total_discount_given
                FROM coupons c
                LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
                GROUP BY c.id
                ORDER BY c.usage_count DESC
                LIMIT 10
            `);

            return successResponse(res, {
                overview: stats[0],
                usage: usageStats[0],
                top_coupons: topCoupons
            }, 'Thống kê tổng quan mã giảm giá');

        } catch (error) {
            console.error('❌ Get overview stats error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy thống kê tổng quan', 500);
        }
    }
}

module.exports = new AdminCouponController();
