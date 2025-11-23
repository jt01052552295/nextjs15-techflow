import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/shop/review/list';

import type { ListResult, IShopReviewListRow } from '@/types/shop/review';
import {
  shopReviewQK,
  type ShopReviewBaseParams,
} from '@/lib/queryKeys/shop/review';
export function useShopReviewInfinite(baseParams: ShopReviewBaseParams) {
  return useInfiniteQuery<
    ListResult<IShopReviewListRow>,
    Error,
    InfiniteData<ListResult<IShopReviewListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: shopReviewQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
