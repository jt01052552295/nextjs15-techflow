'use server';

import type { ListParams, ListResult } from '@/types/point';
import { list } from '@/services/point.service';
import type { IPointListRow } from '@/types/point';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IPointListRow>> {
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

function toDTO(row: any): IPointListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    expiredAt: row.expiredAt ? fmtDateD(row.expiredAt) : null,
  };
}
