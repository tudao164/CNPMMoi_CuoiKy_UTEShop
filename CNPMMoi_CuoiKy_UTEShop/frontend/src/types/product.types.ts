export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  discount_percentage: number;
  effective_price: number;
  savings_amount: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  category_id: number;
  category_name: string;
  image_url: string;
  images: string[];
  specifications: Record<string, any>;
  view_count: number;
  sold_count: number;
  is_featured: boolean;
  is_on_sale: boolean;
  is_in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail {
  product: Product;
  related_products: Product[];
  category: Category;
}

export interface HomePageData {
  latest_products: Product[];
  best_selling_products: Product[];
  most_viewed_products: Product[];
  highest_discount_products: Product[];
  categories: Category[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination: Pagination;
  timestamp: string;
}

export interface ProductDetailResponse {
  success: boolean;
  message?: string;
  data: ProductDetail;
  timestamp: string;
}

export interface HomePageResponse {
  success: boolean;
  data: HomePageData;
  timestamp: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  timestamp: string;
}

// Product Filter & Sort Types
export type SortBy = 
  | 'price_asc' 
  | 'price_desc' 
  | 'name' 
  | 'popularity' 
  | 'best_selling' 
  | 'newest';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: SortBy;
  on_sale?: boolean;
  in_stock?: boolean;
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}
