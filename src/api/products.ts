import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { Category, Product } from '@/types/models';
import { apiClient } from './client';

export type CatalogListParams = {
  search?: string;
  category_id?: number;
  source_provider?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
};

export const productsApi = {
  async list(params: CatalogListParams = {}) {
    const { data } = await apiClient.get<ApiPaginated<Product>>('/catalog', {
      params,
    });
    return data;
  },

  async getById(id: number | string) {
    const { data } = await apiClient.get<ApiSuccess<{ product: Product }>>(
      `/catalog/${id}`
    );
    return data.data.product;
  },

  async categories() {
    const { data } = await apiClient.get<ApiSuccess<{ categories: Category[] }>>(
      '/catalog/categories'
    );
    return data.data.categories;
  },
};
