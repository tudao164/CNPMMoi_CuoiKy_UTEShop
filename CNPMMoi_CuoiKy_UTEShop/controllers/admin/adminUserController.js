const User = require('../../models/User');
const { executeQuery } = require('../../config/database');
const bcrypt = require('bcryptjs');
const {
    successResponse,
    errorResponse,
    notFoundResponse,
    createdResponse,
    paginationResponse
} = require('../../utils/responseHelper');
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} = require('../../utils/constants');

class AdminUserController {
    // GET /api/admin/users - Get all users
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search;

            let result;
            if (search) {
                result = await User.searchUsers(search, page, limit);
            } else {
                result = await User.getAllUsers(page, limit);
            }

            return paginationResponse(
                res,
                result.users.map(user => user.toJSON()),
                result.pagination,
                'Danh sách người dùng được tải thành công'
            );

        } catch (error) {
            console.error('❌ Admin get all users error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // GET /api/admin/users/:id - Get user by ID
    async getUserById(req, res) {
        try {
            const userId = req.params.id;

            const user = await User.findById(userId);
            if (!user) {
                return notFoundResponse(res, 'Người dùng không tồn tại');
            }

            // Get user statistics
            const [orderStats] = await executeQuery(`
                SELECT 
                    COUNT(*) as total_orders,
                    COALESCE(SUM(total_amount), 0) as total_spent,
                    MAX(created_at) as last_order_date
                FROM orders
                WHERE user_id = ?
            `, [userId]);

            return successResponse(res, {
                user: user.toJSON(),
                stats: orderStats
            }, 'Thông tin người dùng được tải thành công');

        } catch (error) {
            console.error('❌ Admin get user by ID error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // POST /api/admin/users - Create new user
    async createUser(req, res) {
        try {
            const { email, password, full_name, phone, is_admin, is_verified } = req.body;

            // Validate required fields
            if (!email || !password || !full_name) {
                return errorResponse(res, 'Email, mật khẩu và tên đầy đủ là bắt buộc', 400);
            }

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return errorResponse(res, 'Email đã được sử dụng', 400);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            const [result] = await executeQuery(
                `INSERT INTO users (email, password, full_name, phone, is_admin, is_verified) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [email, hashedPassword, full_name, phone || null, is_admin || false, is_verified || false]
            );

            const user = await User.findById(result.insertId);

            return createdResponse(res, {
                user: user.toJSON()
            }, 'Người dùng đã được tạo thành công');

        } catch (error) {
            console.error('❌ Admin create user error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PUT /api/admin/users/:id - Update user
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { email, full_name, phone, is_admin, is_verified } = req.body;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return notFoundResponse(res, 'Người dùng không tồn tại');
            }

            // Prevent admin from removing their own admin status
            if (userId == req.user.id && is_admin === false) {
                return errorResponse(res, 'Bạn không thể xóa quyền admin của chính mình', 400);
            }

            // Check if email is taken by another user
            if (email && email !== user.email) {
                const emailExists = await User.emailExists(email, userId);
                if (emailExists) {
                    return errorResponse(res, 'Email đã được sử dụng bởi người dùng khác', 400);
                }
            }

            // Build update query
            const updates = [];
            const params = [];

            if (email !== undefined) {
                updates.push('email = ?');
                params.push(email);
            }
            if (full_name !== undefined) {
                updates.push('full_name = ?');
                params.push(full_name);
            }
            if (phone !== undefined) {
                updates.push('phone = ?');
                params.push(phone);
            }
            if (is_admin !== undefined) {
                updates.push('is_admin = ?');
                params.push(is_admin);
            }
            if (is_verified !== undefined) {
                updates.push('is_verified = ?');
                params.push(is_verified);
            }

            if (updates.length === 0) {
                return errorResponse(res, 'Không có thông tin nào để cập nhật', 400);
            }

            params.push(userId);

            await executeQuery(
                `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                params
            );

            const updatedUser = await User.findById(userId);

            return successResponse(res, {
                user: updatedUser.toJSON()
            }, 'Thông tin người dùng đã được cập nhật');

        } catch (error) {
            console.error('❌ Admin update user error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // DELETE /api/admin/users/:id - Delete user
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return notFoundResponse(res, 'Người dùng không tồn tại');
            }

            // Prevent admin from deleting themselves
            if (userId == req.user.id) {
                return errorResponse(res, 'Bạn không thể xóa tài khoản của chính mình', 400);
            }

            // Check if user has orders
            const [orderCheck] = await executeQuery(
                'SELECT COUNT(*) as order_count FROM orders WHERE user_id = ?',
                [userId]
            );

            if (orderCheck.order_count > 0) {
                return errorResponse(res, 
                    'Không thể xóa người dùng có đơn hàng. Hãy vô hiệu hóa tài khoản thay vì xóa.', 
                    400
                );
            }

            await User.deleteUser(userId);

            return successResponse(res, null, 'Người dùng đã được xóa thành công');

        } catch (error) {
            console.error('❌ Admin delete user error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PATCH /api/admin/users/:id/password - Reset user password
    async resetUserPassword(req, res) {
        try {
            const userId = req.params.id;
            const { new_password } = req.body;

            if (!new_password || new_password.length < 6) {
                return errorResponse(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
                return notFoundResponse(res, 'Người dùng không tồn tại');
            }

            await User.updatePassword(userId, new_password);

            return successResponse(res, null, 'Mật khẩu đã được đặt lại thành công');

        } catch (error) {
            console.error('❌ Admin reset password error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // GET /api/admin/users/stats - Get user statistics
    async getUserStats(req, res) {
        try {
            const stats = await User.getUserStats();

            // Get additional stats
            const [adminCount] = await executeQuery(
                'SELECT COUNT(*) as admin_count FROM users WHERE is_admin = TRUE'
            );

            const [recentUsers] = await executeQuery(`
                SELECT COUNT(*) as users_today 
                FROM users 
                WHERE DATE(created_at) = CURDATE()
            `);

            return successResponse(res, {
                stats: {
                    ...stats,
                    admin_count: adminCount.admin_count,
                    users_today: recentUsers.users_today
                }
            }, 'Thống kê người dùng được tải thành công');

        } catch (error) {
            console.error('❌ Admin get user stats error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    // PATCH /api/admin/users/:id/toggle-admin - Toggle admin status
    async toggleAdminStatus(req, res) {
        try {
            const userId = req.params.id;

            const user = await User.findById(userId);
            if (!user) {
                return notFoundResponse(res, 'Người dùng không tồn tại');
            }

            // Prevent admin from toggling their own status
            if (userId == req.user.id) {
                return errorResponse(res, 'Bạn không thể thay đổi quyền admin của chính mình', 400);
            }

            const newAdminStatus = !user.is_admin;

            await executeQuery(
                'UPDATE users SET is_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newAdminStatus, userId]
            );

            const updatedUser = await User.findById(userId);

            return successResponse(res, {
                user: updatedUser.toJSON()
            }, `Quyền admin đã được ${newAdminStatus ? 'cấp' : 'thu hồi'}`);

        } catch (error) {
            console.error('❌ Admin toggle admin status error:', error);
            return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}

module.exports = new AdminUserController();
