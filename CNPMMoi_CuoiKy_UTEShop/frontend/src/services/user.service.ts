import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constants';
import { ApiResponse, User, ChangePasswordRequest } from '@/types/auth.types';

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UserStats {
  account_created: string;
  is_verified: boolean;
  total_otp_requests: number;
  used_otps: number;
  expired_otps: number;
  last_otp_time: string | null;
}

export interface OTPHistory {
  id: number;
  otp_type: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
  is_expired: boolean;
  time_until_expiration: number;
}

export const userService = {
  // Get profile
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.PROFILE
    );
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.PROFILE,
      data
    );
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  // Get user statistics
  getStats: async (): Promise<ApiResponse<UserStats>> => {
    const response = await axiosInstance.get<ApiResponse<UserStats>>(
      API_ENDPOINTS.STATS
    );
    return response.data;
  },

  // Get OTP history
  getOTPHistory: async (limit: number = 10): Promise<ApiResponse<{ otps: OTPHistory[]; total: number }>> => {
    const response = await axiosInstance.get<ApiResponse<{ otps: OTPHistory[]; total: number }>>(
      `${API_ENDPOINTS.OTPS}?limit=${limit}`
    );
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      API_ENDPOINTS.DELETE_ACCOUNT,
      { data: { password } }
    );
    return response.data;
  },
};
