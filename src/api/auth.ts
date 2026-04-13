import type { User } from '@/types/models';
import { apiClient } from './client';
import type { AxiosError } from 'axios';

export type OtpVerifySuccessResponse =
  | {
      action: 'logged_in';
      token: string;
      user: User;
      new_device?: boolean;
    }
  | {
      action: 'needs_profile';
      temp_token: string;
      phone: string;
    }
  | {
      action: '2fa_required';
      message: string;
      temp_token: string;
      method: string;
      new_device?: boolean;
    };

export type CompleteProfileResponse = {
  message: string;
  action: string;
  token: string;
  user: User;
};

export const authApi = {
  async sendOtp(mobile: string, type = 'login') {
    const { data } = await apiClient.post<{
      success: boolean;
      message?: string;
      expires_in?: number;
      resend_available?: number;
      error?: string;
    }>('/auth/otp/send', { mobile, type });
    return data;
  },

  /**
   * Returns discriminated result so callers can handle 2FA (202), blocked (403), locked (423), validation (422).
   */
  async verifyOtp(mobile: string, otp: string) {
    try {
      const { data, status } = await apiClient.post<OtpVerifySuccessResponse>('/auth/otp/verify', { mobile, otp });
      return { ok: true as const, status, data };
    } catch (e) {
      const err = e as AxiosError<{
        message?: string;
        error?: string;
        errors?: Record<string, string[]>;
      }>;
      const status = err.response?.status ?? 0;
      const data = err.response?.data;
      return { ok: false as const, status, data };
    }
  },

  async completeProfile(body: {
    temp_token: string;
    name: string;
    email?: string | null;
    referral_code?: string | null;
  }) {
    const { data } = await apiClient.post<CompleteProfileResponse>('/auth/complete-profile', body);
    return data;
  },

  async verifyTwoFactor(code: string, tempToken: string) {
    const { data } = await apiClient.post<{
      message: string;
      token: string;
      user: User;
    }>(
      '/auth/2fa/verify',
      { code },
      { headers: { Authorization: `Bearer ${tempToken}` } }
    );
    return data;
  },

  async me() {
    const { data } = await apiClient.get<{ user: User }>('/auth/me');
    return data.user;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};
