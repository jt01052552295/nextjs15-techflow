import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/banner/list';
import type { ListResult, IBannerListRow } from '@/types/banner';
import { bannerQK, type BannerBaseParams } from '@/lib/queryKeys/banner';

export function useBannerInfinite(baseParams: BannerBaseParams) {
  return useInfiniteQuery<
    ListResult<IBannerListRow>,
    Error,
    InfiniteData<ListResult<IBannerListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: bannerQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
