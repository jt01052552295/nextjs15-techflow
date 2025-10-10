import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/comment/list';
import type { ListResult, IBBSCommentRow } from '@/types/comment';
import { commentQK, type CommentBaseParams } from '@/lib/queryKeys/comment';

export function useCommentInfinite(baseParams: CommentBaseParams) {
  return useInfiniteQuery<
    ListResult<IBBSCommentRow>,
    Error,
    InfiniteData<ListResult<IBBSCommentRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: commentQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
