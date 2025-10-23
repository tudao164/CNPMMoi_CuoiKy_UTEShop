# 📊 ADMIN DASHBOARD API DOCUMENTATION

## Overview
API endpoints for admin dashboard statistics and data visualization.

**Base URL**: `/api/admin/dashboard`  
**Authentication**: Required (Admin only)

---

## 📈 DASHBOARD ENDPOINTS

### 1. Get Dashboard Overview
Get comprehensive dashboard statistics.

**Endpoint**: `GET /api/admin/dashboard/overview`

**Query Parameters**:
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response**:
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total_orders": 150,
      "total_revenue": 50000000,
      "total_discount": 5000000,
      "avg_order_value": 333333.33,
      "pending_orders": 10,
      "processing_orders": 25,
      "delivered_orders": 100,
      "cancelled_orders": 15
    },
    "today": {
      "orders_today": 5,
      "revenue_today": 2000000,
      "new_orders_today": 3
    },
    "customers": {
      "total_customers": 500,
      "new_customers_30d": 50,
      "new_customers_7d": 10,
      "new_customers_today": 2
    },
    "products": {
      "total_products": 100,
      "active_products": 95,
      "out_of_stock": 5,
      "low_stock": 10
    },
    "payment_breakdown": [
      {
        "payment_method": "COD",
        "order_count": 80,
        "total_amount": 30000000
      },
      {
        "payment_method": "E_WALLET",
        "order_count": 70,
        "total_amount": 20000000
      }
    ]
  },
  "message": "Dữ liệu dashboard được tải thành công"
}
```

---

### 2. Get Revenue Chart Data
Get revenue data for charts and graphs.

**Endpoint**: `GET /api/admin/dashboard/revenue-chart`

**Query Parameters**:
- `period` (optional): `hourly`, `daily`, `weekly`, `monthly` (default: `daily`)
- `date_from` (optional): Start date (default: last 30 days)
- `date_to` (optional): End date

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "data": [
      {
        "period": "2024-01-15",
        "order_count": 10,
        "revenue": 3000000,
        "discount": 300000,
        "subtotal": 3300000
      },
      {
        "period": "2024-01-16",
        "order_count": 15,
        "revenue": 4500000,
        "discount": 450000,
        "subtotal": 4950000
      }
    ]
  },
  "message": "Dữ liệu biểu đồ doanh thu được tải thành công"
}
```

---

### 3. Get Top Products
Get top selling products.

**Endpoint**: `GET /api/admin/dashboard/top-products`

**Query Parameters**:
- `limit` (optional): Number of products (default: 10)
- `date_from` (optional): Start date
- `date_to` (optional): End date

**Response**:
```json
{
  "success": true,
  "data": {
    "top_products": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "image_url": "/images/iphone15pro.jpg",
        "price": 999.99,
        "sale_price": 899.99,
        "stock_quantity": 50,
        "category_name": "Electronics",
        "total_sold": 120,
        "total_revenue": 107999.88,
        "order_count": 100
      }
    ],
    "count": 10
  },
  "message": "Top sản phẩm bán chạy được tải thành công"
}
```

---

### 4. Get Delivered Orders
Get list of successfully delivered orders.

**Endpoint**: `GET /api/admin/dashboard/delivered-orders`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `date_from` (optional): Start date
- `date_to` (optional): End date
- `payment_method` (optional): Filter by payment method

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "user_id": 2,
        "total_amount": 999.99,
        "subtotal_amount": 1099.99,
        "discount_amount": 100.00,
        "coupon_code": "WELCOME10",
        "payment_method": "COD",
        "shipping_address": "123 Street, City",
        "created_at": "2024-01-15T10:00:00.000Z",
        "delivered_at": "2024-01-18T14:30:00.000Z",
        "customer_name": "Nguyen Van A",
        "customer_email": "user@example.com",
        "customer_phone": "0987654321",
        "payment_status": "completed",
        "item_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  },
  "message": "Danh sách đơn hàng đã giao được tải thành công"
}
```

---

### 5. Get Cash Flow Data
Get cash flow statistics (collected and pending money).

**Endpoint**: `GET /api/admin/dashboard/cash-flow`

**Query Parameters**:
- `date_from` (optional): Start date
- `date_to` (optional): End date

**Response**:
```json
{
  "success": true,
  "data": {
    "collected": [
      {
        "payment_method": "COD",
        "order_count": 50,
        "total_amount": 15000000,
        "total_discount": 1500000,
        "total_subtotal": 16500000
      },
      {
        "payment_method": "E_WALLET",
        "order_count": 40,
        "total_amount": 12000000,
        "total_discount": 1200000,
        "total_subtotal": 13200000
      }
    ],
    "pending": [
      {
        "payment_method": "COD",
        "status": "shipping",
        "order_count": 10,
        "total_amount": 3000000
      },
      {
        "payment_method": "E_WALLET",
        "status": "confirmed",
        "order_count": 5,
        "total_amount": 1500000
      }
    ],
    "summary": {
      "total_collected": 27000000,
      "total_pending": 4500000,
      "total_cancelled": 2000000,
      "total_discount_applied": 2700000
    }
  },
  "message": "Dữ liệu dòng tiền được tải thành công"
}
```

---

### 6. Get New Customers
Get list of new customers.

**Endpoint**: `GET /api/admin/dashboard/new-customers`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `period` (optional): Days to look back (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 10,
        "email": "newuser@example.com",
        "full_name": "Tran Van B",
        "phone": "0987654321",
        "is_verified": true,
        "created_at": "2024-01-20T10:00:00.000Z",
        "total_orders": 2,
        "total_spent": 500000
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 50,
      "total_pages": 3
    },
    "period": "30 ngày gần đây"
  },
  "message": "Danh sách khách hàng mới được tải thành công"
}
```

---

## 🔐 Authentication

All endpoints require:
```
Authorization: Bearer <admin_token>
```

## ⚠️ Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "status": 400
}
```

**Common Error Codes**:
- `401`: Unauthorized (not logged in or token expired)
- `403`: Forbidden (not admin)
- `500`: Internal server error

---

## 💡 Usage Examples

### Get Dashboard Overview (Last 7 Days)
```bash
curl -X GET \
  'http://localhost:3000/api/admin/dashboard/overview?date_from=2024-01-14&date_to=2024-01-21' \
  -H 'Authorization: Bearer <admin_token>'
```

### Get Daily Revenue Chart (Last 30 Days)
```bash
curl -X GET \
  'http://localhost:3000/api/admin/dashboard/revenue-chart?period=daily' \
  -H 'Authorization: Bearer <admin_token>'
```

### Get Top 5 Products
```bash
curl -X GET \
  'http://localhost:3000/api/admin/dashboard/top-products?limit=5' \
  -H 'Authorization: Bearer <admin_token>'
```

---

## 📊 Data Visualization Tips

### For Charts:
- Use revenue-chart with `period=daily` for line charts
- Use payment_breakdown from overview for pie charts
- Use top-products for bar charts

### For Tables:
- Use delivered-orders for order list tables
- Use new-customers for customer list tables
- Use cash-flow for payment status tables

---

*Last updated: January 2024*
