import type { ApiSuccess } from '@/types/api';
import type { Offer } from '@/types/models';
import { apiClient } from './client';

/**
 * Consumer offers endpoints are documented in API_DOCUMENTATION.md but may not
 * be registered in routes/api.php yet. These calls fail softly.
 */
export const offersApi = {
  async list(): Promise<Offer[]> {
    try {
      const { data } = await apiClient.get<ApiSuccess<Offer[]> | ApiSuccess<{ offers: Offer[] }>>(
        '/offers'
      );
      const d = data.data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === 'object' && 'offers' in d) {
        return (d as { offers: Offer[] }).offers;
      }
      return [];
    } catch {
      return [];
    }
  },

  async apply(body: {
    promo_code: string;
    order_amount: number;
    product_id: number;
  }) {
    const { data } = await apiClient.post<
      ApiSuccess<{
        offer_id: number;
        discount_type: string;
        discount_value: number;
        discount_amount: number;
        final_amount: number;
      }>
    >('/offers/apply', body);
    return data.data;
  },
};
