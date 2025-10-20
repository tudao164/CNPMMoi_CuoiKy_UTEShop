# 🔐 Admin API Documentation - UTEShop

## Tổng Quan

Hệ thống Admin API cho phép quản trị viên quản lý toàn bộ hệ thống bao gồm: Sản phẩm, Người dùng, và Đơn hàng.

### Yêu Cầu
- **Authentication**: Bearer Token (JWT)
- **Authorization**: User phải có `is_admin = TRUE`
- **Header**: `Authorization: Bearer <your_jwt_token>`

### Login Admin

**Endpoint:** `POST /api/auth/login`

```json
{
    "email": "admin@uteshop.com",
    "password": "admin123"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "email": "admin@uteshop.com",
            "full_name": "Admin User",
            "is_admin": true,
            "is_verified": true
        }
    }
}
```

---

## 📦 Quản Lý Sản Phẩm (Admin Product Management)

### 1. Lấy Tất Cả Sản Phẩm (Bao Gồm Inactive)

**Endpoint:** `GET /api/admin/products`

**Query Parameters:**
- `page` (number): Số trang (default: 1)
- `limit` (number): Số sản phẩm/trang (default: 20)
- `category_id` (number): Lọc theo danh mục
- `search` (string): Tìm kiếm theo tên/mô tả
- `is_active` (boolean): Lọc theo trạng thái (true/false)
- `stock_status` (string): Lọc theo tồn kho (out_of_stock, low_stock, in_stock)

**Example:**
```
GET /api/admin/products?page=1&limit=20&is_active=true&stock_status=low_stock
```

---

### 2. Thống Kê Sản Phẩm

**Endpoint:** `GET /api/admin/products/stats`

**Response:**
```json
{
    "success": true,
    "data": {
        "stats": {
            "total_products": 50,
            "active_products": 45,
            "inactive_products": 5,
            "out_of_stock": 3,
            "low_stock": 7,
            "in_stock": 35,
            "on_sale": 12,
            "total_sold": 1250,
            "total_views": 45678
        }
    }
}
```

---

### 3. Tạo Sản Phẩm Mới


**Trước khi tạo sản phẩm mới, có thể thêm bước upload hình ảnh lên server qua endpoint `/api/admin/uploads` để lấy URL hình ảnh.**
**Endpoint:** POST http://localhost:3000/api/upload/single
**Headers:**
Authorization: Bearer <your_admin_token>
Content-Type: multipart/form-data
Key: image
Type: File
Value: Chọn file hình ảnh từ máy tính
Description: Upload hình ảnh sản phẩm

Return
```json
{
    "success": true,
    "message": "Upload ảnh thành công",
    "data": {
        "image_url": "/images/59_3_185007f6d7a04bc48c27427464a1a906_master-1760974240718-223872938.jpg",
        "filename": "59_3_185007f6d7a04bc48c27427464a1a906_master-1760974240718-223872938.jpg",
        "size": 341257,
        "mimetype": "image/jpeg"
    },
    "timestamp": "2025-10-20T15:30:40.724Z"
}
```

Sau khi upload như trên hình xong có thể vào http://localhost:3000/images/59_3_185007f6d7a04bc48c27427464a1a906_master-1760974240718-223872938.jpg
Để xem ảnh đã upload thành công.

**Endpoint:** `POST /api/admin/products`

Tạo sản phẩm với link ảnh như ở trên đã làm
**Request Body:**
```json
{
    "name": "iPhone 16 Pro Max",
    "description": "Latest iPhone with A18 chip",
    "price": 1299.99,
    "sale_price": 1199.99,
    "stock_quantity": 100,
    "category_id": 1,
    "image_url": "/images/59_3_185007f6d7a04bc48c27427464a1a906_master-1760974240718-223872938.jpg",
    "images": ["/images/59_3_185007f6d7a04bc48c27427464a1a906_master-1760974240718-223872938.jpg"],
    "specifications": {
        "screen": "6.7 inch",
        "chip": "A18 Pro",
        "camera": "48MP"
    },
    "is_featured": true
}
```

---

### 4. Cập Nhật Sản Phẩm

**Endpoint:** `PUT /api/admin/products/:id`

**Request Body:** (Tất cả fields đều optional)
```json
{
    "name": "iPhone 16 Pro Max - Updated",
    "price": 1249.99,
    "stock_quantity": 150,
    "is_active": true
}
```

---

### 5. Xóa Sản Phẩm (Soft Delete)

**Endpoint:** `DELETE /api/admin/products/:id`

*Sản phẩm sẽ được đánh dấu `is_active = FALSE` thay vì xóa vĩnh viễn*

---

### 6. Kích Hoạt Sản Phẩm

