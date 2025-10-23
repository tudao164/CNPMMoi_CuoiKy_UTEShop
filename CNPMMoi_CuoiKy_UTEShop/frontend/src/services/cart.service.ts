import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types/auth.types';
import {
  Cart,
  AddToCartRequest,
  AddToCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  DeleteCartItemResponse,
  BulkAddToCartRequest,
  SyncCartRequest,
  CartSummary,
  CartValidation
} from '@/types/cart.types';

export const cartService = {
  // 1. Lấy giỏ hàng
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await axiosInstance.get('/api/cart');
    return response.data;
  },

  // 2. Thêm sản phẩm vào giỏ hàng
  async addToCart(data: AddToCartRequest): Promise<ApiResponse<AddToCartResponse>> {
    const response = await axiosInstance.post('/api/cart/add', data);
    return response.data;
  },

  // 3. Cập nhật số lượng sản phẩm
  async updateCartItem(
    itemId: number,
    data: UpdateCartItemRequest
  ): Promise<ApiResponse<UpdateCartItemResponse>> {
    const response = await axiosInstance.put(`/api/cart/${itemId}`, data);
    return response.data;
  },

  // 4. Xóa sản phẩm khỏi giỏ hàng
  async removeCartItem(itemId: number): Promise<ApiResponse<DeleteCartItemResponse>> {
    const response = await axiosInstance.delete(`/api/cart/${itemId}`);
    return response.data;
  },

  // 5. Xóa toàn bộ giỏ hàng
  async clearCart(): Promise<ApiResponse<null>> {
    const response = await axiosInstance.delete('/api/cart');
    return response.data;
  },

  // 6. Lấy tóm tắt giỏ hàng
  async getCartSummary(): Promise<ApiResponse<CartSummary>> {
    const response = await axiosInstance.get('/api/cart/summary');
    return response.data;
  },

  // 7. Kiểm tra tính hợp lệ giỏ hàng
  async validateCart(): Promise<ApiResponse<CartValidation>> {
    const response = await axiosInstance.get('/api/cart/validate');
    return response.data;
  },

  // 8. Thêm nhiều sản phẩm cùng lúc
  async bulkAddToCart(data: BulkAddToCartRequest): Promise<ApiResponse<AddToCartResponse>> {
    const response = await axiosInstance.post('/api/cart/bulk-add', data);
    return response.data;
  },

  // 9. Đồng bộ giỏ hàng
  async syncCart(data: SyncCartRequest): Promise<ApiResponse<Cart>> {
    const response = await axiosInstance.post('/api/cart/sync', data);
    return response.data;
  }
};
