import type { ListParams } from '@/types/config';

/** 커서를 제외한 기준 파라미터 타입 */
export type ConfigBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const configQK = {
  list: (base: ConfigBaseParams) => ['config', 'list', base] as const,
  detail: (uid: string) => ['config', 'detail', uid] as const,
};
