'use server';

import type { ListParams, ListResult } from '@/types/config';
import { list } from '@/services/config.service';
import type { IConfig } from '@/types/config';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IConfig>> {
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

function toDTO(row: any): IConfig {
  return {
    ...row,
  };
}
