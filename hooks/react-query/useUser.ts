import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/user/list';
import type { ListResult, IUserListRow } from '@/types/user';
import { userQK, type UserBaseParams } from '@/lib/queryKeys/user';

export function useUserInfinite(baseParams: UserBaseParams) {
  return useInfiniteQuery<
    ListResult<IUserListRow>,
    Error,
    InfiniteData<ListResult<IUserListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: userQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
