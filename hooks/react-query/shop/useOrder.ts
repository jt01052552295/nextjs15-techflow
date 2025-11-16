import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/shop/order/list';

import type { ListResult, IShopOrderListRow } from '@/types/shop/order';
import {
  shopOrderQK,
  type ShopOrderBaseParams,
} from '@/lib/queryKeys/shop/order';

export function useShopOrderInfinite(baseParams: ShopOrderBaseParams) {
  return useInfiniteQuery<
    ListResult<IShopOrderListRow>,
    Error,
    InfiniteData<ListResult<IShopOrderListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: shopOrderQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
