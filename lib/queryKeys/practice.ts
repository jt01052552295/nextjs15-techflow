import type { ListParams, CommentListParams } from '@/types/practice';

/** 커서를 제외한 기준 파라미터 타입 */
export type PracticeBaseParams = Omit<ListParams, 'cursor'>;

export type CommentBaseParams = Omit<
  CommentListParams,
  'cursor' | 'currentUserId'
>;

const normRoot = (base: CommentBaseParams) => ({
  todoId: base.todoId,
  parentIdx: null as number | null, // 루트 고정
  sortBy: base.sortBy ?? 'createdAt',
  order: base.order ?? 'desc', // 루트 기본: desc
  limit: base.limit ?? 20,
});

const normReplies = (base: CommentBaseParams) => ({
  todoId: base.todoId,
  parentIdx: base.parentIdx as number, // 반드시 숫자
  sortBy: base.sortBy ?? 'createdAt',
  order: base.order ?? 'asc', // 답글 기본: asc
  limit: base.limit ?? 20,
});

/** React Query QueryKey 모음 */
export const practiceQK = {
  list: (base: PracticeBaseParams) => ['practice', 'list', base] as const,
  detail: (uid: string) => ['practice', 'detail', uid] as const,

  // 댓글(루트)
  comments: (base: CommentBaseParams) =>
    ['practice', 'comments', normRoot(base)] as const,

  // 댓글(답글)
  replies: (base: CommentBaseParams) =>
    ['practice', 'comments', 'replies', normReplies(base)] as const,

  // 단일 댓글
  comment: (commentUid: string) => ['practice', 'comment', commentUid] as const,
};
