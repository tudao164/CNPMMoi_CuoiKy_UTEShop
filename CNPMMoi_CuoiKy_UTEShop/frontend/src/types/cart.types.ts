// Cart Types
export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  category_name: string;
  quantity: number;
  price: number;
  sale_price: number | null;
  effective_price: number;
  total_price: number;
  discount_amount: number;
  stock_quantity: number;
  is_available: boolean;
  added_at: string;
  updated_at: string;
}

export interface CartSummary {
  total_items: number;
  total_quantity: number;
  total_amount: number;
  original_amount: number;
  total_savings: number;
}

export interface CartValidation {
  is_valid: boolean;
  invalid_items: string[];
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
  validation: CartValidation;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface BulkAddToCartRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export interface SyncCartRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export interface AddToCartResponse {
  item: {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    effective_price: number;
    total_price: number;
    is_available: boolean;
  };
  summary: CartSummary;
}

export interface UpdateCartItemResponse {
  item: {
    id: number;
    quantity: number;
    total_price: number;
  };
  summary: CartSummary;
}

export interface DeleteCartItemResponse {
  summary: CartSummary;
}
