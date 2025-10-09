import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/bbs/list';
import { listAction as commentsAction } from '@/actions/bbs/comments';
import type { ListResult, CommentListResult, IBBSListRow } from '@/types/bbs';
import type { IBBSCommentRow } from '@/types/comment';
import {
  bbsQK,
  type BbsBaseParams,
  type CommentBaseParams,
} from '@/lib/queryKeys/bbs';

export function useBbsInfinite(baseParams: BbsBaseParams) {
  return useInfiniteQuery<
    ListResult<IBBSListRow>,
    Error,
    InfiniteData<ListResult<IBBSListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: bbsQK.list(baseParams),
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
    CommentListResult<IBBSCommentRow>,
    Error,
    InfiniteData<CommentListResult<IBBSCommentRow>>,
    QueryKey,
    string | null
  >({
    queryKey: bbsQK.comments(base),
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
    CommentListResult<IBBSCommentRow>,
    Error,
    InfiniteData<CommentListResult<IBBSCommentRow>>,
    QueryKey,
    string | null
  >({
    queryKey: bbsQK.replies(base),
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
