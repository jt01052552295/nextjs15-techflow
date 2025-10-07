'use server';

import type { ListParams, ListResult, ISetting } from '@/types/setting';
import { list } from '@/services/setting.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<ISetting>> {
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

function toDTO(row: any): ISetting {
  return {
    ...row,
  };
}
