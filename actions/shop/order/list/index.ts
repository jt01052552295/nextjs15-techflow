'use server';

import type { ListParams, ListResult } from '@/types/shop/order';
import { list } from '@/services/shop/order.service';
import type { IShopOrderListRow } from '@/types/shop/order';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IShopOrderListRow>> {
  try {
    const rs = await list(params ?? {});

    return {
      ...rs,
      items: rs.items.map(toDTO),
    };
  } catch (err) {
    console.error('[listAction] error:', err);
    throw err;
  }
}

function toDTO(row: any): IShopOrderListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}
