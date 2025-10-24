import api from '@/lib/axios';
import {
  AdminProduct,
  ProductStats,
  CreateProductData,
  UpdateProductData,
  AdminUser,
  AdminUserDetail,
  UserStats,
  CreateUserData,
  UpdateUserData,
  AdminOrder,
  AdminOrderDetail,
  OrderStats,
  UpdateOrderStatusData,
} from '@/types/admin.types';

// ============ ADMIN PRODUCTS ============
export const adminProductService = {
  // Get all products (including inactive)
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    search?: string;
    is_active?: boolean;
    stock_status?: 'out_of_stock' | 'low_stock' | 'in_stock';
  }) => {
    const response = await api.get<{
      success: boolean;
      data: AdminProduct[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/api/admin/products', { params });
    return response.data;
  },

  // Get product statistics
  getStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: { stats: ProductStats };
    }>('/api/admin/products/stats');
    return response.data;
  },

  // Create new product
  createProduct: async (data: CreateProductData) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { product: AdminProduct };
    }>('/api/admin/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id: number, data: UpdateProductData) => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: { product: AdminProduct };
    }>(`/api/admin/products/${id}`, data);
    return response.data;
  },

  // Delete product (soft delete)
  deleteProduct: async (id: number) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/api/admin/products/${id}`);
    return response.data;
  },

  // Activate product
  activateProduct: async (id: number) => {
    const response = await api.patch<{
      success: boolean;
      message: string;
    }>(`/api/admin/products/${id}/activate`);
    return response.data;
  },

  // Update stock
  updateStock: async (id: number, stock_quantity: number) => {
    const response = await api.patch<{
      success: boolean;
      message: string;
    }>(`/api/admin/products/${id}/stock`, { stock_quantity });
    return response.data;
  },
};

// ============ ADMIN USERS ============
export const adminUserService = {
  // Get all users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: AdminUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/api/admin/users', { params });
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: { stats: UserStats };
    }>('/api/admin/users/stats');
    return response.data;
  },

  // Get user detail
  getUserDetail: async (id: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        user: AdminUser;
        stats: AdminUserDetail['stats'];
      };
    }>(`/api/admin/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserData) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { user: AdminUser };
    }>('/api/admin/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, data: UpdateUserData) => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: { user: AdminUser };
    }>(`/api/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/api/admin/users/${id}`);
    return response.data;
  },

  // Reset user password
  resetPassword: async (id: number, new_password: string) => {
    const response = await api.patch<{
      success: boolean;
      message: string;
    }>(`/api/admin/users/${id}/password`, { new_password });
    return response.data;
  },

  // Toggle admin status
  toggleAdmin: async (id: number) => {
    const response = await api.patch<{
      success: boolean;
      message: string;
    }>(`/api/admin/users/${id}/toggle-admin`);
    return response.data;
  },
};

// ============ ADMIN ORDERS ============
export const adminOrderService = {
  // Get all orders
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_method?: string;
    payment_status?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: AdminOrder[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/api/admin/orders', { params });
    return response.data;
  },

  // Get order statistics
  getStats: async (params?: { date_from?: string; date_to?: string }) => {
    const response = await api.get<{
      success: boolean;
      data: { stats: OrderStats };
    }>('/api/admin/orders/stats', { params });
    return response.data;
  },

  // Get order detail
  getOrderDetail: async (id: number) => {
    const response = await api.get<{
      success: boolean;
      data: {
        order: AdminOrder;
        items: AdminOrderDetail['items'];
        history: AdminOrderDetail['history'];
      };
    }>(`/api/admin/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: number, data: UpdateOrderStatusData) => {
    const response = await api.patch<{
      success: boolean;
      message: string;
    }>(`/api/admin/orders/${id}/status`, data);
    return response.data;
  },

  // Export orders
  exportOrders: async (params?: {
    date_from?: string;
    date_to?: string;
    status?: string;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: { orders: AdminOrder[] };
    }>('/api/admin/orders/export', { params });
    return response.data;
  },

  // Delete order (only cancelled orders)
  deleteOrder: async (id: number) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/api/admin/orders/${id}`);
    return response.data;
  },
};
