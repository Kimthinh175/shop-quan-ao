import { apiClient } from './apiClient';

export interface CreateOrderPayload {
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  note?: string;
  payment_method: 'COD' | 'TRANSFER';
  items: {
    product_variant_id: string | null;
    quantity: number;
    price?: number;
    name?: string;
    color?: string;
    size?: string;
    image?: string;
  }[];
  promotion_id?: string;
}

export interface OrderResponse {
  _id?: string;
  order_code?: string;
  status?: string;
  total_price?: number;
  total_amount?: number;
  receiver_name?: string;
  receiver_phone?: string;
  receiver_address?: string;
  payment_method?: string;
  note?: string;
  created_at?: string;
  createdAt?: string;
  items?: any[];
  payos_checkout_url?: string;
  [key: string]: any;
}

export interface ShippingFeePayload {
  to_district_id: number;
  to_ward_code: string;
  total_items?: number;
}

class OrderService {
  async createOrder(data: CreateOrderPayload): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>('/orders', data);
  }

  async getMyOrders(params?: { page?: number; limit?: number }): Promise<any> {
    return apiClient.get<any>('/orders/my-orders', { params });
  }

  async getOrderById(id: string): Promise<OrderResponse> {
    return apiClient.get<OrderResponse>(`/orders/${id}`);
  }

  async calculateShippingFee(data: ShippingFeePayload): Promise<{ fee: number }> {
    return apiClient.post<{ fee: number }>('/orders/shipping-fee', data);
  }

  async getAllOrders(params?: { page?: number; limit?: number; status?: string; search?: string; is_pos?: boolean }): Promise<{ data: OrderResponse[]; pagination: any }> {
    return apiClient.get('/orders', { params });
  }

  async updateOrderStatus(orderId: string | number, status: string): Promise<OrderResponse> {
    return apiClient.put(`/orders/${orderId}/status`, { status });
  }

  async getPayosLink(orderId: string): Promise<{ checkout_url: string }> {
    return apiClient.get<{ checkout_url: string }>(`/orders/${orderId}/payos-link`);
  }
}

export const orderService = new OrderService();
