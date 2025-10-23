const { executeQuery } = require('../config/database');

class Coupon {
    // Create new coupon
    static async create(couponData) {
        const {
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount = 0,
            max_discount_amount = null,
            usage_limit = null,
            per_user_limit = 1,
            start_date,
            end_date,
            is_active = true,
            applies_to = 'all',
            applies_to_ids = null,
            created_by
        } = couponData;

        const result = await executeQuery(`
            INSERT INTO coupons 
            (code, description, discount_type, discount_value, min_order_amount, 
             max_discount_amount, usage_limit, per_user_limit, start_date, end_date, 
             is_active, applies_to, applies_to_ids, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            code.toUpperCase(), 
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
            applies_to_ids ? JSON.stringify(applies_to_ids) : null, 
            created_by
        ]);

        return result.insertId;
    }

    // Find coupon by ID
    static async findById(id) {
        const result = await executeQuery(`
            SELECT 
                c.*,
                u.full_name as created_by_name
            FROM coupons c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `, [id]);

        if (result.length === 0) return null;

        const coupon = result[0];
        if (coupon.applies_to_ids) {
            coupon.applies_to_ids = JSON.parse(coupon.applies_to_ids);
        }
        return coupon;
    }

    // Find coupon by code
    static async findByCode(code) {
        const result = await executeQuery(`
            SELECT * FROM coupons
            WHERE code = ? AND is_active = TRUE
        `, [code.toUpperCase()]);

        if (result.length === 0) return null;

        const coupon = result[0];
        if (coupon.applies_to_ids) {
            coupon.applies_to_ids = JSON.parse(coupon.applies_to_ids);
        }
        return coupon;
    }

    // Validate and calculate discount
    static async validate(code, userId, cartData) {
        const coupon = await this.findByCode(code);

        if (!coupon) {
            return { valid: false, message: 'Mã giảm giá không tồn tại' };
        }

        // Check active status
        if (!coupon.is_active) {
            return { valid: false, message: 'Mã giảm giá không còn hiệu lực' };
        }

        // Check date range
        const now = new Date();
        const startDate = new Date(coupon.start_date);
        const endDate = new Date(coupon.end_date);

        if (now < startDate) {
            return { valid: false, message: 'Mã giảm giá chưa có hiệu lực' };
        }

        if (now > endDate) {
            return { valid: false, message: 'Mã giảm giá đã hết hạn' };
        }

        // Check usage limit
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
            return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
        }

        // Check per-user limit
        const userUsageResult = await executeQuery(`
            SELECT COUNT(*) as usage_count
            FROM coupon_usage
            WHERE coupon_id = ? AND user_id = ?
        `, [coupon.id, userId]);

        const userUsageCount = userUsageResult[0].usage_count;
        if (userUsageCount >= coupon.per_user_limit) {
            return { valid: false, message: 'Bạn đã sử dụng hết lượt của mã giảm giá này' };
        }

        // Calculate order subtotal
        let subtotal = 0;
        const validItems = [];

        for (const item of cartData.items) {
            let itemIncluded = false;

            if (coupon.applies_to === 'all') {
                itemIncluded = true;
            } else if (coupon.applies_to === 'product' && coupon.applies_to_ids) {
                itemIncluded = coupon.applies_to_ids.includes(item.product_id);
            } else if (coupon.applies_to === 'category' && coupon.applies_to_ids) {
                // Get product category
                const productResult = await executeQuery(
                    'SELECT category_id FROM products WHERE id = ?',
                    [item.product_id]
                );
                if (productResult.length > 0 && coupon.applies_to_ids.includes(productResult[0].category_id)) {
                    itemIncluded = true;
                }
            }

            if (itemIncluded) {
                validItems.push(item);
                subtotal += item.price * item.quantity;
            }
        }

        // Check minimum order amount
        if (subtotal < coupon.min_order_amount) {
            return {
                valid: false,
                message: `Đơn hàng tối thiểu ${coupon.min_order_amount.toLocaleString('vi-VN')}đ để sử dụng mã này`
            };
        }

        // Calculate discount
        let discountAmount = 0;

        if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                discountAmount = coupon.max_discount_amount;
            }
        } else {
            // fixed_amount
            discountAmount = coupon.discount_value;
        }

        // Discount can't exceed subtotal
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        return {
            valid: true,
            coupon_id: coupon.id,
            coupon_code: coupon.code,
            discount_amount: Math.round(discountAmount * 100) / 100,
            subtotal: subtotal,
            final_amount: subtotal - discountAmount,
            message: 'Mã giảm giá hợp lệ'
        };
    }

    // Record coupon usage
    static async recordUsage(couponId, userId, orderId, discountAmount) {
        await executeQuery(`
            INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
            VALUES (?, ?, ?, ?)
        `, [couponId, userId, orderId, discountAmount]);

        // Usage count will be updated by trigger
    }

    // Get all coupons with pagination
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 20,
            is_active = null,
            discount_type = null,
            search = null
        } = options;

        const offset = (page - 1) * limit;
        let whereConditions = ['1=1'];
        const params = [];

        if (is_active !== null) {
            whereConditions.push('c.is_active = ?');
            params.push(is_active);
        }

        if (discount_type) {
            whereConditions.push('c.discount_type = ?');
            params.push(discount_type);
        }

        if (search) {
            whereConditions.push('(c.code LIKE ? OR c.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.join(' AND ');

        const countResult = await executeQuery(`
            SELECT COUNT(*) as total
            FROM coupons c
            WHERE ${whereClause}
        `, params);

        const total = countResult[0].total;

        const coupons = await executeQuery(`
            SELECT 
                c.*,
                u.full_name as created_by_name
            FROM coupons c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params);

        coupons.forEach(coupon => {
            if (coupon.applies_to_ids) {
                coupon.applies_to_ids = JSON.parse(coupon.applies_to_ids);
            }
        });

        return { coupons, total };
    }

