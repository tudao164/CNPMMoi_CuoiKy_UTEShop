# UTEShop API

Hệ thống API cho website bán hàng UTEShop sử dụng Node.js, Express.js và MySQL.

## Tính năng

- 🔐 Đăng ký tài khoản với xác thực OTP qua email
- 🔑 Đăng nhập với JWT authentication
- 🔄 Quên mật khẩu với OTP verification
- 📧 Gửi email OTP tự động
- 🛡️ Bảo mật với bcrypt và JWT
- 🚀 RESTful API design

## Cài đặt

1. Clone repository
2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` và cấu hình:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=uteshop

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=3000
NODE_ENV=development
```

4. Tạo database và tables (xem file `database/schema.sql`)

5. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/verify-otp` - Xác thực OTP đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu với OTP

### User Profile

- `GET /api/user/profile` - Lấy thông tin profile (cần JWT)
- `PUT /api/user/profile` - Cập nhật profile (cần JWT)

## Cấu trúc Database

### Users Table
- `id` - Primary key
- `email` - Email đăng nhập
- `password` - Mật khẩu đã hash
- `full_name` - Họ tên
- `phone` - Số điện thoại
- `is_verified` - Trạng thái xác thực email
- `created_at` - Thời gian tạo
- `updated_at` - Thời gian cập nhật

### OTP Codes Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `otp_code` - Mã OTP
- `otp_type` - Loại OTP (register/reset_password)
- `expires_at` - Thời gian hết hạn
- `is_used` - Trạng thái đã sử dụng

## Bảo mật

- Mật khẩu được mã hóa bằng bcrypt
- JWT token cho authentication
- OTP có thời gian hết hạn (5 phút)
- Rate limiting để chống spam
- Input validation và sanitization
- CORS protection
- Helmet security headers

## Cấu trúc thư mục

```
uteshop-api/
├── config/
│   ├── database.js          # Cấu hình database
│   └── email.js             # Cấu hình email
├── controllers/
│   ├── authController.js    # Controller authentication
│   └── userController.js    # Controller user
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── validation.js        # Validation middleware
│   └── rateLimiter.js       # Rate limiting middleware
├── models/
│   ├── User.js              # Model User
│   └── OTP.js               # Model OTP
├── routes/
│   ├── auth.js              # Routes authentication
│   └── user.js              # Routes user
├── services/
│   ├── emailService.js      # Service gửi email
│   └── otpService.js        # Service tạo và xác thực OTP
├── utils/
│   ├── responseHelper.js    # Helper response API
│   └── constants.js         # Constants
├── database/
│   └── schema.sql           # Database schema
├── .env                     # Environment variables
├── server.js                # Entry point
└── package.json
```
