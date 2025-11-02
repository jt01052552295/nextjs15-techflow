import type { ListParams } from '@/types/fcm/token';

/** 커서를 제외한 기준 파라미터 타입 */
export type FcmTokenBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const fcmTokenQK = {
  list: (base: FcmTokenBaseParams) => ['fcmToken', 'list', base] as const,
  detail: (uid: string) => ['fcmToken', 'detail', uid] as const,
};
