# 📝 PRODUCT REVIEWS API DOCUMENTATION

## Overview
API endpoints for product review management (user and admin).

**Base URLs**: 
- User: `/api/reviews`
- Admin: `/api/admin/reviews`

**Authentication**: Required

---

## 👤 USER ENDPOINTS

### 1. Create Review
Submit a review for a purchased product.

**Endpoint**: `POST /api/reviews`

**Request Body**:
```json
{
  "product_id": 1,
  "order_id": 5,
  "rating": 5,
  "title": "Sản phẩm tuyệt vời!",
  "comment": "Chất lượng rất tốt, giao hàng nhanh",
  "images": ["/images/review1.jpg", "/images/review2.jpg"]
}
```

**Validation Rules**:
- `product_id`: Required
- `order_id`: Required
- `rating`: Required, 1-5 stars
- User must have purchased the product
- Can only review once per order

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "product_id": 1,
    "user_id": 2,
    "order_id": 5,
    "rating": 5,
    "title": "Sản phẩm tuyệt vời!",
    "comment": "Chất lượng rất tốt, giao hàng nhanh",
    "images": ["/images/review1.jpg"],
    "is_verified_purchase": true,
    "is_approved": true,
    "helpful_count": 0,
    "created_at": "2024-01-20T10:00:00.000Z",
    "user_name": "Nguyen Van A",
    "product_name": "iPhone 15 Pro"
  },
  "message": "Đánh giá đã được gửi thành công",
  "status": 201
}
```

---

### 2. Get Product Reviews
Get all reviews for a specific product.

**Endpoint**: `GET /api/reviews/product/:productId`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `rating` (optional): Filter by rating (1-5)
- `sort` (optional): `recent`, `helpful`, `rating_high`, `rating_low` (default: `recent`)

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "product_id": 1,
        "user_id": 2,
        "rating": 5,
        "title": "Tuyệt vời!",
        "comment": "Sản phẩm rất tốt",
        "images": ["/images/review1.jpg"],
        "is_verified_purchase": true,
        "helpful_count": 10,
        "created_at": "2024-01-15T10:00:00.000Z",
        "user_name": "Nguyen Van A",
        "user_avatar": "/images/avatar.jpg"
      }
    ],
    "stats": {
      "total_reviews": 150,
      "average_rating": 4.5,
      "five_star": 100,
      "four_star": 30,
      "three_star": 10,
      "two_star": 5,
      "one_star": 5,
      "verified_purchases": 140
    },
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 150,
      "total_pages": 15
    }
  },
  "message": "Đánh giá được tải thành công"
}
```

---

### 3. Get My Reviews
Get current user's reviews.

**Endpoint**: `GET /api/reviews/my-reviews`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "product_id": 1,
        "rating": 5,
        "title": "Tuyệt vời!",
        "comment": "Sản phẩm rất tốt",
        "images": [],
        "is_approved": true,
        "created_at": "2024-01-15T10:00:00.000Z",
        "product_name": "iPhone 15 Pro",
        "product_image": "/images/iphone15pro.jpg"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 5,
      "total_pages": 1
    }
  },
  "message": "Đánh giá của bạn được tải thành công"
}
```

---

### 4. Update Review
Update your own review.

**Endpoint**: `PUT /api/reviews/:id`

**Request Body**:
```json
{
  "rating": 4,
  "title": "Updated title",
  "comment": "Updated comment",
  "images": ["/images/new-review.jpg"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rating": 4,
    "title": "Updated title",
    "comment": "Updated comment",
    "updated_at": "2024-01-20T11:00:00.000Z"
  },
  "message": "Đánh giá đã được cập nhật"
}
```

---

### 5. Delete Review
Delete your own review.

**Endpoint**: `DELETE /api/reviews/:id`

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Đánh giá đã được xóa"
}
```

---

### 6. Mark Review as Helpful
Mark/unmark a review as helpful.

