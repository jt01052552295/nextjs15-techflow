import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/point/list';
import type { ListResult, IPointListRow } from '@/types/point';
import { pointQK, type PointBaseParams } from '@/lib/queryKeys/point';

export function usePointInfinite(baseParams: PointBaseParams) {
  return useInfiniteQuery<
    ListResult<IPointListRow>,
    Error,
    InfiniteData<ListResult<IPointListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: pointQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
