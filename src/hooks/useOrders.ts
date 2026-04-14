import { ordersApi } from '@/api/orders';
import type { PlaceOrderPayload } from '@/types/models';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function useOrdersList() {
  return useInfiniteQuery({
    queryKey: ['orders'],
    queryFn: ({ pageParam }) => ordersApi.list(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      if (last.meta.current_page < last.meta.last_page) {
        return last.meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
  });
}

export function useOrder(id: number | string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: id != null && id !== '',
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlaceOrderPayload) => ordersApi.place(body),
       onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useFetchVoucherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number | string) => ordersApi.getVoucherCode(orderId),
    onSuccess: (data, orderId) => {
      qc.setQueryData(['voucher', orderId], data);
    },
  });
}
