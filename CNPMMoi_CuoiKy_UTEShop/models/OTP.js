const { executeQuery, getOne, insert } = require('../config/database');
const { OTP_TYPES } = require('../utils/constants');

class OTP {
    constructor(otpData) {
        this.id = otpData.id;
        this.user_id = otpData.user_id;
        this.otp_code = otpData.otp_code;
        this.otp_type = otpData.otp_type;
        this.expires_at = otpData.expires_at;
        this.is_used = otpData.is_used;
        this.created_at = otpData.created_at;
    }

    // Create new OTP
    static async create(otpData) {
        try {
            const { user_id, otp_code, otp_type, expires_at } = otpData;
            
            const otpId = await insert(
                'INSERT INTO otp_codes (user_id, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)',
                [user_id, otp_code, otp_type, expires_at]
            );

            return await OTP.findById(otpId);
        } catch (error) {
            console.error('❌ Error creating OTP:', error);
            throw new Error('Lỗi tạo mã OTP');
        }
    }

    // Find OTP by ID
    static async findById(id) {
        try {
            const otpData = await getOne('SELECT * FROM otp_codes WHERE id = ?', [id]);
            return otpData ? new OTP(otpData) : null;
        } catch (error) {
            console.error('❌ Error finding OTP by ID:', error);
            throw new Error('Lỗi tìm kiếm mã OTP');
        }
    }

    // Find valid OTP by user and code
    static async findValidOTP(userId, otpCode, otpType) {
        try {
            const otpData = await getOne(
                `SELECT * FROM otp_codes 
                 WHERE user_id = ? AND otp_code = ? AND otp_type = ? 
                 AND is_used = FALSE AND expires_at > NOW()
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, otpCode, otpType]
            );
            return otpData ? new OTP(otpData) : null;
        } catch (error) {
            console.error('❌ Error finding valid OTP:', error);
            throw new Error('Lỗi tìm kiếm mã OTP hợp lệ');
        }
    }

    // Mark OTP as used
    static async markAsUsed(otpId) {
        try {
            await executeQuery(
                'UPDATE otp_codes SET is_used = TRUE WHERE id = ?',
                [otpId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error marking OTP as used:', error);
            throw new Error('Lỗi đánh dấu mã OTP đã sử dụng');
        }
    }

    // Invalidate all OTPs for user and type
    static async invalidateUserOTPs(userId, otpType) {
        try {
            await executeQuery(
                'UPDATE otp_codes SET is_used = TRUE WHERE user_id = ? AND otp_type = ? AND is_used = FALSE',
                [userId, otpType]
            );
            return true;
        } catch (error) {
            console.error('❌ Error invalidating user OTPs:', error);
            throw new Error('Lỗi hủy mã OTP của người dùng');
        }
    }

    // Get user's recent OTPs
    static async getUserRecentOTPs(userId, limit = 10) {
        try {
            const otps = await executeQuery(
                `SELECT * FROM otp_codes 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [userId, limit]
            );
            return otps.map(otpData => new OTP(otpData));
        } catch (error) {
            console.error('❌ Error getting user recent OTPs:', error);
            throw new Error('Lỗi lấy danh sách mã OTP gần đây');
        }
    }

    // Check if user has recent OTP request (rate limiting)
    static async hasRecentOTPRequest(userId, otpType, minutesAgo = 1) {
        try {
            const recentOTP = await getOne(
                `SELECT id FROM otp_codes 
                 WHERE user_id = ? AND otp_type = ? 
                 AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
                 LIMIT 1`,
                [userId, otpType, minutesAgo]
            );
            return !!recentOTP;
        } catch (error) {
            console.error('❌ Error checking recent OTP request:', error);
            throw new Error('Lỗi kiểm tra yêu cầu OTP gần đây');
        }
    }

    // Clean up expired OTPs
    static async cleanupExpiredOTPs() {
        try {
            const result = await executeQuery(
                'DELETE FROM otp_codes WHERE expires_at < NOW() OR (is_used = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 1 DAY))'
            );
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error cleaning up expired OTPs:', error);
            throw new Error('Lỗi dọn dẹp mã OTP hết hạn');
        }
    }

    // Get OTP statistics
    static async getOTPStats() {
        try {
            const stats = await getOne(
                `SELECT 
                    COUNT(*) as total_otps,
                    SUM(CASE WHEN is_used = TRUE THEN 1 ELSE 0 END) as used_otps,
                    SUM(CASE WHEN expires_at < NOW() THEN 1 ELSE 0 END) as expired_otps,
                    SUM(CASE WHEN otp_type = 'register' THEN 1 ELSE 0 END) as register_otps,
                    SUM(CASE WHEN otp_type = 'reset_password' THEN 1 ELSE 0 END) as reset_password_otps,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as otps_24h
                 FROM otp_codes`
            );
            return stats;
        } catch (error) {
            console.error('❌ Error getting OTP stats:', error);
            throw new Error('Lỗi lấy thống kê mã OTP');
        }
    }

    // Get OTP usage by user
    static async getUserOTPStats(userId) {
        try {
            const stats = await getOne(
                `SELECT 
                    COUNT(*) as total_otps,
                    SUM(CASE WHEN is_used = TRUE THEN 1 ELSE 0 END) as used_otps,
                    SUM(CASE WHEN expires_at < NOW() AND is_used = FALSE THEN 1 ELSE 0 END) as expired_otps,
                    MAX(created_at) as last_otp_time
                 FROM otp_codes 
                 WHERE user_id = ?`,
                [userId]
            );
            return stats;
        } catch (error) {
            console.error('❌ Error getting user OTP stats:', error);
            throw new Error('Lỗi lấy thống kê mã OTP của người dùng');
        }
    }

    // Check if OTP is still valid (not expired and not used)
    isValid() {
        const now = new Date();
        const expiresAt = new Date(this.expires_at);
        return !this.is_used && expiresAt > now;
    }

    // Check if OTP is expired
    isExpired() {
        const now = new Date();
        const expiresAt = new Date(this.expires_at);
        return expiresAt <= now;
    }

    // Get time until expiration in minutes
    getTimeUntilExpiration() {
        const now = new Date();
        const expiresAt = new Date(this.expires_at);
        const diffMs = expiresAt.getTime() - now.getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }

    // Get all OTPs with pagination
    static async getAllOTPs(page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            // Get total count
            const countResult = await getOne('SELECT COUNT(*) as total FROM otp_codes');
            const total = countResult.total;

            // Get OTPs with user information
            const otps = await executeQuery(
                `SELECT o.*, u.email, u.full_name
                 FROM otp_codes o
                 JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC 
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            return {
                otps: otps.map(otpData => ({
                    ...new OTP(otpData),
                    user_email: otpData.email,
                    user_name: otpData.full_name
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting all OTPs:', error);
            throw new Error('Lỗi lấy danh sách mã OTP');
        }
    }
}

module.exports = OTP;
