import type { ListParams } from '@/types/company';

/** 커서를 제외한 기준 파라미터 타입 */
export type CompanyBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const companyQK = {
  list: (base: CompanyBaseParams) => ['company', 'list', base] as const,
  detail: (uid: string) => ['company', 'detail', uid] as const,
};
