import type { ApiSuccess } from '@/types/api';
import type { HomeSlide } from '@/types/models';
import { apiClient } from './client';

export const homeApi = {
  async getSlides(): Promise<HomeSlide[]> {
    const { data } = await apiClient.get<ApiSuccess<{ slides: HomeSlide[] }>>('/home');
    return data.data.slides ?? [];
  },
};
