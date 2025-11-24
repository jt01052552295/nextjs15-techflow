import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/blog/tag/list';
import type { ListResult, IBlogTagListRow } from '@/types/blog/tag';
import { blogTagQK, type BlogTagBaseParams } from '@/lib/queryKeys/blog/tag';

export function useBlogTagInfinite(baseParams: BlogTagBaseParams) {
  return useInfiniteQuery<
    ListResult<IBlogTagListRow>,
    Error,
    InfiniteData<ListResult<IBlogTagListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: blogTagQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
