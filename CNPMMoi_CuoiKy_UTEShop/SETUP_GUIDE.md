# 🚀 Hướng dẫn chạy UTEShop Project

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x hoặc yarn
- MySQL >= 8.0
- Git

---

## ⚙️ Cài đặt và chạy Backend

### 1. Di chuyển vào thư mục backend (root folder)

```bash
cd d:\CNPMMoiCuoiKy\CNPMMoi_CuoiKy_UTEShop\CNPMMoi_CuoiKy_UTEShop
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình database

Tạo file `.env` trong root folder với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=uteshop
DB_PORT=3306

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=UTEShop <noreply@uteshop.com>

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Tạo database

```bash
# Chạy MySQL và tạo database
mysql -u root -p
CREATE DATABASE uteshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 5. Import schema

```bash
mysql -u root -p uteshop < database/schema.sql
```

### 6. Chạy backend server

```bash
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

---

## 🎨 Cài đặt và chạy Frontend

### 1. Mở terminal mới và di chuyển vào thư mục frontend

```bash
cd d:\CNPMMoiCuoiKy\CNPMMoi_CuoiKy_UTEShop\CNPMMoi_CuoiKy_UTEShop\frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## ✅ Kiểm tra hệ thống

### 1. Kiểm tra Backend

Mở browser và truy cập:
```
http://localhost:3000/health
```

Nếu thấy response:
```json
{
  "success": true,
  "message": "UTEShop API is running",
  "timestamp": "...",
  "version": "1.0.0",
  "environment": "development"
}
```

➡️ Backend đang chạy thành công! ✅

### 2. Kiểm tra Frontend

Mở browser và truy cập:
```
http://localhost:5173
```

Nếu thấy trang chủ UTEShop với nút "Đăng ký" và "Đăng nhập"

➡️ Frontend đang chạy thành công! ✅

---

## 🧪 Test Authentication Flow

### 1. Đăng ký tài khoản mới

1. Click "Đăng ký" hoặc truy cập: `http://localhost:5173/register`
2. Điền form:
   - Họ và tên: `Nguyen Van A`
   - Email: `test@example.com`
   - Số điện thoại: `0123456789` (optional)
   - Mật khẩu: `Password123`
   - Xác nhận mật khẩu: `Password123`
3. Click "Đăng ký"
4. Kiểm tra console log của backend để lấy mã OTP (vì email chưa config)

### 2. Xác thực OTP

1. Nhập mã OTP 6 số từ console
2. Click "Xác thực"
3. Tự động đăng nhập và chuyển về trang chủ

### 3. Đăng nhập

1. Truy cập: `http://localhost:5173/login`
2. Nhập email và mật khẩu
3. Click "Đăng nhập"

### 4. Test Quên mật khẩu

1. Click "Quên mật khẩu?" ở trang login
2. Nhập email
3. Lấy OTP từ console
4. Nhập OTP và mật khẩu mới

---

## 📂 Cấu trúc Project

```
CNPMMoi_CuoiKy_UTEShop/
├── backend/                    # Backend (Node.js + Express)
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── database/              # Database schema
│   ├── middleware/            # Express middlewares
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Utilities
│   ├── server.js              # Entry point
│   └── package.json
│
└── frontend/                  # Frontend (React + TypeScript)
    ├── src/
    │   ├── config/            # Configuration
    │   ├── lib/               # Libraries setup
    │   ├── pages/             # Page components
    │   ├── services/          # API services
    │   ├── store/             # State management
    │   ├── types/             # TypeScript types
    │   ├── App.tsx            # Main app
    │   └── main.tsx           # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## 🐛 Troubleshooting

### Backend không chạy được

**Error: `Cannot find module ...`**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

**Error: `ECONNREFUSED` (không kết nối được database)**
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin trong file `.env`
- Kiểm tra database `uteshop` đã được tạo chưa

**Error: `Port 3000 already in use`**
```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Frontend không chạy được

**Error: `Cannot find module ...`**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: Network error khi call API**
- Kiểm tra backend đang chạy ở `http://localhost:3000`
- Kiểm tra proxy trong `vite.config.ts`

**Error: `Port 5173 already in use`**
```bash
# Thay đổi port trong vite.config.ts
server: {
  port: 5174,
}
```

---

## 📝 Scripts có sẵn

### Backend
```bash
npm start          # Chạy server
npm run dev        # Chạy với nodemon (auto-reload)
npm test           # Chạy tests
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Build production
npm run preview    # Preview production build
npm run lint       # Check code quality
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/resend-otp` - Gửi lại OTP
- `GET /api/auth/me` - Thông tin user

Chi tiết: Xem file `README.md` trong root folder

---

## 🎯 Tính năng đã hoàn thành

### Authentication System ✅
- [x] Đăng ký với OTP verification
- [x] Đăng nhập với JWT
- [x] Quên mật khẩu
- [x] Đặt lại mật khẩu
- [x] Gửi lại OTP
- [x] Đăng xuất
- [x] Protected routes

### Frontend UI ✅
- [x] Responsive design
- [x] Form validation
- [x] Loading states
- [x] Error handling
- [x] Success notifications
- [x] Beautiful UI with Tailwind CSS

---

## 📧 Cấu hình Email (Optional)

Để gửi OTP qua email thật, cấu hình Gmail App Password:

1. Vào Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable nếu chưa có)
3. App passwords → Tạo app password mới
4. Copy password và paste vào `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

---

## 🎉 Chúc bạn code vui vẻ!

Nếu có vấn đề, hãy kiểm tra:
1. ✅ Backend đang chạy ở port 3000
2. ✅ Frontend đang chạy ở port 5173
3. ✅ Database đã được tạo và import schema
4. ✅ File `.env` đã được cấu hình đúng
