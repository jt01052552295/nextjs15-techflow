'use server';

import { removeAccount } from '@/services/user.service';
import type { DeleteAccountInput } from '@/types/user';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const deleteAccountAction = async (data: DeleteAccountInput) => {
  const language = await ckLocale();

  try {
    // throw Error('throw test')
    const { userId, idx, provider } = data;
    if (!userId || !idx || !provider) {
      const missingFields = await __ts(
        'common.form.missingFields',
        {},
        language,
      );
      throw Error(missingFields);
    }

    const rs = await removeAccount(data);

    const msg = await __ts('common.delete_success', {}, language);
    return { status: 'success', message: msg, data: rs };
  } catch (err: any) {
    const fail = await __ts('common.delete_failed', {}, language);
    return { status: 'error', message: fail, error: err?.message };
  }
};
