import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/blog/category/list';
import type { ListResult, IBlogCategoryListRow } from '@/types/blog/category';
import {
  blogCategoryQK,
  type BlogCategoryBaseParams,
} from '@/lib/queryKeys/blog/category';

export function useBlogCategoryInfinite(baseParams: BlogCategoryBaseParams) {
  return useInfiniteQuery<
    ListResult<IBlogCategoryListRow>,
    Error,
    InfiniteData<ListResult<IBlogCategoryListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: blogCategoryQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
