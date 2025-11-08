import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/fcm/message/list';
import type { ListResult, IFcmMessage } from '@/types/fcm/message';
import {
  fcmMessageQK,
  type FcmMessageBaseParams,
} from '@/lib/queryKeys/fcm/message';

export function useFcmMessageInfinite(baseParams: FcmMessageBaseParams) {
  return useInfiniteQuery<
    ListResult<IFcmMessage>,
    Error,
    InfiniteData<ListResult<IFcmMessage>>,
    QueryKey,
    string | undefined
  >({
    queryKey: fcmMessageQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
