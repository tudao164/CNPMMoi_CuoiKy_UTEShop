# 🎟️ COUPON/VOUCHER API DOCUMENTATION

## Overview
API endpoints for coupon/discount code management (user and admin).

**Base URLs**: 
- User: `/api/coupons`
- Admin: `/api/admin/coupons`

**Authentication**: Required

---

## 👤 USER ENDPOINTS

### 1. Validate Coupon
Validate a coupon code and calculate discount.

**Endpoint**: `POST /api/coupons/validate`

**Request Body**:
```json
{
  "code": "WELCOME10",
  "items": [
    {
      "product_id": 1,
      "price": 899.99,
      "quantity": 1
    },
    {
      "product_id": 2,
      "price": 119.99,
      "quantity": 2
    }
  ]
}
```

**Validation Checks**:
- Coupon exists and is active
- Within valid date range
- Usage limit not exceeded
- User hasn't exceeded per-user limit
- Minimum order amount requirement met
- Applicable to cart items (based on applies_to)

**Success Response**:
```json
{
  "success": true,
  "data": {
    "coupon_id": 1,
    "coupon_code": "WELCOME10",
    "discount_amount": 113.99,
    "subtotal": 1139.97,
    "final_amount": 1025.98
  },
  "message": "Mã giảm giá hợp lệ"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Mã giảm giá đã hết hạn",
  "status": 400
}
```

**Possible Error Messages**:
- "Mã giảm giá không tồn tại"
- "Mã giảm giá không còn hiệu lực"
- "Mã giảm giá chưa có hiệu lực"
- "Mã giảm giá đã hết hạn"
- "Mã giảm giá đã hết lượt sử dụng"
- "Bạn đã sử dụng hết lượt của mã giảm giá này"
- "Đơn hàng tối thiểu {amount}đ để sử dụng mã này"

---

### 2. Get Available Coupons
Get list of coupons available for the user.

**Endpoint**: `GET /api/coupons/available`

**Query Parameters**:
- `order_amount` (optional): Current order amount to check min_order_amount

**Response**:
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "WELCOME10",
        "description": "Giảm 10% cho đơn hàng đầu tiên",
        "discount_type": "percentage",
        "discount_value": 10.00,
        "min_order_amount": 100.00,
        "max_discount_amount": 50.00,
        "per_user_limit": 1,
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T23:59:59.000Z",
        "user_usage_count": 0,
        "applies_to": "all"
      }
    ],
    "count": 5
  },
  "message": "Danh sách mã giảm giá khả dụng"
}
```

---

### 3. Get Coupon by Code
Get details of a specific coupon.

**Endpoint**: `GET /api/coupons/:code`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "WELCOME10",
    "description": "Giảm 10% cho đơn hàng đầu tiên",
    "discount_type": "percentage",
    "discount_value": 10.00,
    "min_order_amount": 100.00,
    "max_discount_amount": 50.00,
    "usage_limit": 1000,
    "usage_count": 150,
    "per_user_limit": 1,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "is_active": true,
    "applies_to": "all",
    "applies_to_ids": null
  },
  "message": "Chi tiết mã giảm giá"
}
```

---

## 🔧 ADMIN ENDPOINTS

### 1. Create Coupon (Admin)
Create a new coupon.

**Endpoint**: `POST /api/admin/coupons`

**Request Body**:
```json
{
  "code": "SUMMER50",
  "description": "Giảm 50k cho mùa hè",
  "discount_type": "fixed_amount",
  "discount_value": 50.00,
  "min_order_amount": 500.00,
  "max_discount_amount": null,
  "usage_limit": 500,
  "per_user_limit": 1,
  "start_date": "2024-06-01T00:00:00.000Z",
  "end_date": "2024-08-31T23:59:59.000Z",
  "is_active": true,
  "applies_to": "all",
  "applies_to_ids": null
}
```

