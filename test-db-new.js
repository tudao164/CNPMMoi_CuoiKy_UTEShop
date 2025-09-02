const { executeQuery } = require('./config/database');

async function testDatabase() {
    try {
        console.log('Testing database queries...');
        
        // Test 3: Using template string for LIMIT
        console.log('\n1. Testing SELECT with template string LIMIT:');
        const limitValue = 3;
        const productsWithTemplate = await executeQuery(`SELECT * FROM products LIMIT ${limitValue}`);
        console.log(`Found ${productsWithTemplate.length} products with template string`);
        
        console.log('\n✅ All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
}

testDatabase();