**Endpoint:** `PATCH /api/admin/products/:id/activate`

*Đặt lại `is_active = TRUE` cho sản phẩm đã bị xóa*

---

### 7. Cập Nhật Tồn Kho

**Endpoint:** `PATCH /api/admin/products/:id/stock`

**Request Body:**
```json
{
    "stock_quantity": 200
}
```

---

## 👥 Quản Lý Người Dùng (Admin User Management)

### 1. Lấy Tất Cả Người Dùng

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**
- `page` (number): Số trang
- `limit` (number): Số users/trang
- `search` (string): Tìm theo email hoặc tên

**Example:**
```
GET /api/admin/users?page=1&limit=20&search=nguyen
```

---

### 2. Thống Kê Người Dùng

**Endpoint:** `GET /api/admin/users/stats`

**Response:**
```json
{
    "success": true,
    "data": {
        "stats": {
            "total_users": 1500,
            "verified_users": 1350,
            "new_users_30d": 120,
            "new_users_7d": 25,
            "admin_count": 3,
            "users_today": 5
        }
    }
}
```

---

### 3. Xem Chi Tiết Người Dùng

**Endpoint:** `GET /api/admin/users/:id`

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 2,
            "email": "user@example.com",
            "full_name": "Nguyen Van A",
            "phone": "0987654321",
            "is_admin": false,
            "is_verified": true
        },
        "stats": {
            "total_orders": 15,
            "total_spent": 5000000,
            "last_order_date": "2024-01-15T10:30:00.000Z"
        }
    }
}
```

---

### 4. Tạo Người Dùng Mới

**Endpoint:** `POST /api/admin/users`

**Request Body:**
```json
{
    "email": "newuser@example.com",
    "password": "password123",
    "full_name": "Tran Van B",
    "phone": "0901234567",
    "is_admin": false,
    "is_verified": true
}
```

---

### 5. Cập Nhật Người Dùng

**Endpoint:** `PUT /api/admin/users/:id`

**Request Body:**
```json
{
    "full_name": "Tran Van B Updated",
    "phone": "0912345678",
    "is_verified": true,
    "is_admin": false
}
```

---

### 6. Xóa Người Dùng

**Endpoint:** `DELETE /api/admin/users/:id`

**Lưu ý:**
- Không thể xóa chính mình
- Không thể xóa user có đơn hàng

---

### 7. Đặt Lại Mật Khẩu

**Endpoint:** `PATCH /api/admin/users/:id/password`

**Request Body:**
```json
{
    "new_password": "newpassword123"
}
```

---

### 8. Bật/Tắt Quyền Admin

**Endpoint:** `PATCH /api/admin/users/:id/toggle-admin`

*Không cần body, tự động toggle is_admin giữa TRUE/FALSE*

**Lưu ý:**
- Admin không thể toggle quyền của chính mình

---

## 📦 Quản Lý Đơn Hàng (Admin Order Management)

### 1. Lấy Tất Cả Đơn Hàng

**Endpoint:** `GET /api/admin/orders`

**Query Parameters:**
- `page`, `limit`: Phân trang
- `status`: Lọc theo trạng thái (new, confirmed, preparing, shipping, delivered, cancelled)
- `payment_method`: Lọc theo phương thức thanh toán (COD, E_WALLET)
- `payment_status`: Lọc theo trạng thái thanh toán (pending, paid, failed, refunded)
- `user_id`: Lọc theo người dùng
- `date_from`, `date_to`: Lọc theo ngày (YYYY-MM-DD)

**Example:**
```
GET /api/admin/orders?status=new&payment_method=COD&date_from=2024-01-01&date_to=2024-01-31
```

---

### 2. Thống Kê Đơn Hàng

**Endpoint:** `GET /api/admin/orders/stats`

**Query Parameters:**
- `date_from`, `date_to`: Khoảng thời gian thống kê

**Response:**
```json
{
    "success": true,
    "data": {
        "stats": {
            "total_orders": 1000,
            "new_orders": 50,
            "confirmed_orders": 100,
            "preparing_orders": 80,
            "shipping_orders": 120,
            "delivered_orders": 600,
            "cancelled_orders": 50,
            "cancel_requested_orders": 5,
            "total_revenue": 500000000,
            "completed_revenue": 450000000,
            "average_order_value": 500000,
            "orders_today": 25,
            "revenue_today": 12500000,
            "payment_breakdown": [
                {
                    "payment_method": "COD",
                    "count": 600,
                    "total_amount": 300000000
                },
                {
                    "payment_method": "E_WALLET",
                    "count": 400,
                    "total_amount": 200000000
                }
            ]
        }
    }
}
```

---

### 3. Xem Chi Tiết Đơn Hàng

**Endpoint:** `GET /api/admin/orders/:id`

**Response:**
```json
{
    "success": true,
    "data": {
        "order": {
            "id": 1,
            "user_id": 2,
            "user_email": "user@example.com",
            "user_name": "Nguyen Van A",
            "total_amount": 1799.98,
            "status": "confirmed",
            "payment_method": "COD",
            "payment_status": "pending",
            "shipping_address": "123 ABC Street"
        },
        "items": [
            {
                "id": 1,
                "product_id": 1,
                "product_name": "iPhone 15 Pro",
                "quantity": 2,
                "price": 899.99
            }
        ],
        "history": [
            {
                "id": 1,
                "status": "new",
                "notes": "Đơn hàng được tạo",
                "changed_by_name": null,
                "created_at": "2024-01-01T10:00:00.000Z"
            },
            {
                "id": 2,
                "status": "confirmed",
                "notes": "Tự động xác nhận",
                "changed_by_name": "System",
                "created_at": "2024-01-01T10:30:00.000Z"
            }
        ]
    }
}
```

---

### 4. Cập Nhật Trạng Thái Đơn Hàng

**Endpoint:** `PATCH /api/admin/orders/:id/status`

**Request Body:**
```json
{
    "status": "shipping",
    "notes": "Đơn hàng đang được giao đến địa chỉ"
}
```

**Valid Status Transitions:**
- `new` → `confirmed`, `cancelled`
- `confirmed` → `preparing`, `cancelled`
- `preparing` → `shipping`, `cancelled`
- `shipping` → `delivered`, `cancelled`
- `delivered` → (final state)
- `cancelled` → (final state)
- `cancel_requested` → `cancelled`, `confirmed`

---

### 5. Xuất Dữ Liệu Đơn Hàng

**Endpoint:** `GET /api/admin/orders/export`

**Query Parameters:**
- `date_from`, `date_to`: Khoảng thời gian
- `status`: Lọc theo trạng thái

**Response:** JSON array của tất cả đơn hàng phù hợp

---

### 6. Xóa Đơn Hàng (Chỉ Cancelled Orders)

**Endpoint:** `DELETE /api/admin/orders/:id`

**Lưu ý:** Chỉ có thể xóa đơn hàng đã hủy

---

## 🚫 Quản Lý Yêu Cầu Hủy Đơn (Admin-only Endpoints)

### 1. Lấy Danh Sách Yêu Cầu Chờ Xử Lý

**Endpoint:** `GET /api/cancel-requests/admin/pending`

**Query Parameters:**
- `page`, `limit`: Phân trang

---

### 2. Thống Kê Yêu Cầu Hủy Đơn (Toàn Hệ Thống)

**Endpoint:** `GET /api/cancel-requests/admin/stats`

**Query Parameters:**
- `start_date`, `end_date`: Khoảng thời gian

---

### 3. Xử Lý Yêu Cầu Hủy Đơn

**Endpoint:** `POST /api/cancel-requests/:id/process`

**Request Body:**
```json
{
    "status": "approved",
    "admin_response": "Chấp thuận yêu cầu hủy đơn vì lý do hợp lý"
}
```

**Status values:** `approved` hoặc `rejected`

---

## 🔒 Error Responses

### Không Có Token
```json
{
    "success": false,
    "message": "Token không được cung cấp",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Không Phải Admin
```json
{
    "success": false,
    "message": "Chỉ admin mới có thể truy cập chức năng này",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Token Hết Hạn
```json
{
    "success": false,
    "message": "Token đã hết hạn",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📝 Notes

1. **Tất cả Admin endpoints đều yêu cầu:**
   - JWT Token hợp lệ
   - User phải có `is_admin = TRUE`

2. **Rate Limiting:** 
   - 100 requests / 15 phút cho mỗi IP

3. **Pagination:**
   - Default: `page=1`, `limit=20`
   - Max limit: 100

4. **Date Format:**
   - ISO 8601: `YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm:ss.sssZ`

5. **Admin Safety:**
   - Admin không thể xóa chính mình
   - Admin không thể thu hồi quyền admin của chính mình

---

## 🎯 Quick Start

### 1. Cập nhật database (nếu chưa có is_admin column)
```bash
node update-database.js
```

### 2. Tạo/Reset admin password
```bash
node create-admin.js
```

### 3. Login as Admin
```bash
POST /api/auth/login
{
    "email": "admin@uteshop.com",
    "password": "admin123"
}
```

### 4. Sử dụng token trong các request tiếp theo
```
Authorization: Bearer <your_token_from_login>
```

---

## 📧 Support

Nếu có vấn đề, vui lòng liên hệ dev team.
