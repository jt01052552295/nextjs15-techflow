import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/setting/list';
import type { ListResult, ISetting } from '@/types/setting';
import { settingQK, type SettingBaseParams } from '@/lib/queryKeys/setting';

export function useSettingInfinite(baseParams: SettingBaseParams) {
  return useInfiniteQuery<
    ListResult<ISetting>,
    Error,
    InfiniteData<ListResult<ISetting>>,
    QueryKey,
    string | undefined
  >({
    queryKey: settingQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
