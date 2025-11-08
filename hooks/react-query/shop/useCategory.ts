import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/shop/category/list';
import type { ListResult, IShopCategoryListRow } from '@/types/shop/category';
import {
  shopCategoryQK,
  type ShopCategoryBaseParams,
} from '@/lib/queryKeys/shop/category';

export function useShopCategoryInfinite(baseParams: ShopCategoryBaseParams) {
  return useInfiniteQuery<
    ListResult<IShopCategoryListRow>,
    Error,
    InfiniteData<ListResult<IShopCategoryListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: shopCategoryQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
