import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/shop/item/list';

import type { ListResult, IShopItemListRow } from '@/types/shop/item';
import { shopItemQK, type ShopItemBaseParams } from '@/lib/queryKeys/shop/item';

export function useShopItemInfinite(baseParams: ShopItemBaseParams) {
  return useInfiniteQuery<
    ListResult<IShopItemListRow>,
    Error,
    InfiniteData<ListResult<IShopItemListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: shopItemQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
