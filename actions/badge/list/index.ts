'use server';

import type { ListParams, ListResult } from '@/types/badge';
import { list } from '@/services/badge.service';
import type { IBadgeListRow } from '@/types/badge';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IBadgeListRow>> {
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

function toDTO(row: any): IBadgeListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
    // nested 포함 시 필요하면 추가 변환
    TodosFile: row.TodosFile?.map((f: any) => ({
      ...f,
      createdAt: fmtDateD(f.createdAt),
      updatedAt: fmtDateD(f.updatedAt),
    })),
  };
}
