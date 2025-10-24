export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
  user_name: string;
  user_avatar?: string;
  product_name?: string;
  product_image?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  verified_purchases: number;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateReviewData {
  product_id: number;
  order_id: number;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
}

export type ReviewSortType = 'recent' | 'helpful' | 'rating_high' | 'rating_low';
