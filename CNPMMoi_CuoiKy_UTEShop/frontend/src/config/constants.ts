// API Base URL
export const API_BASE_URL = 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  VERIFY_OTP: '/api/auth/verify-otp',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  RESEND_OTP: '/api/auth/resend-otp',
  ME: '/api/auth/me',
  
  // User
  PROFILE: '/api/user/profile',
  CHANGE_PASSWORD: '/api/user/change-password',
  STATS: '/api/user/stats',
  OTPS: '/api/user/otps',
  DELETE_ACCOUNT: '/api/user/account',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'uteshop_token',
  USER: 'uteshop_user',
  REMEMBER_EMAIL: 'uteshop_remember_email',
};

// OTP Types
export const OTP_TYPES = {
  REGISTER: 'register',
  RESET_PASSWORD: 'reset_password',
};

// Validation Rules
export const VALIDATION = {
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  },
  FULL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-ZÀ-ỹ\s]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 11,
    PATTERN: /^[0-9]+$/,
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^[0-9]{6}$/,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  EMAIL_INVALID: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 8 ký tự',
  PASSWORD_WEAK: 'Mật khẩu phải có chữ hoa, chữ thường và số',
  PASSWORD_NOT_MATCH: 'Mật khẩu không khớp',
  FULL_NAME_INVALID: 'Họ tên chỉ được chứa chữ cái và khoảng trắng',
  PHONE_INVALID: 'Số điện thoại không hợp lệ',
  OTP_INVALID: 'Mã OTP phải có 6 chữ số',
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng thử lại',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực',
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',
  VERIFY_OTP_SUCCESS: 'Xác thực thành công!',
  FORGOT_PASSWORD_SUCCESS: 'Đã gửi mã OTP qua email',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công!',
  RESEND_OTP_SUCCESS: 'Đã gửi lại mã OTP',
};
