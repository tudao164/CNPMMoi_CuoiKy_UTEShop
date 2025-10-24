const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
    try {
        // Tạo connection sử dụng config tương tự database.js
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123456',
            database: process.env.DB_NAME || 'uteshop'
        });

        console.log('Connected to database successfully!');

        // Hash mật khẩu "admin123"
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        console.log('Plain password:', plainPassword);
        console.log('Hashed password:', hashedPassword);

        // Kiểm tra xem admin đã tồn tại chưa
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@uteshop.com']
        );

        if (existingUsers.length > 0) {
            // Update mật khẩu cho admin hiện tại
            await connection.execute(
                'UPDATE users SET password = ?, is_admin = TRUE WHERE email = ?',
                [hashedPassword, 'admin@uteshop.com']
            );
            console.log('Updated existing admin password!');
        } else {
            // Tạo admin mới
            await connection.execute(
                'INSERT INTO users (email, password, full_name, phone, is_verified, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
                ['admin@uteshop.com', hashedPassword, 'Admin User', '0123456789', true, true]
            );
            console.log('Created new admin user!');
        }

        // Kiểm tra lại
        const [adminUser] = await connection.execute(
            'SELECT id, email, full_name, is_verified, is_admin FROM users WHERE email = ?',
            ['admin@uteshop.com']
        );

        console.log('Admin user info:', adminUser[0]);
        
        await connection.end();
        
        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('Email: admin@uteshop.com');
        console.log('Password: admin123');
        console.log('========================');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

createAdmin();