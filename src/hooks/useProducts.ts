import { homeApi } from '@/api/home';
import { productsApi, type CatalogListParams } from '@/api/products';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

const catalogKey = ['catalog'] as const;

export function useProductList(filters: Omit<CatalogListParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...catalogKey, filters],
    queryFn: async ({ pageParam }) => {
      const res = await productsApi.list({ ...filters, page: pageParam as number });
      
  console.group(`Page ${pageParam}`);
  console.log('Meta:', res.meta);
  console.log('Data:', res.data[0]);
  console.log(
    res.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.selling_price,
      image: p.resolved_image_url,
    }))
  );
  
  console.groupEnd();

  return res;
    },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { meta } = last;
      if (meta.current_page < meta.last_page) {
        return meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number | string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: id != null && id !== '',
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories(),
    staleTime: 15 * 60 * 1000,
  });
}

export function useHomeSlides() {
  return useQuery({
    queryKey: ['home', 'slides'],
    queryFn: () => homeApi.getSlides(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchProducts(search: string, categoryId?: number) {
  return useProductList({
    search: search.trim() || undefined,
    category_id: categoryId,
  });
}
