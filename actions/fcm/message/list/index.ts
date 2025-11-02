'use server';

import type { ListParams, ListResult, IFcmMessage } from '@/types/fcm/message';
import { list } from '@/services/fcm/message.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IFcmMessage>> {
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

function toDTO(row: any): IFcmMessage {
  return {
    ...row,
  };
}
