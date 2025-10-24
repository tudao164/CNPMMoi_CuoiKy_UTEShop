import axios from '@/lib/axios';
import type {
  Review,
  ProductReviewsResponse,
  CreateReviewData,
  UpdateReviewData,
  CanReviewResponse,
  ReviewSortType,
} from '@/types/review.types';

interface GetProductReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: ReviewSortType;
}

interface GetMyReviewsParams {
  page?: number;
  limit?: number;
}

export const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId: number, params?: GetProductReviewsParams) => {
    const response = await axios.get<{ success: boolean; data: ProductReviewsResponse }>(
      `/api/reviews/product/${productId}`,
      { params }
    );
    return response.data;
  },

  // Get current user's reviews
  getMyReviews: async (params?: GetMyReviewsParams) => {
    const response = await axios.get<{
      success: boolean;
      data: {
        reviews: Review[];
        pagination: {
          current_page: number;
          per_page: number;
          total: number;
          total_pages: number;
        };
      };
    }>('/api/reviews/my-reviews', { params });
    return response.data;
  },

  // Create a new review
  createReview: async (data: CreateReviewData) => {
    const response = await axios.post<{ success: boolean; data: Review; message: string }>(
      '/api/reviews',
      data
    );
    return response.data;
  },

  // Update a review
  updateReview: async (id: number, data: UpdateReviewData) => {
    const response = await axios.put<{ success: boolean; data: Review; message: string }>(
      `/api/reviews/${id}`,
      data
    );
    return response.data;
  },

  // Delete a review
  deleteReview: async (id: number) => {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `/api/reviews/${id}`
    );
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (id: number) => {
    const response = await axios.post<{
      success: boolean;
      data: { action: 'added' | 'removed' };
      message: string;
    }>(`/api/reviews/${id}/helpful`);
    return response.data;
  },

  // Check if user can review a product
  canReview: async (productId: number, orderId: number) => {
    const response = await axios.get<{ success: boolean; data: CanReviewResponse }>(
      `/api/reviews/can-review/${productId}/${orderId}`
    );
    return response.data;
  },
};
