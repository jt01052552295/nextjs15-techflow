import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/blog/post/list';
import type { ListResult, IBlogPostListRow } from '@/types/blog/post';
import { blogPostQK, type BlogPostBaseParams } from '@/lib/queryKeys/blog/post';

export function useBlogPostInfinite(baseParams: BlogPostBaseParams) {
  return useInfiniteQuery<
    ListResult<IBlogPostListRow>,
    Error,
    InfiniteData<ListResult<IBlogPostListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: blogPostQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
