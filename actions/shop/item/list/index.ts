'use server';

import type { ListParams, ListResult } from '@/types/shop/item';
import { list } from '@/services/shop/item.service';
import type { IShopItemListRow } from '@/types/shop/item';
import { fmtDateD } from '@/lib/util';
import { getAllItems } from '@/lib/shop/db-utils';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IShopItemListRow>> {
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

function toDTO(row: any): IShopItemListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}

export async function fetchAllShopItemAction() {
  return await getAllItems();
}