    // Update coupon
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'description', 'discount_type', 'discount_value', 'min_order_amount',
            'max_discount_amount', 'usage_limit', 'per_user_limit', 'start_date',
            'end_date', 'is_active', 'applies_to', 'applies_to_ids'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = ?`);
                if (field === 'applies_to_ids' && updateData[field]) {
                    values.push(JSON.stringify(updateData[field]));
                } else {
                    values.push(updateData[field]);
                }
            }
        }

        if (fields.length === 0) {
            throw new Error('Không có trường nào để cập nhật');
        }

        values.push(id);

        await executeQuery(`
            UPDATE coupons
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = ?
        `, values);

        return this.findById(id);
    }

    // Delete coupon
    static async delete(id) {
        const result = await executeQuery(`
            DELETE FROM coupons
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }

    // Get coupon usage statistics
    static async getUsageStats(couponId) {
        const stats = await executeQuery(`
            SELECT 
                c.code,
                c.usage_count,
                c.usage_limit,
                COUNT(cu.id) as actual_usage,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
                COUNT(DISTINCT cu.user_id) as unique_users
            FROM coupons c
            LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [couponId]);

        return stats[0];
    }

    // Get user's available coupons
    static async getAvailableForUser(userId, orderAmount = 0) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const coupons = await executeQuery(`
            SELECT 
                c.*,
                COALESCE(cu.usage_count, 0) as user_usage_count
            FROM coupons c
            LEFT JOIN (
                SELECT coupon_id, COUNT(*) as usage_count
                FROM coupon_usage
                WHERE user_id = ?
                GROUP BY coupon_id
            ) cu ON c.id = cu.coupon_id
            WHERE c.is_active = TRUE
            AND c.start_date <= ?
            AND c.end_date >= ?
            AND (c.usage_limit IS NULL OR c.usage_count < c.usage_limit)
            AND (cu.usage_count IS NULL OR cu.usage_count < c.per_user_limit)
            AND c.min_order_amount <= ?
            ORDER BY c.discount_value DESC
        `, [userId, now, now, orderAmount]);

        coupons.forEach(coupon => {
            if (coupon.applies_to_ids) {
                coupon.applies_to_ids = JSON.parse(coupon.applies_to_ids);
            }
        });

        return coupons;
    }
}

module.exports = Coupon;
