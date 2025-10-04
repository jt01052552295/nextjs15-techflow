'use server';

import type { ListParams, ListResult, IPopupListRow } from '@/types/popup';
import { list } from '@/services/popup.service';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IPopupListRow>> {
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

function toDTO(row: any): IPopupListRow {
  return {
    ...row,
    startTime: fmtDateD(row.startTime),
    endTime: fmtDateD(row.endTime),
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}
