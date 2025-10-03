import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/agent/list';
import type { ListResult } from '@/types/agent';
import type { IAgentLogListRow } from '@/types/agent';
import { agentQK, type AgentBaseParams } from '@/lib/queryKeys/agent';

export function useAgentInfinite(baseParams: AgentBaseParams) {
  return useInfiniteQuery<
    ListResult<IAgentLogListRow>,
    Error,
    InfiniteData<ListResult<IAgentLogListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: agentQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
