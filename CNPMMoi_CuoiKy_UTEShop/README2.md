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



## 📦 Order Endpoints

---

i### 1. Tạo đơn hàng từ giỏ hàng

**Endpoint:** `POST /api/orders/from-cart`
**Descrption:** Tạo đơn hàng từ các sản phẩm trong giỏ hàng (bao gồm cả Payment record)
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