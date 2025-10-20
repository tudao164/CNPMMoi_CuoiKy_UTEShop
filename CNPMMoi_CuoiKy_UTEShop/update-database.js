const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123456',
            database: process.env.DB_NAME || 'uteshop'
        });

        console.log('✅ Connected to database successfully!');

        console.log('\n📝 Updating database schema...\n');

        // Check if is_admin column exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'
        `, [process.env.DB_NAME || 'uteshop']);

        if (columns.length === 0) {
            console.log('➕ Adding is_admin column to users table...');
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN is_admin BOOLEAN DEFAULT FALSE AFTER is_verified,
                ADD INDEX idx_is_admin (is_admin)
            `);
            console.log('✅ is_admin column added successfully!');
        } else {
            console.log('ℹ️  is_admin column already exists');
        }

        // Update admin user
        console.log('\n👤 Setting admin privileges for admin@uteshop.com...');
        const [result] = await connection.execute(`
            UPDATE users 
            SET is_admin = TRUE 
            WHERE email = 'admin@uteshop.com'
        `);

        if (result.affectedRows > 0) {
            console.log('✅ Admin privileges granted to admin@uteshop.com');
        } else {
            console.log('⚠️  User admin@uteshop.com not found');
        }

        // Verify admin user
        const [adminUser] = await connection.execute(`
            SELECT id, email, full_name, is_admin, is_verified 
            FROM users 
            WHERE email = 'admin@uteshop.com'
        `);

        if (adminUser.length > 0) {
            console.log('\n📋 Admin user details:');
            console.log(adminUser[0]);
        }

        await connection.end();

        console.log('\n✅ Database update completed successfully!');
        console.log('\n=== ADMIN ACCESS ===');
        console.log('Email: admin@uteshop.com');
        console.log('Password: admin123');
        console.log('====================\n');

    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        process.exit(1);
    }
}

updateDatabase();
