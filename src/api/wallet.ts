import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { WalletBalance, WalletTransaction } from '@/types/models';
import { apiClient } from './client';

export type LoadRequestBody = {
  amount: number;
  payment_method: 'bank_transfer' | 'upi' | 'neft' | 'rtgs';
  utr_number: string;
  bank_reference?: string;
};

export const walletApi = {
  async balance() {
    const { data } = await apiClient.get<ApiSuccess<WalletBalance>>(
      '/wallet/balance'
    );
    return data.data;
  },

  async transactions(page = 1) {
    const { data } = await apiClient.get<
      ApiPaginated<WalletTransaction> | ApiSuccess<{ transactions: [] }>
    >('/wallet/transactions', { params: { page } });

    if ('data' in data && Array.isArray(data.data)) {
      return data as ApiPaginated<WalletTransaction>;
    }
    return {
      success: true as const,
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    };
  },

  async requestLoad(body: LoadRequestBody) {
    const { data } = await apiClient.post<
      ApiSuccess<{ request_id: number; amount: number; status: string }>
    >('/wallet/load-request', body);
    return data.data;
  },

  async loadRequestStatus(loadRequestId: number) {
    const { data } = await apiClient.get<
      ApiSuccess<{
        id: number;
        amount: number;
        status: string;
        created_at?: string;
        updated_at?: string;
      }>
    >(`/wallet/load-request/${loadRequestId}`);
    return data.data;
  },
};
