import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/practice/list';
import { listAction as commentsAction } from '@/actions/practice/comments';
import type { ListResult, CommentListResult } from '@/types/practice';
import type { ITodosListRow, ITodosCommentRow } from '@/types/todos';
import {
  practiceQK,
  type PracticeBaseParams,
  type CommentBaseParams,
} from '@/lib/queryKeys/practice';

export function usePracticeInfinite(baseParams: PracticeBaseParams) {
  return useInfiniteQuery<
    ListResult<ITodosListRow>,
    Error,
    InfiniteData<ListResult<ITodosListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: practiceQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}

/** 루트 댓글 무한스크롤 */
export function useCommentsInfinite(
  base: CommentBaseParams,
  currentUserId?: string,
) {
  return useInfiniteQuery<
    CommentListResult<ITodosCommentRow>,
    Error,
    InfiniteData<CommentListResult<ITodosCommentRow>>,
    QueryKey,
    string | null
  >({
    queryKey: practiceQK.comments(base),
    queryFn: ({ pageParam }) =>
      commentsAction({
        ...base,
        cursor: pageParam ?? null,
        currentUserId,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null,
    staleTime: 30_000,
  });
}

/** 특정 부모의 답글 무한스크롤 */
export function useRepliesInfinite(
  base: CommentBaseParams, // 반드시 base.parentIdx 존재!
  currentUserId?: string,
) {
  return useInfiniteQuery<
    CommentListResult<ITodosCommentRow>,
    Error,
    InfiniteData<CommentListResult<ITodosCommentRow>>,
    QueryKey,
    string | null
  >({
    queryKey: practiceQK.replies(base),
    queryFn: ({ pageParam }) =>
      commentsAction({
        ...base,
        cursor: pageParam ?? null,
        currentUserId,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null,
    staleTime: 30_000,
  });
}
