import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/company/list';
import type { ListResult, ICompany } from '@/types/company';
import { companyQK, type CompanyBaseParams } from '@/lib/queryKeys/company';

export function useCompanyInfinite(baseParams: CompanyBaseParams) {
  return useInfiniteQuery<
    ListResult<ICompany>,
    Error,
    InfiniteData<ListResult<ICompany>>,
    QueryKey,
    string | undefined
  >({
    queryKey: companyQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
