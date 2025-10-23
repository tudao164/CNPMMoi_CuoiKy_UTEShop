# 🎉 NEW FEATURES - UTEShop API v2.0

## Overview
Hệ thống đã được nâng cấp với 3 tính năng chính mới:
1. **📊 Dashboard & Statistics** - Thống kê toàn diện cho admin
2. **📝 Product Reviews** - Hệ thống đánh giá sản phẩm
3. **🎟️ Coupons/Vouchers** - Quản lý mã giảm giá

---

## 📊 DASHBOARD & STATISTICS

### Tính năng
- **Tổng quan dashboard**: Doanh thu, đơn hàng, khách hàng, sản phẩm
- **Biểu đồ doanh thu**: Theo giờ/ngày/tuần/tháng
- **Top sản phẩm**: Sản phẩm bán chạy nhất
- **Đơn hàng đã giao**: Danh sách chi tiết đơn hàng thành công
- **Quản lý dòng tiền**: Tiền đã thu, tiền chưa thu, theo phương thức thanh toán
- **Khách hàng mới**: Thống kê và danh sách khách hàng mới

### API Endpoints
```
GET /api/admin/dashboard/overview
GET /api/admin/dashboard/revenue-chart
GET /api/admin/dashboard/top-products
GET /api/admin/dashboard/delivered-orders
GET /api/admin/dashboard/cash-flow
GET /api/admin/dashboard/new-customers
```

### Files Created
- `controllers/admin/adminDashboardController.js`
- `routes/admin/dashboard.js`
- `docs/DASHBOARD_API.md`

### Database Tables Used
- `orders` - Phân tích doanh thu, trạng thái đơn hàng
- `order_items` - Top sản phẩm bán chạy
- `payments` - Phân tích dòng tiền
- `users` - Thống kê khách hàng mới
- `products` - Thống kê kho hàng

### Example Usage
```javascript
// Get dashboard overview for last 7 days
GET /api/admin/dashboard/overview?date_from=2024-01-14&date_to=2024-01-21

// Get daily revenue chart
GET /api/admin/dashboard/revenue-chart?period=daily

// Get top 10 products
GET /api/admin/dashboard/top-products?limit=10
```

---

## 📝 PRODUCT REVIEWS

### Tính năng
#### User:
- Đánh giá sản phẩm đã mua (1-5 sao)
- Upload ảnh đánh giá
- Chỉnh sửa/xóa đánh giá của mình
- Đánh dấu đánh giá hữu ích
- Xem đánh giá của sản phẩm với filters

#### Admin:
- Duyệt/từ chối đánh giá
- Xóa đánh giá vi phạm
- Xem thống kê đánh giá
- Quản lý tất cả đánh giá

### API Endpoints
**User:**
```
POST   /api/reviews                          # Tạo đánh giá
GET    /api/reviews/product/:productId       # Xem đánh giá sản phẩm
GET    /api/reviews/my-reviews               # Đánh giá của tôi
PUT    /api/reviews/:id                      # Cập nhật đánh giá
DELETE /api/reviews/:id                      # Xóa đánh giá
POST   /api/reviews/:id/helpful              # Đánh dấu hữu ích
GET    /api/reviews/can-review/:productId/:orderId  # Kiểm tra quyền
```

**Admin:**
```
GET    /api/admin/reviews                    # Tất cả đánh giá
GET    /api/admin/reviews/stats              # Thống kê
PUT    /api/admin/reviews/:id/approve        # Duyệt đánh giá
PUT    /api/admin/reviews/:id/reject         # Từ chối đánh giá
DELETE /api/admin/reviews/:id                # Xóa đánh giá
```

### Files Created
- `models/ProductReview.js`
- `controllers/reviewController.js`
- `controllers/admin/adminReviewController.js`
- `routes/reviews.js`
- `routes/admin/reviews.js`
- `docs/REVIEW_API.md`

### Database Tables
```sql
-- Bảng đánh giá
product_reviews (
    id, product_id, user_id, order_id,
    rating, title, comment, images,
    is_verified_purchase, is_approved,
    helpful_count, created_at, updated_at
)

-- Bảng vote hữu ích
review_helpful (
    id, review_id, user_id, created_at
)

-- Thêm cột vào products
ALTER TABLE products ADD average_rating DECIMAL(3,2)
ALTER TABLE products ADD review_count INT
```

### Triggers
- `update_product_rating_after_insert` - Tự động cập nhật rating khi có đánh giá mới
- `update_product_rating_after_update` - Cập nhật rating khi đánh giá được sửa
- `update_product_rating_after_delete` - Cập nhật rating khi đánh giá bị xóa

