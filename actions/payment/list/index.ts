'use server';

import type { ListParams, ListResult, IPayment } from '@/types/payment';
import { list } from '@/services/payment.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IPayment>> {
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

function toDTO(row: any): IPayment {
  return {
    ...row,
  };
}
