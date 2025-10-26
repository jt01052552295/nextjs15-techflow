import type { ListParams } from '@/types/point';

/** 커서를 제외한 기준 파라미터 타입 */
export type PointBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const pointQK = {
  list: (base: PointBaseParams) => ['point', 'list', base] as const,
  detail: (idx: number) => ['point', 'detail', idx] as const,
};
