'use server';

import type { ListParams, ListResult, IFcmToken } from '@/types/fcm/token';
import { list } from '@/services/fcm/token.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IFcmToken>> {
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

function toDTO(row: any): IFcmToken {
  return {
    ...row,
  };
}
