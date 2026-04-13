import { walletApi, type LoadRequestBody } from '@/api/wallet';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => walletApi.balance(),
    staleTime: 60 * 1000,
  });
}

export function useWalletTransactions() {
  return useInfiniteQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: ({ pageParam }) => walletApi.transactions(pageParam as number),
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

export function useRequestWalletLoad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoadRequestBody) => walletApi.requestLoad(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}
