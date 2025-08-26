// API Response status codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

// OTP types
const OTP_TYPES = {
    REGISTER: 'register',
    RESET_PASSWORD: 'reset_password'
};

// JWT expiration times
const JWT_EXPIRES = {
    ACCESS_TOKEN: '7d',
    REFRESH_TOKEN: '30d'
};

// OTP settings
const OTP_SETTINGS = {
    LENGTH: 6,
    EXPIRE_MINUTES: 5,
    MAX_ATTEMPTS: 3
};

// Email templates
const EMAIL_SUBJECTS = {
    VERIFY_ACCOUNT: 'UTEShop - Xác thực tài khoản',
    RESET_PASSWORD: 'UTEShop - Đặt lại mật khẩu',
    WELCOME: 'UTEShop - Chào mừng bạn đến với UTEShop'
};

// Validation patterns
const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[0-9]{10,11}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

// Error messages
const ERROR_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    EMAIL_EXISTS: 'Email đã được sử dụng',
    USER_NOT_FOUND: 'Người dùng không tồn tại',
    ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác thực',
    
    // OTP
    INVALID_OTP: 'Mã OTP không hợp lệ',
    OTP_EXPIRED: 'Mã OTP đã hết hạn',
    OTP_ALREADY_USED: 'Mã OTP đã được sử dụng',
    OTP_NOT_FOUND: 'Mã OTP không tồn tại',
    
    // Validation
    INVALID_EMAIL: 'Email không hợp lệ',
    INVALID_PHONE: 'Số điện thoại không hợp lệ',
    WEAK_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
    REQUIRED_FIELD: 'Trường này là bắt buộc',
    
    // JWT
    INVALID_TOKEN: 'Token không hợp lệ',
    TOKEN_EXPIRED: 'Token đã hết hạn',
    TOKEN_REQUIRED: 'Token là bắt buộc',
    
    // Server
    INTERNAL_ERROR: 'Lỗi server nội bộ',
    DATABASE_ERROR: 'Lỗi cơ sở dữ liệu',
    EMAIL_SEND_ERROR: 'Không thể gửi email'
};

// Success messages
const SUCCESS_MESSAGES = {
    REGISTER_SUCCESS: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản',
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    OTP_SENT: 'Mã OTP đã được gửi đến email của bạn',
    OTP_VERIFIED: 'Xác thực OTP thành công',
    PASSWORD_RESET: 'Đặt lại mật khẩu thành công',
    PROFILE_UPDATED: 'Cập nhật thông tin thành công'
};

module.exports = {
    HTTP_STATUS,
    OTP_TYPES,
    JWT_EXPIRES,
    OTP_SETTINGS,
    EMAIL_SUBJECTS,
    VALIDATION_PATTERNS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
};
