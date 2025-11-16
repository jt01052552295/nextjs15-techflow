'use server';

import { updateCancel } from '@/services/shop/order.service';
import type { CancelStatusInput } from '@/types/shop/order';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const updateCancelStatusAction = async (data: CancelStatusInput) => {
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

    const rs = await updateCancel(data);

    const msg = await __ts(
      'common.shopOrder.cancel_update_success',
      {},
      language,
    );
    return { status: 'success', message: msg, data: rs };
  } catch (err: any) {
    const fail = await __ts('common.cancel_update_failed', {}, language);
    return { status: 'error', message: fail, error: err?.message };
  }
};
