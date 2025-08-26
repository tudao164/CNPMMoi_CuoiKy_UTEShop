const User = require('../models/User');
const OTP = require('../models/OTP');
const {
    successResponse,
    errorResponse,
    notFoundResponse,
    conflictResponse,
    unauthorizedResponse,
    paginationResponse
} = require('../utils/responseHelper');
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../utils/constants');

class UserController {
    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = req.user;
            
            return successResponse(res, {
                user: user.toJSON()
            }, 'Profile retrieved successfully');

        } catch (error) {
            console.error('❌ Get profile error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { full_name, phone } = req.body;

            // Prepare update data
            const updateData = {};
            if (full_name !== undefined) updateData.full_name = full_name;
            if (phone !== undefined) updateData.phone = phone;

            // Check if there's anything to update
            if (Object.keys(updateData).length === 0) {
                return errorResponse(res, 'Không có dữ liệu để cập nhật', 400);
            }

            // Update user profile
            const updatedUser = await User.updateProfile(userId, updateData);

            console.log(`✅ Profile updated: ${req.user.email}`);
            return successResponse(res, {
                user: updatedUser.toJSON()
            }, SUCCESS_MESSAGES.PROFILE_UPDATED);

        } catch (error) {
            console.error('❌ Update profile error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { current_password, new_password } = req.body;

            // Get user with password
            const user = await User.findByEmailWithPassword(req.user.email);
            if (!user) {
                return notFoundResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            // Verify current password
            const isCurrentPasswordValid = await user.verifyPassword(current_password);
            if (!isCurrentPasswordValid) {
                return unauthorizedResponse(res, 'Mật khẩu hiện tại không đúng');
            }

            // Check if new password is different from current password
            const isSamePassword = await user.verifyPassword(new_password);
            if (isSamePassword) {
                return conflictResponse(res, 'Mật khẩu mới phải khác mật khẩu hiện tại');
            }

            // Update password
            await User.updatePassword(userId, new_password);

            console.log(`✅ Password changed: ${req.user.email}`);
            return successResponse(res, null, 'Đổi mật khẩu thành công');

        } catch (error) {
            console.error('❌ Change password error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get user statistics (personal)
    async getUserStats(req, res) {
        try {
            const userId = req.user.id;

            // Get user's OTP statistics
            const otpStats = await OTP.getUserOTPStats(userId);

            // Get user account info
            const user = await User.findById(userId);

            const stats = {
                account_created: user.created_at,
                is_verified: user.is_verified,
                total_otp_requests: otpStats.total_otps || 0,
                used_otps: otpStats.used_otps || 0,
                expired_otps: otpStats.expired_otps || 0,
                last_otp_time: otpStats.last_otp_time
            };

            return successResponse(res, stats, 'User statistics retrieved');

        } catch (error) {
            console.error('❌ Get user stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get user's recent OTPs
    async getUserOTPs(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;

            const recentOTPs = await OTP.getUserRecentOTPs(userId, limit);

            // Remove sensitive information
            const sanitizedOTPs = recentOTPs.map(otp => ({
                id: otp.id,
                otp_type: otp.otp_type,
                is_used: otp.is_used,
                expires_at: otp.expires_at,
                created_at: otp.created_at,
                is_expired: otp.isExpired(),
                time_until_expiration: otp.getTimeUntilExpiration()
            }));

            return successResponse(res, {
                otps: sanitizedOTPs,
                total: sanitizedOTPs.length
            }, 'User OTPs retrieved');

        } catch (error) {
            console.error('❌ Get user OTPs error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Delete user account
    async deleteAccount(req, res) {
        try {
            const userId = req.user.id;
            const { password } = req.body;

            // Verify password before deletion
            const user = await User.findByEmailWithPassword(req.user.email);
            if (!user) {
                return notFoundResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                return unauthorizedResponse(res, 'Mật khẩu không đúng');
            }

            // Delete user account
            await User.deleteUser(userId);

            console.log(`✅ Account deleted: ${req.user.email}`);
            return successResponse(res, null, 'Tài khoản đã được xóa thành công');

        } catch (error) {
            console.error('❌ Delete account error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get all users (admin only - for future use)
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await User.getAllUsers(page, limit);

            return paginationResponse(res, result.users.map(user => user.toJSON()), result.pagination, 'Users retrieved successfully');

        } catch (error) {
            console.error('❌ Get all users error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Search users (admin only - for future use)
    async searchUsers(req, res) {
        try {
            const searchTerm = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!searchTerm.trim()) {
                return errorResponse(res, 'Từ khóa tìm kiếm không được để trống', 400);
            }

            const result = await User.searchUsers(searchTerm, page, limit);

            return paginationResponse(res, result.users.map(user => user.toJSON()), result.pagination, 'Search results retrieved');

        } catch (error) {
            console.error('❌ Search users error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Get system user statistics (admin only - for future use)
    async getSystemUserStats(req, res) {
        try {
            const userStats = await User.getUserStats();
            const otpStats = await OTP.getOTPStats();

            const stats = {
                users: userStats,
                otps: otpStats
            };

            return successResponse(res, stats, 'System statistics retrieved');

        } catch (error) {
            console.error('❌ Get system stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // Update user email (requires verification)
    async updateEmail(req, res) {
        try {
            const { new_email, password } = req.body;

            // Verify password
            const user = await User.findByEmailWithPassword(req.user.email);
            if (!user) {
                return notFoundResponse(res, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                return unauthorizedResponse(res, 'Mật khẩu không đúng');
            }

            // Check if new email already exists
            const emailExists = await User.emailExists(new_email, req.user.id);
            if (emailExists) {
                return conflictResponse(res, ERROR_MESSAGES.EMAIL_EXISTS);
            }

            // For now, just return success. In a real implementation, you'd:
            // 1. Send verification OTP to new email
            // 2. Update email after verification
            // 3. Set is_verified to false until new email is verified

            return successResponse(res, null, 'Chức năng đổi email sẽ được triển khai trong phiên bản tiếp theo');

        } catch (error) {
            console.error('❌ Update email error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new UserController();
