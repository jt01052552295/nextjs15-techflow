import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/practice/list';
import type { ListResult } from '@/types/practice';
import type { ITodosListRow } from '@/types/todos';
import { practiceQK, type PracticeBaseParams } from '@/lib/queryKeys/practice';

export function usePracticeInfinite(baseParams: PracticeBaseParams) {
  return useInfiniteQuery<
    ListResult<ITodosListRow>,
    Error,
    InfiniteData<ListResult<ITodosListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: practiceQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
