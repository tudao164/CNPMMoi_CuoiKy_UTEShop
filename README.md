# UTEShop API - Tài liệu API đầy đủ

## Thông tin chung

**Base URL:** `http://localhost:3000`
**Authentication:** Bearer Token (JWT)
**Content-Type:** `application/json`

---

## 📋 Mục lục

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Utility Endpoints](#utility-endpoints)
4. [Cách sử dụng và Test](#cách-sử-dụng-và-test)
5. [Response Format](#response-format)
6. [Error Codes](#error-codes)

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

**Endpoint:** `GET /api/auth/me`
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
  "phone": "0987654321"
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

## 🛠 Utility Endpoints

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
