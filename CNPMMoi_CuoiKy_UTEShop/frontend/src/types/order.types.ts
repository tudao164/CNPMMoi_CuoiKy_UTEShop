// Order Item
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  product_name: string;
  product_image: string;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  from_status: string | null;
  to_status: string;
  reason: string;
  updated_by: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  coupon_code: string | null;
  payment_method: string;
  status: string;
  status_text: string;
  status_color: string;
  shipping_address: string;
  notes: string;
  items: OrderItem[];
  total_items: number;
  status_history: OrderStatusHistory[];
  can_be_cancelled_by_user: boolean;
  can_be_cancelled_immediately: boolean;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
}

export interface AppliedCoupon {
  code: string;
  discount_amount: number;
  subtotal_amount: number;
  total_amount: number;
}

export interface CreateOrderRequest {
  shipping_address: string;
  notes?: string;
  payment_method: 'COD' | 'E_WALLET' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  coupon_code?: string;
}

export interface CreateOrderResponse {
  order: Order;
  cart_cleared: boolean;
  applied_coupon: AppliedCoupon | null;
}

export interface OrderTracking {
  id: number;
  status: string;
  status_text: string;
  status_color: string;
  notes: string;
  changed_by_name: string | null;
  actor_name: string;
  changed_at: string;
  time_elapsed: string;
}

export interface OrderTrackingResponse {
  order: {
    id: number;
    status: string;
    status_text: string;
    total_amount: number;
    created_at: string;
  };
  tracking: OrderTracking[];
}

export interface OrderStats {
  total_orders: number;
  new_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  shipping_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  cancel_requested_orders: number;
  total_spent: number;
}

export interface OrderListItem {
  id: number;
  status: string;
  status_text: string;
  status_color: string;
  total_amount: number;
  discount_amount: number;
  coupon_code: string | null;
  payment_method: string;
  total_items: number;
  can_be_cancelled_by_user: boolean;
  created_at: string;
}

export interface OrderListResponse {
  orders: OrderListItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
