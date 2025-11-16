'use server';

import { updateOrder } from '@/services/shop/order.service';
import type { OrderStatusInput } from '@/types/shop/order';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const updateOrderStatusAction = async (data: OrderStatusInput) => {
  const language = await ckLocale();

  try {
    // throw Error('throw test')
    const { uid, uids } = data;
    if (!uid && (!uids || !uids.length)) {
      const missingFields = await __ts(
        'common.form.missingFields',
        {},
        language,
      );
      throw Error(missingFields);
    }

    const rs = await updateOrder(data);

    const msg = await __ts(
      'common.shopOrder.order_update_success',
      {},
      language,
    );
    return { status: 'success', message: msg, data: rs };
  } catch (err: any) {
    const fail = await __ts(
      'common.shopOrder.order_update_failed',
      {},
      language,
    );
    return { status: 'error', message: fail, error: err?.message };
  }
};
