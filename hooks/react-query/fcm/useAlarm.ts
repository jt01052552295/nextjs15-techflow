import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/fcm/alarm/list';
import type { ListResult, IFcmAlarm } from '@/types/fcm/alarm';
import { fcmAlarmQK, type FcmAlarmBaseParams } from '@/lib/queryKeys/fcm/alarm';

export function useFcmAlarmInfinite(baseParams: FcmAlarmBaseParams) {
  return useInfiniteQuery<
    ListResult<IFcmAlarm>,
    Error,
    InfiniteData<ListResult<IFcmAlarm>>,
    QueryKey,
    string | undefined
  >({
    queryKey: fcmAlarmQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
