import type { ListParams } from '@/types/badge';

/** 커서를 제외한 기준 파라미터 타입 */
export type BadgeBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const badgeQK = {
  list: (base: BadgeBaseParams) => ['badge', 'list', base] as const,
  detail: (uid: string) => ['badge', 'detail', uid] as const,
};
