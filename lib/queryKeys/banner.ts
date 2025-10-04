import type { ListParams } from '@/types/banner';

/** 커서를 제외한 기준 파라미터 타입 */
export type BannerBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const bannerQK = {
  list: (base: BannerBaseParams) => ['banner', 'list', base] as const,
  detail: (uid: string) => ['banner', 'detail', uid] as const,
};
