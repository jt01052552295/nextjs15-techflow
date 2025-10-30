import type { ListParams } from '@/types/address';

/** 커서를 제외한 기준 파라미터 타입 */
export type AddressBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const addressQK = {
  list: (base: AddressBaseParams) => ['address', 'list', base] as const,
  detail: (uid: string) => ['address', 'detail', uid] as const,
};
