# UTEShop Database Setup Instructions

## Tổng quan
Có 2 file schema để tạo database:

1. **schema.sql** - Schema đầy đủ với triggers và stored procedures
2. **schema-simple.sql** - Schema đơn giản chỉ có tables và data

## Lựa chọn Schema

### Option 1: Schema Đầy đủ (Khuyến nghị)
File: `database/schema.sql`

**Tính năng:**
- Tất cả tables cần thiết cho e-commerce
- Triggers tự động cập nhật timestamp khi order status thay đổi
- Stored procedure tự động confirm orders sau 30 phút
- Event scheduler chạy mỗi 5 phút để check auto-confirmation
- History tracking cho mọi thay đổi order status

**Cách chạy:**
```bash
mysql -u root -p < database/schema.sql
```

### Option 2: Schema Đơn giản 
File: `database/schema-simple.sql`

**Tính năng:**
- Chỉ tạo tables và insert sample data
- Không có triggers hoặc stored procedures
- Dễ dàng troubleshoot nếu có lỗi
- Phù hợp để test API endpoints

**Cách chạy:**
```bash
mysql -u root -p < database/schema-simple.sql
```

## Hướng dẫn chi tiết

### Bước 1: Kết nối MySQL
```bash
mysql -u root -p
```

### Bước 2: Tạo database (nếu dùng manual)
```sql
DROP DATABASE IF EXISTS uteshop;
CREATE DATABASE uteshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uteshop;
```

### Bước 3: Chọn file schema và chạy
```bash
# Chạy schema đầy đủ
mysql -u root -p < database/schema.sql

# HOẶC chạy schema đơn giản
mysql -u root -p < database/schema-simple.sql
```

### Bước 4: Verify Database
```sql
USE uteshop;
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
```

## Troubleshooting

### Lỗi Trigger (Error 1362)
Nếu gặp lỗi: "Updating of NEW row is not allowed in after trigger"

**Giải pháp:** Schema đã được fix với 2 triggers riêng biệt:
- `order_status_timestamp_trigger` (BEFORE UPDATE) - Cập nhật timestamps
- `order_status_history_trigger` (AFTER UPDATE) - Log history

### Lỗi Event Scheduler
Nếu events không chạy:
```sql
SET GLOBAL event_scheduler = ON;
SHOW PROCESSLIST; -- Check if event scheduler running
```

### Lỗi Permissions
Nếu không có quyền tạo triggers/events:
```sql
-- Sử dụng schema-simple.sql thay vì schema.sql
-- Hoặc grant permissions:
GRANT ALL PRIVILEGES ON uteshop.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Kiểm tra sau khi setup

### Check Tables
```sql
USE uteshop;
SHOW TABLES;

-- Expected tables:
-- users, otp_codes, categories, products, cart_items
-- orders, order_items, payments, order_status_history, cancel_requests
```

### Check Sample Data
```sql
SELECT name, price, sale_price FROM products LIMIT 5;
SELECT email, full_name FROM users;
SELECT id, status, total_amount FROM orders;
```

### Check Triggers (nếu dùng schema.sql)
```sql
SHOW TRIGGERS;
-- Expected: order_status_timestamp_trigger, order_status_history_trigger, set_auto_confirm_trigger
```

### Check Events (nếu dùng schema.sql)
```sql
SHOW EVENTS;
-- Expected: auto_confirm_orders
```

## Database Structure

### Core Tables
- `users` - User accounts và authentication
- `categories` - Product categories  
- `products` - Product catalog với pricing và stock
- `cart_items` - Shopping cart functionality

### Order Management
- `orders` - Main order records với enhanced status tracking
- `order_items` - Items trong mỗi order
- `payments` - Payment records với multiple methods
- `order_status_history` - Audit trail cho order changes

### Additional Features  
- `cancel_requests` - Order cancellation workflow
- `otp_codes` - Email verification và password reset

### Order Status Flow
```
new -> confirmed -> preparing -> shipping -> delivered
   \-> cancel_requested -> cancelled
```

### Payment Methods
- COD (Cash on Delivery) - Default
- E_WALLET (VNPay, MoMo, etc.)
- BANK_TRANSFER
- CREDIT_CARD

## Configuration Files

Đảm bảo config/database.js có thông tin đúng:
```javascript
module.exports = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'uteshop',
  charset: 'utf8mb4'
};
```

## Testing Database Connection

Chạy test file:
```bash
node test-db.js
```

Expected output:
```
Database connected successfully
Total products: 14
Total users: 3
Total orders: 3
```

Nếu thành công, API server sẽ có thể kết nối và sử dụng tất cả endpoints.