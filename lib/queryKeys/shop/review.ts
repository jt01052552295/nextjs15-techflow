import type { ListParams } from '@/types/shop/review';

/** 커서를 제외한 기준 파라미터 타입 */
export type ShopReviewBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const shopReviewQK = {
  list: (base: ShopReviewBaseParams) => ['shopReview', 'list', base] as const,
  detail: (uid: string) => ['shopReview', 'detail', uid] as const,
};
