import type { ListParams } from '@/types/setting';

/** 커서를 제외한 기준 파라미터 타입 */
export type SettingBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const settingQK = {
  list: (base: SettingBaseParams) => ['setting', 'list', base] as const,
  detail: (uid: string) => ['setting', 'detail', uid] as const,
};
