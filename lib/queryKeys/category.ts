import type { ListParams } from '@/types/category';

/** 커서를 제외한 기준 파라미터 타입 */
export type CategoryBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const categoryQK = {
  list: (base: CategoryBaseParams) => ['category', 'list', base] as const,
  detail: (uid: string) => ['category', 'detail', uid] as const,
};
