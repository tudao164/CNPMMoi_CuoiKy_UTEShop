// Cancel Request Types
export interface CancelRequest {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  status: string; // pending, approved, rejected
  status_text: string;
  status_color: string;
  admin_response: string | null;
  processed_by: number | null;
  processed_by_name: string | null;
  created_at: string;
  processed_at: string | null;
  is_editable: boolean;
  can_be_withdrawn: boolean;
  is_urgent: boolean;
  processing_time_hours: number | null;
  order_total_amount: number;
  order_status: string;
  order_created_at?: string;
  shipping_address?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface CreateCancelRequestRequest {
  order_id: number;
  reason: string;
}

export interface CreateCancelRequestResponse {
  cancel_request: CancelRequest;
}

export interface CancelRequestListResponse {
  cancel_requests: CancelRequest[]; // Backend trả về cancel_requests, không phải requests
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  message?: string;
}
