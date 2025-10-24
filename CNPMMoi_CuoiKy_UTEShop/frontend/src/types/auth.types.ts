export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url?: string;
  is_verified: boolean;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
    token_type?: string;
    message?: string;
  };
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
  timestamp: string;
}

// Auth Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface ResendOtpRequest {
  email: string;
  otp_type: 'register' | 'reset_password';
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
