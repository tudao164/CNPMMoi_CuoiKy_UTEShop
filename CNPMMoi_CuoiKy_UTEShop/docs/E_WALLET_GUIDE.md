# 💳 Hướng dẫn sử dụng E_WALLET (Ví điện tử)

## 📋 Tổng quan
Hệ thống UTEShop hỗ trợ thanh toán qua ví điện tử với các tính năng:
- ✅ Tạo đơn hàng với phương thức E_WALLET
- ✅ Xử lý thanh toán thông qua webhook
- ✅ Theo dõi trạng thái thanh toán real-time
- ✅ Hủy/hoàn tiền tự động

## 🔄 Workflow E_WALLET

```
1. Tạo đơn hàng (payment_method: "E_WALLET")
2. Payment record được tạo với status "pending"
3. User được redirect đến gateway thanh toán
4. Gateway gửi webhook về hệ thống
5. Hệ thống cập nhật payment status
6. Order status được cập nhật tương ứng
```

## 📚 API Endpoints

### 1. Tạo đơn hàng với E_WALLET

**POST** `/api/orders`
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "payment_method": "E_WALLET",
  "shipping_address": "123 Nguyen Van Cu, District 5, Ho Chi Minh City",
  "notes": "Thanh toán qua MoMo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "status": "new",
      "payment_method": "E_WALLET",
      "total_amount": 1799.98
    },
    "payment": {
      "id": 1,
      "payment_status": "pending",
      "payment_method": "E_WALLET",
      "amount": 1799.98
    }
  }
}
```

### 2. Xử lý thanh toán E_WALLET

**POST** `/api/payments/:id/process-ewallet`
```json
{
  "transaction_id": "TXN_MOMO_123456789",
  "gateway_response": {
    "gateway": "MoMo",
    "response_code": "00",
    "message": "Success"
  },
  "status": "completed"
}
```

### 3. Webhook từ Gateway

**POST** `/api/payments/webhook`
```json
{
  "transaction_id": "TXN_MOMO_123456789",
  "order_id": 1,
  "status": "completed",
  "amount": 1799.98,
  "gateway_response": {
    "gateway": "MoMo",
    "partnerCode": "MOMO",
    "responseTime": 1694234567000
  }
}
```

## 🧪 Testing E_WALLET

### Bước 1: Tạo đơn hàng E_WALLET

```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 1
      }
    ],
    "payment_method": "E_WALLET",
    "shipping_address": "123 Test Street"
  }'
```

### Bước 2: Simulate Webhook Success

```bash
curl -X POST "http://localhost:3000/api/payments/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TEST_TXN_001",
    "order_id": 1,
    "status": "completed",
    "amount": 899.99,
    "gateway_response": {
      "gateway": "MoMo",
      "code": "00",
      "message": "Success"
    }
  }'
```

### Bước 3: Kiểm tra kết quả

```bash
# Kiểm tra payment status
curl -X GET "http://localhost:3000/api/payments/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Kiểm tra order status  
curl -X GET "http://localhost:3000/api/orders/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 PowerShell Examples

### Tạo đơn hàng E_WALLET
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    items = @(
        @{
            product_id = 1
            quantity = 2
        }
    )
    payment_method = "E_WALLET"
    shipping_address = "123 Nguyen Van Cu, District 5, Ho Chi Minh City"
    notes = "Thanh toán MoMo"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method POST -Headers $headers -Body $body
