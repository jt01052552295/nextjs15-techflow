import type { ListParams } from '@/types/blog/comment';

/** 커서를 제외한 기준 파라미터 타입 */
export type BlogPostCommentBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const blogPostCommentQK = {
  list: (base: BlogPostCommentBaseParams) =>
    ['blogPostComment', 'list', base] as const,
  detail: (uid: string) => ['blogPostComment', 'detail', uid] as const,
};
