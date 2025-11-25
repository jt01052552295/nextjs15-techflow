import type { ListParams } from '@/types/blog/post';

/** 커서를 제외한 기준 파라미터 타입 */
export type BlogPostBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const blogPostQK = {
  list: (base: BlogPostBaseParams) => ['blogPost', 'list', base] as const,
  detail: (uid: string) => ['blogPost', 'detail', uid] as const,
};
