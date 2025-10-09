import type { ListParams, CommentListParams } from '@/types/bbs';

/** 커서를 제외한 기준 파라미터 타입 */
export type BbsBaseParams = Omit<ListParams, 'cursor'>;

export type CommentBaseParams = Omit<
  CommentListParams,
  'cursor' | 'currentUserId'
>;

const normRoot = (base: CommentBaseParams) => ({
  pid: base.pid,
  parentIdx: null as number | null, // 루트 고정
  sortBy: base.sortBy ?? 'createdAt',
  order: base.order ?? 'desc', // 루트 기본: desc
  limit: base.limit ?? 20,
});

const normReplies = (base: CommentBaseParams) => ({
  pid: base.pid,
  parentIdx: base.parentIdx as number, // 반드시 숫자
  sortBy: base.sortBy ?? 'createdAt',
  order: base.order ?? 'asc', // 답글 기본: asc
  limit: base.limit ?? 20,
});

/** React Query QueryKey 모음 */
export const bbsQK = {
  list: (base: BbsBaseParams) => ['bbs', 'list', base] as const,
  detail: (uid: string) => ['bbs', 'detail', uid] as const,

  // 댓글(루트)
  comments: (base: CommentBaseParams) =>
    ['bbs', 'comments', normRoot(base)] as const,

  // 댓글(답글)
  replies: (base: CommentBaseParams) =>
    ['bbs', 'comments', 'replies', normReplies(base)] as const,

  // 단일 댓글
  comment: (commentUid: string) => ['bbs', 'comment', commentUid] as const,
};
