import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/badge/list';
import type { ListResult, IBadgeListRow } from '@/types/badge';
import { badgeQK, type BadgeBaseParams } from '@/lib/queryKeys/badge';

export function useBadgeInfinite(baseParams: BadgeBaseParams) {
  return useInfiniteQuery<
    ListResult<IBadgeListRow>,
    Error,
    InfiniteData<ListResult<IBadgeListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: badgeQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
