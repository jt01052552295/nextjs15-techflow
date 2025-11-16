import type { ListParams } from '@/types/shop/order';

/** 커서를 제외한 기준 파라미터 타입 */
export type ShopOrderBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const shopOrderQK = {
  list: (base: ShopOrderBaseParams) => ['shopOrder', 'list', base] as const,
  detail: (uid: string) => ['shopOrder', 'detail', uid] as const,
};
