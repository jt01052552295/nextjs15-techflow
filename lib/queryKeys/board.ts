import type { ListParams } from '@/types/board';

/** 커서를 제외한 기준 파라미터 타입 */
export type BoardBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const boardQK = {
  list: (base: BoardBaseParams) => ['board', 'list', base] as const,
  detail: (uid: string) => ['board', 'detail', uid] as const,
};