### Example Usage
```javascript
// Tạo đánh giá
POST /api/reviews
{
  "product_id": 1,
  "order_id": 5,
  "rating": 5,
  "title": "Sản phẩm tuyệt vời!",
  "comment": "Chất lượng rất tốt",
  "images": ["/images/review1.jpg"]
}

// Xem đánh giá 5 sao, sắp xếp theo hữu ích nhất
GET /api/reviews/product/1?rating=5&sort=helpful
```

---

## 🎟️ COUPONS/VOUCHERS

### Tính năng
#### User:
- Kiểm tra mã giảm giá hợp lệ
- Xem danh sách mã khả dụng
- Áp dụng mã khi tạo đơn hàng

#### Admin:
- Tạo mã giảm giá mới
- Quản lý (CRUD) mã giảm giá
- Xem thống kê sử dụng
- Theo dõi lịch sử sử dụng

### Loại mã giảm giá
1. **Percentage** - Giảm theo phần trăm (có thể set max_discount_amount)
2. **Fixed Amount** - Giảm số tiền cố định

### Phạm vi áp dụng
- `all` - Áp dụng toàn bộ đơn hàng
- `category` - Áp dụng cho danh mục cụ thể
- `product` - Áp dụng cho sản phẩm cụ thể

### Kiểm tra
- Thời gian hiệu lực (start_date → end_date)
- Giới hạn tổng số lần sử dụng (usage_limit)
- Giới hạn số lần sử dụng mỗi user (per_user_limit)
- Giá trị đơn hàng tối thiểu (min_order_amount)
- Sản phẩm/danh mục áp dụng

### API Endpoints
**User:**
```
POST /api/coupons/validate         # Kiểm tra mã giảm giá
GET  /api/coupons/available        # Mã khả dụng
GET  /api/coupons/:code            # Chi tiết mã
```

**Admin:**
```
POST   /api/admin/coupons                    # Tạo mã mới
GET    /api/admin/coupons                    # Danh sách mã
GET    /api/admin/coupons/:id                # Chi tiết mã
PUT    /api/admin/coupons/:id                # Cập nhật mã
DELETE /api/admin/coupons/:id                # Xóa mã
GET    /api/admin/coupons/:id/stats          # Thống kê sử dụng
GET    /api/admin/coupons/statistics/overview # Tổng quan
```

### Files Created
- `models/Coupon.js`
- `controllers/couponController.js`
- `controllers/admin/adminCouponController.js`
- `routes/coupons.js`
- `routes/admin/coupons.js`
- `docs/COUPON_API.md`

### Files Modified
- `controllers/orderController.js` - Thêm xử lý coupon vào createOrder và createOrderFromCart

### Database Tables
```sql
-- Bảng mã giảm giá
coupons (
    id, code, description,
    discount_type, discount_value,
    min_order_amount, max_discount_amount,
    usage_limit, usage_count, per_user_limit,
    start_date, end_date, is_active,
    applies_to, applies_to_ids,
    created_by, created_at, updated_at
)

-- Bảng lịch sử sử dụng
coupon_usage (
    id, coupon_id, user_id, order_id,
    discount_amount, created_at
)

-- Thêm cột vào orders
ALTER TABLE orders ADD coupon_id INT
ALTER TABLE orders ADD coupon_code VARCHAR(50)
ALTER TABLE orders ADD discount_amount DECIMAL(10,2)
ALTER TABLE orders ADD subtotal_amount DECIMAL(10,2)
```

### Triggers
- `update_coupon_usage_count` - Tự động tăng usage_count khi có sử dụng mới

### Example Usage
```javascript
// Kiểm tra mã giảm giá
POST /api/coupons/validate
{
  "code": "WELCOME10",
  "items": [
    {"product_id": 1, "price": 899.99, "quantity": 1}
  ]
}

// Tạo đơn hàng với mã giảm giá
POST /api/orders
{
  "shipping_address": "123 Street",
  "payment_method": "COD",
  "coupon_code": "WELCOME10",
  "items": [...]
}
```

---

## 🗄️ DATABASE SCHEMA

### New Tables Created
1. **product_reviews** - Lưu đánh giá sản phẩm
2. **review_helpful** - Lưu vote "hữu ích"
3. **coupons** - Lưu mã giảm giá
4. **coupon_usage** - Lịch sử sử dụng mã

### Modified Tables
1. **products**:
   - Added: `average_rating DECIMAL(3,2)`
   - Added: `review_count INT`

