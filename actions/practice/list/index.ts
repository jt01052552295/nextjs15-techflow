'use server';

import type { ListParams, ListResult } from '@/types/practice';
import { list } from '@/services/practice.service';
import type { ITodosListRow } from '@/types/todos';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<ITodosListRow>> {
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

function toDTO(row: any): ITodosListRow {
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
