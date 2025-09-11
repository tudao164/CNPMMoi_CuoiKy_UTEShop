const { executeQuery } = require('./config/database');

async function testDatabase() {
    try {
        console.log('Testing database queries...');
        
        // Test 1: Simple select without parameters
        console.log('\n1. Testing simple SELECT:');
        const products = await executeQuery('SELECT * FROM products LIMIT 5');
        console.log(`Found ${products.length} products`);
        
        // Test 2: Select with LIMIT parameter
        console.log('\n2. Testing SELECT with LIMIT parameter:');
        const productsWithParam = await executeQuery('SELECT * FROM products LIMIT ?', [3]);
        console.log(`Found ${productsWithParam.length} products with parameter`);
        
        // Test 3: Complex query like in our code
        console.log('\n3. Testing complex query:');
        const latestProducts = await executeQuery(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.is_active = TRUE 
             ORDER BY p.created_at DESC 
             LIMIT ?`,
            [5]
        );
        console.log(`Found ${latestProducts.length} latest products`);
        
        console.log('\n✅ All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
}

testDatabase();
