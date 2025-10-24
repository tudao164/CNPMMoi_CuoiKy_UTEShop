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
4. [Cart Endpoints](#cart-endpoints)
5. [Payment Endpoints](#payment-endpoints)
6. [Order Endpoints](#order-endpoints)
7. [Cancel Request Endpoints](#cancel-request-endpoints)
8. [Utility Endpoints](#utility-endpoints)
9. [Cách sử dụng và Test](#cách-sử-dụng-và-test)
10. [Response Format](#response-format)
11. [Error Codes](#error-codes)

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

## � Cart Endpoints

### 1. Lấy giỏ hàng

**Endpoint:** `GET /api/cart`
**Description:** Lấy toàn bộ giỏ hàng của user hiện tại
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "iPhone 15 Pro",
        "product_image": "/images/iphone15pro.jpg",
        "category_name": "Electronics",
        "quantity": 2,
        "price": 999.99,
        "sale_price": 899.99,
        "effective_price": 899.99,
        "total_price": 1799.98,
        "discount_amount": 200.00,
        "stock_quantity": 50,
        "is_available": true,
        "added_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:30:00.000Z"
      }
    ],
    "summary": {
      "total_items": 1,
      "total_quantity": 2,
      "total_amount": 1799.98,
      "original_amount": 1999.98,
      "total_savings": 200.00
    },
    "validation": {
      "is_valid": true,
      "invalid_items": []
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Thêm sản phẩm vào giỏ hàng

**Endpoint:** `POST /api/cart/add`
**Description:** Thêm sản phẩm vào giỏ hàng hoặc tăng số lượng nếu đã có
**Authentication:** Required

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Thêm sản phẩm vào giỏ hàng thành công",
  "data": {
    "item": {
      "id": 1,
      "product_id": 1,
      "product_name": "iPhone 15 Pro",
      "quantity": 2,
      "effective_price": 899.99,
      "total_price": 1799.98,
      "is_available": true
    },
    "summary": {
      "total_items": 1,
      "total_quantity": 2,
      "total_amount": 1799.98
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Cập nhật số lượng sản phẩm

**Endpoint:** `PUT /api/cart/:id`
**Description:** Cập nhật số lượng sản phẩm trong giỏ hàng (quantity = 0 sẽ xóa)
**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật số lượng thành công",
  "data": {
    "item": {
      "id": 1,
      "quantity": 3,
      "total_price": 2699.97
    },
    "summary": {
      "total_quantity": 3,
      "total_amount": 2699.97
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 4. Xóa sản phẩm khỏi giỏ hàng

**Endpoint:** `DELETE /api/cart/:id`
**Description:** Xóa sản phẩm khỏi giỏ hàng
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi giỏ hàng",
  "data": {
    "summary": {
      "total_items": 0,
      "total_quantity": 0,
      "total_amount": 0
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Xóa toàn bộ giỏ hàng

**Endpoint:** `DELETE /api/cart`
**Description:** Xóa tất cả sản phẩm trong giỏ hàng
**Authentication:** Required

---

### 6. Lấy tóm tắt giỏ hàng

**Endpoint:** `GET /api/cart/summary`
**Description:** Lấy thông tin tóm tắt giỏ hàng (số lượng, tổng tiền)
**Authentication:** Required

---

### 7. Kiểm tra tính hợp lệ giỏ hàng

**Endpoint:** `GET /api/cart/validate`
**Description:** Kiểm tra tính sẵn có của các sản phẩm trong giỏ hàng
**Authentication:** Required

---

### 8. Thêm nhiều sản phẩm cùng lúc

**Endpoint:** `POST /api/cart/bulk-add`
**Description:** Thêm nhiều sản phẩm vào giỏ hàng cùng lúc
**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 2, "quantity": 1},
    {"product_id": 3, "quantity": 3}
  ]
}
```

---

### 9. Đồng bộ giỏ hàng

**Endpoint:** `POST /api/cart/sync`
**Description:** Đồng bộ giỏ hàng từ client (thay thế toàn bộ giỏ hàng hiện tại)
**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 2, "quantity": 1}
  ]
}
```

---

## 💳 Payment Endpoints

### 1. Lấy phương thức thanh toán

**Endpoint:** `GET /api/payments/methods`
**Description:** Lấy danh sách phương thức thanh toán có sẵn
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách phương thức thanh toán thành công",
  "data": {
    "methods": [
      {
        "code": "COD",
        "name": "Thanh toán khi nhận hàng",
        "description": "Thanh toán bằng tiền mặt khi nhận hàng",
        "is_available": true,
        "icon": "cash",
        "fees": 0
      },
      {
        "code": "E_WALLET",
        "name": "Ví điện tử",
        "description": "Thanh toán qua ví điện tử (MoMo, ZaloPay, v.v.)",
        "is_available": true,
        "icon": "wallet",
        "fees": 0
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Tạo thanh toán cho đơn hàng

**Endpoint:** `POST /api/payments/create`
**Description:** Tạo thông tin thanh toán cho đơn hàng đã tồn tại (dùng khi cần tạo payment riêng biệt)
**Authentication:** Required

**💡 Use Case:**
- Đơn hàng đã tồn tại nhưng chưa có thanh toán
- Đổi phương thức thanh toán 
- Tạo thanh toán cho đơn hàng từ admin
- **Khác với `/api/orders/from-cart`:** Endpoint này chỉ tạo Payment record, không tạo Order

**Request Body (COD):**
```json
{
  "order_id": 1,
  "payment_method": "COD",
  "notes": "Thanh toán khi nhận hàng"
}
```

**Request Body (E_WALLET):**
```json
{
  "order_id": 1,
  "payment_method": "E_WALLET",
  "notes": "Thanh toán qua ví điện tử MoMo"
}
```

**Request Body (BANK_TRANSFER):**
```json
{
  "order_id": 1,
  "payment_method": "BANK_TRANSFER",
  "notes": "Chuyển khoản ngân hàng"
}
```

**Request Body (CREDIT_CARD):**
```json
{
  "order_id": 1,
  "payment_method": "CREDIT_CARD",
  "notes": "Thanh toán bằng thẻ tín dụng"
}
```
  "notes": "Thanh toán qua ví điện tử MoMo"
}


**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo thông tin thanh toán thành công",
  "data": {
    "payment": {
      "id": 1,
      "order_id": 1,
      "payment_method": "COD",
      "payment_method_text": "Thanh toán khi nhận hàng",
      "payment_status": "pending",
      "payment_status_text": "Đang chờ",
      "amount": 1799.98,
      "transaction_id": null,
      "notes": "Thanh toán khi nhận hàng",
      "created_at": "2024-01-01T00:00:00.000Z",
      "is_editable": true,
      "is_cancellable": true,
      "is_refundable": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Lấy danh sách thanh toán

**Endpoint:** `GET /api/payments`
**Description:** Lấy danh sách thanh toán của user hiện tại
**Authentication:** Required

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số thanh toán trên trang (default: 10)
- `status`: Lọc theo trạng thái (pending, completed, failed, cancelled, refunded)
- `method`: Lọc theo phương thức (COD, E_WALLET)

---

### 4. Lấy thanh toán theo đơn hàng

**Endpoint:** `GET /api/payments/order/:orderId`
**Description:** Lấy thông tin thanh toán theo đơn hàng
**Authentication:** Required

---

### 5. Xử lý thanh toán COD

**Endpoint:** `POST /api/payments/:id/process-cod`
**Description:** Xử lý thanh toán COD (khi giao hàng thành công)
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xử lý thanh toán COD thành công",
  "data": {
    "payment": {
      "id": 1,
      "payment_status": "completed",
      "payment_status_text": "Hoàn thành",
      "paid_at": "2024-01-01T10:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

### 6. Xử lý thanh toán ví điện tử

**Endpoint:** `POST /api/payments/:id/process-ewallet`
**Description:** Xử lý thanh toán qua ví điện tử
**Authentication:** Required

**Request Body:**
```json
{
  "transaction_id": "TXN_123456789",
  "gateway_response": {
    "status": "success",
    "message": "Payment completed"
  },
  "status": "completed"
}
```

---

### 7. Hủy thanh toán

**Endpoint:** `PUT /api/payments/:id/cancel`
**Description:** Hủy thanh toán
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Khách hàng hủy đơn hàng"
}
```

---

### 8. Hoàn tiền (Admin only)

**Endpoint:** `POST /api/payments/:id/refund`
**Description:** Hoàn tiền cho thanh toán (chỉ admin)
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "refund_amount": 1799.98,
  "refund_reason": "Sản phẩm lỗi, hoàn tiền toàn bộ",
  "refund_transaction_id": "REFUND_123456789"
}
```

---

### 9. Thống kê thanh toán

**Endpoint:** `GET /api/payments/stats`
**Description:** Lấy thống kê thanh toán của user
**Authentication:** Required

**Query Parameters:**
- `start_date`: Ngày bắt đầu (YYYY-MM-DD)
- `end_date`: Ngày kết thúc (YYYY-MM-DD)

---

### 10. Webhook thanh toán

**Endpoint:** `POST /api/payments/webhook`
**Description:** Webhook cho các gateway thanh toán bên ngoài
**Authentication:** Public (with signature verification)

**Request Body:**
```json
{
  "transaction_id": "TXN_123456789",
  "order_id": 1,
  "status": "completed",
  "amount": 1799.98,
  "gateway_response": {
    "gateway": "momo",
    "message": "Payment successful"
  }
}
```

---

## 📦 Order Endpoints

### 🔄 **Workflow Comparison: Orders vs Payments**

| Endpoint | Purpose | Creates | Use Case |
|----------|---------|---------|----------|
| `POST /api/orders/from-cart` | Tạo đơn hàng từ cart | Order + Payment | Checkout bình thường |
| `POST /api/payments/create` | Tạo payment cho order có sẵn | Payment only | Thanh toán riêng biệt |

**💡 Recommended Flow:**
```
Cart → /api/orders/from-cart → Order + Payment (1 step)
```

**⚡ Alternative Flow:**
```
/api/orders → Order → /api/payments/create → Payment (2 steps)
```

---

### 1. Tạo đơn hàng từ giỏ hàng

**Endpoint:** `POST /api/orders/from-cart`
**Description:** Tạo đơn hàng từ các sản phẩm trong giỏ hàng (bao gồm cả Payment record)
**Authentication:** Required

**💡 Workflow:** Cart Items → Order + Payment (tự động tạo cả 2)

**Request Body Options:**

**1. COD (Cash on Delivery):**
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Giao hàng buổi chiều",
  "payment_method": "COD"
}
```

**2. E_WALLET (Ví điện tử):**
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Thanh toán qua MoMo",
  "payment_method": "E_WALLET"
}
```

**3. BANK_TRANSFER (Chuyển khoản ngân hàng):**
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Chuyển khoản qua Vietcombank",
  "payment_method": "BANK_TRANSFER"
}
```

**4. CREDIT_CARD (Thẻ tín dụng):**
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Thanh toán bằng thẻ Visa",
  "payment_method": "CREDIT_CARD"
}
```

**💡 Available Payment Methods:**
- `COD` - Thanh toán khi nhận hàng (✅ Fully implemented)
- `E_WALLET` - Ví điện tử: MoMo, ZaloPay, VNPay (✅ Fully implemented)
- `BANK_TRANSFER` - Chuyển khoản ngân hàng (⚠️ Database ready, logic pending)
- `CREDIT_CARD` - Thẻ tín dụng (⚠️ Database ready, logic pending)

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "order": {
      "id": 1,
      "user_id": 1,
      "total_amount": 1799.98,
      "status": "new",
      "status_text": "Đơn hàng mới",
      "status_color": "blue",
      "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
      "notes": "Giao hàng buổi chiều",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "iPhone 15 Pro",
          "quantity": 2,
          "price": 899.99
        }
      ],
      "total_items": 2,
      "can_be_cancelled_by_user": true,
      "can_be_cancelled_immediately": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "payment": {
      "id": 1,
      "payment_method": "COD",
      "payment_status": "pending",
      "amount": 1799.98
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Theo dõi đơn hàng

**Endpoint:** `GET /api/orders/:id/tracking`
**Description:** Lấy lịch sử theo dõi trạng thái đơn hàng
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin theo dõi đơn hàng thành công",
  "data": {
    "order": {
      "id": 1,
      "status": "shipping",
      "status_text": "Đang giao hàng",
      "total_amount": 1799.98,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "tracking": [
      {
        "id": 1,
        "status": "new",
        "status_text": "Đơn hàng mới",
        "status_color": "blue",
        "notes": "Đơn hàng được tạo",
        "changed_by_name": null,
        "actor_name": "Hệ thống",
        "changed_at": "2024-01-01T00:00:00.000Z",
        "time_elapsed": "2 giờ trước"
      },
      {
        "id": 2,
        "status": "confirmed",
        "status_text": "Đã xác nhận",
        "status_color": "green",
        "notes": "Tự động xác nhận sau 30 phút",
        "changed_by_name": null,
        "actor_name": "Hệ thống",
        "changed_at": "2024-01-01T00:30:00.000Z",
        "time_elapsed": "1.5 giờ trước"
      },
      {
        "id": 3,
        "status": "preparing",
        "status_text": "Đang chuẩn bị",
        "status_color": "yellow",
        "notes": "Shop đang chuẩn bị hàng",
        "changed_by_name": "Admin User",
        "actor_name": "Admin User",
        "changed_at": "2024-01-01T01:00:00.000Z",
        "time_elapsed": "1 giờ trước"
      },
      {
        "id": 4,
        "status": "shipping",
        "status_text": "Đang giao hàng",
        "status_color": "purple",
        "notes": "Đơn hàng đang được giao đến địa chỉ",
        "changed_by_name": "Admin User",
        "actor_name": "Admin User",
        "changed_at": "2024-01-01T01:30:00.000Z",
        "time_elapsed": "30 phút trước"
      }
    ]
  },
  "timestamp": "2024-01-01T02:00:00.000Z"
}
```

---

### 3. Cập nhật trạng thái đơn hàng (Admin)

**Endpoint:** `PUT /api/orders/:id/status`
**Description:** Cập nhật trạng thái đơn hàng (chỉ admin)
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "status": "shipping",
  "notes": "Đơn hàng đang được giao đến địa chỉ"
}
```

**Valid Status Transitions:**
- `new` → `confirmed`, `cancelled`, `cancel_requested`
- `confirmed` → `preparing`, `cancelled`, `cancel_requested`
- `preparing` → `shipping`, `cancelled`
- `shipping` → `delivered`, `cancelled`
- `delivered` → (final state)
- `cancelled` → (final state)
- `cancel_requested` → `cancelled`, `confirmed`

---

### 4. Lấy đơn hàng với bộ lọc

**Endpoint:** `GET /api/orders`
**Description:** Lấy danh sách đơn hàng với bộ lọc nâng cao
**Authentication:** Required

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số đơn hàng trên trang (default: 10)
- `status`: Lọc theo trạng thái (new, confirmed, preparing, shipping, delivered, cancelled, cancel_requested)
- `order_by`: Sắp xếp theo (created_at, updated_at, total_amount)
- `order_dir`: Chiều sắp xếp (ASC, DESC)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": {
    "orders": [
      {
        "id": 1,
        "status": "shipping",
        "status_text": "Đang giao hàng",
        "status_color": "purple",
        "total_amount": 1799.98,
        "total_items": 2,
        "can_be_cancelled_by_user": false,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 5,
      "total_pages": 1
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Thống kê đơn hàng nâng cao

**Endpoint:** `GET /api/orders/stats`
**Description:** Lấy thống kê chi tiết đơn hàng của user
**Authentication:** Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy thống kê đơn hàng thành công",
  "data": {
    "stats": {
      "total_orders": 10,
      "new_orders": 1,
      "confirmed_orders": 2,
      "preparing_orders": 1,
      "shipping_orders": 2,
      "delivered_orders": 3,
      "cancelled_orders": 1,
      "cancel_requested_orders": 0,
      "total_spent": 15000000
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚫 Cancel Request Endpoints

### 1. Tạo yêu cầu hủy đơn hàng

**Endpoint:** `POST /api/cancel-requests`
**Description:** Tạo yêu cầu hủy đơn hàng
**Authentication:** Required

**Request Body:**
```json
{
  "order_id": 1,
  "reason": "Tôi muốn đổi màu sản phẩm khác, vui lòng hủy đơn hàng này"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo yêu cầu hủy đơn thành công",
  "data": {
    "cancel_request": {
      "id": 1,
      "order_id": 1,
      "user_id": 1,
      "reason": "Tôi muốn đổi màu sản phẩm khác, vui lòng hủy đơn hàng này",
      "status": "approved",
      "status_text": "Đã chấp thuận",
      "status_color": "green",
      "admin_response": "Tự động chấp thuận - trong thời gian cho phép hủy",
      "created_at": "2024-01-01T00:10:00.000Z",
      "processed_at": "2024-01-01T00:10:00.000Z",
      "is_editable": false,
      "can_be_withdrawn": false,
      "is_urgent": true,
      "processing_time_hours": 0,
      "order_total_amount": 1799.98,
      "order_status": "cancelled"
    }
  },
  "timestamp": "2024-01-01T00:10:00.000Z"
}
```

**Business Logic:**
- Nếu đơn hàng có trạng thái `new` và trong vòng 30 phút: **Tự động chấp thuận**
- Nếu đơn hàng có trạng thái `confirmed` hoặc ngoài 30 phút: **Chờ admin xử lý**
- Chỉ có thể hủy đơn hàng ở trạng thái `new` hoặc `confirmed`

---

### 2. Lấy danh sách yêu cầu hủy đơn

**Endpoint:** `GET /api/cancel-requests`
**Description:** Lấy danh sách yêu cầu hủy đơn của user hiện tại
**Authentication:** Required

**Query Parameters:**
- `page`: Số trang (default: 1)
- `limit`: Số yêu cầu trên trang (default: 10)
- `status`: Lọc theo trạng thái (pending, approved, rejected)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách yêu cầu hủy đơn thành công",
  "data": {
    "requests": [
      {
        "id": 1,
        "order_id": 1,
        "reason": "Tôi muốn đổi màu sản phẩm khác",
        "status": "approved",
        "status_text": "Đã chấp thuận",
        "status_color": "green",
        "admin_response": "Tự động chấp thuận - trong thời gian cho phép hủy",
        "created_at": "2024-01-01T00:10:00.000Z",
        "processed_at": "2024-01-01T00:10:00.000Z",
        "is_urgent": true,
        "processing_time_hours": 0,
        "order_total_amount": 1799.98,
        "order_status": "cancelled"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 1,
      "total_pages": 1
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Lấy chi tiết yêu cầu hủy đơn

**Endpoint:** `GET /api/cancel-requests/:id`
**Description:** Lấy thông tin chi tiết yêu cầu hủy đơn
**Authentication:** Required

---

### 4. Lấy yêu cầu hủy theo đơn hàng

**Endpoint:** `GET /api/cancel-requests/order/:orderId`
**Description:** Lấy yêu cầu hủy đơn theo ID đơn hàng
**Authentication:** Required

---

### 5. Xử lý yêu cầu hủy đơn (Admin)

**Endpoint:** `PUT /api/cancel-requests/:id/process`
**Description:** Xử lý yêu cầu hủy đơn (chấp thuận/từ chối) - chỉ admin
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "status": "approved",
  "admin_response": "Chấp thuận yêu cầu hủy đơn vì lý do hợp lý"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xử lý yêu cầu hủy đơn thành công",
  "data": {
    "cancel_request": {
      "id": 1,
      "status": "approved",
      "status_text": "Đã chấp thuận",
      "admin_response": "Chấp thuận yêu cầu hủy đơn vì lý do hợp lý",
      "processed_by": 2,
      "processed_by_name": "Admin User",
      "processed_at": "2024-01-01T02:00:00.000Z",
      "processing_time_hours": 2
    }
  },
  "timestamp": "2024-01-01T02:00:00.000Z"
}
```

---

### 6. Thống kê yêu cầu hủy đơn

**Endpoint:** `GET /api/cancel-requests/stats`
**Description:** Lấy thống kê yêu cầu hủy đơn của user
**Authentication:** Required

**Query Parameters:**
- `start_date`: Ngày bắt đầu (YYYY-MM-DD)
- `end_date`: Ngày kết thúc (YYYY-MM-DD)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Lấy thống kê yêu cầu hủy đơn thành công",
  "data": {
    "stats": {
      "total_requests": 5,
      "pending_requests": 1,
      "approved_requests": 3,
      "rejected_requests": 1,
      "total_cancelled_amount": 4500000,
      "avg_processing_hours": 1.5,
      "approval_rate": "60.00"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## �📦 Order Endpoints

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
