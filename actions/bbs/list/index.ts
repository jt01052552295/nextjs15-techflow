'use server';

import type { ListParams, ListResult, IBBSListRow } from '@/types/bbs';
import { list } from '@/services/bbs.service';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IBBSListRow>> {
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

function toDTO(row: any): IBBSListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
    // nested 포함 시 필요하면 추가 변환
    files: row.files?.map((f: any) => ({
      ...f,
      createdAt: fmtDateD(f.createdAt),
      updatedAt: fmtDateD(f.updatedAt),
    })),
  };
}
