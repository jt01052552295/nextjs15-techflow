import type { ListParams } from '@/types/fcm/template';

/** 커서를 제외한 기준 파라미터 타입 */
export type FcmTemplateBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const fcmTemplateQK = {
  list: (base: FcmTemplateBaseParams) => ['fcmTemplate', 'list', base] as const,
  detail: (uid: string) => ['fcmTemplate', 'detail', uid] as const,
};
