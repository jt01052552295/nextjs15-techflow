import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/blog/comment/list';
import type { ListResult, IBlogPostCommentListRow } from '@/types/blog/comment';
import {
  blogPostCommentQK,
  type BlogPostCommentBaseParams,
} from '@/lib/queryKeys/blog/comment';

export function useBlogPostCommentInfinite(
  baseParams: BlogPostCommentBaseParams,
) {
  return useInfiniteQuery<
    ListResult<IBlogPostCommentListRow>,
    Error,
    InfiniteData<ListResult<IBlogPostCommentListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: blogPostCommentQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
