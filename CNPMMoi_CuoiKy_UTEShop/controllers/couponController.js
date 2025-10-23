const Coupon = require('../models/Coupon');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class CouponController {
    // POST /api/coupons/validate - Validate coupon code
    async validateCoupon(req, res) {
        try {
            const { code, items } = req.body;
            const userId = req.user.id;

            if (!code) {
                return errorResponse(res, 'Vui lòng nhập mã giảm giá', 400);
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return errorResponse(res, 'Giỏ hàng trống', 400);
            }

            // Validate items structure
            for (const item of items) {
                if (!item.product_id || !item.price || !item.quantity) {
                    return errorResponse(res, 'Dữ liệu giỏ hàng không hợp lệ', 400);
                }
            }

            const validation = await Coupon.validate(code, userId, { items });

            if (!validation.valid) {
                return errorResponse(res, validation.message, 400);
            }

            return successResponse(res, {
                coupon_id: validation.coupon_id,
                coupon_code: validation.coupon_code,
                discount_amount: validation.discount_amount,
                subtotal: validation.subtotal,
                final_amount: validation.final_amount
            }, validation.message);

        } catch (error) {
            console.error('❌ Validate coupon error:', error);
            return errorResponse(res, error.message || 'Lỗi kiểm tra mã giảm giá', 500);
        }
    }

    // GET /api/coupons/available - Get available coupons for user
    async getAvailableCoupons(req, res) {
        try {
            const userId = req.user.id;
            const { order_amount = 0 } = req.query;

            const coupons = await Coupon.getAvailableForUser(userId, parseFloat(order_amount));

            return successResponse(res, {
                coupons,
                count: coupons.length
            }, 'Danh sách mã giảm giá khả dụng');

        } catch (error) {
            console.error('❌ Get available coupons error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy danh sách mã giảm giá', 500);
        }
    }

    // GET /api/coupons/:code - Get coupon details by code
    async getCouponByCode(req, res) {
        try {
            const { code } = req.params;
            const coupon = await Coupon.findByCode(code);

            if (!coupon) {
                return errorResponse(res, 'Không tìm thấy mã giảm giá', 404);
            }

            return successResponse(res, coupon, 'Chi tiết mã giảm giá');

        } catch (error) {
            console.error('❌ Get coupon by code error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy thông tin mã giảm giá', 500);
        }
    }
}

module.exports = new CouponController();
