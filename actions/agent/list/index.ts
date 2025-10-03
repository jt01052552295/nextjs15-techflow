'use server';

import type { ListParams, ListResult } from '@/types/agent';
import { list } from '@/services/agent.service';
import type { IAgentLogListRow } from '@/types/agent';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IAgentLogListRow>> {
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

function toDTO(row: any): IAgentLogListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
  };
}
