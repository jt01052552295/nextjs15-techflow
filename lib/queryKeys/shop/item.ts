import type { ListParams } from '@/types/shop/item';

/** 커서를 제외한 기준 파라미터 타입 */
export type ShopItemBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const shopItemQK = {
  list: (base: ShopItemBaseParams) => ['shopItem', 'list', base] as const,
  detail: (uid: string) => ['shopItem', 'detail', uid] as const,
};
