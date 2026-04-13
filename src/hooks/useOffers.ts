import { offersApi } from '@/api/offers';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => offersApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useApplyOffer() {
  return useMutation({
    mutationFn: offersApi.apply,
  });
}