2. **orders**:
   - Added: `coupon_id INT`
   - Added: `coupon_code VARCHAR(50)`
   - Added: `discount_amount DECIMAL(10,2)`
   - Added: `subtotal_amount DECIMAL(10,2)`

### Sample Data Included
- 5 mã giảm giá mẫu (WELCOME10, FREESHIP, SUMMER50, VIP20, BLACKFRIDAY)
- 3 đánh giá sản phẩm mẫu

---

## 📦 INSTALLATION & SETUP

### 1. Update Database
```bash
# Chạy file schema.sql để tạo/cập nhật database
mysql -u root -p < database/schema.sql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Server
```bash
npm start
# hoặc
node server.js
```

### 4. Test Endpoints
Server sẽ chạy tại: `http://localhost:3000`

---

## 📖 API DOCUMENTATION

Chi tiết API có sẵn trong thư mục `docs/`:

1. **DASHBOARD_API.md** - Dashboard & Statistics endpoints
2. **REVIEW_API.md** - Product Reviews endpoints  
3. **COUPON_API.md** - Coupons/Vouchers endpoints

### Quick Access
- Dashboard: `GET /api/admin/dashboard/overview`
- Reviews: `GET /api/reviews/product/:productId`
- Coupons: `POST /api/coupons/validate`

---

## 🔑 AUTHENTICATION

### Admin Endpoints
Tất cả admin endpoints yêu cầu:
```
Authorization: Bearer <admin_token>
```

Admin token có `is_admin = TRUE`

### User Endpoints
Tất cả user endpoints yêu cầu:
```
Authorization: Bearer <user_token>
```

### Get Admin Token
```bash
POST /api/auth/login
{
  "email": "admin@uteshop.com",
  "password": "admin123"
}
```

---

## 🧪 TESTING

### Test Dashboard
```bash
curl -X GET http://localhost:3000/api/admin/dashboard/overview \
  -H "Authorization: Bearer <admin_token>"
```

### Test Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "order_id": 1,
    "rating": 5,
    "title": "Great!",
    "comment": "Excellent product"
  }'
```

### Test Coupon
```bash
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "items": [{"product_id": 1, "price": 899.99, "quantity": 1}]
  }'
```

---

## 📊 STATISTICS QUERIES

### Dashboard Metrics
- Total revenue (delivered orders)
- Orders by status
- New customers (7d, 30d)
- Top products by sales
- Payment method breakdown
- Cash flow (collected vs pending)

### Review Metrics
- Average rating by product
- Total reviews (approved vs pending)
- Verified purchase percentage
- Rating distribution (1-5 stars)

### Coupon Metrics
- Total coupons (active vs inactive)
- Usage count and limits
- Total discount given
- Top performing coupons
- Unique users redeemed

---

## 🎯 FEATURES SUMMARY

### ✅ Completed
- [x] Admin Dashboard với 6 endpoints
- [x] Revenue chart với multiple periods
- [x] Top products statistics
- [x] Delivered orders tracking
- [x] Cash flow management
- [x] New customers tracking
- [x] Product reviews (CRUD)
- [x] Review approval system
- [x] Helpful votes
- [x] Review statistics
- [x] Coupon creation & management
- [x] Coupon validation engine
- [x] Usage tracking & limits
- [x] Apply coupon to orders
- [x] Coupon statistics

### 🔧 Triggers & Automation
- [x] Auto-update product ratings
- [x] Auto-increment coupon usage
- [x] Track review helpful counts

### 📝 Documentation
- [x] Complete API documentation
- [x] Usage examples
- [x] Error handling guide

---

## 🚀 NEXT STEPS

### Frontend Integration
1. Create dashboard UI with charts (Chart.js / Recharts)
2. Build review submission form
3. Implement coupon input on checkout
4. Display review stars on product cards

### Future Enhancements
- [ ] Email notifications for reviews
- [ ] Coupon campaign scheduling
- [ ] Advanced analytics (cohort, retention)
- [ ] Export reports to Excel/PDF
- [ ] Review moderation queue
- [ ] Coupon auto-generation
- [ ] A/B testing for coupons

---

## 📞 SUPPORT

Nếu có vấn đề, check:
1. Server logs: `console.log` messages
2. Database connection: `GET /health`
3. API documentation: `GET /api/docs`
4. Error responses: Status codes & messages

---

**Version**: 2.0  
**Last Updated**: January 2024  
**Author**: UTEShop Development Team

🎉 **Happy Coding!**
