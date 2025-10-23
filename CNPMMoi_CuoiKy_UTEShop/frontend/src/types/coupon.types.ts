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
