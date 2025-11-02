'use server';

import type { ListParams, ListResult, IFcmAlarm } from '@/types/fcm/alarm';
import { list } from '@/services/fcm/alarm.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IFcmAlarm>> {
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

function toDTO(row: any): IFcmAlarm {
  return {
    ...row,
  };
}