**Field Descriptions**:
- `code`: Unique coupon code (auto-uppercase)
- `discount_type`: `percentage` or `fixed_amount`
- `discount_value`: Percentage (1-100) or fixed amount
- `min_order_amount`: Minimum order value required
- `max_discount_amount`: Max discount for percentage type
- `usage_limit`: Total usage limit (null = unlimited)
- `per_user_limit`: Usage limit per user
- `applies_to`: `all`, `category`, or `product`
- `applies_to_ids`: Array of category/product IDs (JSON)

**Validation Rules**:
- Code must be unique
- discount_value > 0
- For percentage: discount_value <= 100
- end_date must be after start_date

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 6,
    "code": "SUMMER50",
    "description": "Giảm 50k cho mùa hè",
    "discount_type": "fixed_amount",
    "discount_value": 50.00,
    "created_at": "2024-01-20T10:00:00.000Z",
    "created_by_name": "Admin User"
  },
  "message": "Tạo mã giảm giá thành công",
  "status": 201
}
```

---

### 2. Get All Coupons (Admin)
Get list of all coupons with filters.

**Endpoint**: `GET /api/admin/coupons`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `is_active` (optional): Filter by active status (true/false)
- `discount_type` (optional): Filter by type (`percentage`, `fixed_amount`)
- `search` (optional): Search in code or description

**Response**:
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "WELCOME10",
        "description": "Giảm 10% cho đơn hàng đầu tiên",
        "discount_type": "percentage",
        "discount_value": 10.00,
        "min_order_amount": 100.00,
        "usage_limit": 1000,
        "usage_count": 150,
        "is_active": true,
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T23:59:59.000Z",
        "created_by_name": "Admin User",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 50,
      "total_pages": 3
    }
  },
  "message": "Danh sách mã giảm giá"
}
```

---

### 3. Get Coupon by ID (Admin)
Get detailed information of a coupon.

**Endpoint**: `GET /api/admin/coupons/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "WELCOME10",
    "description": "Giảm 10% cho đơn hàng đầu tiên",
    "discount_type": "percentage",
    "discount_value": 10.00,
    "min_order_amount": 100.00,
    "max_discount_amount": 50.00,
    "usage_limit": 1000,
    "usage_count": 150,
    "per_user_limit": 1,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "is_active": true,
    "applies_to": "all",
    "applies_to_ids": null,
    "created_by": 1,
    "created_by_name": "Admin User",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "Chi tiết mã giảm giá"
}
```

---

### 4. Update Coupon (Admin)
Update an existing coupon.

**Endpoint**: `PUT /api/admin/coupons/:id`

**Request Body** (all fields optional):
```json
{
  "description": "Updated description",
  "discount_value": 15.00,
  "min_order_amount": 150.00,
  "is_active": false,
  "end_date": "2024-12-31T23:59:59.000Z"
}
```

**Note**: Cannot update `code` field after creation.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "WELCOME10",
    "description": "Updated description",
    "discount_value": 15.00,
    "updated_at": "2024-01-20T11:00:00.000Z"
  },
  "message": "Cập nhật mã giảm giá thành công"
}
```

---

### 5. Delete Coupon (Admin)
Delete a coupon (only if not used).

**Endpoint**: `DELETE /api/admin/coupons/:id`

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Xóa mã giảm giá thành công"
}
```

**Error Response** (if coupon was used):
```json
{
  "success": false,
  "message": "Không thể xóa mã giảm giá đã được sử dụng. Vui lòng vô hiệu hóa thay vì xóa.",
  "status": 400
}
```

---

### 6. Get Coupon Usage Statistics (Admin)
Get detailed usage statistics for a specific coupon.

**Endpoint**: `GET /api/admin/coupons/:id/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 1,
      "code": "WELCOME10",
      "description": "Giảm 10% cho đơn hàng đầu tiên"
    },
    "statistics": {
      "code": "WELCOME10",
      "usage_count": 150,
      "usage_limit": 1000,
      "actual_usage": 150,
      "total_discount_given": 7500.00,
      "unique_users": 145
    },
    "recent_usage": [
      {
        "id": 1,
        "coupon_id": 1,
        "user_id": 10,
        "order_id": 50,
        "discount_amount": 50.00,
        "created_at": "2024-01-20T10:00:00.000Z",
        "user_name": "Nguyen Van A",
        "user_email": "user@example.com",
        "order_total": 500.00
      }
    ]
  },
  "message": "Thống kê mã giảm giá"
}
```

