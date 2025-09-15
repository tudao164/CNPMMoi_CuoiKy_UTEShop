const axios = require('axios');

async function testAPI() {
    try {
        const baseURL = 'http://localhost:3000/api';
        
        // Đăng nhập
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@uteshop.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token received');
        
        // Test endpoint GET /api/orders
        console.log('📋 Testing GET /api/orders...');
        const ordersResponse = await axios.get(`${baseURL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ GET /api/orders successful!');
        console.log('📊 Response:', JSON.stringify(ordersResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testAPI();