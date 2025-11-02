import type { ListParams } from '@/types/fcm/alarm';

/** 커서를 제외한 기준 파라미터 타입 */
export type FcmAlarmBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const fcmAlarmQK = {
  list: (base: FcmAlarmBaseParams) => ['fcmAlarm', 'list', base] as const,
  detail: (uid: string) => ['fcmAlarm', 'detail', uid] as const,
};
