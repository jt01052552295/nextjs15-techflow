import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/popup/list';
import type { ListResult, IPopupListRow } from '@/types/popup';
import { popupQK, type PopupBaseParams } from '@/lib/queryKeys/popup';

export function usePopupInfinite(baseParams: PopupBaseParams) {
  return useInfiniteQuery<
    ListResult<IPopupListRow>,
    Error,
    InfiniteData<ListResult<IPopupListRow>>,
    QueryKey,
    string | undefined
  >({
    queryKey: popupQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
