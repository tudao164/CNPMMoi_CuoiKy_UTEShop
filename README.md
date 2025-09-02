# UTEShop API - Tài liệu API đầy đủ

## Thông tin chung

**Base URL:** `http://localhost:3000`
**Authentication:** Bearer Token (JWT)
**Content-Type:** `application/json`

---

## 📋 Mục lục

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Product Endpoints](#product-endpoints)
4. [Order Endpoints](#order-endpoints)
5. [Utility Endpoints](#utility-endpoints)
6. [Cách sử dụng và Test](#cách-sử-dụng-và-test)
7. [Response Format](#response-format)
8. [Error Codes](#error-codes)

---

## 🔐 Authentication Endpoints

### 1. Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`
**Description:** Đăng ký tài khoản mới và gửi OTP xác thực qua email
**Rate Limit:** 5 requests/hour

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "full_name": "Nguyen Van A",
  "phone": "0123456789"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0123456789",
      "is_verified": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "message": "Vui lòng kiểm tra email để xác thực tài khoản"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Validation Rules:**
- `email`: Bắt buộc, định dạng email hợp lệ, tối đa 255 ký tự
- `password`: Bắt buộc, tối thiểu 8 ký tự, có chữ hoa, chữ thường, số
- `full_name`: Bắt buộc, 2-255 ký tự, chỉ chữ cái và khoảng trắng
- `phone`: Tùy chọn, 10-11 số

---

### 2. Xác thực OTP đăng ký

**Endpoint:** `POST /api/auth/verify-otp`
**Description:** Xác thực mã OTP để hoàn thành đăng ký
**Rate Limit:** 3 requests/10 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xác thực OTP thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0123456789",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Đăng nhập

**Endpoint:** `POST /api/auth/login`
**Description:** Đăng nhập và nhận JWT token
**Rate Limit:** 5 requests/15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0123456789",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 4. Quên mật khẩu

**Endpoint:** `POST /api/auth/forgot-password`
**Description:** Gửi OTP đặt lại mật khẩu qua email
**Rate Limit:** 3 requests/hour

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Nếu email tồn tại, mã OTP đã được gửi",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Đặt lại mật khẩu

**Endpoint:** `POST /api/auth/reset-password`
**Description:** Đặt lại mật khẩu bằng OTP
**Rate Limit:** 3 requests/hour

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "new_password": "NewPassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 6. Gửi lại OTP

**Endpoint:** `POST /api/auth/resend-otp`
**Description:** Gửi lại mã OTP
**Rate Limit:** 3 requests/5 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp_type": "register"
}
```

**OTP Types:**
- `register`: OTP xác thực đăng ký
- `reset_password`: OTP đặt lại mật khẩu

---

### 7. Kiểm tra trạng thái đăng nhập

**Endpoint:** `GET  `
**Description:** Kiểm tra token và lấy thông tin user hiện tại
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User is authenticated",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0123456789",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "is_authenticated": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 8. Đăng xuất

**Endpoint:** `POST /api/auth/logout`
**Description:** Đăng xuất (client phải xóa token)
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 👤 User Management Endpoints

### 1. Lấy thông tin profile

**Endpoint:** `GET /api/user/profile`
**Description:** Lấy thông tin chi tiết của user hiện tại
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Nguyen Van A",
      "phone": "0123456789",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Cập nhật profile

**Endpoint:** `PUT /api/user/profile`
**Description:** Cập nhật thông tin cá nhân
**Authentication:** Required

**Request Body:**
```json
{
  "full_name": "Nguyen Van B",
  "phone": "0987654321",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Nguyen Van B",
      "phone": "0987654321",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T01:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

---

### 3. Đổi mật khẩu

**Endpoint:** `POST /api/user/change-password`
**Description:** Đổi mật khẩu khi đã đăng nhập
**Authentication:** Required

**Request Body:**
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewPassword123",
  "confirm_password": "NewPassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 4. Thống kê cá nhân

**Endpoint:** `GET /api/user/stats`
**Description:** Lấy thống kê tài khoản cá nhân
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved",
  "data": {
    "account_created": "2024-01-01T00:00:00.000Z",
    "is_verified": true,
    "total_otp_requests": 3,
    "used_otps": 2,
    "expired_otps": 1,
    "last_otp_time": "2024-01-01T00:30:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Lịch sử OTP

**Endpoint:** `GET /api/user/otps?limit=10`
**Description:** Lấy lịch sử OTP gần đây
**Authentication:** Required

**Query Parameters:**
- `limit`: Số lượng OTP muốn lấy (default: 10)

**Response Success (200):**
```json
{
  "success": true,
  "message": "User OTPs retrieved",
  "data": {
    "otps": [
      {
        "id": 1,
        "otp_type": "register",
        "is_used": true,
        "expires_at": "2024-01-01T00:05:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z",
        "is_expired": false,
        "time_until_expiration": 0
      }
    ],
    "total": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 6. Xóa tài khoản

**Endpoint:** `DELETE /api/user/account`
**Description:** Xóa tài khoản vĩnh viễn (cần xác nhận mật khẩu)
**Authentication:** Required

**Request Body:**
```json
{
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Tài khoản đã được xóa thành công",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## �️ Product Endpoints

### 1. Lấy dữ liệu trang chủ

**Endpoint:** `GET /api/products/home`
**Description:** Lấy tất cả dữ liệu cho trang chủ: 8 sản phẩm mới nhất, 6 sản phẩm bán chạy, 8 sản phẩm được xem nhiều, 4 sản phẩm khuyến mãi cao nhất

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "latest_products": [...],
    "best_selling_products": [...],
    "most_viewed_products": [...],
    "highest_discount_products": [...],
    "categories": [...]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Lấy tất cả sản phẩm

**Endpoint:** `GET /api/products`
**Description:** Lấy danh sách sản phẩm với phân trang và bộ lọc

**Query Parameters:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số sản phẩm trên trang (mặc định: 12, tối đa: 100)
- `category_id`: Lọc theo danh mục
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `search`: Từ khóa tìm kiếm
- `sort_by`: Sắp xếp (price_asc, price_desc, name, popularity, best_selling, newest)
- `on_sale`: Chỉ lấy sản phẩm khuyến mãi (true/false)
- `in_stock`: Chỉ lấy sản phẩm còn hàng (true/false)

**Response Success (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

✅ GET /api/products/latest - Sản phẩm mới nhất
✅ GET /api/products/best-selling - Sản phẩm bán chạy
✅ GET /api/products/most-viewed - Sản phẩm được xem nhiều
✅ GET /api/products/highest-discount - Sản phẩm khuyến mãi cao

```

---

### 3. Lấy chi tiết sản phẩm

**Endpoint:** `GET /api/products/1`
**Description:** Lấy thông tin chi tiết sản phẩm và tự động tăng lượt xem

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "...",
      "price": 999.99,
      "sale_price": 899.99,
      "discount_percentage": 10.00,
      "effective_price": 899.99,
      "savings_amount": 100.00,
      "stock_quantity": 50,
      "stock_status": "in_stock",
      "category_id": 1,
      "category_name": "Electronics",
      "image_url": "/images/iphone15pro.jpg",
      "images": ["image1.jpg", "image2.jpg"],
      "specifications": {...},
      "view_count": 1250,
      "sold_count": 45,
      "is_featured": true,
      "is_on_sale": true,
      "is_in_stock": true
    },
    "related_products": [...],
    "category": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 4. Tìm kiếm sản phẩm

**Endpoint:** `GET /api/products/search`
**Description:** Tìm kiếm sản phẩm theo từ khóa trong tên và mô tả sản phẩm

**Query Parameters:**
- `q`: Từ khóa tìm kiếm (bắt buộc, tối thiểu 1 ký tự)
- `page`: Số trang (mặc định: 1)
- `limit`: Số sản phẩm trên trang (mặc định: 12, tối đa: 100)

**Examples:**
```bash
# Tìm kiếm cơ bản
GET /api/products/search?q=iPhone

# Tìm kiếm với phân trang
GET /api/products/search?q=iPhone&page=2&limit=20

# Tìm kiếm nhiều từ khóa
GET /api/products/search?q=iPhone%2015%20Pro
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Tìm thấy 15 sản phẩm",
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "sale_price": 899.99,
      "discount_percentage": 10.00,
      "effective_price": 899.99,
      "savings_amount": 100.00,
      "stock_quantity": 50,
      "stock_status": "in_stock",
      "category_id": 1,
      "category_name": "Electronics",
      "image_url": "/images/iphone15pro.jpg",
      "images": ["image1.jpg", "image2.jpg"],
      "specifications": {
        "storage": "256GB",
        "color": "Natural Titanium"
      },
      "view_count": 1250,
      "sold_count": 45,
      "is_featured": true,
      "is_on_sale": true,
      "is_in_stock": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 15,
    "totalPages": 2
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Từ khóa tìm kiếm không được để trống",
  "errors": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Lấy sản phẩm theo danh mục

**Endpoint:** `GET /api/products/categories/categoryId(VD:1)/products`
**Description:** Lấy danh sách sản phẩm trong danh mục

---

### 6. Lấy danh sách danh mục

**Endpoint:** `GET /api/products/categories`
**Description:** Lấy tất cả danh mục sản phẩm

---

### 7. Lấy sản phẩm liên quan

**Endpoint:** `GET /api/products/id(VD:1)/related`
**Description:** Lấy sản phẩm liên quan (cùng danh mục)

---

## 📦 Order Endpoints

### 1. Tạo đơn hàng mới

**Endpoint:** `POST /api/orders`
**Description:** Tạo đơn hàng mới
**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Giao hàng buổi chiều"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "user_id": 1,
      "total_amount": 1799.98,
      "status": "pending",
      "status_text": "Chờ xác nhận",
      "shipping_address": "...",
      "notes": "...",
      "items": [...],
      "total_items": 2
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Lấy đơn hàng của tôi

**Endpoint:** `GET /api/orders`
**Description:** Lấy danh sách đơn hàng của người dùng hiện tại
**Authentication:** Required

**Query Parameters:**
- `page`: Số trang
- `limit`: Số đơn hàng trên trang

---

### 3. Lấy chi tiết đơn hàng

**Endpoint:** `GET /api/orders/:id`
**Description:** Lấy thông tin chi tiết đơn hàng
**Authentication:** Required

---

### 4. Hủy đơn hàng

**Endpoint:** `PATCH /api/orders/:id/cancel`
**Description:** Hủy đơn hàng (chỉ áp dụng cho đơn hàng đang chờ xác nhận)
**Authentication:** Required

---

### 5. Thống kê đơn hàng cá nhân

**Endpoint:** `GET /api/orders/stats`
**Description:** Lấy thống kê đơn hàng của người dùng
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_orders": 10,
      "pending_orders": 2,
      "confirmed_orders": 3,
      "shipping_orders": 1,
      "delivered_orders": 3,
      "cancelled_orders": 1,
      "total_spent": 5000000
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## �🛠 Utility Endpoints

### 1. Health Check

**Endpoint:** `GET /health`
**Description:** Kiểm tra trạng thái server

**Response Success (200):**
```json
{
  "success": true,
  "message": "UTEShop API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

---

### 2. API Documentation

**Endpoint:** `GET /api/docs`
**Description:** Lấy tài liệu API tóm tắt

---

### 3. Root Endpoint

**Endpoint:** `GET /`
**Description:** Thông tin chào mừng và các endpoint chính

---

## 🚀 Cách sử dụng và Test

### 1. Sử dụng cURL

#### Đăng ký tài khoản:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "full_name": "Test User",
    "phone": "0123456789"
  }'
```

#### Xác thực OTP:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456"
  }'
```

#### Đăng nhập:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

#### Lấy profile (với token):
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Sử dụng Postman

#### Setup Environment:
- Tạo environment với variable `baseUrl` = `http://localhost:3000`
- Tạo variable `token` để lưu JWT token

#### Collection Structure:
1. **Auth Folder:**
   - POST {{baseUrl}}/api/auth/register
   - POST {{baseUrl}}/api/auth/verify-otp
   - POST {{baseUrl}}/api/auth/login
   - POST {{baseUrl}}/api/auth/forgot-password
   - POST {{baseUrl}}/api/auth/reset-password
   - GET {{baseUrl}}/api/auth/me

2. **User Folder:**
   - GET {{baseUrl}}/api/user/profile
   - PUT {{baseUrl}}/api/user/profile
   - POST {{baseUrl}}/api/user/change-password

#### Auto-save Token:
Thêm script vào tab "Tests" của login request:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

#### Authorization Header:
Trong các request cần authentication, thêm header:
```
Authorization: Bearer {{token}}
```

### 3. Test Flow hoàn chỉnh

1. **Đăng ký → Xác thực OTP → Đăng nhập:**
```bash
# 1. Đăng ký
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","full_name":"Test User"}'

# 2. Kiểm tra email nhận OTP (hoặc xem console log)

# 3. Xác thực OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp_code":"123456"}'

# 4. Lưu token từ response và sử dụng cho các request tiếp theo
```

2. **Quên mật khẩu → Đặt lại mật khẩu:**
```bash
# 1. Yêu cầu OTP đặt lại mật khẩu
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Đặt lại mật khẩu với OTP
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp_code":"123456","new_password":"NewPassword123"}'
```

---

## 📝 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Thông điệp thành công",
  "data": { /* Dữ liệu trả về */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Thông điệp lỗi",
  "errors": { /* Chi tiết lỗi nếu có */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Validation Error Response:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ⚠️ Error Codes

| HTTP Code | Meaning | Description |
|-----------|---------|-------------|
| 200 | OK | Thành công |
| 201 | Created | Tạo mới thành công |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Không có quyền truy cập |
| 403 | Forbidden | Bị cấm truy cập |
| 404 | Not Found | Không tìm thấy |
| 409 | Conflict | Xung đột dữ liệu |
| 422 | Unprocessable Entity | Lỗi validation |
| 429 | Too Many Requests | Quá giới hạn request |
| 500 | Internal Server Error | Lỗi server |

---

## 🔒 Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| General API | 100 requests | 15 minutes |
| Authentication | 10 requests | 15 minutes |
| Registration | 5 requests | 1 hour |
| Login | 5 requests | 15 minutes |
| OTP Requests | 3 requests | 5 minutes |
| Password Reset | 3 requests | 1 hour |

---

## 📧 Email Templates

API tự động gửi email cho:
- **Đăng ký:** OTP xác thực tài khoản
- **Quên mật khẩu:** OTP đặt lại mật khẩu  
- **Chào mừng:** Email sau khi xác thực thành công

---

## 🛡️ Security Features

- **JWT Authentication:** Bảo mật với JWT token
- **Password Hashing:** Mã hóa mật khẩu bằng bcrypt
- **Rate Limiting:** Giới hạn số request để chống spam
- **Input Validation:** Kiểm tra và làm sạch dữ liệu đầu vào
- **CORS Protection:** Bảo vệ cross-origin requests
- **Helmet Security:** HTTP security headers
- **OTP Expiration:** OTP tự động hết hạn sau 5 phút

---

## 📱 Frontend Integration

### React.js Example:

```javascript
// API Service
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.token = localStorage.getItem('token');
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('token', this.token);
    }
    return data;
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }
}
```

---

**🎉 Chúc bạn phát triển thành công với UTEShop API!**
