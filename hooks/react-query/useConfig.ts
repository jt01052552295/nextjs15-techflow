import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/config/list';
import type { ListResult } from '@/types/config';
import type { IConfig } from '@/types/config';
import { configQK, type ConfigBaseParams } from '@/lib/queryKeys/config';

export function useConfigInfinite(baseParams: ConfigBaseParams) {
  return useInfiniteQuery<
    ListResult<IConfig>,
    Error,
    InfiniteData<ListResult<IConfig>>,
    QueryKey,
    string | undefined
  >({
    queryKey: configQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
