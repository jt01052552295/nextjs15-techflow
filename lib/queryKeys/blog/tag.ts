import type { ListParams } from '@/types/blog/tag';

/** 커서를 제외한 기준 파라미터 타입 */
export type BlogTagBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const blogTagQK = {
  list: (base: BlogTagBaseParams) => ['blogTag', 'list', base] as const,
  detail: (uid: string) => ['blogTag', 'detail', uid] as const,
};
