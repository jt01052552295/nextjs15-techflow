import type { ListParams } from '@/types/user';

/** 커서를 제외한 기준 파라미터 타입 */
export type UserBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const userQK = {
  list: (base: UserBaseParams) => ['user', 'list', base] as const,
  detail: (uid: string) => ['user', 'detail', uid] as const,
};
