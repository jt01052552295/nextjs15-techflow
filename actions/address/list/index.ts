'use server';

import type { ListParams, ListResult, IAddress } from '@/types/address';
import { list } from '@/services/address.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IAddress>> {
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

function toDTO(row: any): IAddress {
  return {
    ...row,
  };
}
