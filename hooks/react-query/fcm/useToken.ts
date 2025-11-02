import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/fcm/token/list';
import type { ListResult, IFcmToken } from '@/types/fcm/token';
import { fcmTokenQK, type FcmTokenBaseParams } from '@/lib/queryKeys/fcm/token';

export function usefcmTokenInfinite(baseParams: FcmTokenBaseParams) {
  return useInfiniteQuery<
    ListResult<IFcmToken>,
    Error,
    InfiniteData<ListResult<IFcmToken>>,
    QueryKey,
    string | undefined
  >({
    queryKey: fcmTokenQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