---

### 7. Get Overall Coupon Statistics (Admin)
Get overall statistics for all coupons.

**Endpoint**: `GET /api/admin/coupons/statistics/overview`

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_coupons": 50,
      "active_coupons": 40,
      "inactive_coupons": 10,
      "percentage_coupons": 30,
      "fixed_coupons": 20,
      "total_usage": 5000,
      "expired_coupons": 5
    },
    "usage": {
      "total_redemptions": 5000,
      "total_discount_given": 250000.00,
      "unique_users": 1200,
      "used_coupons": 35
    },
    "top_coupons": [
      {
        "code": "WELCOME10",
        "description": "Giảm 10% cho đơn hàng đầu tiên",
        "discount_type": "percentage",
        "discount_value": 10.00,
        "usage_count": 1500,
        "total_discount_given": 75000.00
      }
    ]
  },
  "message": "Thống kê tổng quan mã giảm giá"
}
```

---

## 💼 CREATE ORDER WITH COUPON

### Updated Order Creation
When creating an order, include `coupon_code` field:

**Endpoint**: `POST /api/orders` or `POST /api/orders/from-cart`

**Request Body**:
```json
{
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Giao hàng buổi chiều",
  "payment_method": "COD",
  "coupon_code": "WELCOME10",
  "items": [...]
}
```

**Response** (with coupon applied):
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 100,
      "total_amount": 809.99,
      "subtotal_amount": 899.99,
      "discount_amount": 90.00,
      "coupon_code": "WELCOME10",
      "status": "new"
    },
    "applied_coupon": {
      "code": "WELCOME10",
      "discount_amount": 90.00,
      "subtotal_amount": 899.99,
      "total_amount": 809.99
    }
  },
  "message": "Đơn hàng đã được tạo thành công",
  "status": 201
}
```

---

## 🔐 Authentication

**User Endpoints**: Require user authentication
```
Authorization: Bearer <user_token>
```

**Admin Endpoints**: Require admin authentication
```
Authorization: Bearer <admin_token>
```

---

## ⚠️ Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "status": 400
}
```

**Common Errors**:
- `400`: Validation error, coupon invalid/expired
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Coupon not found
- `500`: Internal server error

---

## 💡 Usage Examples

### Validate Coupon Before Checkout
```bash
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "items": [
      {"product_id": 1, "price": 899.99, "quantity": 1}
    ]
  }'
```

### Create Order with Coupon
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address": "123 Street",
    "payment_method": "COD",
    "coupon_code": "WELCOME10",
    "items": [...]
  }'
```

### Admin: Create New Coupon
```bash
curl -X POST http://localhost:3000/api/admin/coupons \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BLACKFRIDAY",
    "description": "Black Friday Sale",
    "discount_type": "percentage",
    "discount_value": 25,
    "min_order_amount": 500,
    "usage_limit": 10000,
    "start_date": "2024-11-29T00:00:00Z",
    "end_date": "2024-11-30T23:59:59Z"
  }'
```

---

## 📊 Coupon Types

### Percentage Discount
- `discount_type`: `percentage`
- `discount_value`: 1-100 (%)
- `max_discount_amount`: Cap for maximum discount

Example: 10% off, max 50k discount

### Fixed Amount Discount
- `discount_type`: `fixed_amount`
- `discount_value`: Fixed amount
- `max_discount_amount`: Not used

Example: 50k off

### Application Scope
- `applies_to: all`: Apply to entire order
- `applies_to: category`: Apply to specific categories
- `applies_to: product`: Apply to specific products
- `applies_to_ids`: JSON array of category/product IDs

---

*Last updated: January 2024*
