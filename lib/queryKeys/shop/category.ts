import type { ListParams } from '@/types/shop/category';

/** 커서를 제외한 기준 파라미터 타입 */
export type ShopCategoryBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const shopCategoryQK = {
  list: (base: ShopCategoryBaseParams) =>
    ['shopCategory', 'list', base] as const,
  detail: (uid: string) => ['shopCategory', 'detail', uid] as const,
};
