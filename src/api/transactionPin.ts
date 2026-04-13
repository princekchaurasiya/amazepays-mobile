import type { ApiSuccess } from '@/types/api';
import { apiClient } from './client';

export const transactionPinApi = {
  async set(pin: string, pin_confirm: string) {
    await apiClient.post<ApiSuccess<[]>>('/transaction-pin/set', {
      pin,
      pin_confirm,
    });
  },

  async change(current_pin: string, new_pin: string, pin_confirm: string) {
    await apiClient.post<ApiSuccess<[]>>('/transaction-pin/change', {
      current_pin,
      new_pin,
      pin_confirm,
    });
  },

  async verify(pin: string) {
    await apiClient.post<ApiSuccess<[]>>('/transaction-pin/verify', { pin });
  },
};
