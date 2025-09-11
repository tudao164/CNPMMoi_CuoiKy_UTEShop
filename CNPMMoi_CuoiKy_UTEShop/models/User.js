const bcrypt = require('bcryptjs');
const { executeQuery, getOne, insert } = require('../config/database');

class User {
    constructor(userData) {
        this.id = userData.id;
        this.email = userData.email;
        this.password = userData.password;
        this.full_name = userData.full_name;
        this.phone = userData.phone;
        this.avatar_url = userData.avatar_url;
        this.is_verified = userData.is_verified;
        this.created_at = userData.created_at;
        this.updated_at = userData.updated_at;
    }

    // Create new user
    static async create(userData) {
        try {
            const { email, password, full_name, phone } = userData;
            
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert user
            const userId = await insert(
                'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, full_name, phone]
            );

            // Return created user (without password)
            return await User.findById(userId);
        } catch (error) {
            console.error('❌ Error creating user:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email đã được sử dụng');
            }
            throw new Error('Lỗi tạo tài khoản người dùng');
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const userData = await getOne(
                'SELECT id, email, full_name, phone, avatar_url, is_verified, created_at, updated_at FROM users WHERE id = ?',
                [id]
            );
            return userData ? new User(userData) : null;
        } catch (error) {
            console.error('❌ Error finding user by ID:', error);
            throw new Error('Lỗi tìm kiếm người dùng');
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const userData = await getOne(
                'SELECT id, email, full_name, phone, avatar_url, is_verified, created_at, updated_at FROM users WHERE email = ?',
                [email]
            );
            return userData ? new User(userData) : null;
        } catch (error) {
            console.error('❌ Error finding user by email:', error);
            throw new Error('Lỗi tìm kiếm người dùng');
        }
    }

    // Find user by email with password (for authentication)
    static async findByEmailWithPassword(email) {
        try {
            const userData = await getOne(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return userData ? new User(userData) : null;
        } catch (error) {
            console.error('❌ Error finding user by email with password:', error);
            throw new Error('Lỗi tìm kiếm người dùng');
        }
    }

    // Verify password
    async verifyPassword(password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            console.error('❌ Error verifying password:', error);
            throw new Error('Lỗi xác thực mật khẩu');
        }
    }

    // Update user verification status
    static async updateVerificationStatus(userId, isVerified = true) {
        try {
            await executeQuery(
                'UPDATE users SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [isVerified, userId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error updating verification status:', error);
            throw new Error('Lỗi cập nhật trạng thái xác thực');
        }
    }

    // Update user password
    static async updatePassword(userId, newPassword) {
        try {
            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            await executeQuery(
                'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, userId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error updating password:', error);
            throw new Error('Lỗi cập nhật mật khẩu');
        }
    }

    // Update user profile
    static async updateProfile(userId, profileData) {
        try {
            const { full_name, phone, avatar_url } = profileData;
            await executeQuery(
                'UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [full_name, phone, avatar_url, userId]
            );
            return await User.findById(userId);
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            throw new Error('Lỗi cập nhật thông tin cá nhân');
        }
    }

    // Check if email exists
    static async emailExists(email, excludeUserId = null) {
        try {
            let query = 'SELECT id FROM users WHERE email = ?';
            let params = [email];

            if (excludeUserId) {
                query += ' AND id != ?';
                params.push(excludeUserId);
            }

            const user = await getOne(query, params);
            return !!user;
        } catch (error) {
            console.error('❌ Error checking email existence:', error);
            throw new Error('Lỗi kiểm tra email');
        }
    }

    // Get user statistics
    static async getUserStats() {
        try {
            const stats = await getOne(
                `SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_users,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30d,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_7d
                 FROM users`
            );
            return stats;
        } catch (error) {
            console.error('❌ Error getting user stats:', error);
            throw new Error('Lỗi lấy thống kê người dùng');
        }
    }

    // Get all users with pagination
    static async getAllUsers(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            // Get total count
            const countResult = await getOne('SELECT COUNT(*) as total FROM users');
            const total = countResult.total;

            // Get users
            const users = await executeQuery(
                `SELECT id, email, full_name, phone, avatar_url, is_verified, created_at, updated_at 
                 FROM users 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            return {
                users: users.map(userData => new User(userData)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error getting all users:', error);
            throw new Error('Lỗi lấy danh sách người dùng');
        }
    }

    // Search users
    static async searchUsers(searchTerm, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const searchPattern = `%${searchTerm}%`;

            // Get total count
            const countResult = await getOne(
                'SELECT COUNT(*) as total FROM users WHERE email LIKE ? OR full_name LIKE ?',
                [searchPattern, searchPattern]
            );
            const total = countResult.total;

            // Get users
            const users = await executeQuery(
                `SELECT id, email, full_name, phone, avatar_url, is_verified, created_at, updated_at 
                 FROM users 
                 WHERE email LIKE ? OR full_name LIKE ?
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`,
                [searchPattern, searchPattern, limit, offset]
            );

            return {
                users: users.map(userData => new User(userData)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Error searching users:', error);
            throw new Error('Lỗi tìm kiếm người dùng');
        }
    }

    // Delete user
    static async deleteUser(userId) {
        try {
            await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
            return true;
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            throw new Error('Lỗi xóa người dùng');
        }
    }

    // Get user without password for API response
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;
