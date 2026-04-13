import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { Order, PlaceOrderPayload, PlaceOrderResult, VoucherReveal } from '@/types/models';
import { apiClient } from './client';

export const ordersApi = {
  async list(page = 1) {
    const { data } = await apiClient.get<ApiPaginated<Order>>('/orders', {
      params: { page },
    });
    return data;
  },

  async getById(orderId: number | string) {
    const { data } = await apiClient.get<ApiSuccess<{ order: Order }>>(
      `/orders/${orderId}`
    );
    return data.data.order;
  },

  async place(body: PlaceOrderPayload) {
    const { data } = await apiClient.post<ApiSuccess<PlaceOrderResult>>(
      '/orders',
      body
    );
    return data.data;
  },

  async getVoucherCode(orderId: number | string) {
    const { data } = await apiClient.get<ApiSuccess<VoucherReveal>>(
      `/orders/${orderId}/voucher-code`
    );
    return data.data;
  },
};
