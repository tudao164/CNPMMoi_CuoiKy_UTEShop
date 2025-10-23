import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import {
  RegisterRequest,
  VerifyOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendOtpRequest,
  AuthResponse,
  ApiResponse,
  User,
} from '@/types/auth.types';

export const authService = {
  // Register new account
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.VERIFY_OTP,
      data
    );
    return response.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      data
    );
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.LOGOUT
    );
    return response.data;
  },

  // Forgot password
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  // Reset password
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  // Resend OTP
  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.RESEND_OTP,
      data
    );
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<{ user: User; is_authenticated: boolean }>> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User; is_authenticated: boolean }>>(
      API_ENDPOINTS.ME
    );
    return response.data;
  },
};
