import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { listAction } from '@/actions/address/list';
import type { ListResult, IAddress } from '@/types/address';
import { addressQK, type AddressBaseParams } from '@/lib/queryKeys/address';

export function useAddressInfinite(baseParams: AddressBaseParams) {
  return useInfiniteQuery<
    ListResult<IAddress>,
    Error,
    InfiniteData<ListResult<IAddress>>,
    QueryKey,
    string | undefined
  >({
    queryKey: addressQK.list(baseParams),
    queryFn: ({ pageParam }) =>
      listAction({ ...baseParams, cursor: pageParam ?? null }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
    initialPageParam: undefined,
  });
}
