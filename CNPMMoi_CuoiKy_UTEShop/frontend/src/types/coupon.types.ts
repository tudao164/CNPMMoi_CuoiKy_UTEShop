// Coupon Types
export interface CouponValidationItem {
  product_id: number;
  price: number;
  quantity: number;
}

export interface ValidateCouponRequest {
  code: string;
  items: CouponValidationItem[];
}

export interface ValidateCouponResponse {
  coupon_id: number;
  coupon_code: string;
  discount_amount: number;
  subtotal: number;
  final_amount: number;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: 'all' | 'category' | 'product';
  applies_to_ids: number[] | null;
  user_usage_count?: number;
}

export interface AvailableCouponsResponse {
  coupons: Coupon[];
  count: number;
}

// Admin Coupon Types
export interface AdminCoupon extends Coupon {
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  per_user_limit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: 'all' | 'category' | 'product';
  applies_to_ids?: number[] | null;
}

export interface UpdateCouponData {
  description?: string;
  discount_value?: number;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  per_user_limit?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  applies_to?: 'all' | 'category' | 'product';
  applies_to_ids?: number[] | null;
}

export interface CouponStats {
  overview: {
    total_coupons: number;
    active_coupons: number;
    inactive_coupons: number;
    percentage_coupons: number;
    fixed_coupons: number;
    total_usage: number;
    expired_coupons: number;
  };
  usage: {
    total_redemptions: number;
    total_discount_given: number;
    unique_users: number;
    used_coupons: number;
  };
  top_coupons: Array<{
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    usage_count: number;
    total_discount_given: number;
  }>;
}

export interface CouponDetailStats {
  coupon: {
    id: number;
    code: string;
    description: string;
  };
  statistics: {
    code: string;
    usage_count: number;
    usage_limit: number | null;
    actual_usage: number;
    total_discount_given: number;
    unique_users: number;
  };
  recent_usage: Array<{
    id: number;
    coupon_id: number;
    user_id: number;
    order_id: number;
    discount_amount: number;
    created_at: string;
    user_name: string;
    user_email: string;
    order_total: number;
  }>;
}
