const crypto = require('crypto');
const { executeQuery, getOne, insert } = require('../config/database');
const { OTP_TYPES, OTP_SETTINGS } = require('../utils/constants');
const emailService = require('./emailService');

class OTPService {
    // Generate random OTP code
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    // Calculate OTP expiration time
    getExpirationTime() {
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + OTP_SETTINGS.EXPIRE_MINUTES);
        return expirationTime;
    }

    // Create and send OTP for registration
    async createRegistrationOTP(userId, email, fullName) {
        try {
            // Invalidate existing OTPs for this user and type
            await this.invalidateExistingOTPs(userId, OTP_TYPES.REGISTER);

            // Generate new OTP
            const otpCode = this.generateOTP();
            const expiresAt = this.getExpirationTime();

            // Save OTP to database
            const otpId = await insert(
                'INSERT INTO otp_codes (user_id, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)',
                [userId, otpCode, OTP_TYPES.REGISTER, expiresAt]
            );

            // Send OTP email (don't fail if email sending fails)
            try {
                await emailService.sendRegistrationOTP(email, fullName, otpCode);
            } catch (emailError) {
                console.warn('⚠️ Email sending failed, but OTP was created:', emailError.message);
                // Continue execution - user can still use OTP from database/logs
            }

            console.log(`✅ Registration OTP created for user ${userId}: ${otpCode}`);
            return { otpId, otpCode, expiresAt };
        } catch (error) {
            console.error('❌ Error creating registration OTP:', error);
            throw new Error('Không thể tạo mã OTP đăng ký');
        }
    }

    // Create and send OTP for password reset
    async createPasswordResetOTP(userId, email, fullName) {
        try {
            // Invalidate existing OTPs for this user and type
            await this.invalidateExistingOTPs(userId, OTP_TYPES.RESET_PASSWORD);

            // Generate new OTP
            const otpCode = this.generateOTP();
            const expiresAt = this.getExpirationTime();

            // Save OTP to database
            const otpId = await insert(
                'INSERT INTO otp_codes (user_id, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)',
                [userId, otpCode, OTP_TYPES.RESET_PASSWORD, expiresAt]
            );

            // Send OTP email (don't fail if email sending fails)
            try {
                await emailService.sendPasswordResetOTP(email, fullName, otpCode);
            } catch (emailError) {
                console.warn('⚠️ Email sending failed, but OTP was created:', emailError.message);
                // Continue execution - user can still use OTP from database/logs
            }

            console.log(`✅ Password reset OTP created for user ${userId}: ${otpCode}`);
            return { otpId, otpCode, expiresAt };
        } catch (error) {
            console.error('❌ Error creating password reset OTP:', error);
            throw new Error('Không thể tạo mã OTP đặt lại mật khẩu');
        }
    }

    // Verify OTP code
    async verifyOTP(userId, otpCode, otpType) {
        try {
            // Find valid OTP
            const otp = await getOne(
                `SELECT * FROM otp_codes 
                 WHERE user_id = ? AND otp_code = ? AND otp_type = ? 
                 AND is_used = FALSE AND expires_at > NOW()
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, otpCode, otpType]
            );

            if (!otp) {
                return { 
                    success: false, 
                    error: 'Mã OTP không hợp lệ hoặc đã hết hạn' 
                };
            }

            // Mark OTP as used
            await executeQuery(
                'UPDATE otp_codes SET is_used = TRUE WHERE id = ?',
                [otp.id]
            );

            console.log(`✅ OTP verified successfully for user ${userId}`);
            return { success: true, otpId: otp.id };
        } catch (error) {
            console.error('❌ Error verifying OTP:', error);
            throw new Error('Lỗi xác thực mã OTP');
        }
    }

    // Invalidate existing OTPs for user and type
    async invalidateExistingOTPs(userId, otpType) {
        try {
            await executeQuery(
                'UPDATE otp_codes SET is_used = TRUE WHERE user_id = ? AND otp_type = ? AND is_used = FALSE',
                [userId, otpType]
            );
            console.log(`✅ Invalidated existing ${otpType} OTPs for user ${userId}`);
        } catch (error) {
            console.error('❌ Error invalidating OTPs:', error);
            throw new Error('Lỗi hủy mã OTP cũ');
        }
    }

    // Clean up expired OTPs (should be run periodically)
    async cleanupExpiredOTPs() {
        try {
            const result = await executeQuery(
                'DELETE FROM otp_codes WHERE expires_at < NOW() OR is_used = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)'
            );
            console.log(`✅ Cleaned up ${result.affectedRows} expired OTP records`);
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error cleaning up expired OTPs:', error);
            throw new Error('Lỗi dọn dẹp mã OTP hết hạn');
        }
    }

    // Get OTP statistics for user
    async getOTPStats(userId) {
        try {
            const stats = await getOne(
                `SELECT 
                    COUNT(*) as total_otps,
                    SUM(CASE WHEN is_used = TRUE THEN 1 ELSE 0 END) as used_otps,
                    SUM(CASE WHEN expires_at < NOW() THEN 1 ELSE 0 END) as expired_otps,
                    MAX(created_at) as last_otp_time
                 FROM otp_codes 
                 WHERE user_id = ?`,
                [userId]
            );
            return stats;
        } catch (error) {
            console.error('❌ Error getting OTP stats:', error);
            throw new Error('Lỗi lấy thống kê OTP');
        }
    }

    // Check if user can request new OTP (rate limiting)
    async canRequestNewOTP(userId, otpType) {
        try {
            const recentOTP = await getOne(
                `SELECT * FROM otp_codes 
                 WHERE user_id = ? AND otp_type = ? 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, otpType]
            );

            return !recentOTP;
        } catch (error) {
            console.error('❌ Error checking OTP rate limit:', error);
            return false;
        }
    }
}

module.exports = new OTPService();
