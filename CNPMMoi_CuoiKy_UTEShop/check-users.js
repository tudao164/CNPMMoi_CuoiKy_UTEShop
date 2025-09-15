const mysql = require('mysql2/promise');

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'uteshop'
    });

    try {
        console.log('🔍 Checking users in database...\n');
        
        // Đếm tổng số users
        const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM users');
        console.log(`📊 Total users in database: ${countResult[0].total}`);
        
        // Lấy tất cả users với thông tin chi tiết
        const [users] = await connection.execute(`
            SELECT 
                id, 
                email, 
                full_name, 
                phone, 
                is_verified, 
                created_at,
                updated_at
            FROM users 
            ORDER BY id ASC
        `);
        
        console.log('\n👥 All users in database:');
        console.log('════════════════════════════════════════════════════════════════');
        
        if (users.length === 0) {
            console.log('❌ No users found in database!');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   👤 Name: ${user.full_name || 'N/A'}`);
                console.log(`   📱 Phone: ${user.phone || 'N/A'}`);
                console.log(`   ✅ Verified: ${user.is_verified ? 'Yes' : 'No'}`);
                console.log(`   📅 Created: ${user.created_at}`);
                console.log(`   📝 Updated: ${user.updated_at}`);
                console.log('────────────────────────────────────────────────────────────────');
            });
        }
        
        // Kiểm tra users chưa xác thực
        const [unverifiedUsers] = await connection.execute(`
            SELECT COUNT(*) as total FROM users WHERE is_verified = 0
        `);
        console.log(`\n⚠️  Unverified users: ${unverifiedUsers[0].total}`);
        
        // Kiểm tra users đã xác thực
        const [verifiedUsers] = await connection.execute(`
            SELECT COUNT(*) as total FROM users WHERE is_verified = 1
        `);
        console.log(`✅ Verified users: ${verifiedUsers[0].total}`);
        
        // Kiểm tra có user nào bị xóa không (nếu có soft delete)
        const [tableInfo] = await connection.execute(`
            DESCRIBE users
        `);
        
        const hasDeletedAt = tableInfo.some(column => column.Field === 'deleted_at');
        if (hasDeletedAt) {
            const [deletedUsers] = await connection.execute(`
                SELECT COUNT(*) as total FROM users WHERE deleted_at IS NOT NULL
            `);
            console.log(`🗑️  Deleted users: ${deletedUsers[0].total}`);
        }
        
        // Kiểm tra OTP records
        const [otpCount] = await connection.execute('SELECT COUNT(*) as total FROM otps');
        console.log(`\n📨 Total OTP records: ${otpCount[0].total}`);
        
        if (otpCount[0].total > 0) {
            const [recentOtps] = await connection.execute(`
                SELECT 
                    email, 
                    otp_type, 
                    is_used, 
                    created_at,
                    expires_at
                FROM otps 
                ORDER BY created_at DESC 
                LIMIT 10
            `);
            
            console.log('\n📨 Recent OTP requests:');
            recentOtps.forEach((otp, index) => {
                console.log(`${index + 1}. ${otp.email} - ${otp.otp_type} - Used: ${otp.is_used} - ${otp.created_at}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking users:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsers();