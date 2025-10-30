import type { ListParams } from '@/types/payment';

/** 커서를 제외한 기준 파라미터 타입 */
export type PaymentBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const paymentQK = {
  list: (base: PaymentBaseParams) => ['payment', 'list', base] as const,
  detail: (uid: string) => ['payment', 'detail', uid] as const,
};