**Endpoint**: `POST /api/reviews/:id/helpful`

**Response**:
```json
{
  "success": true,
  "data": {
    "action": "added"
  },
  "message": "Đã đánh dấu hữu ích"
}
```

---

### 7. Check Can Review
Check if user can review a product.

**Endpoint**: `GET /api/reviews/can-review/:productId/:orderId`

**Response**:
```json
{
  "success": true,
  "data": {
    "can_review": true
  },
  "message": "Kiểm tra quyền đánh giá thành công"
}
```

Or:
```json
{
  "success": true,
  "data": {
    "can_review": false,
    "reason": "Bạn đã đánh giá sản phẩm này rồi"
  },
  "message": "Kiểm tra quyền đánh giá thành công"
}
```

---

## 🔧 ADMIN ENDPOINTS

### 1. Get All Reviews (Admin)
Get all reviews with filters.

**Endpoint**: `GET /api/admin/reviews`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): `approved`, `pending`
- `rating` (optional): Filter by rating (1-5)
- `product_id` (optional): Filter by product
- `user_id` (optional): Filter by user

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "product_id": 1,
        "user_id": 2,
        "rating": 5,
        "title": "Great product",
        "is_approved": true,
        "created_at": "2024-01-15T10:00:00.000Z",
        "user_name": "Nguyen Van A",
        "user_email": "user@example.com",
        "product_name": "iPhone 15 Pro",
        "product_image": "/images/iphone15pro.jpg"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 500,
      "total_pages": 25
    }
  },
  "message": "Danh sách đánh giá được tải thành công"
}
```

---

### 2. Approve Review (Admin)
Approve a pending review.

**Endpoint**: `PUT /api/admin/reviews/:id/approve`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_approved": true,
    "updated_at": "2024-01-20T11:00:00.000Z"
  },
  "message": "Đã duyệt đánh giá thành công"
}
```

---

### 3. Reject Review (Admin)
Reject a review.

**Endpoint**: `PUT /api/admin/reviews/:id/reject`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_approved": false,
    "updated_at": "2024-01-20T11:00:00.000Z"
  },
  "message": "Đã từ chối đánh giá"
}
```

---

### 4. Delete Review (Admin)
Delete any review (admin privilege).

**Endpoint**: `DELETE /api/admin/reviews/:id`

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Đã xóa đánh giá thành công"
}
```

---

### 5. Get Review Statistics (Admin)
Get overall review statistics.

**Endpoint**: `GET /api/admin/reviews/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_reviews": 500,
      "approved_reviews": 480,
      "pending_reviews": 20,
      "average_rating": 4.5,
      "five_star": 300,
      "four_star": 150,
      "three_star": 30,
      "two_star": 10,
      "one_star": 10,
      "verified_purchases": 450
    },
    "recent_reviews": [
      {
        "id": 500,
        "rating": 5,
        "title": "Latest review",
        "created_at": "2024-01-20T10:00:00.000Z",
        "is_approved": false,
        "user_name": "New User",
        "product_name": "Product ABC"
      }
    ]
  },
  "message": "Thống kê đánh giá được tải thành công"
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
- `400`: Validation error, already reviewed, can't review
- `401`: Unauthorized
- `403`: Forbidden (not your review or not admin)
- `404`: Review not found
- `500`: Internal server error

---

## 💡 Usage Examples

### Submit a Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "order_id": 5,
    "rating": 5,
    "title": "Tuyệt vời!",
    "comment": "Sản phẩm rất tốt"
  }'
```

### Get Product Reviews (5-star only)
```bash
curl -X GET \
  'http://localhost:3000/api/reviews/product/1?rating=5&sort=helpful' \
  -H 'Authorization: Bearer <token>'
```

### Admin: Get Pending Reviews
```bash
curl -X GET \
  'http://localhost:3000/api/admin/reviews?status=pending' \
  -H 'Authorization: Bearer <admin_token>'
```

---

*Last updated: January 2024*
