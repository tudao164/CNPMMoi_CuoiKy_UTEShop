// Admin Product Types
export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  category_id: number;
  category_name?: string;
  image_url: string;
  images: string[];
  specifications: any;
  is_active: boolean;
  is_featured: boolean;
  total_sold: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  out_of_stock: number;
  low_stock: number;
  in_stock: number;
  on_sale: number;
  total_sold: number;
  total_views: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  category_id: number;
  image_url: string;
  images?: string[];
  specifications?: any;
  is_featured?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  stock_quantity?: number;
  category_id?: number;
  image_url?: string;
  images?: string[];
  specifications?: any;
  is_active?: boolean;
  is_featured?: boolean;
}

// Admin User Types
export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  address: string | null;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  stats: {
    total_orders: number;
    total_spent: number;
    last_order_date: string | null;
  };
}

export interface UserStats {
  total_users: number;
  verified_users: number;
  new_users_30d: number;
  new_users_7d: number;
  admin_count: number;
  users_today: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  is_admin?: boolean;
  is_verified?: boolean;
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  address?: string;
  is_verified?: boolean;
  is_admin?: boolean;
}

// Admin Order Types
export interface AdminOrder {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  total_amount: number;
  status: 'new' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'cancel_requested';
  payment_method: 'COD' | 'E_WALLET';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: string;
  shipping_phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderDetail extends AdminOrder {
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    image_url: string;
  }>;
  history: Array<{
    id: number;
    status: string;
    notes: string;
    changed_by_name: string | null;
    created_at: string;
  }>;
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
  total_revenue: number;
  completed_revenue: number;
  average_order_value: number;
  orders_today: number;
  revenue_today: number;
  payment_breakdown: Array<{
    payment_method: string;
    count: number;
    total_amount: number;
  }>;
}

export interface UpdateOrderStatusData {
  status: 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  products: ProductStats;
  users: UserStats;
  orders: OrderStats;
}
