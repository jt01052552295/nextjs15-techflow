import type { ListParams } from '@/types/fcm/message';

/** 커서를 제외한 기준 파라미터 타입 */
export type FcmMessageBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const fcmMessageQK = {
  list: (base: FcmMessageBaseParams) => ['fcmMessage', 'list', base] as const,
  detail: (uid: string) => ['fcmMessage', 'detail', uid] as const,
};
