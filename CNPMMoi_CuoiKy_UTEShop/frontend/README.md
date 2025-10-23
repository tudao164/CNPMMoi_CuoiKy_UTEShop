# UTEShop Frontend

Frontend cho ứng dụng thương mại điện tử UTEShop được xây dựng với React, TypeScript và Tailwind CSS.

## 🚀 Tính năng hiện tại

### Authentication System (Hoàn thiện 100%)
- ✅ Đăng ký tài khoản với xác thực OTP qua email
- ✅ Đăng nhập với JWT token
- ✅ Xác thực OTP
- ✅ Quên mật khẩu
- ✅ Đặt lại mật khẩu với OTP
- ✅ Gửi lại mã OTP
- ✅ Đăng xuất
- ✅ Kiểm tra trạng thái đăng nhập
- ✅ Protected Routes
- ✅ Remember Me

## 🛠️ Công nghệ sử dụng

- **React 18** - Thư viện UI
- **TypeScript** - Type safety
- **Vite** - Build tool & Dev server
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Zustand** - State management
- **React Hook Form** - Form validation
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling

## 📦 Cài đặt

### 1. Clone repository và di chuyển vào thư mục frontend

```bash
cd frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình

Backend API đang chạy ở `http://localhost:3000` (đã được cấu hình trong vite.config.ts)

Nếu backend chạy ở port khác, chỉnh sửa file:
- `frontend/src/config/constants.ts` - Thay đổi `API_BASE_URL`
- `frontend/vite.config.ts` - Thay đổi proxy target

### 4. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 5. Build cho production

```bash
npm run build
```

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── config/           # Configuration & constants
│   │   └── constants.ts
│   ├── lib/              # Libraries setup
│   │   └── axios.ts      # Axios instance với interceptors
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── VerifyOtpPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   └── HomePage.tsx
│   ├── services/         # API services
│   │   └── auth.service.ts
│   ├── store/            # Zustand stores
│   │   └── authStore.ts
│   ├── types/            # TypeScript types
│   │   └── auth.types.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔐 Authentication Flow

### Đăng ký
1. User điền form đăng ký
2. Backend gửi OTP qua email
3. User nhập OTP để xác thực
4. Sau khi xác thực thành công, tự động đăng nhập

### Đăng nhập
1. User nhập email và mật khẩu
2. Backend trả về JWT token
3. Token được lưu vào localStorage và Zustand store
4. Token tự động đính kèm vào mọi request

### Quên mật khẩu
1. User nhập email
2. Backend gửi OTP qua email
3. User nhập OTP để xác thực
4. User nhập mật khẩu mới
5. Đặt lại mật khẩu thành công

## 🎨 UI Components

### Tailwind CSS Classes (Custom)
- `btn` - Button base
- `btn-primary` - Primary button (blue)
- `btn-secondary` - Secondary button (gray)
- `btn-disabled` - Disabled state
- `input` - Input field
- `input-error` - Input with error
- `label` - Form label
- `error-text` - Error message
- `card` - Card container

## 📝 API Endpoints được sử dụng

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/resend-otp` - Gửi lại OTP
- `GET /api/auth/me` - Lấy thông tin user hiện tại

## 🔒 State Management

### Zustand Store (authStore)
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  setUser: (user) => void,
  setToken: (token) => void,
  setAuth: (user, token) => void,
  logout: () => void,
  setLoading: (loading) => void
}
```

## 🛡️ Form Validation

Validation rules được định nghĩa trong `src/config/constants.ts`:

- **Email**: Format hợp lệ, max 255 ký tự
- **Password**: Min 8 ký tự, có chữ hoa, chữ thường, số
- **Full Name**: 2-255 ký tự, chỉ chữ cái và khoảng trắng
- **Phone**: 10-11 số
- **OTP**: 6 chữ số

## 📱 Responsive Design

UI được thiết kế responsive cho tất cả các thiết bị:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚧 Tính năng tiếp theo

- [ ] Product listing & detail
- [ ] Shopping cart
- [ ] Checkout
- [ ] Order management
- [ ] User profile
- [ ] Admin dashboard

## 🐛 Troubleshooting

### Port 5173 đã được sử dụng
```bash
# Thay đổi port trong vite.config.ts
server: {
  port: 5174, // Đổi sang port khác
}
```

### Backend không kết nối được
- Kiểm tra backend đang chạy ở `http://localhost:3000`
- Kiểm tra CORS đã được enable trong backend
- Kiểm tra proxy config trong `vite.config.ts`

### TypeScript errors
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License

## 👥 Contributors

- UTE Students

---

**Happy Coding! 🎉**
