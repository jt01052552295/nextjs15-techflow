import type { ListParams } from '@/types/practice';

/** 커서를 제외한 기준 파라미터 타입 */
export type PracticeBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const practiceQK = {
  list: (base: PracticeBaseParams) => ['practice', 'list', base] as const,
};
