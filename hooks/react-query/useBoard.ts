import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/board/list';
import type { ListResult, IBoardListRow } from '@/types/board';
import { boardQK, type BoardBaseParams } from '@/lib/queryKeys/board';

export function useBoardInfinite(baseParams: BoardBaseParams) {
  return useInfiniteQuery<
    ListResult<IBoardListRow>,
    Error,
    InfiniteData<ListResult<IBoardListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: boardQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
