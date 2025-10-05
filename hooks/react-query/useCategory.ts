import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/category/list';
import type { ListResult, ICategoryListRow } from '@/types/category';
import { categoryQK, type CategoryBaseParams } from '@/lib/queryKeys/category';

export function useCategoryInfinite(baseParams: CategoryBaseParams) {
  return useInfiniteQuery<
    ListResult<ICategoryListRow>,
    Error,
    InfiniteData<ListResult<ICategoryListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: categoryQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
