import api from '@/lib/axios';

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  product_count: number;
}

export const categoryService = {
  // Get all categories
  getAll: async () => {
    const response = await api.get<{
      success: boolean;
      data: {
        categories: Category[];
        total: number;
      };
    }>('/api/products/categories');
    return response.data;
  },
};
