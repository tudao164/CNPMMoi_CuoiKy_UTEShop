import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
  CreateCancelRequestRequest,
  CreateCancelRequestResponse,
  CancelRequestListResponse,
  CancelRequest
} from '@/types/cancelRequest.types';

export const cancelRequestService = {
  // 1. Create cancel request
  async createCancelRequest(data: CreateCancelRequestRequest): Promise<ApiResponse<CreateCancelRequestResponse>> {
    const response = await axiosInstance.post('/api/cancel-requests', data);
    return response.data;
  },

  // 2. Get cancel requests list
  async getCancelRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<CancelRequestListResponse>> {
    const response = await axiosInstance.get('/api/cancel-requests', { params });
    return response.data;
  },

  // 3. Get cancel request by ID
  async getCancelRequestById(id: number): Promise<ApiResponse<{ cancel_request: CancelRequest }>> {
    const response = await axiosInstance.get(`/api/cancel-requests/${id}`);
    return response.data;
  },

  // 4. Get cancel request by order ID
  async getCancelRequestByOrderId(orderId: number): Promise<ApiResponse<{ cancel_request: CancelRequest }>> {
    const response = await axiosInstance.get(`/api/cancel-requests/order/${orderId}`);
    return response.data;
  }
};
