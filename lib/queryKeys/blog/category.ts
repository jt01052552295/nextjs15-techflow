import type { ListParams } from '@/types/blog/category';

/** 커서를 제외한 기준 파라미터 타입 */
export type BlogCategoryBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const blogCategoryQK = {
  list: (base: BlogCategoryBaseParams) =>
    ['blogCategory', 'list', base] as const,
  detail: (uid: string) => ['blogCategory', 'detail', uid] as const,
};
