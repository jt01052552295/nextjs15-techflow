import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/fcm/template/list';
import type { ListResult, IFcmTemplate } from '@/types/fcm/template';
import {
  fcmTemplateQK,
  type FcmTemplateBaseParams,
} from '@/lib/queryKeys/fcm/template';

export function usefcmTemplateInfinite(baseParams: FcmTemplateBaseParams) {
  return useInfiniteQuery<
    ListResult<IFcmTemplate>,
    Error,
    InfiniteData<ListResult<IFcmTemplate>>,
    QueryKey,
    string | undefined
  >({
    queryKey: fcmTemplateQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
