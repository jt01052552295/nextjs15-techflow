import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/payment/list';
import type { ListResult, IPayment } from '@/types/payment';
import { paymentQK, type PaymentBaseParams } from '@/lib/queryKeys/payment';

export function usePaymentInfinite(baseParams: PaymentBaseParams) {
  return useInfiniteQuery<
    ListResult<IPayment>,
    Error,
    InfiniteData<ListResult<IPayment>>,
    QueryKey,
    string | undefined
  >({
    queryKey: paymentQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
