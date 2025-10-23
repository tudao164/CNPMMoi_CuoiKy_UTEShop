import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderTrackingResponse,
  OrderStats,
  OrderListResponse,
  Order
} from '@/types/order.types';

export const orderService = {
  // 1. Create order from cart
  async createOrderFromCart(data: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    const response = await axiosInstance.post('/api/orders/from-cart', data);
    return response.data;
  },

  // 2. Get order tracking
  async getOrderTracking(orderId: number): Promise<ApiResponse<OrderTrackingResponse>> {
    const response = await axiosInstance.get(`/api/orders/${orderId}/tracking`);
    return response.data;
  },

  // 3. Get orders list with filters
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    order_by?: string;
    order_dir?: string;
  }): Promise<ApiResponse<OrderListResponse>> {
    const response = await axiosInstance.get('/api/orders', { params });
    return response.data;
  },

  // 4. Get order by ID
  async getOrderById(orderId: number): Promise<ApiResponse<Order>> {
    const response = await axiosInstance.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // 5. Get order stats
  async getOrderStats(): Promise<ApiResponse<{ stats: OrderStats }>> {
    const response = await axiosInstance.get('/api/orders/stats');
    return response.data;
  }
};
