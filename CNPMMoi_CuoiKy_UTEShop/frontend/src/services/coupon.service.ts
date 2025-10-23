import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
  ValidateCouponRequest,
  ValidateCouponResponse,
  AvailableCouponsResponse,
  Coupon
} from '@/types/coupon.types';

export const couponService = {
  // 1. Validate coupon
  async validateCoupon(data: ValidateCouponRequest): Promise<ApiResponse<ValidateCouponResponse>> {
    const response = await axiosInstance.post('/api/coupons/validate', data);
    return response.data;
  },

  // 2. Get available coupons
  async getAvailableCoupons(orderAmount?: number): Promise<ApiResponse<AvailableCouponsResponse>> {
    const params = orderAmount ? { order_amount: orderAmount } : {};
    const response = await axiosInstance.get('/api/coupons/available', { params });
    return response.data;
  },

  // 3. Get coupon by code
  async getCouponByCode(code: string): Promise<ApiResponse<Coupon>> {
    const response = await axiosInstance.get(`/api/coupons/${code}`);
    return response.data;
  }
};
