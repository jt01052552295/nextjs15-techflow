'use server';

import type { ListParams, ListResult } from '@/types/category';
import { list } from '@/services/category.service';
import type { ICategoryListRow } from '@/types/category';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<ICategoryListRow>> {
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

function toDTO(row: any): ICategoryListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}
