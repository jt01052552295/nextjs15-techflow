import type { ListParams } from '@/types/popup';

/** 커서를 제외한 기준 파라미터 타입 */
export type PopupBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const popupQK = {
  list: (base: PopupBaseParams) => ['popup', 'list', base] as const,
  detail: (uid: string) => ['popup', 'detail', uid] as const,
};
