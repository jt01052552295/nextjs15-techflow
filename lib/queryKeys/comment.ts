import type { ListParams } from '@/types/comment';

/** 커서를 제외한 기준 파라미터 타입 */
export type CommentBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const commentQK = {
  list: (base: CommentBaseParams) => ['comment', 'list', base] as const,
  detail: (uid: string) => ['comment', 'detail', uid] as const,
};
