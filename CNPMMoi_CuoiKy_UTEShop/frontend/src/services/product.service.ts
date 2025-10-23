import axiosInstance from '@/lib/axios';
import {
  ProductFilters,
  SearchParams,
  ProductListResponse,
  ProductDetailResponse,
  HomePageResponse,
  CategoriesResponse,
} from '@/types/product.types';

const PRODUCT_ENDPOINTS = {
  HOME: '/api/products/home',
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: number) => `/api/products/${id}`,
  SEARCH: '/api/products/search',
  CATEGORIES: '/api/products/categories',
  CATEGORY_PRODUCTS: (categoryId: number) => `/api/products/categories/${categoryId}/products`,
  RELATED_PRODUCTS: (id: number) => `/api/products/${id}/related`,
  LATEST: '/api/products/latest',
  BEST_SELLING: '/api/products/best-selling',
  MOST_VIEWED: '/api/products/most-viewed',
  HIGHEST_DISCOUNT: '/api/products/highest-discount',
};

export const productService = {
  // Get home page data
  getHomePageData: async (): Promise<HomePageResponse> => {
    const response = await axiosInstance.get<HomePageResponse>(
      PRODUCT_ENDPOINTS.HOME
    );
    return response.data;
  },

  // Get all products with filters
  getProducts: async (filters?: ProductFilters): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.on_sale !== undefined) params.append('on_sale', filters.on_sale.toString());
      if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString());
    }

    const response = await axiosInstance.get<ProductListResponse>(
      `${PRODUCT_ENDPOINTS.PRODUCTS}?${params.toString()}`
    );
    return response.data;
  },

  // Get product detail
  getProductDetail: async (id: number): Promise<ProductDetailResponse> => {
    const response = await axiosInstance.get<ProductDetailResponse>(
      PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id)
    );
    return response.data;
  },

  // Search products
  searchProducts: async (params: SearchParams): Promise<ProductListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.q);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<ProductListResponse>(
      `${PRODUCT_ENDPOINTS.SEARCH}?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await axiosInstance.get<CategoriesResponse>(
      PRODUCT_ENDPOINTS.CATEGORIES
    );
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (
    categoryId: number,
    filters?: Omit<ProductFilters, 'category_id'>
  ): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.on_sale !== undefined) params.append('on_sale', filters.on_sale.toString());
      if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString());
    }

    const response = await axiosInstance.get<ProductListResponse>(
      `${PRODUCT_ENDPOINTS.CATEGORY_PRODUCTS(categoryId)}?${params.toString()}`
    );
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (id: number): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(
      PRODUCT_ENDPOINTS.RELATED_PRODUCTS(id)
    );
    return response.data;
  },

  // Get latest products
  getLatestProducts: async (): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(
      PRODUCT_ENDPOINTS.LATEST
    );
    return response.data;
  },

  // Get best selling products
  getBestSellingProducts: async (): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(
      PRODUCT_ENDPOINTS.BEST_SELLING
    );
    return response.data;
  },

  // Get most viewed products
  getMostViewedProducts: async (): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(
      PRODUCT_ENDPOINTS.MOST_VIEWED
    );
    return response.data;
  },

  // Get highest discount products
  getHighestDiscountProducts: async (): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(
      PRODUCT_ENDPOINTS.HIGHEST_DISCOUNT
    );
    return response.data;
  },
};