```

### Simulate Webhook
```powershell
$webhookBody = @{
    transaction_id = "MOMO_TXN_$(Get-Date -Format 'yyyyMMddHHmmss')"
    order_id = 1
    status = "completed"
    amount = 1799.98
    gateway_response = @{
        gateway = "MoMo"
        partnerCode = "MOMO"
        responseTime = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/payments/webhook" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $webhookBody
```

## 📊 Payment Status Flow

### E_WALLET Status Transitions:
```
pending → completed (success)
pending → failed (gateway failure)  
pending → cancelled (user cancelled)
completed → refunded (admin refund)
```

### Order Status Updates:
```
new → confirmed (when payment completed)
new → cancelled (when payment failed)
```

## 🛠️ Advanced Features

### 1. Lấy danh sách thanh toán E_WALLET

```bash
curl -X GET "http://localhost:3000/api/payments?method=E_WALLET&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Hoàn tiền E_WALLET

```bash
curl -X POST "http://localhost:3000/api/payments/1/refund" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refund_amount": 899.99,
    "refund_reason": "Khách hàng yêu cầu hoàn tiền",
    "refund_transaction_id": "REFUND_001"
  }'
```

### 3. Thống kê thanh toán E_WALLET

```bash
curl -X GET "http://localhost:3000/api/payments/stats?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚠️ Error Handling

### Common Errors:

1. **Invalid Payment Method**
```json
{
  "success": false,
  "message": "Phương thức thanh toán không hợp lệ"
}
```

2. **Payment Not Found**
```json
{
  "success": false,
  "message": "Không tìm thấy thông tin thanh toán"
}
```

3. **Invalid Webhook Data**
```json
{
  "success": false,
  "message": "Dữ liệu webhook không hợp lệ"
}
```

## 🔐 Security Considerations

### 1. Webhook Verification
```javascript
// In real implementation, verify webhook signature
const signature = req.headers['x-signature'];
const isValid = verifySignature(req.body, signature, SECRET_KEY);
if (!isValid) {
    return errorResponse(res, 'Invalid webhook signature', 401);
}
```

### 2. Payment Validation
- ✅ Validate transaction_id uniqueness
- ✅ Check amount consistency  
- ✅ Verify order ownership
- ✅ Rate limiting on webhook endpoints

## 🌐 Integration Examples

### React.js Frontend
```jsx
const handleEWalletPayment = async (orderId) => {
  try {
    // Redirect to gateway payment page
    const gatewayUrl = await getPaymentGatewayUrl(orderId);
    window.location.href = gatewayUrl;
    
    // Or handle in-app payment
    const result = await processEWalletPayment(orderId, {
      gateway: 'MoMo',
      amount: orderTotal
    });
    
    if (result.success) {
      toast.success('Thanh toán thành công!');
      router.push('/orders');
    }
  } catch (error) {
    toast.error('Thanh toán thất bại: ' + error.message);
  }
};
```

### MoMo Integration Example
```javascript
const createMoMoPayment = async (orderData) => {
  const momoRequest = {
    partnerCode: 'MOMO_PARTNER_CODE',
    orderId: orderData.id,
    amount: orderData.total_amount,
    orderInfo: `UTEShop Order #${orderData.id}`,
    redirectUrl: 'http://localhost:3000/payment/return',
    ipnUrl: 'http://localhost:3000/api/payments/webhook',
    extraData: '',
    requestId: uuidv4(),
    requestType: 'captureWallet'
  };
  
  // Generate signature and call MoMo API
  // Return payment URL for redirect
};
```

## 📱 Mobile App Integration

### React Native Example
```javascript
import { WebView } from 'react-native-webview';

const EWalletPayment = ({ paymentUrl, onPaymentComplete }) => {
  const handleNavigationStateChange = (navState) => {
    if (navState.url.includes('/payment/success')) {
      onPaymentComplete('success');
    } else if (navState.url.includes('/payment/cancel')) {
      onPaymentComplete('cancelled');
    }
  };

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState={true}
    />
  );
};
```

## 📈 Monitoring & Analytics

### Key Metrics để theo dõi:
- E_WALLET success rate
- Average transaction amount
- Popular gateways (MoMo, ZaloPay, etc.)
- Failed payment reasons
- Refund rates

### Database Queries:
```sql
-- E_WALLET success rate
SELECT 
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM payments 
WHERE payment_method = 'E_WALLET'
AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Top E_WALLET transactions
SELECT * FROM payments 
WHERE payment_method = 'E_WALLET' 
AND payment_status = 'completed'
ORDER BY amount DESC 
LIMIT 10;
```

Hệ thống E_WALLET đã sẵn sàng để sử dụng! 🚀